import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple
from app.models import VerdictReport, VerdictResultEnum, RiskLevelEnum
from app.session import SessionState


class VerdictEngine:
    @staticmethod
    def evaluate(session: SessionState) -> VerdictReport:
        """
        Evaluates the global Mastercard KYC Decision Matrix:
        PASS = Automation==FALSE and VirtualCam==FALSE and FlashPAD==PASS 
               and Action==PASS and FakeScore<0.20 and CosineSim>=0.85
        """
        telemetry = session.telemetry
        fraud_flags = []
        
        # 1. Automation Check
        auto_check = telemetry.get("automation", {})
        if auto_check.get("status") != "PASSED":
            fraud_flags.append("BOT_AUTOMATION_DETECTED")
            
        # 2. Camera Driver & Loopback
        cam_check = telemetry.get("camera_driver", {})
        if cam_check.get("status") not in ["HARDWARE_OK", "PASSED"]:
            fraud_flags.append("VIRTUAL_CAMERA_INJECTION")
            
        # 3. Frame Jitter
        jitter_check = telemetry.get("frame_jitter", {})
        if jitter_check.get("status") == "SYNTHETIC":
            fraud_flags.append("SYNTHETIC_FRAME_PACING")
            
        # 4. Flash-PAD Optical Sync
        flash_check = telemetry.get("flash_pad", {})
        if flash_check.get("status") not in ["PASS", "PASSED"]:
            fraud_flags.append("OPTICAL_REFLECTION_MISMATCH")
            
        # 5. Dynamic Action Challenge
        action_check = telemetry.get("action_challenge", {})
        if action_check.get("status") not in ["PASS", "PASSED"]:
            fraud_flags.append("LIVENESS_ACTION_FAILED")
            
        # 6. Deepfake AI Fake Score (< 0.20)
        fake_check = telemetry.get("ai_fake_score", {})
        fake_score = fake_check.get("value", 0.08)
        if fake_score is not None and fake_score >= 0.20:
            fraud_flags.append("AI_SYNTHETIC_DEEPFAKE_DETECTED")
            
        # 7. 1:1 Face Match Cosine Similarity (>= 0.85)
        face_check = telemetry.get("face_match", {})
        similarity = face_check.get("value", 0.90)
        if similarity is None or similarity < 0.85:
            fraud_flags.append("IDENTITY_FACIAL_MISMATCH")
            
        # Global decision
        is_passed = len(fraud_flags) == 0
        
        if is_passed:
            result = VerdictResultEnum.VERIFIED
            # Check for borderline scores
            if similarity < 0.88 or (fake_score is not None and fake_score > 0.14):
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
