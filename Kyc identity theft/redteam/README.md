# Red team — deepfake injection vs the KYC pipeline

The blue-team side (`../backend`, `../frontend`) chains six independent
checks into one 60-second KYC session. This folder is the attacker: a
**stolen ID portrait** plus a **commodity deepfake clip** of that person,
replayed through the same public REST + WebSocket contract the browser
client uses. No webcam, no human.

```
victim_id.jpg ─┐
               ├─►  deepfake_attack.py  ──ws──►  backend  ──►  VERDICT: FAILED
deepfakevid.mp4┘
```

**The lab's point: the blue team catches this.** The attack is an honest
replay — it streams the clip and nothing else. A pre-recorded video
cannot react to the pipeline's two randomized live challenges, so it is
detected.

## Pieces

| File | Role |
|---|---|
| `deepfake_prompt.md` | prompt for a **commodity** face-animation tool to make `deepfakevid.mp4` from the ID portrait — deliberately basic, no on-demand actions |
| `frame_forge.py` | frame formatting only: fit the clip to 640×480, encode as the client's base64 JPEG |
| `deepfake_attack.py` | the session driver — uploads the ID, opens the WebSocket, replays frames, prints telemetry + verdict |
| `requirements.txt` | opencv, numpy, httpx, websockets |

## What happens in each phase

| Phase | Check | Outcome for the deepfake |
|---|---|---|
| 1 · ID ingestion | ArcFace baseline from the uploaded portrait | **PASS** — the clip's face *is* this portrait (that's the identity being impersonated) |
| 2 · Environment gate | `navigator.webdriver`, headless UA, virtual-cam labels, frame-timing variance | **PASS** — browser-injected frames don't trip automation flags; this layer isn't the deepfake detector |
| 3 · Optical Flash-PAD | server flashes a **random** color sequence at the screen, Pearson-correlates it against the skin-ROI reflection | **FAIL** — `OPTICAL_REFLECTION_MISMATCH`. A flat-lit recorded clip has no reflection that tracks a sequence it never saw |
| 4 · Action challenge | server picks a **random** action (blink N / smile-hold / turn head / raise eyebrows) with a live deadline, verified from its own landmarks/CNN | **FAIL** — `LIVENESS_ACTION_FAILED` on any non-blink action; the idle clip can't smile or turn on cue |
| 5 · Forensic AI | Sobel boundary + 2D-FFT + fused fake score | contributes — a commodity generator leaves boundary/frequency tells and flat affect |
| 6 · 1:1 face match | cosine similarity ≥ 0.85 | **PASS** — same identity by construction |

Verdict: **FAILED / HIGH RISK — deepfake detected.**

## Run it

```bash
# 1. backend up in another terminal
cd ../backend && python -m uvicorn app.main:app --port 8000

# 2. put the generated clip here as deepfakevid.mp4  (see deepfake_prompt.md)

# 3. fire
cd ../redteam
python -m pip install -r requirements.txt
python deepfake_attack.py --id /path/to/victim_id.jpg --video deepfakevid.mp4
```

Expected tail:

```
[telem ] flash_pad        FAILED   MISMATCH (UNAUTHENTIC REFLECTION)
[telem ] action_challenge FAILED   FAILED (Smile and hold for 2 seconds)
...
==============================================================
  VERDICT: FAILED   RISK: HIGH   [deepfake DETECTED - blue team wins]
  VERIFICATION REJECTED: OPTICAL_REFLECTION_MISMATCH, LIVENESS_ACTION_FAILED
==============================================================
```

`--keep-open` leaves the socket up after the verdict; `--fps` changes the
injected frame rate.

## Why it holds

The deepfake never sees the challenge before it has to answer it:

- **Flash-PAD colors are generated per-session** (`secrets`-random, 4 of 7
  colors) and only revealed in the `phase_change` message *after* the
  clip is already streaming. There's no reflection in a pre-recorded clip
  to match them.
- **The action is chosen per-session** with a ~6.5 s live deadline. A
  static clip can idle and blink; it can't produce "turn your head left"
  or "raise your eyebrows" the moment it's asked.

A stronger attacker would need a **real-time, pose-controllable avatar**
*and* synthetic screen-light reflectance rendered per frame — a different
threat model, out of scope for this lab.

## Notes on the current blue-team code (informational)

Not changed here, but worth a hardening pass later:

- Phase 4 passes if **either** `action_server_count` **or**
  `action_client_count` reaches target. The client-reported count is
  attacker-controlled — server-verified only would be tighter. (This
  harness does not send `action_event`, so the demo already shows the
  server-verified path failing.)
- Phase 3 correlates against a **resampled** trajectory, ignoring *when*
  each color appeared. Scoring per-frame `flash_color` vs measured
  reflection with a latency tolerance would resist a future attacker who
  tries to paint the sequence in.
- `compute_chromaticity_correlation` returns a 0.6 neutral value per
  channel when the observed reflection has near-zero variance — a
  perfectly still, perfectly flat clip could sneak through that branch.
  Treat "no variance" as a fail, not a neutral.
