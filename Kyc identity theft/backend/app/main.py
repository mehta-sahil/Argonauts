import io
import os
import tempfile
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
from app.forensics import forensics_engine
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
            face_detected=detected,
            confidence=round(conf, 3),
            message="ID Document Baseline Extracted Successfully."
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing ID document: {str(e)}")


# Red-team entry point. The live flow only ever sees webcam frames, so there was
# no way to show the forensics catching a known deepfake. This runs the same
# engine over an uploaded clip and reports what it found.
MAX_VIDEO_BYTES = 50 * 1024 * 1024
VIDEO_SAMPLE_FRAMES = 24


@app.post("/api/analyze-video")
async def analyze_video(file: UploadFile = File(...)):
    """
    Runs the deepfake forensics over an uploaded video and returns the per-frame
    scores plus a verdict. Same Sobel / FFT / classifier path the live session
    uses, so a flagged clip here would be flagged there.
    """
    if not (file.content_type or "").startswith("video/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a video (MP4, WebM or MOV).")

    contents = await file.read()
    if len(contents) > MAX_VIDEO_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Maximum allowed size is 50MB.")
    if len(contents) < 1024:
        raise HTTPException(status_code=400, detail="File payload is too small or corrupt.")

    # OpenCV's VideoCapture reads from a path, not from bytes.
    suffix = os.path.splitext(file.filename or "")[1] or ".mp4"
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not decode this video. Try re-encoding it as H.264 MP4.")

        total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        fps = float(cap.get(cv2.CAP_PROP_FPS) or 0) or None

        # Sample evenly across the clip rather than taking the first N frames —
        # a face swap can be clean at the start and fall apart later.
        step = max(1, total // VIDEO_SAMPLE_FRAMES) if total > 0 else 1

        face_frames, per_frame = [], []
        idx = read = 0
        while read < VIDEO_SAMPLE_FRAMES:
            ok, frame = cap.read()
            if not ok:
                break
            if idx % step == 0:
                detected, bbox, conf = face_matcher.detect_face(frame)
                if detected and bbox is not None:
                    sobel, sobel_status, _ = forensics_engine.compute_sobel_residual(frame, bbox)
                    fft, fft_status, _ = forensics_engine.compute_fft_anomaly(frame)
                    crop, _ = face_matcher.extract_face_crop(frame, bbox, target_size=(224, 224))
                    face_frames.append(crop)
                    per_frame.append({
                        "frame": idx,
                        "timestamp_s": round(idx / fps, 2) if fps else None,
                        "face_confidence": round(float(conf), 3),
                        "sobel_residual": round(float(sobel), 4),
                        "sobel_status": sobel_status,
                        "fft_anomaly": round(float(fft), 4),
                        "fft_status": fft_status,
                    })
                read += 1
            idx += 1
        cap.release()

        if not per_frame:
            raise HTTPException(
                status_code=400,
                detail="No face found in any sampled frame. The forensics need a visible face to analyse."
            )

        mean_sobel = float(np.mean([f["sobel_residual"] for f in per_frame]))
        mean_fft = float(np.mean([f["fft_anomaly"] for f in per_frame]))
        fake_score, status, details = forensics_engine.classify_deepfake(face_frames, mean_sobel, mean_fft)

        return JSONResponse({
            "filename": file.filename,
            "frames_analyzed": len(per_frame),
            "duration_s": round(total / fps, 2) if (fps and total) else None,
            "sobel_residual": round(mean_sobel, 4),
            "sobel_status": per_frame[-1]["sobel_status"],
            "fft_anomaly": round(mean_fft, 4),
            "fft_status": per_frame[-1]["fft_status"],
            "ai_fake_score": round(float(fake_score), 4),
            "verdict": status,
            "flagged": bool(fake_score >= 0.20),
            # Says which path actually ran, so the dashboard never implies the
            # neural model was used when it was not.
            "engine": details.get("model"),
            "neural_model_loaded": forensics_engine.model is not None,
            "per_frame": per_frame,
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analysing video: {str(e)}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


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
