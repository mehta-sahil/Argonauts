# Lab: voice-auth-bypass — AI voice cloning vs anti-spoofing + a callback protocol

An attacker clones a voice from a few seconds of public audio (earnings
call, YouTube) and phones in a payment authorization:

- **enterprise** — cloned CEO/CFO voice tells the treasury team to wire
  funds to a new supplier, "keep it off the group thread";
- **consumer** — cloned relative's voice: "I've been arrested, I need
  bail money, don't tell Mom".

The defence is a stack: an **anti-spoofing (liveness) classifier** on the
acoustic biomarkers, a **voiceprint** speaker-match (which the clone
*passes* — that's the point), a **call-context risk** model, and — the
part that actually holds — a **deterministic authorization protocol**:
anything large / to a new payee / with secrecy markers requires an
**out-of-band callback to the registered number** or **dual
authorization**. A perfect clone that fools every classifier still can't
answer the callback.

Synthetic and local. **No real audio** — the build machine's disk is full
and voice-clone / anti-spoof models are GB-scale. The lab models the
**~16 acoustic biomarkers the ASVspoof literature actually uses**,
synthesized to match the genuine-vs-clone distributions from the papers.
`biomarkers.py` is written in pure numpy/scipy so the identical code runs
on real `.wav` files if any are dropped into `data/wav/`.

---

## Research grounding

| Claim | Source |
|---|---|
| >1,000 AI voice-clone attacks/day at major US companies; CEO-fraud deepfakes ≥400 companies/day; ~3s of audio ≈ 85% clone fidelity | Vectra AI, March 2026 analysis |
| Deepfakes = 11% of all global fraud in 2025; AI scams +1,210% | Sumsub 2026 Identity Fraud Report; Vectra AI 2026 |
| Florida "cloned daughter, $15,000 bail" case | Sumsub Identity Fraud Report |
| First fully adjudicated criminal case (47 fraudulent accounts) | ABN AMRO, Rb. Amsterdam, ECLI:NL:RBAMS:2026:6093 (June 2026) |
| Voice biometrics alone is defeated by a good clone (bank hotline bypass demonstrated) | NetSPI, "Using Deep Fakes to Bypass Voice Biometrics" |
| Synthetic-speech tells: jitter/shimmer, F0-contour smoothness, HNR, phase/vocoder artifacts, breath & pause statistics, band-limiting | Audio Deepfake Detection surveys (arXiv 2308.14970, 2404.13914); ASVspoof 2021 (arXiv 2210.02437); vocoder-fingerprint work (arXiv 2411.14013) |
| Anti-spoofing metric is EER; RawNet2 / AASIST baselines | ASVspoof challenge series |
| Controls: out-of-band callback, dual authorization above a threshold, challenge-response | ABA Banking Journal (Feb 2024); industry deepfake-defence guidance; FinCEN GenAI-fraud alert (Nov 2024) |

---

## Acoustic biomarkers (`biomarkers.py`)

~16 features, the families the literature uses. Each has a documented
**genuine range**; the cloner shifts them toward the clone distribution,
scaled by `clone_quality ∈ [0,1]` and the attacker's evasions.

| feature | genuine | low-quality clone | what it measures |
|---|---|---|---|
| `jitter_pct` | 0.5–2.0 | <0.4 (too stable) or >3 (glitchy) | cycle-to-cycle F0 perturbation (real vocal folds) |
| `shimmer_db` | 0.2–0.6 | lower / erratic | cycle-to-cycle amplitude perturbation |
| `hnr_db` | 12–22 | >24 (too clean) | harmonics-to-noise ratio |
| `f0_range_semitones` | 6–14 | 3–7 (flat, short sample) | prosodic pitch range |
| `f0_contour_smoothness` | mid | very high or abrupt jumps | naturalness of the F0 trajectory |
| `spectral_flatness` | low–mid | elevated in bands | vocoder over-smoothing / buzz |
| `spectral_tilt_db_oct` | −8…−12 | flatter | spectral envelope slope |
| `phase_artifact` | low | elevated | minimum-phase vocoder signature |
| `hf_energy_ratio` | 0.10–0.25 | <0.06 | energy > 6 kHz (TTS/codec band-limiting) |
| `checkerboard_score` | ~0 | elevated | transposed-conv upsampling artifact |
| `breath_rate_pm` | 8–20 | 0–4 | breaths per minute |
| `pause_regularity_cv` | 0.6–1.2 | <0.4 (too regular) | variability of inter-pause gaps |
| `reverb_rt60_s` | 0.15–0.5 | ~0 | room acoustics |
| `bg_snr_db` | 15–30 | >40 (too clean) | background noise present |
| `latency_glitch_count` | 0–1 | 3–10 | real-time-clone micro-discontinuities |
| `codec_mismatch` | 0 | 1 | synthesis/channel codec inconsistency |

**Attacker evasions** (each closes specific tells, each has a cost):
`add_breath` → breath_rate + pause_regularity; `add_room_noise` →
bg_snr + reverb; `longer_sample` → f0_range + contour; `better_vocoder`
→ phase_artifact + checkerboard + hf_energy + spectral_flatness.

---

## Red team (`cloner.py`)

Builds a synthetic call: `{biomarkers, transcript, meta}`.

- `clone_quality` and evasions set the biomarker vector.
- `scripts.py` supplies the vishing transcript (CEO-fraud wire /
  family-bail), with urgency / secrecy / channel-switch markers.
- `meta`: claimed identity, spoofed caller ID, amount, payee (new),
  time of day.
- Adapts across rounds: on `blocked_by == "antispoof"` it turns on the
  evasion that fixes the flagged feature family; on `context` it softens
  the script; on `auth_protocol` — nothing it can do (that's the point).

`--llm`: Gemini writes the vishing script; templates otherwise (Gemini
quota is currently exhausted, so templates are the default).

---

## Blue team

- **`voiceprint.py`** — speaker-similarity score. A clone scores **high**
  (0.82–0.97) just like a genuine call; a different-person impostor scores
  low. Demonstrates that voiceprint alone cannot separate clone from real.
- **`antispoof.py`** — `HistGradientBoostingClassifier` on the 16
  biomarkers. Reports **EER** and detection@1%-false-accept. Exposes
  which feature families flagged (for the UI). Trained on `corpus.py`
  (genuine calls vs clones across the quality range).
- **`context.py`** — risk on call metadata + transcript markers: amount,
  new payee, caller-ID mismatch, out-of-hours, urgency, secrecy,
  channel-switch, deviation from the caller's normal pattern.
- **`authprotocol.py`** — the deterministic gate:
  - wire ≤ `$LOW` to a **registered** payee → phone auth accepted;
  - `> $LOW` **or** new payee → **callback to the registered number**
    required; the real person answers → "I never made that call" →
    **BLOCKED**;
  - `> $HIGH` → **dual authorization** (a second approver) required;
  - any secrecy / channel-switch marker → mandatory callback + a
    cooling-off delay.
  The attacker spoofed the *inbound* caller ID but the *outbound*
  callback goes to the real registered number — uninterceptable. A
  perfect clone still fails here.

---

## The battle (`run.py`)

Configs: `none` / `voiceprint` / `antispoof` / `context` / `full`.
For each: run enterprise + consumer episodes across a `clone_quality`
sweep (0.2 → 0.95) with the attacker adapting.

Metrics:
- **fraud success rate** (money moved) per config, vs clone_quality;
- **anti-spoof EER** and detection@1%FA;
- **genuine-call false-reject rate** (a real CFO's scheduled-payment call
  wrongly blocked — the friction cost);
- **adversarial curve** — clone_quality + evasions vs anti-spoof
  detection (falls); auth-protocol block rate (flat ~100%).

Expected headline:

| config | fraud success | note |
|---|---|---|
| `none` | ~100% | voice auth alone |
| `voiceprint` | ~95% | the clone passes the biometric — barely helps |
| `antispoof` | ~55% | catches low-quality clones, misses good/evasive ones |
| `context` | ~40% | new-payee + urgency + secrecy catch many, not all |
| `full` | **~0–5%** | callback / dual-auth; a perfect clone can't answer the callback |

Genuine friction under `full`: only large or new-payee calls get a
callback — which is the control banks already recommend.

---

## UI (`prototype.html`)

An inbound-call replay, one episode at a time (scenario × config ×
clone-quality):

- caller ID banner (claimed = "CEO Jane Doe", actual = spoofed) →
- transcript, with urgency / secrecy markers highlighted →
- **biomarker panel**: each of the 16 features as a dot on its genuine
  band; out-of-band dots flash red; the flagged families listed →
- **anti-spoof verdict** (spoof probability, EER context) →
- **voiceprint match**: shows **PASS ✓ (0.91)** — captioned "sounds like
  her — which is exactly why this isn't enough" →
- **context risk** →
- **authorization protocol**: `CALLBACK REQUIRED → registered number
  answered → "I never called" → BLOCKED` (or `DUAL-AUTH REQUIRED`, or
  `ACCEPTED` for a small known-payee call) →
- outcome: money moved? $ prevented.

Controls: scenario toggle, config tabs, a **clone-quality slider** that
re-runs the same attack and shows anti-spoof detection degrade while the
protocol holds. Sidebar: fraud-rate bars per config, EER, adversarial
curve. d3 for the charts.

---

## Files

```
voice-auth-bypass/
  config.py         biomarker ranges, policy thresholds, sizes
  biomarkers.py     the 16 features + genuine ranges + a pure-scipy extract_from_wav() hook
  scripts.py        vishing + genuine transcript templates, urgency/secrecy lexicons
  cloner.py         red team — synth biomarkers by quality+evasions, transcript, adapts
  genuine.py        genuine calls (natural biomarkers, verifiable context)
  corpus.py         labelled call dataset for the anti-spoof classifier
  antispoof.py      anti-spoofing classifier + EER
  voiceprint.py     speaker-similarity (the layer the clone defeats)
  context.py        call-context risk
  authprotocol.py   deterministic callback / dual-auth gate
  run.py            the battle + sweeps -> demo_data.js
  prototype.html    call-replay UI
  requirements.txt  numpy, scikit-learn (scipy already pulled in)
  README.md / plan.md
```

---

## Build order

1. `config.py`, `biomarkers.py` (ranges + synth samplers + wav hook).
2. `scripts.py` (transcripts + lexicons).
3. `cloner.py` + `genuine.py` — generate one call each, eyeball the vectors.
4. `corpus.py` — labelled set; check genuine/clone overlap grows with quality.
5. `antispoof.py` — classifier + EER; `voiceprint.py` — the fooled score.
6. `context.py`, `authprotocol.py` — unit-test the gate (callback blocks a
   perfect clone; a small known-payee call passes; genuine large call gets
   a callback that confirms).
7. `run.py` — battle, sweeps, `demo_data.js`.
8. `prototype.html`.
9. `README.md`, parent README entry, `.gitignore`, headless render, commit, push.

## Verification

- `python authprotocol.py` — gate unit tests pass (perfect clone blocked
  by callback; genuine confirmed by callback; small known-payee accepted).
- `python -m antispoof` — EER printed; detection degrades as clone_quality
  rises (assert EER at q=0.3 << EER at q=0.9).
- `python run.py` — the fraud-rate table. Assert: `full` fraud ≈ 0 across
  the whole quality sweep; `none` ≈ 100%; `voiceprint` ≈ `none`;
  genuine false-reject under `full` is low.
- `prototype.html` renders headless; the clone-quality slider changes the
  anti-spoof verdict but not the protocol outcome.

## Constraints / deviations

- **No real audio** — feature-level simulation. `biomarkers.py` exposes
  `extract_from_wav()` (pure numpy + scipy.fft/signal, already installed)
  so the same pipeline runs on real clips dropped into `data/wav/`; the
  synthetic path is used because there is neither disk for audio libs nor
  a real anti-spoof model on this machine.
- Sarvam AI has no self-serve voice cloning and no deepfake detector, so
  it does not change this.
- numpy + scikit-learn only.

## Out of scope

- Real waveform synthesis / detection; real-time clone streaming.
- Video deepfakes (covered conceptually elsewhere).
- Multi-language.
