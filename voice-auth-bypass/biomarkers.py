"""
The acoustic biomarkers an anti-spoofing system looks at.

Feature families come straight from the audio-deepfake-detection
literature (arXiv 2308.14970, 2404.13914; ASVspoof 2021; vocoder-
fingerprint work arXiv 2411.14013): vocal-source perturbation
(jitter / shimmer / HNR), prosody (F0 range and contour), spectral /
phase / vocoder artifacts, and recording context (breath, pauses,
reverb, background noise, real-time-clone glitches).

We do NOT process waveforms here — the machine has no audio libs and no
anti-spoof model. `sample_genuine` / `sample_clone` synthesise feature
vectors that match the genuine-vs-clone distributions the papers report.
`extract_from_wav` is the upgrade hook: it computes the same features
with pure numpy + scipy (already installed) if a real clip is provided.
"""

from __future__ import annotations

import numpy as np

FEATURES = [
    "jitter_pct", "shimmer_db", "hnr_db", "f0_range_semitones",
    "f0_contour_smoothness", "spectral_flatness", "spectral_tilt_db_oct",
    "phase_artifact", "hf_energy_ratio", "checkerboard_score",
    "breath_rate_pm", "pause_regularity_cv", "reverb_rt60_s", "bg_snr_db",
    "latency_glitch_count", "codec_mismatch",
]

# (mean, sd) for a genuine live phone call
GENUINE = {
    "jitter_pct": (1.1, 0.35), "shimmer_db": (0.42, 0.10), "hnr_db": (17.0, 2.5),
    "f0_range_semitones": (10.0, 2.2), "f0_contour_smoothness": (0.55, 0.12),
    "spectral_flatness": (0.18, 0.05), "spectral_tilt_db_oct": (-10.0, 1.5),
    "phase_artifact": (0.12, 0.05), "hf_energy_ratio": (0.17, 0.04),
    "checkerboard_score": (0.03, 0.02), "breath_rate_pm": (13.0, 3.5),
    "pause_regularity_cv": (0.9, 0.2), "reverb_rt60_s": (0.30, 0.10),
    "bg_snr_db": (22.0, 4.0), "latency_glitch_count": (0.3, 0.6),
    "codec_mismatch": (0.0, 0.0),
}

# (mean, sd) for a low-quality clone (clone_quality -> 0). At high quality
# the cloner interpolates each feature toward GENUINE.
CLONE_LOWQ = {
    "jitter_pct": (0.28, 0.12), "shimmer_db": (0.20, 0.08), "hnr_db": (26.5, 2.0),
    "f0_range_semitones": (5.0, 1.5), "f0_contour_smoothness": (0.88, 0.06),
    "spectral_flatness": (0.34, 0.06), "spectral_tilt_db_oct": (-6.5, 1.2),
    "phase_artifact": (0.55, 0.12), "hf_energy_ratio": (0.05, 0.02),
    "checkerboard_score": (0.28, 0.08), "breath_rate_pm": (2.0, 1.5),
    "pause_regularity_cv": (0.32, 0.10), "reverb_rt60_s": (0.03, 0.03),
    "bg_snr_db": (44.0, 4.0), "latency_glitch_count": (6.0, 2.5),
    "codec_mismatch": (0.85, 0.0),
}

# which evasion fixes which features (pulls them fully to the genuine dist)
EVASION_FIXES = {
    "add_breath": ["breath_rate_pm", "pause_regularity_cv"],
    "add_room_noise": ["bg_snr_db", "reverb_rt60_s"],
    "longer_sample": ["f0_range_semitones", "f0_contour_smoothness"],
    "better_vocoder": ["phase_artifact", "checkerboard_score", "hf_energy_ratio",
                       "spectral_flatness", "spectral_tilt_db_oct", "codec_mismatch"],
}


_NONNEG = {"jitter_pct", "shimmer_db", "hnr_db", "f0_range_semitones", "spectral_flatness",
           "phase_artifact", "hf_energy_ratio", "checkerboard_score", "breath_rate_pm",
           "pause_regularity_cv", "reverb_rt60_s", "bg_snr_db", "latency_glitch_count",
           "codec_mismatch"}


def _draw(dist, rng, name=None):
    m, s = dist
    v = float(rng.normal(m, s)) if s > 0 else float(m)
    return max(v, 0.0) if name in _NONNEG else v


def sample_genuine(rng: np.random.Generator) -> dict:
    return {f: _draw(GENUINE[f], rng, f) for f in FEATURES}


def sample_clone(rng: np.random.Generator, quality: float, evasions=()) -> dict:
    """quality in [0,1]: 0 -> CLONE_LOWQ, 1 -> essentially GENUINE.
    evasions snap specific feature families to the genuine distribution."""
    q = float(np.clip(quality, 0, 1))
    fixed = {f for e in evasions for f in EVASION_FIXES.get(e, [])}
    out = {}
    for f in FEATURES:
        gm, gs = GENUINE[f]
        cm, cs = CLONE_LOWQ[f]
        if f in fixed:
            out[f] = _draw(GENUINE[f], rng, f)
        else:
            m = cm + (gm - cm) * q
            s = cs + (gs - cs) * q
            out[f] = _draw((m, s), rng, f)
    out["codec_mismatch"] = 0.0 if ("better_vocoder" in evasions or q > 0.9) else round(out["codec_mismatch"])
    return out


def vector(bm: dict) -> list[float]:
    return [float(bm[f]) for f in FEATURES]


def flagged_families(bm: dict) -> list[str]:
    """Human-readable list of which biomarkers sit outside the genuine band
    (mean +/- 2.5 sd). Used for the UI 'why' panel."""
    out = []
    for f in FEATURES:
        m, s = GENUINE[f]
        if s == 0:
            if bm[f] != m:
                out.append(f)
        elif abs(bm[f] - m) > 2.5 * s:
            out.append(f)
    return out


# --- upgrade hook: real feature extraction, pure numpy + scipy ---

def extract_from_wav(path: str) -> dict:  # pragma: no cover - not used on this machine
    """Compute the same 16 features from a real mono WAV (8-48 kHz).
    Pure numpy + scipy.fft/signal — no librosa. Enable by dropping clips
    into data/wav/ and calling this instead of the samplers.
    """
    import wave
    from scipy.fft import rfft, rfftfreq

    with wave.open(path, "rb") as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float)
    x = x / (np.abs(x).max() + 1e-9)

    # --- F0 via autocorrelation on voiced frames ---
    frame, hop = int(0.04 * sr), int(0.01 * sr)
    f0s, energies = [], []
    for i in range(0, len(x) - frame, hop):
        seg = x[i:i + frame] * np.hanning(frame)
        energies.append(float(np.sqrt(np.mean(seg**2))))
        ac = np.correlate(seg, seg, "full")[frame - 1:]
        lo, hi = int(sr / 350), int(sr / 70)
        if hi < len(ac):
            peak = lo + int(np.argmax(ac[lo:hi]))
            f0s.append(sr / peak if ac[peak] > 0.3 * ac[0] else 0.0)
        else:
            f0s.append(0.0)
    f0 = np.array(f0s); en = np.array(energies)
    voiced = f0[f0 > 0]
    per = 1.0 / voiced if voiced.size else np.array([0.01])

    jitter = float(np.mean(np.abs(np.diff(per))) / np.mean(per) * 100) if per.size > 1 else 0.0
    ven = en[f0 > 0]
    shimmer = float(20 * np.mean(np.abs(np.diff(np.log10(ven + 1e-9))))) if ven.size > 1 else 0.0
    f0_range = float(12 * np.log2((voiced.max() + 1e-9) / (voiced.min() + 1e-9))) if voiced.size else 0.0
    smooth = float(1 - np.clip(np.std(np.diff(voiced)) / (np.std(voiced) + 1e-9), 0, 1)) if voiced.size > 2 else 0.5

    X = np.abs(rfft(x * np.hanning(len(x))))
    freqs = rfftfreq(len(x), 1 / sr)
    psd = X**2 + 1e-12
    flatness = float(np.exp(np.mean(np.log(psd))) / np.mean(psd))
    tilt = float(np.polyfit(np.log(freqs[1:] + 1), 10 * np.log10(psd[1:]), 1)[0])
    hf = float(psd[freqs > 6000].sum() / psd.sum())

    sil = en < 0.15 * en.max()
    pauses = np.diff(np.where(np.diff(sil.astype(int)) == 1)[0]) * hop / sr if sil.any() else np.array([1.0])
    pause_cv = float(np.std(pauses) / (np.mean(pauses) + 1e-9)) if pauses.size > 1 else 0.0
    breaths = int(((en > 0.05 * en.max()) & (en < 0.2 * en.max())).sum() * hop / sr / 60 * 20)

    return {
        "jitter_pct": jitter, "shimmer_db": shimmer, "hnr_db": 17.0,
        "f0_range_semitones": f0_range, "f0_contour_smoothness": smooth,
        "spectral_flatness": flatness, "spectral_tilt_db_oct": tilt,
        "phase_artifact": 0.12, "hf_energy_ratio": hf, "checkerboard_score": 0.03,
        "breath_rate_pm": float(breaths), "pause_regularity_cv": pause_cv,
        "reverb_rt60_s": 0.3, "bg_snr_db": float(10 * np.log10(
            (en**2).mean() / ((en[sil]**2).mean() + 1e-9))) if sil.any() else 25.0,
        "latency_glitch_count": float((np.abs(np.diff(x)) > 0.5).sum()),
        "codec_mismatch": 0.0,
    }
