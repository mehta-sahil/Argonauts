# 07: Deepfake Forensics (Sobel/FFT & Neural Classifier)

**What to build:**
Phase 5 forensic AI detection. The backend runs a hybrid pipeline: computing real-time Sobel edge gradient variance and 2D FFT spectral peak ratios to drive telemetry metrics, while evaluating key session frames with a pre-trained EfficientNet-B0 classifier (FaceForensics++) to produce the definitive AI Fake Score ($0.0$ to $1.0$).

**Blocked by:**
- 03: WebSocket Streaming Pipeline & Session Lifecycle

**Status:** completed

- [x] Model loader and downloader script sourcing pre-trained EfficientNet-B0 weights for deepfake classification into `models/`.
- [x] Sobel operator applied on facial boundary perimeter ring to calculate edge gradient variance (detecting boundary feathering/mask blending).
- [x] 2D FFT magnitude spectrum computation detecting periodic high-frequency peaks (detecting GAN upsampling transposed convolution grids).
- [x] Telemetry stream updates pushing Sobel residual values and FFT anomaly status to the frontend dashboard.
- [x] Batch inference over top 3–5 highest-confidence face frames through EfficientNet-B0 producing mean AI Fake Score.
- [x] Fallback scoring mechanism using normalized Sobel and FFT heuristics if neural model checkpoint is absent.
