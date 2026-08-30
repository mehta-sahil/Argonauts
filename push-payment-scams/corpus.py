"""
Build the labelled conversation corpus.

    python corpus.py             # deterministic dialogue engine
    python corpus.py --llm       # scammer driven by an Anthropic model

Writes data/conversations.jsonl, one JSON object per line:

  {
    "id": int,
    "label": "scam" | "legit",
    "archetype": str,
    "turns": [{"speaker": "them"|"me", "text": str, "stage": str, "turn": int}, ...],
    "payment": {"amount", "new_account", "sort_code", "archetype", "known_payee"} | null,
    "payment_made": bool,        # did the customer actually send money
    "ask_turn": int | null       # turn index of the scammer's payment request
  }
"""

import argparse
import json
import os
import random

from config import (ARCHETYPES, CORPUS_PATH, CORPUS_SEED, MAX_TURNS,
                    N_LEGIT_CONVOS, N_SCAM_CONVOS)
import legit
from scammer import make_scammer
from victim import Victim


def _scam_convo(cid: int, rng: random.Random, use_llm: bool) -> dict:
    archetype = rng.choice(ARCHETYPES)
    scammer = make_scammer(archetype, rng, use_llm)
    victim = Victim(rng)

    turns, objection, ask_turn = [], None, None
    for t in range(MAX_TURNS):
        text, stage = scammer.next_line(objection)
        turns.append({"speaker": "them", "text": text, "stage": stage, "turn": len(turns)})
        if stage == "ask":
            ask_turn = len(turns) - 1
        v_text, objection = victim.respond(text, stage)
        turns.append({"speaker": "me", "text": v_text, "stage": "reply", "turn": len(turns)})
        if victim.complied or victim.disengaged:
            break

    return {
        "id": cid, "label": "scam", "archetype": archetype, "turns": turns,
        "payment": scammer.payment, "payment_made": victim.complied,
        "ask_turn": ask_turn,
    }


def _legit_convo(cid: int, rng: random.Random) -> dict:
    turns_raw, payment = legit.make_legit(rng)
    turns = [{"speaker": sp, "text": tx, "stage": st, "turn": i}
             for i, (sp, tx, st) in enumerate(turns_raw)]
    made = payment is not None and any(t["stage"] == "pay" for t in turns)
    return {
        "id": cid, "label": "legit",
        "archetype": payment["archetype"] if payment else "legit_notification",
        "turns": turns, "payment": payment, "payment_made": made, "ask_turn": None,
    }


def build(use_llm: bool = False, path: str = CORPUS_PATH):
    rng = random.Random(CORPUS_SEED)
    rows = []
    for i in range(N_SCAM_CONVOS):
        rows.append(_scam_convo(i, rng, use_llm))
    for j in range(N_LEGIT_CONVOS):
        rows.append(_legit_convo(N_SCAM_CONVOS + j, rng))
    rng.shuffle(rows)

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        for r in rows:
            fh.write(json.dumps(r) + "\n")

    scam = [r for r in rows if r["label"] == "scam"]
    print(f"wrote {len(rows)} conversations to {path}")
    print(f"  scam: {len(scam)}   legit: {len(rows) - len(scam)}")
    print(f"  scam payments completed: {sum(r['payment_made'] for r in scam)} / {len(scam)}")
    print(f"  mean turns: {sum(len(r['turns']) for r in rows) / len(rows):.1f}")
    return rows


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--llm", action="store_true")
    build(use_llm=ap.parse_args().llm)
