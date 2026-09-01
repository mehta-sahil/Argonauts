"""Live voice-clone API for the voice-auth lab.

The browser records the user, posts the clip here, and this drives Sarvam's
dubbing pipeline to return that same voice speaking the other language.

Sarvam refuses same-language dubbing, so the direction is always a real
language switch: en-IN -> hi-IN or hi-IN -> en-IN. That is the demo — the
clone says words the speaker never said, in a language they never spoke.

The API key lives here and never reaches the browser.
"""
import json
import os
import subprocess
import tempfile
import time
import uuid
from collections import deque

import httpx
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware

SARVAM_KEY = os.environ.get("SARVAM_API_KEY", "")
DUB_BASE = "https://studio.sarvam.ai/api/dubbing"

# Sarvam accepts wav/mp3/m4a but not the webm/opus MediaRecorder produces, so
# every upload is transcoded to mono 48k WAV first. That is also the format
# biomarkers.extract_from_wav() expects, so the same file feeds both paths.
FFMPEG = os.environ.get("FFMPEG_BIN", "ffmpeg")

# Every clone costs real money (~Rs 40/min of audio) against a prepaid balance,
# and this endpoint is public once deployed. These caps exist so a single
# visitor - or a bored one holding the record button - cannot drain it.
MAX_UPLOAD_BYTES = int(os.environ.get("VA_MAX_UPLOAD_BYTES", 12_000_000))
MAX_SECONDS = float(os.environ.get("VA_MAX_SECONDS", 45))
RATE_PER_IP = int(os.environ.get("VA_RATE_PER_IP", 3))          # clones per window
RATE_WINDOW = int(os.environ.get("VA_RATE_WINDOW", 3600))       # seconds
DAILY_CAP = int(os.environ.get("VA_DAILY_CAP", 40))             # clones per day, all users

_hits: dict[str, deque] = {}
_day: dict[str, int] = {"stamp": 0, "count": 0}


def _rate_check(ip: str) -> None:
    now = time.time()

    day = int(now // 86400)
    if _day["stamp"] != day:
        _day["stamp"], _day["count"] = day, 0
    if _day["count"] >= DAILY_CAP:
        raise HTTPException(429, "the demo's daily clone budget is spent - try tomorrow")

    q = _hits.setdefault(ip, deque())
    while q and now - q[0] > RATE_WINDOW:
        q.popleft()
    if len(q) >= RATE_PER_IP:
        wait = int((RATE_WINDOW - (now - q[0])) / 60) + 1
        raise HTTPException(429, f"{RATE_PER_IP} clones an hour per visitor - try again in {wait} min")

    q.append(now)
    _day["count"] += 1


def _duration(path: str) -> float:
    """Read the clip length so an over-long upload is refused before it is billed."""
    probe = subprocess.run(
        [os.environ.get("FFPROBE_BIN", "ffprobe"), "-v", "error",
         "-show_entries", "format=duration", "-of", "json", path],
        capture_output=True,
    )
    try:
        return float(json.loads(probe.stdout)["format"]["duration"])
    except Exception:
        return 0.0

app = FastAPI(title="Voice-Auth Bypass - live clone")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

JOBS: dict[str, dict] = {}


def _headers() -> dict:
    if not SARVAM_KEY:
        raise HTTPException(503, "SARVAM_API_KEY is not set on the server")
    return {"api-subscription-key": SARVAM_KEY}


def _to_wav(raw: bytes, suffix: str) -> bytes:
    """Transcode whatever the browser sent into mono 48k PCM WAV."""
    with tempfile.TemporaryDirectory() as d:
        src = os.path.join(d, "in" + suffix)
        dst = os.path.join(d, "out.wav")
        with open(src, "wb") as f:
            f.write(raw)
        secs = _duration(src)
        if secs > MAX_SECONDS:
            raise HTTPException(
                413, f"clip is {secs:.0f}s - the demo accepts up to {MAX_SECONDS:.0f}s"
            )
        proc = subprocess.run(
            [FFMPEG, "-y", "-v", "error", "-i", src, "-t", str(MAX_SECONDS),
             "-vn", "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", dst],
            capture_output=True,
        )
        if proc.returncode != 0 or not os.path.exists(dst):
            raise HTTPException(400, f"could not decode audio: {proc.stderr.decode()[:300]}")
        with open(dst, "rb") as f:
            return f.read()


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "key_present": bool(SARVAM_KEY),
        "max_seconds": MAX_SECONDS,
        "per_ip_hourly": RATE_PER_IP,
        "daily_remaining": max(0, DAILY_CAP - _day["count"]),
    }


@app.post("/api/clone")
async def clone(
    request: Request,
    file: UploadFile = File(...),
    src_lang: str = Form("en-IN"),
    target_lang: str = Form("hi-IN"),
):
    _rate_check(request.client.host if request.client else "unknown")

    if src_lang == target_lang:
        raise HTTPException(400, "source and target must differ - same-language dubbing is not supported")

    raw = await file.read()
    if not raw:
        raise HTTPException(400, "empty upload")
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, f"upload is over the {MAX_UPLOAD_BYTES // 1_000_000} MB limit")

    suffix = os.path.splitext(file.filename or "")[1] or ".webm"
    wav = _to_wav(raw, suffix)

    async with httpx.AsyncClient(timeout=180) as cx:
        created = await cx.post(
            f"{DUB_BASE}/jobs",
            headers={**_headers(), "Content-Type": "application/json"},
            json={
                "src_lang": src_lang,
                "target_langs": [target_lang],
                "num_speakers": 1,
                "voice_cloning": True,
                "register": "auto",
                "editor_flow": False,
            },
        )
        if created.status_code != 200:
            raise HTTPException(created.status_code, created.text[:400])
        data = created.json()["data"]
        job_id, upload_url = data["job_id"], data["upload_url"]

        up = await cx.put(
            upload_url,
            headers={"x-ms-blob-type": "BlockBlob", "Content-Type": "audio/wav"},
            content=wav,
        )
        if up.status_code not in (200, 201):
            raise HTTPException(502, f"upload failed: {up.status_code}")

        started = await cx.post(f"{DUB_BASE}/jobs/{job_id}/start", headers=_headers())
        if started.status_code not in (200, 202):
            raise HTTPException(started.status_code, started.text[:400])

    token = uuid.uuid4().hex[:12]
    JOBS[token] = {"job_id": job_id, "src": src_lang, "tgt": target_lang}
    return {"token": token, "job_id": job_id}


@app.get("/api/clone/{token}")
async def clone_status(token: str):
    job = JOBS.get(token)
    if not job:
        raise HTTPException(404, "unknown job")

    async with httpx.AsyncClient(timeout=60) as cx:
        r = await cx.get(f"{DUB_BASE}/jobs/{job['job_id']}/live-status", headers=_headers())
    if r.status_code != 200:
        raise HTTPException(r.status_code, r.text[:400])

    st = r.json().get("data", {})
    out = {
        "status": st.get("status"),
        "progress": st.get("progress"),
        "step": st.get("current_step_label"),
    }
    if st.get("status") == "completed":
        ex = st.get("export") or {}
        # Prefer an isolated audio track; fall back to the dubbed video, which
        # a browser <audio> element will still play the soundtrack of.
        out["audio_url"] = (
            ex.get("dubbed_audio_url")
            or ex.get("audio_url")
            or ex.get("dubbed_video_url")
        )
        out["export"] = ex
    if st.get("status") == "failed":
        out["error"] = st.get("error_message")
    return out


@app.get("/api/clone/{token}/audio")
async def clone_audio(token: str):
    """Stream the finished clone through this origin.

    The Azure blob URLs are signed and short-lived, and fetching them straight
    from the page trips CORS, so the audio is proxied rather than linked.
    """
    from fastapi.responses import Response

    status = await clone_status(token)
    url = status.get("audio_url")
    if not url:
        raise HTTPException(409, "not finished yet")

    async with httpx.AsyncClient(timeout=180, follow_redirects=True) as cx:
        r = await cx.get(url)
    if r.status_code != 200:
        raise HTTPException(502, f"could not fetch result: {r.status_code}")

    ctype = r.headers.get("content-type", "audio/mpeg")
    return Response(content=r.content, media_type=ctype)
