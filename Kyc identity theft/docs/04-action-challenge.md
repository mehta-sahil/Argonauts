# Spec 04: Dynamic Action Challenge State Machine

> **Phase:** 4 · **Label:** `ready-for-agent`

## Problem Statement

Even with Flash-PAD, a sophisticated real-time face swap running on a physical screen could produce correct color reflections. The system needs a second layer of active liveness that requires the user to perform specific, randomized physical actions — movements that a deepfake generator would need to interpret and synthesize in real-time under time pressure. The combination of random action type, random parameters, and a countdown timer makes pre-recording and replay infeasible.

## Solution

The server generates a random challenge prompt (e.g., "Blink 3 times" or "Turn your head left") with a dynamic countdown window. MediaPipe Face Mesh runs client-side in the browser (WASM) for instant UX feedback — the user sees their blink count increment in real-time. Simultaneously, the client streams landmark data to the server, which independently verifies that the action was performed correctly within the time window. This dual client/server architecture provides responsive UX without trusting the client.

## User Stories

1. As a **user**, I want to see a clear text prompt telling me exactly what action to perform, so that I know what the system expects.
2. As a **user**, I want to see a real-time counter (e.g., "1/3 blinks") updating instantly as I perform the action, so that I get feedback without waiting for server round-trips.
3. As a **user**, I want to see a countdown timer for the challenge, so that I know how much time I have left.
4. As a **user**, I want the challenge actions to be intuitive (blink, smile, turn head, raise eyebrows), so that I don't have to learn complex gestures.
5. As a **security engineer**, I want the action type and parameters to be randomly selected per session, so that replay attacks cannot predict the challenge.
6. As a **security engineer**, I want the server to independently verify the challenge from raw landmark data, so that a compromised client cannot fake the count.
7. As a **security engineer**, I want at least 4 distinct action types in the challenge pool, so that an attacker cannot prepare for a specific action.
8. As the **backend**, I want to generate a challenge with random type and random parameters from defined ranges, so that no two sessions have the same challenge.
9. As the **backend**, I want to receive MediaPipe landmark time series and compute EAR/MAR/yaw/eyebrow metrics independently, so that I can verify the client's reported count.
10. As the **backend**, I want to define configurable thresholds for each action detector, so that sensitivity can be tuned.
11. As the **frontend**, I want to load MediaPipe Face Mesh via the WASM runtime, so that landmark tracking runs at 30+ FPS without server latency.
12. As the **frontend**, I want to compute EAR, MAR, yaw angle, and eyebrow distance from the 468 landmarks, so that I can update the counter in real-time.
13. As the **frontend**, I want to send landmark arrays alongside video frames in the WebSocket messages, so that the server can verify independently.
14. As the **frontend**, I want a visual face mesh overlay on the video feed (optional, toggle-able) to demonstrate that tracking is working, so that judges can see the technology in action.

## Implementation Decisions

- **Supported action types** (4 total):

  | Action | Prompt Template | Parameter Range | Detection Metric |
  |--------|----------------|-----------------|------------------|
  | `BLINK_N` | "Blink {n} times" | n ∈ [2, 4] | Eye Aspect Ratio (EAR) |
  | `SMILE_HOLD` | "Smile and hold for {n} seconds" | n ∈ [1, 3] | Mouth Aspect Ratio (MAR) |
  | `HEAD_TURN` | "Turn your head {direction}" | left / right | Yaw angle from landmarks |
  | `EYEBROW_RAISE` | "Raise your eyebrows" | (no param) | Eyebrow-to-eye distance ratio |

- **Challenge generation**: Server randomly selects 1 action per session (not a sequence of multiple actions — keeping it simple for hackathon). Parameters are randomly chosen within their ranges.

- **EAR (Eye Aspect Ratio)** computation:
  - Uses MediaPipe landmarks for left eye (indices 33, 160, 158, 133, 153, 144) and right eye (indices 362, 385, 387, 263, 373, 380)
  - $\text{EAR} = \frac{|p_2 - p_6| + |p_3 - p_5|}{2 \cdot |p_1 - p_4|}$
  - Blink detected when EAR drops below **0.21** then recovers above **0.25** (hysteresis to prevent double-counting)
  - Count increments on the rising edge (eye reopening)

- **MAR (Mouth Aspect Ratio)** computation:
  - Uses landmarks for upper lip (index 13), lower lip (index 14), left corner (index 61), right corner (index 291)
  - $\text{MAR} = \frac{|p_{\text{upper}} - p_{\text{lower}}|}{|p_{\text{left}} - p_{\text{right}}|}$
  - Smile detected when MAR exceeds **0.6** continuously for the required hold duration

- **Head turn (yaw angle)**:
  - Computed from the nose tip (index 1) and left/right face edge landmarks (indices 234, 454)
  - Yaw angle estimated as the horizontal offset ratio of the nose relative to the face width
  - Turn detected when estimated yaw exceeds **±20°** from the neutral baseline
  - Direction (left/right) validated against the challenge prompt

- **Eyebrow raise**:
  - Measures vertical distance between eyebrow landmarks (indices 70, 300) and eye center landmarks
  - Raise detected when distance increases by **>30%** compared to the baseline measured in the first 10 frames
  - Baseline is established during the initial landmark stabilization period

- **Countdown window**: 15 seconds for all action types. The countdown starts when the server sends the `phase_change` message and is displayed on the frontend.

- **Server verification**: The server receives landmark arrays (468 × 3 values per frame) at ~15 FPS. It independently recomputes EAR/MAR/yaw/eyebrow metrics and validates the action count. If the client reports "3 blinks" but the server's independent count is only 2, the check fails.

- **Telemetry messages**:
  ```json
  {"type": "phase_change", "phase": "action", "challenge": {"action": "BLINK_N", "params": {"count": 3}, "timeout_s": 15}}
  {"type": "action_progress", "current_count": 2, "target_count": 3}
  {"type": "telemetry", "check": "action_challenge", "status": "PASS", "client_count": 3, "server_count": 3}
  ```

- **Failure mode**: Soft-continue. If the user doesn't complete the challenge within 15 seconds, or the server count doesn't match, the phase is flagged as FAILED but the session proceeds to Phase 5.

## Testing Decisions

- **Good tests** verify action detection from landmark data: given a time series of landmarks simulating 3 blinks (EAR dips and recoveries) → count = 3. Given landmarks with no EAR change → count = 0. Given landmarks with a smile → MAR exceeds threshold.
- **Modules to test**:
  - `generate_challenge()` — unit test: returns valid action type with in-range parameters
  - `verify_landmarks(challenge, landmark_stream)` — unit test with synthetic landmark arrays:
    - 3 EAR dips → blink count = 3
    - Continuous low MAR (no smile) → smile hold = 0s
    - Yaw offset > 20° → head turn detected
    - Eyebrow distance increase > 30% → raise detected
  - EAR/MAR/yaw computation functions — unit test with known landmark coordinates
- **Edge cases**:
  - Rapid blinks that don't fully recover (EAR doesn't cross 0.25) — should not count
  - Partial head turn (15° yaw) — should not count
  - User performing the wrong action — should not count

## Out of Scope

- Lip reading or speech-based challenges ("Say the word on screen").
- Multi-action sequences (e.g., "Blink twice then smile") — single action per session.
- Head nod (pitch angle) — excluded from the final action pool per interview decision.
- Anti-spoofing for 3D-printed masks (addressed by Flash-PAD and forensics, not action challenges).

## Further Notes

- MediaPipe Face Mesh WASM loads ~5MB of model files on first use. These should be served from the frontend's static assets (not CDN) for offline demo reliability.
- The landmark array sent over WebSocket is large (~468 × 3 × 4 bytes = ~5.6KB per frame). At 15 FPS, that's ~84KB/s — acceptable alongside the JPEG frames.
- The visual face mesh overlay (green wireframe on the video) is a powerful demo tool for judges. It should be enabled by default but toggle-able via a UI switch.
