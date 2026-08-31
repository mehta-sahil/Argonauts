# 05: Optical Flash-PAD Challenge

**What to build:**
Phase 3 active optical challenge. The backend generates a cryptographically random 5-color sequence (150ms per color) and commands the frontend to flash semi-transparent screen overlays. During the flash sequence, the backend analyzes the incoming video frames, extracts skin chromaticity in the face ROI (forehead/cheeks), and computes Pearson correlation against the expected sequence.

**Blocked by:**
- 03: WebSocket Streaming Pipeline & Session Lifecycle

**Status:** completed

- [x] Backend generation of random 5-color sequences from the primary color palette with millisecond timing metadata.
- [x] Frontend full-screen/panel overlay rendering sequential solid color flashes with precise 150ms timing.
- [x] Backend face skin ROI segmentation (forehead, cheek areas) from RetinaFace/OpenCV bounding box coordinates.
- [x] Per-frame RGB mean extraction and temporal alignment with the flashed color slots.
- [x] Pearson correlation computation across R, G, and B color channels comparing observed skin shifts to the expected sequence.
- [x] Pass criteria evaluation (correlation $\ge 0.6$) and telemetry panel update showing optical sync match percentage.
- [x] Soft-continue error handling if correlation is below threshold (flagged in verdict without hard-blocking).
