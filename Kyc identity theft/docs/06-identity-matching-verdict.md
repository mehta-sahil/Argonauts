# Spec 06: Identity Matching & Verdict Engine

> **Phase:** 6 · **Label:** `ready-for-agent`

## Problem Statement

The system has now confirmed that a real human is physically present (Flash-PAD, action challenge) and that the video is not synthetically generated (forensics). The final question is: **is this the same person as the one on the ID document?** Without this check, a real person could pass all liveness tests while impersonating someone else. The system must also aggregate all per-phase results into a single, actionable verdict.

## Solution

The backend extracts a face embedding from the best live video frame, computes cosine similarity against the Phase 1 ID document embedding, and evaluates it against a 0.85 threshold. Then the verdict engine evaluates the complete decision matrix across all six phases, producing a binary VERIFIED/FAILED result with a risk level and per-check breakdown.

## User Stories

1. As a **user**, I want to see the face similarity percentage between my live face and my ID photo, so that I can understand how the system determined my identity.
2. As a **user**, I want to see a clear final verdict ("KYC VERIFIED" or "VERIFICATION FAILED"), so that I know the outcome immediately.
3. As a **user**, I want to see which specific checks passed or failed in the verdict breakdown, so that I understand why I failed (if applicable).
4. As a **security engineer**, I want the face similarity threshold to be configurable, so that false acceptance/rejection rates can be tuned.
5. As a **security engineer**, I want the decision matrix to require ALL checks to pass for a VERIFIED verdict, so that no single attack vector can bypass the system.
6. As a **security engineer**, I want the risk level (LOW/MEDIUM/HIGH) to reflect the margin of pass/fail across checks, so that borderline cases are flagged for manual review.
7. As the **backend**, I want to select the highest-confidence face detection frame from the session for embedding, so that the similarity score is based on the best available data.
8. As the **backend**, I want to compute cosine similarity between two L2-normalized 512-d vectors, so that identity matching is a simple dot product.
9. As the **backend**, I want to generate a JSON report of the session results, so that results are downloadable for audit purposes.
10. As the **frontend**, I want the verdict bar to animate from "ANALYZING..." to the final result with a visual transition, so that the reveal feels impactful.
11. As the **frontend**, I want to display the face similarity score alongside the ID reference crop and the best live frame side-by-side, so that the match is visually demonstrable.

## Implementation Decisions

### 1:1 Face Matching

- **Embedding extraction**: Same InsightFace ArcFace model used in Phase 1. Extract 512-d embedding from the best live frame (highest RetinaFace confidence score from frames received during the session).
- **Cosine similarity**: Since ArcFace embeddings are L2-normalized, cosine similarity = dot product:
  $$\text{sim}(\mathbf{e}_1, \mathbf{e}_2) = \mathbf{e}_1 \cdot \mathbf{e}_2$$
- **Threshold**: ≥ 0.85 = PASS. This is a moderately strict threshold — ArcFace typically produces >0.90 for same-person comparisons and <0.40 for different-person comparisons.
- **Frame selection**: Pick the frame with the highest face detection confidence score from the entire session (across all phases). This is more robust than using the last frame, which may be poorly lit or angled.

### Decision Matrix

The verdict engine evaluates six boolean conditions:

| Check | Variable | Pass Condition |
|-------|----------|----------------|
| Automation Detection | `automation` | `== FALSE` |
| Virtual Camera | `virtual_cam` | `== FALSE` |
| Flash-PAD | `flash_pad` | `== PASS` (correlation ≥ 0.6) |
| Action Challenge | `action_match` | `== PASS` |
| AI Fake Score | `fake_score` | `< 0.20` |
| Face Similarity | `cosine_sim` | `≥ 0.85` |

**VERIFIED** requires ALL six conditions to be true. Any single failure produces a **FAILED** verdict.

### Risk Level Classification

| Level | Criteria |
|-------|----------|
| **LOW** | All checks pass with comfortable margins (sim > 0.90, fake < 0.10, correlation > 0.80) |
| **MEDIUM** | All checks pass but some are near thresholds (sim 0.85–0.90 or fake 0.15–0.20) |
| **HIGH** | One or more checks failed |

### Verdict Payload

```json
{
  "type": "verdict",
  "result": "VERIFIED",
  "risk": "LOW",
  "session_id": "abc-123",
  "timestamp": "2026-08-23T00:45:00Z",
  "duration_s": 42,
  "checks": {
    "automation": {"status": "PASSED", "webdriver": false, "plugins": 3},
    "camera_driver": {"status": "HARDWARE_OK", "device": "Integrated Webcam"},
    "frame_jitter": {"status": "OK", "variance_ms2": 0.42},
    "flash_pad": {"status": "PASS", "correlation": 0.91},
    "action_challenge": {"status": "PASS", "challenge": "BLINK_3", "server_count": 3},
    "sobel": {"score": 0.04, "status": "CLEAN"},
    "fft": {"status": "NO_ARTIFACTS", "peak_ratio": 0.02},
    "ai_fake_score": {"score": 0.08, "status": "PASS"},
    "face_match": {"similarity": 0.924, "status": "PASS"}
  }
}
```

### JSON Report Download

- The frontend offers a "Download Report" button after the verdict
- The report is the full verdict payload as a `.json` file
- Named: `kyc_verification_{session_id}_{timestamp}.json`

### Failure Flagging

When the verdict is FAILED, the specific fraud flags are listed:
- `AUTOMATION_DETECTED` — bot/headless browser
- `VIRTUAL_CAMERA` — virtual video driver
- `FLASH_PAD_MISMATCH` — no correlated color reflection
- `ACTION_INCOMPLETE` — failed to perform the challenge
- `SYNTHETIC_CONTENT` — deepfake artifacts detected
- `IDENTITY_MISMATCH` — face doesn't match ID document

## Testing Decisions

- **Good tests** verify the decision matrix logic: all passing inputs → VERIFIED/LOW. One failing input → FAILED/HIGH. Borderline inputs → correct risk classification.
- **Modules to test**:
  - `compute_similarity(emb1, emb2)` — unit test: same embedding → 1.0; orthogonal embeddings → 0.0; known face pair → expected range
  - `compute_verdict(telemetry)` — unit test with various telemetry combinations:
    - All pass with good margins → VERIFIED + LOW
    - All pass with borderline sim (0.86) → VERIFIED + MEDIUM
    - Flash-PAD fails, everything else passes → FAILED + HIGH
    - Only automation fails → FAILED + HIGH
  - Risk level classification — unit test with margin analysis
- **Edge cases**:
  - Missing telemetry fields (a phase didn't complete) — should be treated as FAILED for that check
  - Session timeout (60s expired) — should produce a FAILED verdict with "TIMEOUT" flag

## Out of Scope

- 1:N face matching (searching a database of known faces). This is strictly 1:1 verification.
- Continuous authentication (re-verifying throughout a session). Single-shot verification only.
- Manual review queue for MEDIUM-risk verdicts. The demo produces a binary result.
- Fraud analytics dashboard (aggregate statistics across sessions).

## Further Notes

- The cosine similarity threshold of 0.85 is conservative. In production, this would be tuned based on a ROC curve analysis with a representative dataset. For the hackathon, 0.85 provides a good balance — same-person matches typically score >0.90, and cross-person matches <0.40, so there's a wide margin.
- The verdict animation should feel decisive — a brief "Analyzing..." state (1-2 seconds) before revealing the result creates dramatic tension that engages judges.
- The per-check breakdown in the verdict is crucial for the demo narrative. When presenting, the team can walk judges through each security layer and show how it contributed to the final decision.
