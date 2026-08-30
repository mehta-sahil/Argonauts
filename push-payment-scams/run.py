"""
Glue: corpus -> scam-intent classifier -> payment-risk fusion ->
adversarial round -> demo_data.js.

    python run.py            # deterministic corpus
    python run.py --llm      # scammer driven by an Anthropic model
    python run.py --fresh    # rebuild the corpus even if it exists
"""

import argparse
import json
import os
import random

import numpy as np

from config import (AVG_SCAM_LOSS, CORPUS_PATH, DEMO_DATA_PATH, EVADE_ROUNDS,
                    FLAG_THRESHOLD)
import corpus as corpus_mod
from classifier import (ScamClassifier, conversation_scores, early_detection,
                        messages_from)
from payment_guard import PAYMENT_FEATURES, PaymentGuard, evaluate, payment_row
from evade import evade_curve


def average_precision(y_true, y_score):
    y = np.asarray(y_true)[np.argsort(-np.asarray(y_score))]
    tp, fp = np.cumsum(y), np.cumsum(1 - y)
    precision = tp / (tp + fp)
    recall = tp / max(y.sum(), 1)
    rprev = np.concatenate([[0.0], recall[:-1]])
    return float(np.sum((recall - rprev) * precision))


def load_corpus(use_llm, fresh):
    if fresh or not os.path.exists(CORPUS_PATH):
        return corpus_mod.build(use_llm=use_llm)
    with open(CORPUS_PATH, encoding="utf-8") as fh:
        return [json.loads(line) for line in fh]


def main(use_llm=False, fresh=False):
    rows = load_corpus(use_llm, fresh)
    random.Random(0).shuffle(rows)
    cut = int(0.7 * len(rows))
    train_rows, test_rows = rows[:cut], rows[cut:]
    test_ids = {r["id"] for r in test_rows}
    print(f"conversations: {len(train_rows)} train / {len(test_rows)} test")

    # --- layer 1: scam-intent classifier (trained on individual messages) ---
    tr = messages_from(train_rows)
    clf = ScamClassifier().fit([m["text"] for m in tr], [m["y"] for m in tr])

    te = messages_from(test_rows)
    msg_ap = average_precision([m["y"] for m in te], clf.score([m["text"] for m in te]))

    seq_all = conversation_scores(clf, rows)          # running score per conversation
    conv_final = {cid: s[-1][1] for cid, s in seq_all.items()}
    seq_test = {cid: seq_all[cid] for cid in test_ids}

    conv_ap = average_precision(
        [1 if r["label"] == "scam" else 0 for r in test_rows],
        [conv_final[r["id"]] for r in test_rows])
    before, total, lead = early_detection(test_rows, seq_test)

    print("\n=== layer 1: scam-intent text classifier (held-out) ===")
    print(f"  message-level AUC-PR : {msg_ap:.3f}")
    print(f"  conversation  AUC-PR : {conv_ap:.3f}")
    print(f"  flagged BEFORE the payment ask: {before}/{total} scam conversations "
          f"(mean {lead:.1f} turns early)")

    # --- layer 2: payment-risk fusion ---
    grng = random.Random(1)
    pay = [(r, payment_row(r, conv_final[r["id"]], grng))
           for r in rows if r["payment"] is not None]
    pay_train = [(r, pr) for (r, pr) in pay if r["id"] not in test_ids]
    pay_test = [(r, pr) for (r, pr) in pay if r["id"] in test_ids]

    guard = PaymentGuard().fit(
        [pr for _, pr in pay_train],
        [1 if r["label"] == "scam" else 0 for r, _ in pay_train])

    Xte = [pr for _, pr in pay_test]
    yte = [1 if r["label"] == "scam" else 0 for r, _ in pay_test]
    risk = guard.risk(Xte)
    fuse = evaluate(risk, yte)
    n_scam_pay, n_legit_pay = sum(yte), len(yte) - sum(yte)

    text_only_stop = sum(1 for (r, pr) in pay_test
                         if r["label"] == "scam" and pr["conversation_score"] >= FLAG_THRESHOLD)
    text_only_fp = sum(1 for (r, pr) in pay_test
                       if r["label"] == "legit" and pr["conversation_score"] >= FLAG_THRESHOLD)

    print("\n=== layer 2: payment-risk fusion (held-out payments) ===")
    print(f"  text score only : stopped {text_only_stop}/{n_scam_pay} scam payments, "
          f"{text_only_fp}/{n_legit_pay} genuine payments flagged")
    print(f"  fusion          : stopped {fuse['scam_stopped']}/{n_scam_pay} "
          f"({fuse['stop_rate']:.0%}); genuine friction {fuse['friction_rate']:.0%}, "
          f"hard false-block {fuse['hard_fp_rate']:.0%}")
    prevented = fuse["scam_stopped"] * AVG_SCAM_LOSS
    print(f"  ~${prevented:,.0f} of scam payments prevented on the test slice")

    # --- adversarial paraphrase rounds ---
    curve = evade_curve(clf, guard, test_rows, Xte, yte, EVADE_ROUNDS)
    print("\n=== adversarial paraphrase rounds ===")
    for c in curve:
        print(f"  strength {c['strength']:.2f}:  text-only recall {c['text_only_recall']:.2f}   "
              f"fusion recall {c['fusion_recall']:.2f}")

    metrics = {
        "msg_ap": round(msg_ap, 3), "conv_ap": round(conv_ap, 3),
        "flagged_before_ask": before, "convos_with_ask": total,
        "mean_lead_turns": round(lead, 1),
        "fusion": fuse, "text_only_stop": text_only_stop, "text_only_fp": text_only_fp,
        "n_scam_pay": int(n_scam_pay), "n_legit_pay": int(n_legit_pay),
        "prevented_usd": prevented, "evade_curve": curve,
    }
    _write_demo(clf, test_rows,
                {r["id"]: (float(rk), pr) for (r, pr), rk in zip(pay_test, risk)},
                metrics)
    print(f"\nwrote {DEMO_DATA_PATH} — open prototype.html")


def _write_demo(clf, test_rows, risk_by_id, metrics):
    rng = random.Random(3)
    scam = [r for r in test_rows if r["label"] == "scam" and r["id"] in risk_by_id]
    legit = [r for r in test_rows if r["label"] == "legit"]
    sample = rng.sample(scam, min(6, len(scam))) + rng.sample(legit, min(5, len(legit)))
    rng.shuffle(sample)

    convos = []
    for r in sample:
        run, turns = 0.0, []
        for t in r["turns"]:
            if t["speaker"] == "them":
                s = clf.score_one(t["text"])
                run = max(run, s)
                fired = [k for k, _ in clf.explain(t["text"])]
            else:
                s, fired = None, []
            turns.append({"speaker": t["speaker"], "text": t["text"], "stage": t["stage"],
                          "score": round(s, 3) if s is not None else None,
                          "running": round(run, 3), "fired": fired})
        rk, pr = risk_by_id.get(r["id"], (None, None))
        convos.append({
            "id": r["id"], "label": r["label"], "archetype": r["archetype"],
            "turns": turns, "ask_turn": r["ask_turn"], "payment": r["payment"],
            "payment_made": r["payment_made"],
            "payment_risk": round(rk, 3) if rk is not None else None,
            "decision": PaymentGuard.decide(rk) if rk is not None else None,
            "payment_features": {k: round(float(pr[k]), 3) for k in PAYMENT_FEATURES} if pr else None,
        })

    payload = {"conversations": convos, "metrics": metrics, "flag_threshold": FLAG_THRESHOLD,
               "narrative": (
                   "An LLM agent runs an authorized-push-payment scam conversation. A "
                   "linear scam-intent model scores every message; a gradient-boosted "
                   "payment guard fuses that with payment features and blocks the "
                   "transfer. When the scammer paraphrases to dodge the text model, the "
                   "payment guard still holds — a first-time payee can't be reworded away.")}
    with open(DEMO_DATA_PATH, "w", encoding="utf-8") as fh:
        fh.write("window.DEMO = ")
        json.dump(payload, fh, indent=1)
        fh.write(";\n")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--llm", action="store_true")
    ap.add_argument("--fresh", action="store_true")
    a = ap.parse_args()
    main(use_llm=a.llm, fresh=a.fresh)
