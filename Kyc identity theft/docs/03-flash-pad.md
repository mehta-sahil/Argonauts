# Spec 03: Optical Flash-PAD (Presentation Attack Detection)

> **Phase:** 3 · **Label:** `ready-for-agent`

## Problem Statement

A sophisticated attacker can replay a pre-recorded video or run a real-time deepfake face swap that passes basic liveness checks. The system needs a challenge that is physically impossible for a non-present human to satisfy: verifying that the person's face is illuminated by the same screen that is displaying the challenge. A pre-recorded video or remote deepfake cannot predict the random color sequence the screen will flash, so the person's skin and eyes will not reflect the correct colors in the correct order.

## Solution

The server generates a cryptographically random sequence of 5 solid colors. The frontend flashes each color as a full-screen overlay for 150ms (750ms total). During the flash sequence, the client streams video frames to the server. The server detects the face in each frame, extracts mean RGB values from skin regions (forehead, cheeks), and computes the Pearson correlation between the observed color shifts and the expected flash sequence. A high correlation (≥0.6) indicates the face was physically present in front of the screen. A pre-recorded or remotely-generated face will show no correlated color shift.

## User Stories

1. As a **user**, I want the flash sequence to be brief (~750ms total), so that the verification feels fast and non-intrusive.
2. As a **user**, I want a visual indicator before the flash begins (e.g., "Hold still — flash test starting"), so that I don't look away during the sequence.
3. As a **user**, I want the flash overlay to not completely obscure my face in the video preview, so that I can confirm the camera is still working.
4. As a **security engineer**, I want each session to use a unique random color sequence, so that pre-recorded replay attacks cannot predict the colors.
5. As a **security engineer**, I want the server to generate and hold the color sequence secret, so that a compromised client cannot fake the expected reflections.
6. As a **security engineer**, I want the system to measure chromaticity shift in multiple face ROIs (forehead, left cheek, right cheek), so that partial occlusion or single-point spoofing is detected.
7. As a **security engineer**, I want the correlation threshold to be configurable, so that it can be tuned based on lighting conditions and camera quality.
8. As the **backend**, I want to receive timestamped frames during the flash window, so that I can align each frame with its expected flash color.
9. As the **backend**, I want to compute per-color average RGB in the face skin ROI, so that I can build the observed color time series.
10. As the **backend**, I want to compute Pearson correlation between the observed and expected color sequences per channel (R, G, B), so that I can produce a single match percentage.
11. As the **frontend**, I want to render the flash colors as a semi-transparent overlay (opacity ~0.7) over the video feed area, so that the user's face is still partially visible.
12. As the **frontend**, I want to use precise `setTimeout` timing (150ms per color) synchronized with the server's sequence, so that frame timestamps align with flash transitions.
13. As the **frontend**, I want to increase the frame capture rate during the flash window (if possible), so that the server gets at least 2 frames per color.

## Implementation Decisions

- **Color palette**: Cyan `#00FFFF`, Magenta `#FF00FF`, Yellow `#FFFF00`, Red `#FF0000`, Green `#00FF00`, Blue `#0000FF`, White `#FFFFFF`. The server randomly selects 5 from this palette (without replacement) per session.

- **Sequence generation**: Server uses `secrets.choice()` (cryptographic randomness) to pick 5 colors. The sequence is stored in the session object and never sent to the client as raw RGB values — only as the WebSocket `phase_change` message which triggers the overlay.

- **Flash timing**: 150ms per color × 5 colors = 750ms total. The frontend uses a `setTimeout` chain starting from the moment it receives the `phase_change` message. Each color transition timestamp is recorded for frame alignment.

- **Frame capture during flash**: The client continues its normal ~15 FPS frame stream. At 15 FPS, ~2 frames land within each 150ms color window. The server uses the frame timestamps to bin frames into color slots.

- **Server-side chromaticity analysis**:
  1. Detect face in each frame using RetinaFace (same InsightFace instance used for embedding)
  2. Define skin ROIs: forehead strip (top 30% of face bbox, middle 60% width), left cheek, right cheek
  3. Compute mean RGB per ROI per frame
  4. Group frames by their corresponding flash color (using timestamps)
  5. Build observed color time series: 5-element array of mean RGB per color slot
  6. Build expected color time series: 5-element array of flash RGB values
  7. Compute Pearson correlation coefficient per channel (R, G, B)
  8. Overall match = mean of three channel correlations

- **Pass threshold**: Correlation ≥ 0.6 = PASS. This is deliberately lower than 1.0 to account for ambient lighting interference, camera white balance, and skin tone variation. Configurable via constant.

- **Telemetry message**:
  ```json
  {
    "type": "telemetry",
    "check": "flash_pad",
    "status": "PASS",
    "correlation": 0.91,
    "per_channel": {"r": 0.88, "g": 0.93, "b": 0.92},
    "frames_captured": 11
  }
  ```

- **Failure mode**: Soft-continue. If Flash-PAD fails, the session proceeds to Phase 4 but the failure is flagged in the verdict. This allows judges to see the full pipeline even on a failed check.

- **Overlay rendering**: A CSS `position: absolute` `<div>` covering the video panel area, with `background-color` set to the current flash color and `opacity: 0.7`. Transitions are instant (no CSS transition) to ensure clean color boundaries.

## Testing Decisions

- **Good tests** verify the correlation computation: given synthetic frame RGB values that match the sequence → high correlation. Given random/constant RGB values → low correlation. Given inverted sequence → negative correlation.
- **Modules to test**:
  - `generate_sequence()` — unit test: returns 5 colors, no duplicates, from the valid palette
  - `analyze_reflection(frames, sequence)` — unit test with synthetic frame data:
    - Frames with RGB matching the sequence → correlation > 0.8
    - Frames with constant RGB (photo attack) → correlation < 0.3
    - Frames with inverted sequence → negative correlation
  - Frame-to-color-slot binning logic — unit test with timestamp edge cases
- **Edge cases**:
  - Fewer than 5 frames captured (network lag) — should fail gracefully with "insufficient frames"
  - Zero frames in a color slot — that color slot is excluded from correlation

## Out of Scope

- Pupil/corneal specular reflection analysis (looking at glints in the eyes). This requires higher resolution and precise eye region detection. The skin ROI chromaticity is sufficient for the hackathon.
- Adaptive timing (adjusting flash duration based on camera FPS). Fixed 150ms for simplicity.
- HDR or exposure compensation analysis.

## Further Notes

- The flash sequence should feel intentional, not like a visual glitch. A brief "Preparing flash test..." message before the overlay starts helps UX.
- Dark-skinned users may show lower chromaticity variance — the 0.6 threshold was chosen to be inclusive. Production systems would need per-skin-tone calibration.
- Ambient room lighting significantly affects reflection intensity. The flash colors are chosen to be high-saturation primaries to maximize the signal-to-noise ratio of the skin reflection.
