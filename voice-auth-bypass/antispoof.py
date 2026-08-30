"""
Anti-spoofing (liveness) classifier — layer 1 of the defence.

HistGradientBoosting on the 16 biomarkers. The audio-deepfake literature
reports results as EER (equal error rate) and as detection rate at a
fixed false-accept; we do the same. Also exposes which biomarker
families flagged, for the UI.

Trained on corpus.py. Detection degrades as clone quality rises and as
the attacker applies evasions — that is the arms race the lab shows.
"""

from __future__ import annotations

import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier

import biomarkers as bm
import corpus
from config import ANTISPOOF_SEED, TARGET_FALSE_ACCEPT


class AntiSpoof:
    def __init__(self):
        self.clf = HistGradientBoostingClassifier(
            max_depth=4, learning_rate=0.07, max_iter=300,
            class_weight="balanced", random_state=ANTISPOOF_SEED)
        self.threshold = 0.5

    def fit(self, X, y):
        self.clf.fit(np.asarray(X), np.asarray(y))
        return self

    def spoof_prob(self, biomarker_dict: dict) -> float:
        return float(self.clf.predict_proba([bm.vector(biomarker_dict)])[0, 1])

    def probs(self, X):
        return self.clf.predict_proba(np.asarray(X))[:, 1]

    def set_operating_point(self, X_val, y_val):
        """Pick the threshold that hits TARGET_FALSE_ACCEPT on genuine calls."""
        p = self.probs(X_val)
        gen = np.sort(p[np.asarray(y_val) == 0])[::-1]
        k = max(int(TARGET_FALSE_ACCEPT * len(gen)) - 1, 0)
        self.threshold = float(gen[k]) if len(gen) else 0.5
        return self.threshold

    def is_spoof(self, biomarker_dict: dict) -> bool:
        return self.spoof_prob(biomarker_dict) >= self.threshold


def eer(y_true, y_score):
    y = np.asarray(y_true); s = np.asarray(y_score)
    order = np.argsort(-s)
    y = y[order]
    tp = np.cumsum(y); fp = np.cumsum(1 - y)
    P, N = y.sum(), (1 - y).sum()
    fnr = 1 - tp / max(P, 1)
    fpr = fp / max(N, 1)
    i = int(np.argmin(np.abs(fnr - fpr)))
    return float((fnr[i] + fpr[i]) / 2)


def train():
    rows = corpus.build()
    X = [r["x"] for r in rows]
    y = [r["y"] for r in rows]
    cut = int(0.75 * len(rows))
    model = AntiSpoof().fit(X[:cut], y[:cut])
    model.set_operating_point(X[cut:], y[cut:])
    return model, (rows[cut:],)


if __name__ == "__main__":
    model, (test,) = train()
    Xte = [r["x"] for r in test]; yte = [r["y"] for r in test]
    p = model.probs(Xte)
    print(f"held-out EER: {eer(yte, p):.3f}   operating threshold: {model.threshold:.3f}")

    # detection vs clone quality
    import biomarkers as _bm
    rng = np.random.default_rng(1)
    print("\n detection rate @ 1% false-accept, by clone quality:")
    for q in (0.2, 0.4, 0.6, 0.8, 0.95):
        det = np.mean([model.is_spoof(_bm.sample_clone(rng, q)) for _ in range(300)])
        print(f"   quality {q:.2f}:  {det:.0%}")
    print("\n detection with evasions (quality 0.6):")
    for ev in [(), ("add_breath",), ("add_breath", "add_room_noise"),
               ("add_breath", "add_room_noise", "better_vocoder")]:
        det = np.mean([model.is_spoof(_bm.sample_clone(rng, 0.6, ev)) for _ in range(300)])
        print(f"   {('+'.join(ev) or 'none'):<45} {det:.0%}")
