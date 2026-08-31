# 04: Client Environment & Hardware Integrity Gate

**What to build:**
Phase 2 environment inspection that runs at session initiation. The client gathers automation flags (`navigator.webdriver`, plugins, Chrome bindings), device labels (`enumerateDevices()`), and 60 consecutive frame arrival deltas via `requestVideoFrameCallback()`. The backend evaluates these metrics and either marks the environment checks as PASSED in the telemetry panel or immediately triggers a hard-block if automation or virtual camera loopbacks are detected.

**Blocked by:**
- 03: WebSocket Streaming Pipeline & Session Lifecycle

**Status:** completed

- [x] Client-side collector gathering `navigator.webdriver`, plugin count, and Chrome binding properties.
- [x] Device query listing video input devices and filtering for virtual driver labels (`OBS`, `v4l2loopback`, `Virtual`, `CamTwist`, `DroidCam`, `ManyCam`, `XSplit`, `Snap Camera`).
- [x] 60-frame arrival delta measurement using `requestVideoFrameCallback()` computing timing variance $\sigma^2$.
- [x] Backend validator flagging synthetic software timing when delta variance $\sigma^2 < 0.01\text{ ms}^2$.
- [x] Hard-block termination: server sends `blocked` message and terminates session if any environment check fails.
- [x] Real-time telemetry panel updates reflecting Automation, Camera Driver, and Frame Jitter status with live values.
