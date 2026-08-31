# 09: Demo Polish, Guardrails & End-to-End Hardening

**What to build:**
Comprehensive end-to-end polish, security guardrails, and demo safeguards. This includes multi-camera hardware blocking, client-side frame rate drop detection, a toggle-able 468-point face mesh wireframe for visual demonstration to judges, smooth UI audio/visual state transitions, and automated test coverage across the whole verification pipeline.

**Blocked by:**
- 08: Identity 1:1 Cosine Match & Verdict Decision Engine

**Status:** completed

- [x] Multi-camera guard: client blocks session if `navigator.mediaDevices.enumerateDevices()` discovers $> 1$ video input.
- [x] Frame rate monitor: client detects mid-session camera lag/throttling and notifies or halts session.
- [x] Visual MediaPipe Face Mesh canvas wireframe toggle button on the video panel for live demonstrations.
- [x] Polished animations on telemetry cards, progress bar countdown, and verdict reveal.
- [x] Backend test suite covering unit logic and integration flows (upload, websocket protocol, matrix scoring).
- [x] Complete single-command developer startup guide in README for hackathon setup and demo execution.
