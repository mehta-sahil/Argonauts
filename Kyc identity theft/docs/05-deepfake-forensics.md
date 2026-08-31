# Spec 05: Deepfake Forensic Analysis

> **Phase:** 5 · **Label:** `ready-for-agent`

## Problem Statement

State-of-the-art deepfakes (GAN-based face swaps, diffusion-model-generated faces) can pass human visual inspection. However, these generators leave statistical artifacts in the spatial and frequency domains: unnatural edge blending around facial boundaries, periodic grid patterns from transposed convolution layers, and high-frequency decay signatures that differ from natural camera images. The system needs a forensic analysis layer that detects these artifacts even when the deepfake appears visually convincing.

## Solution

A hybrid forensic pipeline combining two approaches:

1. **Heuristic analysis** (OpenCV + NumPy): Computes Sobel gradient variance and 2D FFT spectral peak ratios on face crop frames. These produce interpretable, real-time scores displayed in the telemetry dashboard — they're the "show your work" metrics that make the demo visually impressive.

2. **Neural classifier** (pre-trained EfficientNet-B0): A CNN trained on the FaceForensics++ dataset that takes a 224×224 face crop and outputs a fake probability score (0.0–1.0). This is the actual classification backbone with higher accuracy than the heuristics alone.

Both run server-side on frames collected during the session. The heuristic scores populate the dashboard telemetry; the neural classifier produces the definitive AI Fake Score used in the verdict decision matrix.

## User Stories

1. As a **security engineer**, I want the system to detect boundary artifacts from face-swap mask feathering, so that GAN-based face swaps with visible blending seams are flagged.
2. As a **security engineer**, I want the system to detect periodic grid patterns in the frequency domain, so that upsampling artifacts from transposed convolutions in GANs/diffusion models are identified.
3. As a **security engineer**, I want a pre-trained deep learning model to classify frames as real or fake, so that the system catches artifacts that simple heuristics miss.
4. As a **security engineer**, I want the AI Fake Score threshold to be configurable, so that the false positive/negative tradeoff can be tuned.
5. As a **user**, I want to see the Sobel Edge Residual and FFT Grid Anomaly scores updating in real-time on the dashboard, so that the forensic analysis is transparent and explainable.
6. As a **user**, I want to see the overall AI Fake Score, so that I understand the system's confidence that my video is authentic.
7. As the **backend**, I want to run the heuristic pipeline on every Nth frame (e.g., every 5th frame) for dashboard metrics, so that telemetry updates feel responsive without processing every frame.
8. As the **backend**, I want to run the neural classifier on 3–5 selected high-quality frames at the end of the session, so that classification accuracy is maximized without per-frame latency.
9. As the **backend**, I want to batch the neural classifier inference, so that GPU/CPU utilization is efficient.
10. As the **backend**, I want the forensic module to gracefully degrade if the pre-trained model fails to load, falling back to heuristic-only scoring with a warning.

## Implementation Decisions

### Heuristic Pipeline (for telemetry dashboard)

- **Sobel gradient analysis**:
  1. Crop face region from the frame using the bounding box from RetinaFace
  2. Expand the crop by 20% to include the face boundary region (where mask artifacts appear)
  3. Convert to grayscale
  4. Apply Sobel operator in X and Y directions: `cv2.Sobel(gray, cv2.CV_64F, 1, 0)` and `cv2.Sobel(gray, cv2.CV_64F, 0, 1)`
  5. Compute gradient magnitude: $G = \sqrt{G_x^2 + G_y^2}$
  6. Create a ring mask (face boundary ring, ~10px wide) around the face bbox edge
  7. Compute variance of gradient magnitude within the ring mask
  8. **Sobel score**: Low variance in the boundary ring suggests artificial feathering/blending. Score is normalized to 0.0–1.0 where lower = cleaner (more natural).
  9. Dashboard display: "Sobel Edge Residual: 0.04 (CLEAN)" or "0.42 (SUSPICIOUS)"

- **2D FFT spectral analysis**:
  1. Crop face region, convert to grayscale, resize to 256×256
  2. Apply windowing function (Hanning) to reduce spectral leakage
  3. Compute 2D FFT: `np.fft.fft2()` → shift → magnitude spectrum (log scale)
  4. Analyze the magnitude spectrum for periodic peaks:
     - Natural images have smooth spectral decay from center
     - GAN/diffusion outputs show periodic peaks at grid frequencies (from transposed convolution stride patterns)
  5. **FFT score**: Ratio of energy at periodic grid frequencies vs. overall spectral energy. High ratio = GAN artifacts detected.
  6. Dashboard display: "2D FFT Grid Anomaly: NO ARTIFACTS" or "PERIODIC PEAKS DETECTED"

- **Heuristic update frequency**: Process every 5th received frame (~3 FPS effective). Send telemetry update after each computation.

### Neural Classifier Pipeline (for classification)

- **Model**: EfficientNet-B0 fine-tuned on FaceForensics++ dataset (c23 compression variant). Binary classification: real vs. fake.
- **Model format**: PyTorch checkpoint (`.pth`). Loaded at backend startup via `torchvision.models.efficientnet_b0()` with modified final layer (2-class output).
- **Model size**: ~20MB (EfficientNet-B0 is compact).
- **Preprocessing**:
  1. Crop face using RetinaFace bbox with 10% margin
  2. Resize to 224×224
  3. Normalize with ImageNet mean/std: `mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]`
- **Inference**:
  1. Select 3–5 frames from the session (frames with highest face detection confidence, spread across the timeline)
  2. Batch inference through EfficientNet-B0
  3. Apply softmax to get per-frame fake probability
  4. **AI Fake Score**: Mean of per-frame fake probabilities (0.0–1.0)
- **Verdict threshold**: AI Fake Score < 0.20 = PASS (as defined in the decision matrix)
- **Fallback**: If the model file is missing or fails to load, log a warning and use the heuristic scores as the classification backbone: `fake_score = 0.4 * sobel_normalized + 0.6 * fft_normalized`

- **Telemetry messages**:
  ```json
  {"type": "telemetry", "check": "sobel", "score": 0.04, "status": "CLEAN"}
  {"type": "telemetry", "check": "fft", "status": "NO_ARTIFACTS", "peak_ratio": 0.02}
  {"type": "telemetry", "check": "ai_fake_score", "score": 0.08, "status": "PASS", "model": "efficientnet_b0", "frames_analyzed": 5}
  ```

### Model Sourcing

- A download script (`models/download_models.py`) fetches the pre-trained EfficientNet-B0 checkpoint from a public source (e.g., GitHub release or Hugging Face model hub).
- The checkpoint is stored in `models/deepfake_efficientnet_b0.pth`.
- SHA-256 hash verification ensures integrity.
- If no suitable FaceForensics++ checkpoint is publicly available, we will train a minimal model on a subset of FaceForensics++ data or use the heuristic-only fallback.

## Testing Decisions

- **Good tests** verify that the heuristic scores and classifier outputs are in expected ranges for known inputs.
- **Modules to test**:
  - `compute_sobel_score(frame)` — unit test: natural face photo → low score (<0.2); synthetically blurred boundary → high score (>0.5)
  - `compute_fft_score(frame)` — unit test: natural photo → no periodic peaks; image with deliberate grid overlay → periodic peaks detected
  - `classify_frame(frame)` — integration test: load model, run on a known real face → score < 0.3; run on a known GAN-generated face → score > 0.7
  - `run_forensics(frames)` — integration test: end-to-end pipeline returns combined results
- **Test fixtures**: Include 2–3 real face crops and 2–3 GAN-generated face crops (e.g., from ThisPersonDoesNotExist or StyleGAN outputs) in `tests/fixtures/`.

## Out of Scope

- Video-level temporal forensics (inter-frame consistency, flickering artifact detection).
- Audio deepfake detection (voice cloning).
- Explainable AI (GradCAM visualization of what the CNN detected) — would be impressive for the demo but adds implementation complexity.
- Real-time per-frame neural classification (too slow on CPU at 15 FPS).

## Further Notes

- EfficientNet-B0 inference on CPU takes ~30-50ms per frame. Batching 5 frames takes ~150-250ms total — well within the session budget.
- The heuristic Sobel/FFT scores serve primarily as **visual telemetry** for the dashboard. They demonstrate the forensic analysis is happening and are interpretable by non-technical judges. The neural classifier is the actual workhorse.
- FaceForensics++ models trained on c23 (light compression) generalize better to webcam footage than c40 (heavy compression) variants.
- If sourcing a pre-trained model proves difficult, the heuristic fallback is still a strong demo — the Sobel boundary analysis and FFT grid detection are genuine, published forensic techniques.
