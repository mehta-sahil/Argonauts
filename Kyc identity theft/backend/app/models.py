from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class PhaseEnum(str, Enum):
    ID_INGESTION = "id_ingestion"
    ENVIRONMENT_CHECK = "env_check"
    FLASH_PAD = "flash_pad"
    ACTION_CHALLENGE = "action_challenge"
    FORENSICS = "forensics"
    FACE_MATCH = "face_match"
    VERDICT = "verdict"
    COMPLETED = "completed"
    BLOCKED = "blocked"


class ActionTypeEnum(str, Enum):
    BLINK_N = "BLINK_N"
    SMILE_HOLD = "SMILE_HOLD"
    HEAD_TURN = "HEAD_TURN"
    EYEBROW_RAISE = "EYEBROW_RAISE"


class CheckStatusEnum(str, Enum):
    PENDING = "PENDING"
    CHECKING = "CHECKING"
    PASSED = "PASSED"
    FAILED = "FAILED"
    WARNING = "WARNING"


class RiskLevelEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class VerdictResultEnum(str, Enum):
    VERIFIED = "VERIFIED"
    FAILED = "FAILED"
    BLOCKED = "BLOCKED"


class UploadIDResponse(BaseModel):
    session_id: str
    face_crop_base64: str
    face_detected: bool
    confidence: float
    message: str


class TelemetryItem(BaseModel):
    check: str
    status: str
    display_value: Optional[str] = None
    numeric_value: Optional[float] = None
    details: Optional[Dict[str, Any]] = None


class ActionChallengeConfig(BaseModel):
    action: ActionTypeEnum
    prompt: str
    params: Dict[str, Any]
    timeout_s: int = 15


class FlashPADConfig(BaseModel):
    colors: List[str]
    duration_ms: int = 150
    delay_before_ms: int = 800


class VerdictReport(BaseModel):
    session_id: str
    timestamp: str
    duration_seconds: float
    result: VerdictResultEnum
    risk_level: RiskLevelEnum
    checks: Dict[str, Dict[str, Any]]
    fraud_flags: List[str]
    summary_message: str
