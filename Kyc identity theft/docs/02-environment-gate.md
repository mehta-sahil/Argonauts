# Spec 02: Client Environment & Hardware Integrity Gate

> **Phase:** 2 · **Label:** `ready-for-agent`

## Problem Statement

Before investing compute in liveness and forensic analysis, the system must rule out trivial attack vectors: headless browsers running automated submissions, virtual camera drivers feeding pre-recorded video, and software-timed synthetic frame injection. These attacks are cheap, scalable, and bypass all downstream liveness checks if not caught at the gate.

## Solution

A three-layer client environment inspection that runs immediately after the user clicks "Start Verification." The browser collects automation flags, device enumeration data, and frame delivery timing metrics, then sends them to the server for validation. If any check fails, the session is **hard-blocked** — no further phases run. This is the only phase with hard-fail behavior; all subsequent phases soft-continue.

## User Stories

1. As a **security engineer**, I want the system to detect `navigator.webdriver === true`, so that Puppeteer/Playwright/Selenium bots are blocked before they can submit frames.
2. As a **security engineer**, I want the system to check for zero-plugin environments and broken Chrome object bindings, so that headless Chrome instances without full browser APIs are flagged.
3. As a **security engineer**, I want the system to query `navigator.mediaDevices.enumerateDevices()` and filter video input labels, so that virtual camera drivers (OBS, v4l2loopback, CamTwist, DroidCam, ManyCam, XSplit, Snap Camera) are detected.
4. As a **security engineer**, I want the system to block sessions where more than one video input device is detected, so that users cannot inject a virtual camera alongside a real one.
5. As a **security engineer**, I want the system to measure inter-frame arrival jitter using `requestVideoFrameCallback()` across 60 frames, so that software-timed video injection (near-zero variance) is detected.
6. As a **security engineer**, I want the system to flag abnormal client-side framerate fluctuations, so that throttled or artificially paced frame delivery is caught.
7. As a **user**, I want to see which environment checks passed or failed in the telemetry panel, so that I understand why my session was blocked (if applicable).
8. As a **user**, I want the system to provide a clear error message when blocked, so that I know whether to switch browsers, disable virtual cameras, or use a physical device.
9. As the **backend**, I want to validate environment data received from the client independently, so that a compromised client cannot simply report "all checks passed."
10. As the **backend**, I want to hard-block the session if any environment check fails, so that no compute is wasted on downstream phases for known-bad sessions.
11. As the **frontend**, I want to run the 60-frame jitter measurement automatically when the WebSocket connects, so that the check completes within ~2-4 seconds without user interaction.
12. As the **frontend**, I want to continuously monitor frame delivery rate during the session and block if the rate drops anomalously, so that mid-session injection attacks are caught.

## Implementation Decisions

- **Automation detection checks** (client-side, reported to server):
  - `navigator.webdriver` — `true` in automated browsers
  - `navigator.plugins.length` — typically 0 in headless Chrome
  - `window.chrome` object structure — missing or incomplete in headless/phantom environments
  - `navigator.languages` — empty in some headless configurations
  - These are collected as a JSON object and sent via the WebSocket `env_data` message

- **Virtual camera device filtering**:
  - Client calls `navigator.mediaDevices.enumerateDevices()` and sends the full device list (kind + label) to the server
  - Server checks video input labels against a blocklist: `OBS`, `v4l2loopback`, `Virtual`, `CamTwist`, `DroidCam`, `ManyCam`, `XSplit`, `Snap Camera`, `Snap Cam`, `CamLink` (configurable)
  - If any video input label matches (case-insensitive substring), the session is blocked
  - If more than 1 video input device is detected, the session is blocked (multiple camera guard)

- **Frame jitter measurement**:
  - Client uses `requestVideoFrameCallback()` to record 60 consecutive frame arrival timestamps
  - Computes inter-frame deltas ($\Delta t_i = t_{i+1} - t_i$) and sends the array to the server
  - Server computes variance $\sigma^2$ of the deltas
  - **Synthetic flag**: $\sigma^2 < 0.01\text{ ms}^2$ (perfectly paced software frames)
  - **Anomaly flag**: Framerate irregularities detected beyond normal hardware camera behavior
  - Natural camera jitter: real webcams produce $\sigma^2$ in the range of 0.1–2.0 ms²

- **Hard-block behavior**: If any of the three checks fail, the server sends `{"type": "blocked", "reason": "...", "details": {...}}` and closes the WebSocket. The frontend displays a blocking error overlay. No further phases execute.

- **Telemetry reporting**: Each sub-check sends a separate telemetry message to the frontend:
  - `{"type": "telemetry", "check": "automation", "status": "PASSED"/"FAILED", "details": {...}}`
  - `{"type": "telemetry", "check": "camera_driver", "status": "HARDWARE_OK"/"VIRTUAL_DETECTED", "details": {...}}`
  - `{"type": "telemetry", "check": "frame_jitter", "status": "OK"/"SYNTHETIC", "variance": 0.42}`

## Testing Decisions

- **Good tests** verify behavior boundaries: a valid environment payload → PASS; a payload with `webdriver: true` → BLOCKED; a device list containing "OBS Virtual Camera" → BLOCKED; a jitter array with $\sigma^2 = 0.001$ → BLOCKED.
- **Modules to test**:
  - `validate_automation(data)` — unit test with various browser fingerprint payloads
  - `validate_camera(data)` — unit test with device label lists (real cameras, virtual cameras, mixed)
  - `validate_frame_jitter(deltas)` — unit test with synthetic delta arrays (zero variance, normal variance, extreme variance)
- **Edge cases to test**:
  - Empty device list (no permission granted) — should fail gracefully
  - Device labels unavailable (privacy mode returns empty strings) — should warn but not hard-block
  - Only 1 camera but it's virtual — should block

## Out of Scope

- Browser TLS certificate pinning or extension detection.
- IP geolocation or VPN detection.
- Device attestation (SafetyNet / App Attest) — production roadmap only.
- GPU/WebGL fingerprinting for device uniqueness.

## Further Notes

- The `enumerateDevices()` API may return empty labels if the user hasn't granted camera permission yet. The environment check should run **after** `getUserMedia()` succeeds, so that labels are populated.
- The virtual camera blocklist should be configurable (stored as a constant in the environment module) so it can be extended easily.
- This phase should complete in 3–5 seconds: automation checks are instant, device enumeration is instant, and the 60-frame jitter measurement takes ~2 seconds at 30 FPS.
