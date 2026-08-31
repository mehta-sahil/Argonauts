# syntax=docker/dockerfile:1
#
# Build context is this directory (the project root), not backend/ — the app needs
# both backend/app and the sibling models/ directory.
#
#   docker build -t kyc-backend .
#   docker run --rm -p 8000:8000 -e KYC_ALLOWED_ORIGINS=http://localhost:5173 kyc-backend

# ---------------------------------------------------------------------------
# Stage 1: fetch the ArcFace ResNet-50 weights.
# Isolated so the ~280 MB archive is cached across builds and never reaches the
# final image — only the single extracted .onnx is copied forward.
# ---------------------------------------------------------------------------
FROM python:3.12-slim AS modelfetch

ARG ARCFACE_URL=https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_l.zip

RUN apt-get update && apt-get install -y --no-install-recommends curl unzip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /fetch
RUN curl -fsSL -o buffalo_l.zip "$ARCFACE_URL" \
    && unzip -q buffalo_l.zip -d extracted \
    && find extracted -name 'w600k_r50.onnx' -exec cp {} /fetch/w600k_r50.onnx \; \
    && test -s /fetch/w600k_r50.onnx \
    && echo "ArcFace w600k_r50.onnx: $(stat -c%s /fetch/w600k_r50.onnx) bytes"

# ---------------------------------------------------------------------------
# Stage 2: runtime.
# Python is pinned to 3.12 deliberately: requirements.txt caps numpy below 2.2,
# which publishes no wheels for 3.13+. On a newer interpreter numpy is built from
# source and then segfaults on import — a green build that dies at startup.
# ---------------------------------------------------------------------------
FROM python:3.12-slim

# opencv-python-headless drops the GUI stack but still links against glib.
# curl is needed by HEALTHCHECK below.
RUN apt-get update && apt-get install -y --no-install-recommends \
        libglib2.0-0 \
        curl \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    KYC_MODELS_DIR=/app/models

WORKDIR /app

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Fail the build if OpenCV 5.x slipped through. It ships cv2/data without the
# Haar cascade XMLs, which silently reduces detect_face() to a centre-crop that
# accepts any image as a valid face. A broken build beats a broken deploy.
RUN python -c "import cv2, os; \
p = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'; \
assert os.path.exists(p), 'Haar cascades missing — opencv-python-headless 5.x is installed; pin <5.0'; \
print('OpenCV', cv2.__version__, '— Haar cascades present')"

COPY backend/app ./app
COPY backend/tests ./tests
COPY models/face_detection_yunet_2023mar.onnx ./models/
COPY --from=modelfetch /fetch/w600k_r50.onnx ./models/

# Confirm the app imports and the ArcFace session actually loads from
# KYC_MODELS_DIR before the image is considered good.
RUN python -c "from app.face_matcher import face_matcher; \
assert face_matcher.arcface_session is not None, 'ArcFace ONNX failed to load'; \
assert face_matcher.haar_cascade is not None, 'Haar cascade failed to load'; \
print('Model load OK:', face_matcher.models_dir)"

RUN useradd --create-home --uid 10001 kyc && chown -R kyc:kyc /app
USER kyc

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:8000/api/health || exit 1

# --workers must stay 1. Sessions live in this process's memory (session.py), so a
# second worker would serve /ws/{id} from a process that never saw the upload.
# Scale by running more tasks behind a sticky load balancer, not more workers.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
