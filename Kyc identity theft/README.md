# Mastercard AI Defense Lab — Automated KYC Verification Pipeline

[![Mastercard Security](https://img.shields.io/badge/Security-Mastercard%20AI%20Defense-EB001B?style=for-the-badge&logo=mastercard)](https://www.mastercard.com)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![MediaPipe](https://img.shields.io/badge/Biometrics-MediaPipe%20WASM-4285F4?style=for-the-badge&logo=google)](https://developers.google.com/mediapipe)

> A state-of-the-art, deepfake-resistant KYC verification pipeline running as a Chrome web application with real-time biometric telemetry, optical presentation attack detection (Flash-PAD), and multi-spectral forensics.

---

## 🏛️ System Architecture

```
[Phase 1: ID Ingestion] ──► [Phase 2: Environment Gate] ──► [Phase 3: Optical Flash-PAD]
                                                                     │
                                                                     ▼
[Phase 6: Verdict & Risk] ◄── [Phase 5: Forensic AI] ◄── [Phase 4: Action Challenge]
```

### End-to-End Defense Layers

| Phase | Layer | Attack Vector Defended | Implementation |
|---|---|---|---|
| **Phase 1** | **ID Document Baseline** | Identity Impersonation | Uploads government ID, extracts face crop, generates 512-d ArcFace reference embedding. |
| **Phase 2** | **Environment Gate** | Puppeteer/Selenium Bots & OBS Virtual Cameras | `navigator.webdriver`, headless signatures, device label blocklists, 60-frame arrival delta variance ($\sigma^2$). |
| **Phase 3** | **Optical Flash-PAD** | Replay Video & Screen Deepfakes | Pseudo-random 5-color screen flashes (150ms each); measures skin chromaticity reflection correlation. |
| **Phase 4** | **Dynamic Action Challenge** | Pre-recorded Video Injection | Randomized challenge (Blink N, Smile Hold, Turn Head, Eyebrow Raise) tracked via 468 MediaPipe landmarks. |
| **Phase 5** | **Forensic AI Analysis** | GAN / Diffusion Face Swaps | Sobel boundary gradient residual + 2D FFT periodic spectral grid anomaly + AI Fake Probability. |
| **Phase 6** | **Identity Matching & Verdict** | Synthetic Mask Impersonation | 1:1 Cosine Similarity between live webcam embedding and ID reference ($\ge 0.85$ threshold) & Decision Matrix. |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (Tested on v23.5)
- **Python**: v3.10+ (Tested on v3.12)
- **Google Chrome** (with webcam access)

---

### Step 1: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
# source venv/bin/activate

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Start FastAPI server (Port 8000)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

### Step 2: Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server (Port 5173)
npm run dev
```

Open **`http://localhost:5173`** in Google Chrome.

---

## 🧪 Running Automated Tests

Run backend unit and integration test suite:
```bash
cd backend
.\venv\Scripts\pytest -v tests/
```

---

## ⚖️ Global Decision Matrix

$$\text{PASS} = (\text{Automation}=\text{FALSE}) \land (\text{VirtualCam}=\text{FALSE}) \land (\text{FlashPAD}=\text{PASS}) \land (\text{Action}=\text{PASS}) \land (\text{FakeScore} < 0.20) \land (\text{CosineSim} \ge 0.85)$$

- **LOW RISK**: All checks pass with strong margins ($\text{Sim} \ge 0.90$, $\text{Fake} \le 0.12$).
- **MEDIUM RISK**: All checks pass with acceptable thresholds ($0.85 \le \text{Sim} < 0.90$).
- **HIGH RISK (FAILED)**: Any security or liveness check fails.

---

## 📂 Repository Layout

```
MasterCard/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entry point & REST/WebSocket routes
│   │   ├── ws_handler.py         # Phase orchestration & streaming handler
│   │   ├── models.py             # Pydantic schemas & enums
│   │   ├── session.py            # In-memory session manager & circular frame buffer
│   │   ├── environment.py        # Bot, virtual camera, & jitter variance checks
│   │   ├── flash_pad.py          # Optical Flash-PAD sequence & chromaticity analyzer
│   │   ├── action_challenge.py   # EAR, MAR, Yaw & dynamic action state machine
│   │   ├── forensics.py          # Sobel boundary gradient & 2D FFT spectral analysis
│   │   ├── face_matcher.py       # 512-d ArcFace embedding & 1:1 cosine similarity
│   │   └── verdict.py            # Decision matrix & risk classification engine
│   ├── tests/
│   │   └── test_pipeline.py      # Automated test suite
│   ├── requirements.txt
│   └── venv/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx        # Mastercard AI Defense Lab branded header
│   │   │   ├── IDUpload.jsx      # ID document ingestion & demo ID generator
│   │   │   ├── VideoPanel.jsx    # Live WebRTC stream & Flash-PAD overlay HUD
│   │   │   ├── TelemetryPanel.jsx# Real-time multi-layer security check cards
│   │   │   ├── FaceMeshOverlay.jsx # 468-point landmark wireframe canvas
│   │   │   ├── VerdictBar.jsx    # 60s countdown timer & final decision banner
│   │   │   └── BlockedModal.jsx  # Hard-block alert on environment anomalies
│   │   ├── hooks/
│   │   │   ├── useEnvironmentCheck.js
│   │   │   ├── useMediaPipe.js
│   │   │   ├── useFrameCapture.js
│   │   │   └── useWebSocket.js
│   │   ├── App.jsx               # Main application coordinator
│   │   ├── main.jsx
│   │   └── index.css             # Tailwind CSS & cyber scanline styling
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── models/
│   └── download_models.py        # Model asset downloader
├── docs/                         # Detailed architecture specifications
└── tickets/                      # Tracer-bullet delivery tickets
```

---

## 🛡️ License
Built for the **Mastercard AI Defense Hackathon Challenge**.
