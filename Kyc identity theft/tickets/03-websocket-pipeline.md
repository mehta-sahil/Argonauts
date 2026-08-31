# 03: WebSocket Streaming Pipeline & Session Lifecycle

**What to build:**
A persistent, bidirectional WebSocket connection between frontend and backend. The client captures user camera frames via `<canvas>` (640x480, JPEG base64) and streams them at ~15 FPS to the backend. The backend runs an asynchronous session state machine with a 60-second overall countdown timer, frame circular buffer, and telemetry message dispatching.

**Blocked by:**
- 01: Project Skeleton & Dashboard Shell
- 02: ID Document Ingestion & Face Embedding

**Status:** completed

- [x] Frontend WebRTC camera access initialized via `getUserMedia` (640x480 resolution) rendered in `<video>` element.
- [x] Off-screen canvas frame grabber converting video frames to base64 JPEG and transmitting via WebSocket messages.
- [x] Backend WebSocket endpoint `/ws/{session_id}` validating active sessions and managing connection state.
- [x] 60-second asynchronous session timeout timer initiated on connection with UI countdown synchronization.
- [x] In-memory circular buffer (last 100 frames) maintained on the backend per session for downstream analysis.
- [x] Real-time telemetry protocol handling incremental check status updates (PENDING, CHECKING, PASSED, FAILED).
- [x] Graceful cleanup of session resources and buffer on disconnect or completion.
