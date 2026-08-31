import io
import os
import time
import asyncio
import cv2
import numpy as np
from contextlib import asynccontextmanager
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.models import UploadIDResponse
from app.session import session_manager
from app.face_matcher import face_matcher
from app.ws_handler import WebSocketHandler

# Sessions are held in memory and each one buffers up to 100 decoded frames
# (~92 MB). Without an eviction sweep, abandoned sessions accumulate until the
# process is OOM-killed.
SESSION_SWEEP_INTERVAL_S = 60
SESSION_MAX_AGE_S = 600


async def _session_sweeper():
    while True:
        await asyncio.sleep(SESSION_SWEEP_INTERVAL_S)
        try:
            removed = session_manager.cleanup_old_sessions(SESSION_MAX_AGE_S)
            if removed:
                print(f"[Sessions] Evicted {removed} expired session(s); "
                      f"{len(session_manager.sessions)} active.")
        except Exception as e:
            print(f"[Sessions] Sweep error: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    sweeper = asyncio.create_task(_session_sweeper())
    try:
        yield
    finally:
        sweeper.cancel()
        try:
            await sweeper
        except asyncio.CancelledError:
            pass


app = FastAPI(
    title="Mastercard AI Defense Lab — Automated KYC Verification",
    description="End-to-end deepfake-resistant KYC verification pipeline",
    version="1.0.0",
    lifespan=lifespan
)

# Explicit origin allowlist. "*" combined with allow_credentials is invalid per the
# CORS spec, and Starlette resolves it by echoing back whatever Origin the caller
# sent — so any website could drive this API with the user's credentials. Set
# KYC_ALLOWED_ORIGINS (comma-separated) to the deployed frontend origin.
DEFAULT_ALLOWED_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("KYC_ALLOWED_ORIGINS", DEFAULT_ALLOWED_ORIGINS).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "Mastercard AI Defense Lab Verification Core",
        "timestamp": time.time()
    }


@app.post("/api/upload-id", response_model=UploadIDResponse)
async def upload_id_document(file: UploadFile = File(...)):
    """
    Phase 1: Ingests government ID document photo, extracts reference face crop
    and generates 512-d ArcFace embedding baseline.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a JPEG or PNG image.")

    try:
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large. Maximum allowed size is 10MB.")
        if len(contents) < 100:
            raise HTTPException(status_code=400, detail="File payload is too small or corrupt. Minimum size is 100 bytes.")

        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        img_np = np.array(pil_img)
        img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

        # Detect face on ID document
        detected, bbox, conf = face_matcher.detect_face(img_bgr)
        if not detected or bbox is None:
            raise HTTPException(
                status_code=400,
                detail="No clear face detected on the uploaded ID document. Please ensure the document is well-lit and unobstructed."
            )

        # Extract face crop
        _, face_crop_b64 = face_matcher.extract_face_crop(img_bgr, bbox, target_size=(160, 160))

        # Generate 512-d feature embedding vector
        embedding = face_matcher.generate_embedding(img_bgr)

        # Initialize in-memory session
        session = session_manager.create_session()
        session.id_embedding = embedding
        session.id_face_crop_base64 = face_crop_b64

        return UploadIDResponse(
            session_id=session.session_id,
            face_crop_base64=face_crop_b64,
            face_detected=True,
            confidence=round(conf, 3),
            message="ID Document Baseline Extracted Successfully."
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing ID document: {str(e)}")


@app.get("/api/session/{session_id}")
async def get_session_status(session_id: str):
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired")
        
    return {
        "session_id": session.session_id,
        "phase": session.current_phase,
        "telemetry": session.telemetry,
        "is_blocked": session.is_blocked,
        "block_reason": session.block_reason,
        "verdict": session.verdict_report.model_dump() if session.verdict_report else None
    }


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await WebSocketHandler.handle_connection(websocket, session_id)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
