import pytest
import numpy as np
import io
import cv2
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.environment import EnvironmentValidator
from app.flash_pad import FlashPADAnalyzer
from app.action_challenge import ActionChallengeEngine, ActionTypeEnum, expression_cnn
from app.forensics import forensics_engine
from app.face_matcher import face_matcher
from app.session import session_manager
from app.verdict import verdict_engine
from app.models import VerdictResultEnum, RiskLevelEnum

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "service" in data


def test_environment_validation():
    # Test valid browser environment
    valid_data = {
        "webdriver": False,
        "plugins_length": 3,
        "has_chrome_object": True,
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "languages": ["en-US", "en"]
    }
    passed, status, details = EnvironmentValidator.validate_automation(valid_data)
    assert passed is True
    assert status == "PASSED"

    # Test automated bot environment
    bot_data = {
        "webdriver": True,
        "plugins_length": 0,
        "has_chrome_object": False,
        "user_agent": "HeadlessChrome/120.0.0.0",
        "languages": []
    }
    passed, status, details = EnvironmentValidator.validate_automation(bot_data)
    assert passed is False
    assert "AUTOMATION" in status

    # Test camera device filter
    hardware_devices = [{"kind": "videoinput", "label": "Integrated Camera (04f2:b6b4)"}]
    passed, status, _ = EnvironmentValidator.validate_camera(hardware_devices)
    assert passed is True
    assert status == "HARDWARE OK"

    virtual_devices = [{"kind": "videoinput", "label": "OBS Virtual Camera"}]
    passed, status, _ = EnvironmentValidator.validate_camera(virtual_devices)
    assert passed is False
    assert "VIRTUAL" in status

    # Test frame jitter
    natural_deltas = [33.3 + np.random.normal(0, 0.4) for _ in range(30)]
    passed, status, variance, _ = EnvironmentValidator.validate_frame_jitter(natural_deltas)
    assert passed is True
    assert variance > 0.01

    synthetic_deltas = [33.333333 for _ in range(30)] # 0 variance
    passed, status, variance, _ = EnvironmentValidator.validate_frame_jitter(synthetic_deltas)
    assert passed is False
    assert "SYNTHETIC" in status


def test_flash_pad_analyzer():
    config = FlashPADAnalyzer.generate_sequence(num_colors=5, duration_ms=150)
    assert len(config.colors) == 5
    assert config.duration_ms == 150

    # Synthetic matching observed reflections
    colors = ["#00FFFF", "#FF00FF", "#FFFF00", "#FF0000", "#00FF00"]
    observed = [
        (10, 240, 240),
        (240, 10, 240),
        (240, 240, 10),
        (240, 10, 10),
        (10, 240, 10)
    ]
    passed, score, details = FlashPADAnalyzer.compute_chromaticity_correlation(colors, observed)
    assert passed is True
    assert score >= 0.55

    # Test rejection on insufficient frames
    insufficient = [(10, 240, 240)]
    fail_passed, fail_score, fail_details = FlashPADAnalyzer.compute_chromaticity_correlation(colors, insufficient)
    assert fail_passed is False
    assert fail_score == 0.0
    assert "INSUFFICIENT" in fail_details["status"]


def test_action_challenge_and_expression_cnn():
    challenge = ActionChallengeEngine.generate_challenge()
    assert challenge.action in [
        ActionTypeEnum.BLINK_N,
        ActionTypeEnum.SMILE_HOLD,
        ActionTypeEnum.HEAD_TURN,
        ActionTypeEnum.EYEBROW_RAISE
    ]
    assert challenge.prompt is not None

    # Test EAR, MAR, Yaw, and Eyebrow Raise calculations
    synthetic_landmarks = [[float(i)/500.0, float(i)/500.0, 0.0] for i in range(468)]
    ear = ActionChallengeEngine.compute_ear(synthetic_landmarks)
    mar = ActionChallengeEngine.compute_mar(synthetic_landmarks)
    yaw = ActionChallengeEngine.compute_head_yaw(synthetic_landmarks)
    ratio, dist = ActionChallengeEngine.compute_eyebrow_raise(synthetic_landmarks, 0.05)

    assert isinstance(ear, float)
    assert isinstance(mar, float)
    assert isinstance(yaw, float)
    assert isinstance(ratio, float)

    # Test Mobile-Optimized CNN Expression Classifier
    test_face = np.full((112, 112, 3), 160, dtype=np.uint8)
    cv2.circle(test_face, (56, 56), 40, (210, 180, 150), -1)
    
    scores = expression_cnn.classify_expression(test_face)
    assert "smile" in scores
    assert "eyebrow_raise" in scores
    assert "neutral" in scores
    assert np.isclose(scores["smile"] + scores["eyebrow_raise"] + scores["neutral"], 1.0, atol=0.05)

    is_sm, _ = expression_cnn.is_smiling(test_face)
    assert isinstance(is_sm, (bool, np.bool_))


def test_forensics_sobel_and_fft():
    # Create synthetic test image
    img = np.random.randint(50, 200, (300, 300, 3), dtype=np.uint8)
    cv2.circle(img, (150, 150), 80, (180, 150, 130), -1)

    sobel_score, sobel_status, _ = forensics_engine.compute_sobel_residual(img, [70, 70, 160, 160])
    assert 0.0 <= sobel_score <= 1.0
    assert sobel_status in ["CLEAN", "SUSPICIOUS BLEND"]

    fft_score, fft_status, _ = forensics_engine.compute_fft_anomaly(img)
    assert 0.0 <= fft_score <= 1.0
    assert fft_status in ["NO ARTIFACTS", "PERIODIC GRID DETECTED"]

    fake_score, status, _ = forensics_engine.classify_deepfake([img], sobel_score, fft_score)
    assert 0.0 <= fake_score <= 1.0


def test_face_matcher_arcface_and_cosine_similarity():
    img1 = np.full((200, 200, 3), 128, dtype=np.uint8)
    cv2.circle(img1, (100, 100), 50, (200, 180, 160), -1)

    img2 = img1.copy()
    cv2.circle(img2, (100, 100), 52, (200, 180, 160), -1)

    # Different face
    img3 = np.zeros((200, 200, 3), dtype=np.uint8)
    cv2.rectangle(img3, (30, 30), (170, 170), (50, 50, 50), -1)

    emb1 = face_matcher.generate_embedding(img1)
    emb2 = face_matcher.generate_embedding(img2)
    emb3 = face_matcher.generate_embedding(img3)

    assert emb1.shape == (512,)
    assert emb2.shape == (512,)
    assert np.isclose(np.linalg.norm(emb1), 1.0, atol=1e-3)

    # Same person match >= 0.85
    sim_same = face_matcher.compute_cosine_similarity(emb1, emb2)
    assert sim_same >= 0.85

    # Different person produces distinct similarity
    sim_diff = face_matcher.compute_cosine_similarity(emb1, emb3)
    assert sim_diff < sim_same


def test_verdict_decision_matrix():
    session = session_manager.create_session()
    
    # Configure all passing telemetry
    session.telemetry["automation"] = {"status": "PASSED"}
    # ws_handler only ever writes "PASSED"/"FAILED"; the verdict engine requires
    # an explicit "PASSED" so that a pending or unknown status cannot pass.
    session.telemetry["camera_driver"] = {"status": "PASSED"}
    session.telemetry["frame_jitter"] = {"status": "PASSED"}
    session.telemetry["flash_pad"] = {"status": "PASSED"}
    session.telemetry["action_challenge"] = {"status": "PASSED"}
    session.telemetry["sobel_residual"] = {"status": "PASSED"}
    session.telemetry["fft_grid"] = {"status": "PASSED"}
    session.telemetry["ai_fake_score"] = {"status": "PASSED", "value": 0.06}
    session.telemetry["face_match"] = {"status": "PASSED", "value": 0.94}

    report = verdict_engine.evaluate(session)
    assert report.result == VerdictResultEnum.VERIFIED
    assert report.risk_level == RiskLevelEnum.LOW
    assert len(report.fraud_flags) == 0

    # Test failure case: deepfake detected
    session.telemetry["ai_fake_score"] = {"status": "FAILED", "value": 0.45}
    report_fail = verdict_engine.evaluate(session)
    assert report_fail.result == VerdictResultEnum.FAILED
    assert report_fail.risk_level == RiskLevelEnum.HIGH
    assert "AI_SYNTHETIC_DEEPFAKE_DETECTED" in report_fail.fraud_flags


def test_verdict_fails_closed_on_incomplete_checks():
    """Regressions: a check that never produced a result must not be waved through."""
    def passing_session():
        s = session_manager.create_session()
        for key in s.telemetry:
            s.telemetry[key] = {"status": "PASSED", "value": 1.0}
        s.telemetry["ai_fake_score"] = {"status": "PASSED", "value": 0.06}
        s.telemetry["face_match"] = {"status": "PASSED", "value": 0.94}
        return s

    # Baseline: the fully-passing session really does verify.
    assert verdict_engine.evaluate(passing_session()).result == VerdictResultEnum.VERIFIED

    # Synthetic frame pacing is reported as FAILED, not as the literal "SYNTHETIC".
    s = passing_session()
    s.telemetry["frame_jitter"] = {"status": "FAILED", "value": 0.0}
    report = verdict_engine.evaluate(s)
    assert report.result == VerdictResultEnum.FAILED
    assert "SYNTHETIC_FRAME_PACING" in report.fraud_flags

    # A score of None means forensics never ran, which must fail rather than pass.
    s = passing_session()
    s.telemetry["ai_fake_score"] = {"status": "FAILED", "value": None}
    report = verdict_engine.evaluate(s)
    assert report.result == VerdictResultEnum.FAILED
    assert "AI_SYNTHETIC_DEEPFAKE_DETECTED" in report.fraud_flags

    # An untouched session must fail every one of the seven checks.
    report = verdict_engine.evaluate(session_manager.create_session())
    assert report.result == VerdictResultEnum.FAILED
    assert len(report.fraud_flags) == 7


def test_upload_id_api():
    # Generate test ID image with face
    img = np.full((320, 480, 3), 40, dtype=np.uint8)
    cv2.circle(img, (240, 160), 60, (220, 190, 170), -1)
    # Eyes
    cv2.circle(img, (220, 150), 6, (10, 10, 10), -1)
    cv2.circle(img, (260, 150), 6, (10, 10, 10), -1)
    # Mouth
    cv2.ellipse(img, (240, 185), (20, 8), 0, 0, 180, (10, 10, 10), 2)

    pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    buf = io.BytesIO()
    pil_img.save(buf, format="JPEG")
    buf.seek(0)

    response = client.post(
        "/api/upload-id",
        files={"file": ("test_id.jpg", buf, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert data["face_detected"] is True
    assert "face_crop_base64" in data

    # Test oversized payload > 10MB
    oversized_buf = io.BytesIO(b"0" * (11 * 1024 * 1024))
    res_oversize = client.post(
        "/api/upload-id",
        files={"file": ("large_id.jpg", oversized_buf, "image/jpeg")}
    )
    assert res_oversize.status_code == 413
