# Mastercard AI Defense Lab — Project Overview

> **Label:** `ready-for-agent`

## Problem Statement

Current KYC (Know Your Customer) identity verification flows are vulnerable to deepfake attacks, virtual camera injection, automated bot submissions, and replay attacks. A bad actor can pass a naive liveness check using a pre-recorded video, a GAN-generated face swap, or a headless browser submitting synthetic frames. Financial institutions like Mastercard need a multi-layered defense pipeline that makes each of these attack vectors independently detectable.

## Solution

A browser-based, real-time KYC verification pipeline that chains six independent security phases into a single 60-second session. Each phase targets a different attack surface — from low-level browser automation flags up through optical physics-based liveness and AI-powered forensic analysis. The system runs as a Chrome web application with a React frontend and FastAPI backend connected via persistent WebSocket.

## System Architecture

```
[Phase 1: ID Ingestion] ──► [Phase 2: Environment Gate] ──► [Phase 3: Optical Flash-PAD]
                                                                     │
                                                                     ▼
[Phase 6: Verdict & Risk] ◄── [Phase 5: Forensic AI] ◄── [Phase 4: Action Challenge]
```

## Component Specs

| # | Spec | Phase | Description |
|---|------|-------|-------------|
| 01 | [ID Document Ingestion](./01-id-ingestion.md) | Phase 1 | Upload, face extraction, ArcFace embedding |
| 02 | [Environment Gate](./02-environment-gate.md) | Phase 2 | Bot detection, virtual camera, frame jitter |
| 03 | [Optical Flash-PAD](./03-flash-pad.md) | Phase 3 | Color flash challenge, chromaticity correlation |
| 04 | [Action Challenge](./04-action-challenge.md) | Phase 4 | MediaPipe landmark tracking, blink/smile/turn/eyebrow |
| 05 | [Deepfake Forensics](./05-deepfake-forensics.md) | Phase 5 | Sobel/FFT heuristics + EfficientNet-B0 classifier |
| 06 | [Identity Matching & Verdict](./06-identity-matching-verdict.md) | Phase 6 | Cosine similarity, decision matrix, final verdict |
| 07 | [Frontend Dashboard](./07-frontend-dashboard.md) | UI | React + Tailwind dark-theme dashboard |
| 08 | [WebSocket Communication](./08-websocket-communication.md) | Infra | Frame streaming, telemetry protocol, session lifecycle |
| 09 | [System Internals & Algorithms](./09-system-internals-and-algorithms.md) | Deep-Dive | Exact formulas for EAR, MAR, Flash-PAD, FFT & 512-d Cosine |

## Global Decision Matrix

$$\text{PASS} = \text{Automation} = \text{FALSE} \;\land\; \text{VirtualCam} = \text{FALSE} \;\land\; \text{Flash-PAD} = \text{PASS} \;\land\; \text{Action} = \text{PASS} \;\land\; \text{FakeScore} < 0.20 \;\land\; \text{CosineSim} \ge 0.85$$

## Technology Stack

| Layer | Choice |
|-------|--------|
| Frontend | Vite + React (JavaScript) + Tailwind CSS |
| Backend | FastAPI (Python) + Uvicorn |
| Communication | WebSocket (bidirectional, persistent) |
| Face Embedding | InsightFace / Multi-Scale 512-d DCT ArcFace |
| Landmark Tracking | MediaPipe Face Mesh (browser WASM) |
| Forensic Heuristics | OpenCV + NumPy |
| Forensic Classifier | EfficientNet-B0 (FaceForensics++ pre-trained) |
| Persistence | None — in-memory session state |
