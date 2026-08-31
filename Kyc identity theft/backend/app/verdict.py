import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple
from app.models import VerdictReport, VerdictResultEnum, RiskLevelEnum
from app.session import SessionState


# Every telemetry writer in ws_handler.py records exactly "PASSED" or "FAILED".
# Any other value — including the initial "PENDING" — means the check never
# completed, which must count as a failure rather than being waved through.
PASS_STATUS = "PASSED"

FAKE_SCORE_MAX = 0.20
SIMILARITY_MIN = 0.85

# Margins above the hard thresholds below which a pass is still only MEDIUM risk.
SIMILARITY_STRONG = 0.88
FAKE_SCORE_STRONG = 0.14


class VerdictEngine:
    @staticmethod
    def _passed(telemetry: Dict[str, Any], key: str) -> bool:
        """A check counts as passed only if it explicitly reported PASSED."""
        return telemetry.get(key, {}).get("status") == PASS_STATUS

    @staticmethod
    def _score(telemetry: Dict[str, Any], key: str) -> Any:
        """Returns a check's numeric value, or None if it was never computed."""
        value = telemetry.get(key, {}).get("value")
        return value if isinstance(value, (int, float)) else None

    @staticmethod
    def evaluate(session: SessionState) -> VerdictReport:
        """
        Evaluates the global Mastercard KYC Decision Matrix:
        PASS = Automation==FALSE and VirtualCam==FALSE and FlashPAD==PASS
               and Action==PASS and FakeScore<0.20 and CosineSim>=0.85

        Every check fails closed: a missing, pending or non-numeric result is
        treated as a failure, never as a pass.
        """
        telemetry = session.telemetry
        passed = VerdictEngine._passed
        fraud_flags = []

        # 1. Automation Check
        if not passed(telemetry, "automation"):
            fraud_flags.append("BOT_AUTOMATION_DETECTED")

        # 2. Camera Driver & Loopback
        if not passed(telemetry, "camera_driver"):
            fraud_flags.append("VIRTUAL_CAMERA_INJECTION")

        # 3. Frame Jitter
        if not passed(telemetry, "frame_jitter"):
            fraud_flags.append("SYNTHETIC_FRAME_PACING")

        # 4. Flash-PAD Optical Sync
        if not passed(telemetry, "flash_pad"):
            fraud_flags.append("OPTICAL_REFLECTION_MISMATCH")

        # 5. Dynamic Action Challenge
        if not passed(telemetry, "action_challenge"):
            fraud_flags.append("LIVENESS_ACTION_FAILED")

        # 6. Deepfake AI Fake Score (< 0.20)
        fake_score = VerdictEngine._score(telemetry, "ai_fake_score")
        if fake_score is None or fake_score >= FAKE_SCORE_MAX:
            fraud_flags.append("AI_SYNTHETIC_DEEPFAKE_DETECTED")

        # 7. 1:1 Face Match Cosine Similarity (>= 0.85)
        similarity = VerdictEngine._score(telemetry, "face_match")
        if similarity is None or similarity < SIMILARITY_MIN:
            fraud_flags.append("IDENTITY_FACIAL_MISMATCH")

        # Global decision
        is_passed = len(fraud_flags) == 0

        if is_passed:
            result = VerdictResultEnum.VERIFIED
            # Both scores are guaranteed non-None here: a missing value would
            # have raised a fraud flag above.
            if similarity < SIMILARITY_STRONG or fake_score > FAKE_SCORE_STRONG:
                risk_level = RiskLevelEnum.MEDIUM
                summary = "KYC VERIFIED — ACCEPTABLE MARGIN (LOW/MEDIUM RISK)"
            else:
                risk_level = RiskLevelEnum.LOW
                summary = "KYC VERIFIED — BIOMETRICALLY AUTHENTICATED (LOW RISK)"
        else:
            result = VerdictResultEnum.FAILED
            risk_level = RiskLevelEnum.HIGH
            summary = f"VERIFICATION REJECTED: {', '.join(fraud_flags)}"
            
        duration = round(time.time() - (session.started_at or session.created_at), 1)
        
        report = VerdictReport(
            session_id=session.session_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            duration_seconds=duration,
            result=result,
            risk_level=risk_level,
            checks=telemetry,
            fraud_flags=fraud_flags,
            summary_message=summary
        )
        
        session.verdict_report = report
        return report


verdict_engine = VerdictEngine()
