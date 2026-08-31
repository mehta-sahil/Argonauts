"""
Voiceprint (speaker-similarity) — the layer the clone defeats.

A voiceprint answers "does this sound like the enrolled speaker?". A good
clone is *built* to sound like them, so it scores just as high as a
genuine call. A different person (a human impostor with no clone) scores
low. So voiceprint alone cannot separate clone from genuine — it is only
useful for catching lazy impostors.

This is not a trained model; it just reproduces that documented behaviour
(NetSPI's bank-hotline bypass; ABA Banking Journal, Feb 2024).
"""

from __future__ import annotations

import numpy as np

ACCEPT_THRESHOLD = 0.70


def match_score(call: dict, rng: np.random.Generator) -> float:
    """Speaker-similarity to the enrolled voice, 0..1."""
    if not call["is_vishing"]:
        return float(np.clip(rng.normal(0.90, 0.05), 0, 1))          # genuine speaker
    # a clone: similarity tracks clone_quality but is high even at modest quality
    q = call.get("clone_quality") or 0.5
    return float(np.clip(rng.normal(0.80 + 0.15 * q, 0.05), 0, 1))


def accepts(score: float) -> bool:
    return score >= ACCEPT_THRESHOLD
