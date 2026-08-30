# Voice-Auth Bypass — AI voice cloning vs anti-spoofing + a callback protocol

An attacker clones a voice from a few seconds of public audio and phones
in a payment authorization:

- **enterprise** — a cloned CEO/CFO voice tells the treasury team to wire
  funds to a new supplier, "keep it off the group thread";
- **consumer** — a cloned relative's voice: "I've been arrested, I need
  bail money, don't tell Mom".

The defence is a stack: a **voiceprint** speaker-match (which the clone
*passes* — that's the point), an **anti-spoofing (liveness) classifier**
on the acoustic biomarkers, a **call-context risk** model, and — the part
that actually holds — a **deterministic authorization protocol**:
anything large / to a new payee / with secrecy markers requires an
**out-of-band callback to the registered number** or **dual
authorization**. A perfect clone that fools every classifier still can't
answer the callback.

Synthetic and local. **No real audio** — the build machine's disk is full
and voice-clone / anti-spoof models are GB-scale. The lab models the
**~16 acoustic biomarkers the ASVspoof literature uses**, synthesised to
match the genuine-vs-clone distributions from the papers.
`biomarkers.extract_from_wav()` is a pure-numpy/scipy upgrade hook that
runs the same pipeline on real `.wav` files dropped into `data/wav/`.

---

## Research grounding

| Claim | Source |
|---|---|
| >1,000 AI voice-clone attacks/day at major US companies; CEO-fraud deepfakes ≥400 companies/day; ~3s of audio ≈ 85% clone fidelity | Vectra AI, March 2026 analysis |
| Deepfakes = 11% of all global fraud in 2025; AI scams +1,210% | Sumsub 2026 Identity Fraud Report; Vectra AI 2026 |
| Florida "cloned daughter, $15,000 bail" case | Sumsub Identity Fraud Report |
| First fully adjudicated criminal case (47 fraudulent accounts) | ABN AMRO, Rb. Amsterdam, ECLI:NL:RBAMS:2026:6093 (June 2026) |
| Voice biometrics alone is defeated by a good clone (bank hotline bypass demonstrated) | NetSPI, "Using Deep Fakes to Bypass Voice Biometrics"; ABA Banking Journal (Feb 2024) |
| Synthetic-speech tells: jitter/shimmer, F0-contour smoothness, HNR, phase/vocoder artifacts, breath & pause statistics, band-limiting | Audio Deepfake Detection surveys (arXiv 2308.14970, 2404.13914); ASVspoof 2021 (arXiv 2210.02437); vocoder-fingerprint work (arXiv 2411.14013) |
| Anti-spoofing metric is EER; RawNet2 / AASIST baselines | ASVspoof challenge series |
| Controls: out-of-band callback, dual authorization above a threshold, challenge-response | ABA Banking Journal; deepfake-defence industry guidance; FinCEN GenAI-fraud alert (Nov 2024) |

---

## Acoustic biomarkers (`biomarkers.py`)

16 features, each with a documented **genuine range**. The cloner shifts
them toward the clone distribution, scaled by `clone_quality ∈ [0,1]`.

Vocal source: `jitter_pct`, `shimmer_db`, `hnr_db` — real vocal folds
perturb; a clone is too stable. Prosody: `f0_range_semitones`,
`f0_contour_smoothness` — short training samples flatten pitch. Spectral /
vocoder: `spectral_flatness`, `spectral_tilt_db_oct`, `phase_artifact`
(minimum-phase vocoder signature), `hf_energy_ratio` (TTS/codec
band-limiting), `checkerboard_score` (transposed-conv upsampling).
Context: `breath_rate_pm`, `pause_regularity_cv`, `reverb_rt60_s`,
`bg_snr_db` (too clean), `latency_glitch_count` (real-time-clone
discontinuities), `codec_mismatch`.

**Attacker evasions** (each closes a family, each has a cost):
`add_breath`, `add_room_noise`, `longer_sample`, `better_vocoder`, plus
raising `clone_quality` (a better cloning service / more sample audio).

---

## Red team (`cloner.py`)

Builds a synthetic inbound call: `{biomarkers, transcript, meta}`, with a
spoofed caller ID, a new payee, an amount, and a vishing script
(`scripts.py`). Adapts across rounds:

| blocked by | attacker's move |
|---|---|
| `antispoof` | turn on the evasion that fixes the flagged biomarker family; buy a better clone (`quality += 0.15`) |
| `context` | soften the script (drop secrecy / channel-switch markers), route to a **mule payee** that passed onboarding, spoof a **matching caller ID**, ask for less (down to a floor) |
| `voiceprint` / `auth_protocol` | nothing — the callback goes to the real registered number |

---

## Blue team

- **`voiceprint.py`** — speaker-similarity. A clone scores **high**
  (0.82–0.97), just like a genuine call; only a lazy human impostor scores
  low. Voiceprint alone cannot separate clone from real (NetSPI's bank
  hotline bypass).
- **`antispoof.py`** — `HistGradientBoosting` on the 16 biomarkers.
  Reports **EER** (~0.08) and detection@1%-false-accept. Detection falls
  from ~100% at low clone quality to ~8% at quality 0.95 — it loses the
  arms race.
- **`context.py`** — logistic model on call metadata + transcript markers:
  amount, new payee, caller-ID mismatch, out-of-hours, urgency, secrecy,
  authority, channel-switch, no prior request pattern.
- **`authprotocol.py`** — the deterministic gate, run **after** the
  probabilistic layers:
  - wire ≤ `$1,000` to a **registered** payee → phone auth accepted;
  - `> $1,000` **or** new payee → **callback to the registered number** —
    the real person answers: *"I never made that call"* → **BLOCKED**;
  - `> $25,000` → **dual authorization** (a second approver who can't
    reach the executive to confirm) → **BLOCKED**;
  - secrecy / channel-switch markers → mandatory callback + cooling-off.
  The attacker spoofed the *inbound* number; the *outbound* callback goes
  to the real registered number — uninterceptable.

In `full` config, anti-spoof and context are **advisory**: a flagged call
is escalated to the protocol, not dropped — so a suspicious call always
faces the callback, and a genuine one is confirmed by it.

---

## Results (`python run.py`)

| config | fraud success | genuine blocked | note |
|---|---|---|---|
| `none` | **100%** | 0/60 | voice auth alone |
| `voiceprint` | **100%** | 0/60 | the clone passes the biometric — it adds nothing |
| `antispoof` | ~58% | 1/60 | catches low-quality clones, loses to a good one with evasions |
| `context` | ~50% | 0/60 | new-payee + urgency + secrecy catch big wires; a mule account + spoofed caller ID gets small ones through |
| `full` | **0%** | 0/60 | callback / dual-auth — a perfect clone can't answer the real number |

Anti-spoof held-out **EER ≈ 0.08**. Detection vs clone quality: ~100% →
~8% (the adversarial curve in the UI). Genuine friction under `full` is
near zero — small registered-payee calls skip the callback, large ones
get one and are confirmed.

The takeaway (same shape as the other labs): **probabilistic detectors
lose to a better fake; the deterministic out-of-band protocol does not.**

---

## Files

```
voice-auth-bypass/
  config.py         biomarker corpus sizes, policy thresholds, the quality sweep
  biomarkers.py     the 16 features + genuine ranges + samplers + extract_from_wav() hook
  scripts.py        vishing + genuine transcripts (CEO-fraud, family-bail), marker lexicons
  cloner.py         red team — synth biomarkers by quality + evasions, adapts on feedback
  genuine.py        genuine calls (natural biomarkers, verifiable context)
  corpus.py         labelled call dataset for the anti-spoof classifier
  antispoof.py      anti-spoofing classifier + EER (has a self-test)
  voiceprint.py     speaker-similarity (the layer the clone defeats)
  context.py        call-context risk (has a self-test)
  authprotocol.py   deterministic callback / dual-auth gate (has unit tests)
  run.py            the battle across 5 configs + a clone-quality sweep -> demo_data.js
  prototype.html    call-replay UI: caller ID, transcript, biomarker panel, defence pipeline
  requirements.txt  numpy, scikit-learn
```

---

## How to run

```
cd Argonauts/voice-auth-bypass
python -m pip install -r requirements.txt

python authprotocol.py     # gate unit tests: a perfect clone is still blocked
python -m antispoof        # EER + detection vs clone quality
python run.py              # the battle -> demo_data.js
```

Open `prototype.html` (needs internet once for d3). Pick a scenario and a
defence config; drag the **clone quality** slider and watch the
anti-spoof verdict flip from FAIL to PASS — while the auth-protocol
outcome stays BLOCKED.

`data/` and `demo_data.js` are git-ignored.

---

## Constraints / deviations

- **No real audio.** Feature-level simulation. `biomarkers.extract_from_wav()`
  (pure numpy + `scipy.fft`) is the hook for real clips; the synthetic
  path is used because there is no disk for audio libs and no real
  anti-spoof model on this machine. Sarvam AI has no self-serve voice
  cloning and no deepfake detector, so it does not change this.
- Production upgrades: RawNet2 / AASIST for anti-spoofing, a real speaker-
  verification model for the voiceprint.
- numpy + scikit-learn only.

## Out of scope

- Real waveform synthesis / detection; real-time streaming clones.
- Video deepfakes; multi-language.
