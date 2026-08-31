# Spec 08: WebSocket Communication & Session Lifecycle

> **Component:** Infrastructure · **Label:** `ready-for-agent`

## Problem Statement

The KYC pipeline requires continuous, bidirectional, low-latency communication between the browser and the backend. The client streams video frames at ~15 FPS (~500KB/s), while the server pushes phase transitions, telemetry updates, and the final verdict back in real-time. REST polling introduces unacceptable latency for the Flash-PAD timing correlation and the live telemetry dashboard. The system needs a persistent connection with a well-defined message protocol that orchestrates all six phases.

## Solution

A single WebSocket connection per session that carries all frame data upstream and all telemetry/control messages downstream. The backend WebSocket handler acts as a phase orchestrator — a state machine that progresses through the six phases, dispatches incoming frames to the appropriate analysis module, and pushes results back to the client. The session has a 60-second hard timeout.

## User Stories

1. As a **developer**, I want a single WebSocket connection to carry all data for the session, so that I don't manage multiple connections or fall back to polling.
2. As a **developer**, I want a well-defined JSON message protocol with `type` fields, so that messages are self-describing and easy to route.
3. As a **developer**, I want the backend to control phase transitions (not the client), so that the server is the source of truth for session state.
4. As a **developer**, I want frames and landmarks to be sent in a single message, so that they're temporally aligned without cross-message correlation.
5. As a **developer**, I want the WebSocket handler to be async, so that frame processing doesn't block telemetry responses.
6. As a **developer**, I want session cleanup to happen automatically on disconnect or timeout, so that memory doesn't leak.
7. As the **backend**, I want to process frames asynchronously so that slow forensic analysis doesn't block frame receipt.
8. As the **backend**, I want to buffer frames in memory per session, so that Phase 5 and Phase 6 can select the best frames retroactively.
9. As the **frontend**, I want to receive telemetry messages as individual check updates, so that the dashboard can update incrementally.
10. As the **frontend**, I want the WebSocket to handle disconnection gracefully with one reconnect attempt, so that transient network issues don't kill the demo.

## Implementation Decisions

### Connection Lifecycle

```
Client                                    Server
  │                                          │
  │  POST /api/upload-id (image)             │
  │ ────────────────────────────────────────► │
  │                                          │ Extract face, generate embedding
  │  {session_id, face_crop}                 │ Create session object
  │ ◄──────────────────────────────────────── │
  │                                          │
  │  WebSocket CONNECT /ws/{session_id}      │
  │ ════════════════════════════════════════► │ Validate session exists
  │                                          │ Start 60-second timer
  │  {type: "session_start", timeout: 60}    │
  │ ◄════════════════════════════════════════ │
  │                                          │
  │        ... phases 2-6 messages ...       │
  │                                          │
  │  {type: "verdict", ...}                  │
  │ ◄════════════════════════════════════════ │
  │                                          │
  │  WebSocket CLOSE                         │
  │ ════════════════════════════════════════► │ Cleanup session
```

### Phase State Machine (Server-Side)

```
CONNECTED → ENV_CHECK → FLASH_PAD → ACTION_CHALLENGE → FORENSICS → FACE_MATCH → VERDICT → CLOSED
```

- Each phase transition is initiated by the server after the previous phase completes
- The server sends a `phase_change` message before each phase begins
- The client responds to `phase_change` by adjusting its behavior (start flashing, show challenge prompt, etc.)
- Phases are sequential, not parallel (one active phase at a time)

### Message Protocol — Client → Server

| Message Type | Fields | When Sent |
|---|---|---|
| `env_data` | `webdriver`, `plugins`, `chrome_bindings`, `devices[]`, `jitter_deltas[]`, `video_input_count` | Once, at connection start |
| `frame` | `timestamp` (float), `frame` (base64 JPEG), `landmarks` (array of 468×3 or null), `phase` (current phase name) | Continuously at ~15 FPS |
| `action_progress` | `action_type`, `current_count`, `timestamp` | When client-side MediaPipe detects an action event |

### Message Protocol — Server → Client

| Message Type | Fields | When Sent |
|---|---|---|
| `session_start` | `session_id`, `timeout_s` | On WebSocket connect |
| `phase_change` | `phase` (enum), `config` (phase-specific) | Before each phase begins |
| `telemetry` | `check` (string), `status`, `details` (varies) | After each check completes |
| `action_progress_ack` | `server_count`, `target_count` | After server verifies a client-reported action |
| `blocked` | `reason`, `details` | On hard-fail (env checks only) |
| `verdict` | `result`, `risk`, `checks`, `timestamp`, `duration_s` | After all phases complete |
| `timeout` | `elapsed_s` | When 60-second timer expires |
| `error` | `code`, `message` | On unexpected errors |

### Phase-Specific Config in `phase_change` Messages

```json
// Phase 2: Environment Check
{"type": "phase_change", "phase": "env_check", "config": {}}

// Phase 3: Flash-PAD
{"type": "phase_change", "phase": "flash_pad", "config": {
  "colors": ["#00FFFF", "#FF00FF", "#FFFF00", "#FF0000", "#00FF00"],
  "duration_ms": 150,
  "delay_before_ms": 1000
}}

// Phase 4: Action Challenge
{"type": "phase_change", "phase": "action_challenge", "config": {
  "action": "BLINK_N",
  "params": {"count": 3},
  "timeout_s": 15
}}

// Phase 5: Forensics (no client config needed)
{"type": "phase_change", "phase": "forensics", "config": {}}

// Phase 6: Face Match (no client config needed)
{"type": "phase_change", "phase": "face_match", "config": {}}
```

### Frame Buffering

- The server maintains a circular buffer of the last 100 frames per session (in memory)
- Each frame is stored as: `{timestamp, decoded_image (numpy), face_bbox, detection_confidence, landmarks}`
- Phase 5 (forensics) selects every 5th frame from the buffer for heuristic analysis and the top 5 by face confidence for neural classification
- Phase 6 (face match) selects the single highest-confidence frame for embedding
- Buffer is cleared on session cleanup

### Async Processing

- Frame receipt and storage is synchronous (fast — just decode and buffer)
- Analysis modules are called via `asyncio.create_task()` or `asyncio.to_thread()` for CPU-bound work (Sobel, FFT, InsightFace, EfficientNet)
- Telemetry messages are pushed to the client as soon as each analysis completes
- The WebSocket handler uses `asyncio.gather()` to run independent analyses in parallel where possible (e.g., Sobel and FFT can run concurrently)

### Session Timeout

- A 60-second `asyncio` timer starts when the WebSocket connects
- If the timer fires before the verdict phase completes, the server sends `{"type": "timeout"}` and closes the connection
- The frontend displays "Session timed out" and disables the UI

### Session Cleanup

- Triggered by: WebSocket disconnect, timeout, or verdict completion
- Actions: remove session from the in-memory dictionary, release frame buffer memory
- Implemented via a `try/finally` block in the WebSocket handler

### CORS Configuration

- FastAPI `CORSMiddleware` allows `http://localhost:5173` (Vite dev server)
- In production, restrict to the actual deployment domain

### FastAPI Application Structure

```python
# main.py
app = FastAPI()

# CORS
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], ...)

# REST endpoints
@app.post("/api/upload-id")
async def upload_id(file: UploadFile):
    # Extract face, generate embedding, create session
    ...

# WebSocket endpoint
@app.websocket("/ws/{session_id}")
async def websocket_handler(websocket: WebSocket, session_id: str):
    # Validate session, run phase state machine
    ...
```

### Error Handling

- Invalid `session_id` on WebSocket connect → close with 4004 code + "Session not found"
- Malformed JSON message → send `{"type": "error", "code": "INVALID_MESSAGE"}`, continue session
- Face not detected in frame → skip frame silently, don't crash
- Model inference failure → send error telemetry, continue with fallback scoring

## Testing Decisions

- **Good tests** verify the message protocol contract and phase transitions.
- **Modules to test**:
  - WebSocket handler — integration test: connect, send `env_data`, verify `telemetry` responses, verify `phase_change` sequence
  - Session creation + cleanup — unit test: create session, verify it exists, cleanup, verify it's gone
  - Frame buffer — unit test: push 200 frames, verify buffer holds last 100
  - Timeout behavior — unit test: verify timeout message is sent after N seconds (use short timeout for tests)
  - Message parsing — unit test: valid JSON → parsed correctly; invalid JSON → error response
- **Integration test approach**: Use `fastapi.testclient.TestClient` with `WebSocketTestSession` for end-to-end protocol testing.

## Out of Scope

- WebSocket authentication (JWT tokens, API keys). Open connection for the hackathon.
- Message compression (WebSocket per-message deflate). Raw JSON is fine at this scale.
- Multiple concurrent sessions. Demo assumes one user at a time.
- WebRTC (peer-to-peer video). WebSocket frame streaming is sufficient.
- Rate limiting on frame submission. Trust the client's ~15 FPS.

## Further Notes

- The WebSocket handler is the "conductor" of the entire pipeline. It should be implemented as a clear, linear async function that progresses through phases, making it easy to read and debug.
- Frame decode (`base64 → bytes → cv2.imdecode`) is the hottest path in the system. Benchmark this — if it becomes a bottleneck, consider sending raw JPEG bytes as binary WebSocket messages (saves ~33% base64 overhead) as a future optimization.
- The 60-second timeout is generous for a successful flow (typically completes in 30-40 seconds). The padding accounts for slow model loading on first run and gives judges time to observe the telemetry.
