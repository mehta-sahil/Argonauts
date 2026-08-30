"""
Labelled call dataset for the anti-spoof classifier.

  genuine  — natural biomarkers (genuine.py)
  clone    — cloned-voice biomarkers across the whole quality range,
             some with evasions already applied (a prepared attacker)

    python corpus.py
"""

from __future__ import annotations

import random

import numpy as np

import biomarkers as bm
from config import CLONE_QUALITY_TRAIN, CORPUS_SEED, N_CLONE, N_GENUINE, SCENARIOS
from genuine import genuine_call

EVASION_SETS = [(), (), (), ("add_breath",), ("add_room_noise",),
                ("add_breath", "add_room_noise"), ("better_vocoder",),
                ("add_breath", "better_vocoder"),
                ("add_breath", "add_room_noise", "longer_sample")]


def build(seed: int = CORPUS_SEED):
    rng = np.random.default_rng(seed)
    prng = random.Random(seed)
    rows = []

    for i in range(N_GENUINE):
        sc = SCENARIOS[i % len(SCENARIOS)]
        c = genuine_call(sc, rng, seed=seed + i)
        rows.append({"x": bm.vector(c["biomarkers"]), "y": 0,
                     "scenario": sc, "quality": None})

    lo, hi = CLONE_QUALITY_TRAIN
    for i in range(N_CLONE):
        sc = SCENARIOS[i % len(SCENARIOS)]
        q = prng.uniform(lo, hi)
        ev = prng.choice(EVASION_SETS)
        b = bm.sample_clone(rng, q, ev)
        rows.append({"x": bm.vector(b), "y": 1, "scenario": sc, "quality": round(q, 2)})

    prng.shuffle(rows)
    return rows


if __name__ == "__main__":
    rows = build()
    g = [r for r in rows if r["y"] == 0]
    c = [r for r in rows if r["y"] == 1]
    print(f"calls: {len(rows)}  genuine {len(g)}  clone {len(c)}")
    X = np.array([r["x"] for r in rows]); y = np.array([r["y"] for r in rows])
    for j, f in enumerate(bm.FEATURES):
        gm = X[y == 0, j].mean(); cm = X[y == 1, j].mean()
        print(f"  {f:<24} genuine {gm:8.3f}   clone {cm:8.3f}")
