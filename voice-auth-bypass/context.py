"""
Call-context risk — layer 3.

Scores the call independent of the audio: the amount, whether the payee
is registered, whether the caller ID matches the claimed person, the
hour, and the urgency / secrecy / authority / channel-switch markers in
what was said, plus whether this request matches the caller's normal
pattern.

A gradient-boosted model over those features, trained on the same corpus
of genuine vs vishing calls.
"""

from __future__ import annotations

import numpy as np
import random
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

import scripts
from config import ANTISPOOF_SEED, SCENARIOS
from cloner import Cloner
from genuine import genuine_call

CONTEXT_FEATURES = ["log_amount", "payee_new", "caller_id_mismatch", "out_of_hours",
                    "no_prior_pattern", "m_urgency", "m_secrecy", "m_authority",
                    "m_channel_switch"]


def features(call: dict) -> list[float]:
    m = call["meta"]
    ms = scripts.marker_scores(call["transcript"])
    return [
        float(np.log1p(m["amount"])),
        0.0 if m["payee_registered"] else 1.0,
        0.0 if m["caller_id_match"] else 1.0,
        1.0 if m["out_of_hours"] else 0.0,
        1.0 if m["prior_calls_this_pattern"] == 0 else 0.0,
        float(ms["urgency"]), float(ms["secrecy"]),
        float(ms["authority"]), float(ms["channel_switch"]),
    ]


class ContextRisk:
    def __init__(self):
        self.scaler = StandardScaler()
        self.clf = LogisticRegression(max_iter=2000, C=1.0,
                                      class_weight="balanced", random_state=ANTISPOOF_SEED)
        self.threshold = 0.5

    def fit(self, calls):
        X = np.array([features(c) for c in calls])
        y = np.array([1 if c["is_vishing"] else 0 for c in calls])
        self.clf.fit(self.scaler.fit_transform(X), y)
        return self

    def risk(self, call: dict) -> float:
        x = self.scaler.transform([features(call)])
        return float(self.clf.predict_proba(x)[0, 1])

    def high(self, call: dict) -> bool:
        return self.risk(call) >= self.threshold


def train(n=800, seed=ANTISPOOF_SEED):
    rng = np.random.default_rng(seed)
    prng = random.Random(seed)
    calls = []
    for i in range(n):
        sc = SCENARIOS[i % 2]
        if i % 2:
            calls.append(genuine_call(sc, rng, seed=seed + i))
        else:
            calls.append(Cloner(sc, prng.uniform(0.2, 0.95), rng, seed=seed + i).call())
    return ContextRisk().fit(calls)   # threshold 0.5; scores are cleanly separated


if __name__ == "__main__":
    m = train()
    rng = np.random.default_rng(2); prng = random.Random(2)
    v = [Cloner(SCENARIOS[i % 2], 0.6, rng, seed=i).call() for i in range(200)]
    g = [genuine_call(SCENARIOS[i % 2], rng, seed=1000 + i) for i in range(200)]
    print(f"vishing flagged  : {np.mean([m.high(c) for c in v]):.0%}")
    print(f"genuine flagged  : {np.mean([m.high(c) for c in g]):.0%}  (friction)")
