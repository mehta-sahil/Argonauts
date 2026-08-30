"""
Adversarial round: the scammer rewrites messages to slip under the text
classifier while keeping the intent.

Two levers, applied at increasing `strength`:

  1. vocabulary softening — swap the obvious trigger words for blander
     synonyms (a scammer paraphrasing by hand);
  2. a greedy query-based word attack (TextFooler-style — Jin et al.,
     "Is BERT Really Robust?", AAAI 2020): repeatedly delete or mask the
     word that most lowers the classifier's score, up to a word budget.

The finding to demonstrate: the greedy attack drives the TEXT-ONLY
detection down, but the FUSION layer barely moves — a first-time payee, a
large instant transfer, and a victim who never verified out-of-band are
not things you can reword. That gap is the case for defence-in-depth
(FRAUD-RLA, arXiv 2502.02290, makes the same point for transaction
models).
"""

import random
import re

from config import EVADE_SAMPLE, FLAG_THRESHOLD
from payment_guard import PaymentGuard

SOFTENERS = [
    (r"\bimmediately\b", "soon"), (r"\bright now\b", "when you can"),
    (r"\blast chance\b", "an option"), (r"\burgent(ly)?\b", "important"),
    (r"\btransfer the money\b", "move the funds across"),
    (r"\bmove your funds\b", "shift the balance"),
    (r"\bsend the payment\b", "arrange the payment"),
    (r"\bsafe account\b", "designated account"),
    (r"\byou will be arrested\b", "there may be consequences"),
    (r"\bwarrant\b", "a note on file"), (r"\bpolice\b", "the office"),
    (r"\bdon'?t tell anyone\b", "keep it simple"),
    (r"\bkeep this between us\b", "no need to involve others"),
    (r"\bfraud (prevention )?team\b", "account services"),
    (r"\bfrozen\b", "on hold"), (r"\bhurry\b", "when you get a moment"),
]

_STOP = set("a an the to of and or is are be it this that i you we they for on in with your my "
            "me he she at as if so no yes not".split())


def soften(text: str, strength: float) -> str:
    out = text
    for pat, repl in SOFTENERS[: int(len(SOFTENERS) * min(strength, 1.0))]:
        out = re.sub(pat, repl, out, flags=re.I)
    return out


def greedy_attack(clf, text: str, budget_frac: float, threshold=FLAG_THRESHOLD) -> str:
    """Delete words one at a time, greedily choosing the deletion that most
    reduces the scam score, until below threshold or budget spent."""
    words = text.split()
    budget = max(1, int(budget_frac * len(words)))
    cur = list(words)
    cur_score = clf.score_one(" ".join(cur))
    if cur_score < threshold:
        return text
    for _ in range(budget):
        cand_idx = [i for i, w in enumerate(cur) if w.lower().strip(".,!?:") not in _STOP]
        if not cand_idx:
            break
        trials = [" ".join(cur[:i] + cur[i + 1:]) or " " for i in cand_idx]
        scores = clf.score(trials)
        j = int(scores.argmin())
        if scores[j] >= cur_score:
            break
        cur.pop(cand_idx[j])
        cur_score = float(scores[j])
        if cur_score < threshold:
            break
    return " ".join(cur)


def evade_message(clf, text: str, strength: float) -> str:
    t = soften(text, strength)
    if strength > 0:
        t = greedy_attack(clf, t, budget_frac=0.15 + 0.35 * strength)
    return t


def _text_recall(clf, rows, strength, threshold=FLAG_THRESHOLD):
    scam = [r for r in rows if r["label"] == "scam"]
    if len(scam) > EVADE_SAMPLE:
        scam = random.Random(7).sample(scam, EVADE_SAMPLE)
    hit = 0
    for r in scam:
        them = [t["text"] for t in r["turns"] if t["speaker"] == "them"]
        if not them:
            continue
        adv = [evade_message(clf, x, strength) for x in them]
        if clf.score(adv).max() >= threshold:
            hit += 1
    return hit / max(len(scam), 1)


def _fusion_recall(guard, pay_rows, pay_labels):
    risk = guard.risk(pay_rows)
    stopped = sum(PaymentGuard.decide(rk) in ("hold", "block")
                  for rk, y in zip(risk, pay_labels) if y == 1)
    return stopped / max(sum(pay_labels), 1)


def evade_curve(clf, guard, test_rows, pay_rows, pay_labels, rounds):
    base_fusion = _fusion_recall(guard, pay_rows, pay_labels)
    curve = []
    for i in range(rounds + 1):
        strength = i / rounds
        curve.append({
            "round": i, "strength": round(strength, 2),
            "text_only_recall": round(_text_recall(clf, test_rows, strength), 3),
            "fusion_recall": round(base_fusion, 3),
        })
    return curve
