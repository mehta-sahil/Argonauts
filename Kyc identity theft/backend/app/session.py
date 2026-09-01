import asyncio
import time
import uuid
from typing import Dict, List, Optional, Any
from collections import deque
import numpy as np
from app.models import (
    PhaseEnum,
    RiskLevelEnum,
    VerdictResultEnum,
    VerdictReport,
    ActionChallengeConfig,
    FlashPADConfig
)


class BufferedFrame:
    def __init__(
        self,
        timestamp: float,
        image_bgr: np.ndarray,
        face_bbox: Optional[List[int]] = None,
        face_confidence: float = 0.0,
        landmarks: Optional[List[List[float]]] = None,
        phase: Optional[str] = None,
        flash_color: Optional[str] = None
    ):
        self.timestamp = timestamp
        self.image_bgr = image_bgr
        self.face_bbox = face_bbox  # [x, y, w, h]
        self.face_confidence = face_confidence
        self.landmarks = landmarks
        self.phase = phase
        self.flash_color = flash_color


class SessionState:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.created_at = time.time()
        self.started_at: Optional[float] = None
        self.current_phase = PhaseEnum.ID_INGESTION
        
        # ID Document Baseline
        self.id_embedding: Optional[np.ndarray] = None
        self.id_face_crop_base64: Optional[str] = None
        
        # In-memory Circular Frame Buffer (last 100 frames)
        self.frame_buffer: deque[BufferedFrame] = deque(maxlen=100)
        
        # Phase Configurations & State
        self.flash_config: Optional[FlashPADConfig] = None
        self.flash_timestamps: List[Dict[str, Any]] = []
        
        self.action_config: Optional[ActionChallengeConfig] = None
        self.action_server_count: int = 0
        self.action_client_count: int = 0
        self.action_verified: bool = False
        
        # Environment & Forensics Telemetry
        self.telemetry: Dict[str, Dict[str, Any]] = {
            "automation": {"status": "PENDING", "display": "Checking...", "value": None},
            "camera_driver": {"status": "PENDING", "display": "Checking...", "value": None},
            "frame_jitter": {"status": "PENDING", "display": "Measuring...", "value": None},
            "flash_pad": {"status": "PENDING", "display": "Pending...", "value": None},
            "action_challenge": {"status": "PENDING", "display": "Pending...", "value": None},
            "sobel_residual": {"status": "PENDING", "display": "Pending...", "value": None},
            "fft_grid": {"status": "PENDING", "display": "Pending...", "value": None},
            "ai_fake_score": {"status": "PENDING", "display": "Pending...", "value": None},
            "face_match": {"status": "PENDING", "display": "Pending...", "value": None},
        }
        
        # Set by the env_data handler. Phase 2 waits on this instead of blind-
        # sleeping, so the gate cannot advance before the client's environment
        # report has actually been scored.
        self.env_received: asyncio.Event = asyncio.Event()

        self.is_blocked: bool = False
        self.block_reason: Optional[str] = None
        self.fraud_flags: List[str] = []
        self.verdict_report: Optional[VerdictReport] = None

    def add_frame(self, frame: BufferedFrame):
        self.frame_buffer.append(frame)

    def get_best_face_frame(self) -> Optional[BufferedFrame]:
        """Finds the frame with highest face detection confidence in buffer."""
        if not self.frame_buffer:
            return None
        valid_frames = [f for f in self.frame_buffer if f.face_confidence > 0.4 and f.image_bgr is not None]
        if not valid_frames:
            return self.frame_buffer[-1]
        return max(valid_frames, key=lambda f: f.face_confidence)

    def get_recent_frames(self, count: int = 10) -> List[BufferedFrame]:
        return list(self.frame_buffer)[-count:]

    def release_frames(self):
        """
        Drops the decoded frame buffer. This is the bulk of a session's memory
        (up to 100 x 640x480x3 BGR arrays, ~92 MB), and it is dead weight once the
        verdict has been produced. The verdict report itself is retained.
        """
        self.frame_buffer.clear()


class SessionManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SessionManager, cls).__new__(cls)
            cls._instance.sessions: Dict[str, SessionState] = {}
        return cls._instance

    def create_session(self) -> SessionState:
        session_id = str(uuid.uuid4())
        session = SessionState(session_id)
        self.sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[SessionState]:
        return self.sessions.get(session_id)

    def remove_session(self, session_id: str):
        session = self.sessions.pop(session_id, None)
        if session is not None:
            session.release_frames()

    def cleanup_old_sessions(self, max_age_seconds: int = 600) -> int:
        """Evicts sessions older than max_age_seconds. Returns the number removed."""
        now = time.time()
        expired = [sid for sid, s in self.sessions.items() if (now - s.created_at) > max_age_seconds]
        for sid in expired:
            self.remove_session(sid)
        return len(expired)


session_manager = SessionManager()
