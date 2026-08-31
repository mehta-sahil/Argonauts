# 06: Dynamic Action Challenge State Machine

**What to build:**
Phase 4 active liveness challenge. The server selects a random action challenge (Blink N times, Smile and hold, Turn head left/right, Raise eyebrows) with a 15-second countdown. The client executes MediaPipe Face Mesh (WASM) to track 468 landmarks in real time and display an instant action counter ("Count: 1/3"). Landmark time series are streamed to the backend, which independently verifies that the target action criteria were satisfied.

**Blocked by:**
- 03: WebSocket Streaming Pipeline & Session Lifecycle

**Status:** completed

- [x] Backend random challenge generator choosing from `BLINK_N`, `SMILE_HOLD`, `HEAD_TURN`, and `EYEBROW_RAISE` with dynamic parameters.
- [x] Client-side MediaPipe Face Mesh WASM integration tracking facial landmarks on the live video stream.
- [x] Client-side real-time calculation of Eye Aspect Ratio (EAR), Mouth Aspect Ratio (MAR), yaw rotation, and eyebrow distance.
- [x] Responsive UI prompt overlay displaying the action instruction and incrementing count/timer in real time.
- [x] Client streaming landmark coordinates to backend alongside video frame messages.
- [x] Backend independent verification of landmark time series confirming hysteresis thresholds and event counts.
- [x] Telemetry panel update reflecting action completion status (PASSED / FAILED) upon completion or phase timeout.
