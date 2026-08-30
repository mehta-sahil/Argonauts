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
from mutate import mutate
from evade import soften
from scammer import make_scammer
from victim import Victim

CASUAL_ARCHETYPES = {"romance", "purchase"}
# how hard the scammer plays it. "soft" scams already read like a careful,
# de-risked script; "camouflaged" ones have no tells at all and are meant
# to slip past the text layer.
INTENSITY = (["soft"] * 3 + ["normal"] * 4 + ["aggressive"] * 2)
CAMOUFLAGE_RATE = 0.28


def _camouflaged_scam(cid: int, rng: random.Random) -> dict:
    """No tells at all: the conversation is generated from the *same*
    templates as a genuine marketplace sale / invoice / bill-split, and
    only the metadata betrays it — the payee is a fresh account the
    customer has never paid, and (in the real world) the goods never
    arrive. These are meant to slip past the text layer; whether the
    payment guard catches one comes down to the amount and the payee."""
    gen = rng.choice([legit.marketplace_sale, legit.supplier_invoice,
                      legit.pay_a_friend, legit.marketplace_haggle, legit.split_the_bill])
    turns_raw, payment = gen(rng)
    turns = [{"speaker": sp, "text": mutate(tx, rng, casual=True), "stage": st, "turn": i}
             for i, (sp, tx, st) in enumerate(turns_raw)]
    if payment is None:                       # generator had no payment -> force one
        acct = f"{rng.randint(10_000_000, 99_999_999)}"
        sort = f"{rng.randint(10,99)}-{rng.randint(10,99)}-{rng.randint(10,99)}"
        payment = {"amount": float(rng.choice([90, 180, 320, 640])),
                   "new_account": acct, "sort_code": sort, "known_payee": False}
    payment = {**payment, "archetype": "purchase", "known_payee": False,
               "new_account": f"{rng.randint(10_000_000, 99_999_999)}"}
    ask_turn = next((t["turn"] for t in turns if t["stage"] in ("details", "pay")), None)
    return {"id": cid, "label": "scam", "archetype": "purchase", "turns": turns,
            "payment": payment, "payment_made": any(t["stage"] == "pay" for t in turns),
            "ask_turn": ask_turn, "intensity": "camouflaged"}


def _scam_convo(cid: int, rng: random.Random, use_llm: bool) -> dict:
    if rng.random() < CAMOUFLAGE_RATE:
        return _camouflaged_scam(cid, rng)
    archetype = rng.choice(ARCHETYPES)
    intensity = rng.choice(INTENSITY)
    scammer = make_scammer(archetype, rng, use_llm)
    victim = Victim(rng)
    casual = archetype in CASUAL_ARCHETYPES

    turns, objection, ask_turn = [], None, None
    for _ in range(MAX_TURNS):
        text, stage = scammer.next_line(objection)
        if intensity == "soft":
            text = soften(text, rng.uniform(0.4, 0.8))
        elif intensity == "normal" and rng.random() < 0.4:
            text = soften(text, rng.uniform(0.15, 0.4))
        text = mutate(text, rng, casual=casual or intensity == "camouflaged")
        turns.append({"speaker": "them", "text": text, "stage": stage, "turn": len(turns)})
        if stage == "ask":
            ask_turn = len(turns) - 1
        v_text, objection = victim.respond(text, stage)
        turns.append({"speaker": "me", "text": mutate(v_text, rng, casual=casual),
                      "stage": "reply", "turn": len(turns)})
        if victim.complied or victim.disengaged:
            break

    return {
        "id": cid, "label": "scam", "archetype": archetype, "turns": turns,
        "payment": scammer.payment, "payment_made": victim.complied,
        "ask_turn": ask_turn, "intensity": intensity,
    }


def _legit_convo(cid: int, rng: random.Random) -> dict:
    turns_raw, payment = legit.make_legit(rng)
    casual = payment is not None and payment.get("archetype", "") in (
        "legit_friend", "legit_family", "legit_billsplit", "legit_marketplace")
    turns = [{"speaker": sp, "text": mutate(tx, rng, casual=casual), "stage": st, "turn": i}
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
