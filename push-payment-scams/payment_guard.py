"""
Blue team, layer 2: payment-risk fusion.

At the moment a payment is initiated, combine the messaging-channel
signal (layer 1's conversation score) with payment-side features that are
hard for a scammer to talk their way around — a first-time payee is a
first-time payee. Mirrors Confirmation of Payee + dynamic scam warnings.

Fusion model: gradient-boosted trees. Decision policy:
  allow  < WARN < warn < HOLD < hold < BLOCK < block
"""

import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier

from config import (BLOCK_THRESHOLD, CLASSIFIER_SEED, HOLD_THRESHOLD,
                    WARN_THRESHOLD)
from lexicons import PAYMENT_REQUEST, SECRECY_ISOLATION

PAYMENT_FEATURES = [
    "conversation_score", "first_time_payee", "log_amount", "round_amount",
    "payee_name_flag", "faster_payment", "odd_hour", "reference_scam_words",
    "recent_limit_increase", "turns_before_pay",
]


def _payee_name_flag(payment: dict) -> int:
    txt = (payment.get("payee_name", "") + " " + payment.get("archetype", "")).lower()
    return 1 if any(w in txt for w in ("secure", "holding", "safe", "settlement", "bond")) else 0


def payment_row(convo: dict, conversation_score: float, rng) -> dict:
    p = convo["payment"]
    amount = float(p["amount"])
    legit = convo["label"] == "legit"
    known = bool(p.get("known_payee", False))
    ref = " ".join(t["text"] for t in convo["turns"] if t["speaker"] == "them")
    return {
        "conversation_score": conversation_score,
        "first_time_payee": 0 if (legit and known) else 1,
        "log_amount": float(np.log1p(amount)),
        "round_amount": 1 if amount % 50 == 0 else 0,
        "payee_name_flag": _payee_name_flag({**p, "payee_name": p.get("new_account", "")}
                                            ) or (1 if not legit and p["archetype"] == "bank_impersonation" else 0),
        # scammers push instant faster-payments; genuine payers often aren't in a rush
        "faster_payment": 1 if (not legit or rng.random() < 0.35) else 0,
        "odd_hour": 1 if rng.random() < (0.4 if not legit else 0.12) else 0,
        "reference_scam_words": sum(ref.lower().count(w) for w in PAYMENT_REQUEST + SECRECY_ISOLATION),
        "recent_limit_increase": 1 if (not legit and rng.random() < 0.45) else 0,
        "turns_before_pay": len(convo["turns"]),
    }


class PaymentGuard:
    def __init__(self):
        self.clf = HistGradientBoostingClassifier(
            max_depth=4, learning_rate=0.08, max_iter=250,
            class_weight="balanced", random_state=CLASSIFIER_SEED)

    def fit(self, rows, y):
        X = np.array([[r[k] for k in PAYMENT_FEATURES] for r in rows])
        self.clf.fit(X, y)
        return self

    def risk(self, rows):
        X = np.array([[r[k] for k in PAYMENT_FEATURES] for r in rows])
        return self.clf.predict_proba(X)[:, 1]

    @staticmethod
    def decide(risk: float) -> str:
        if risk >= BLOCK_THRESHOLD:
            return "block"
        if risk >= HOLD_THRESHOLD:
            return "hold"
        if risk >= WARN_THRESHOLD:
            return "warn"
        return "allow"


def evaluate(risks, labels):
    """Scam payments stopped (hold/block) vs genuine-payment friction."""
    decisions = [PaymentGuard.decide(r) for r in risks]
    scam_idx = [i for i, y in enumerate(labels) if y == 1]
    legit_idx = [i for i, y in enumerate(labels) if y == 0]
    stopped = sum(decisions[i] in ("hold", "block") for i in scam_idx)
    warned_scam = sum(decisions[i] == "warn" for i in scam_idx)
    friction = sum(decisions[i] != "allow" for i in legit_idx)
    hard_fp = sum(decisions[i] in ("hold", "block") for i in legit_idx)
    return {
        "scam_payments": len(scam_idx),
        "scam_stopped": stopped,
        "scam_warned": warned_scam,
        "legit_payments": len(legit_idx),
        "legit_friction": friction,
        "legit_hard_block": hard_fp,
        "stop_rate": round(stopped / max(len(scam_idx), 1), 3),
        "friction_rate": round(friction / max(len(legit_idx), 1), 3),
        "hard_fp_rate": round(hard_fp / max(len(legit_idx), 1), 3),
    }
