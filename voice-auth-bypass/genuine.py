"""
Genuine calls — a real executive or family member making a legitimate
payment-related call. Natural biomarkers, verifiable context (registered
payee, matching caller ID, normal hours, an established request pattern).

These are the negatives for the anti-spoof classifier and the population
the false-reject / friction metric is measured against.
"""

from __future__ import annotations

import random

import numpy as np

import biomarkers as bm
import scripts

CLAIMED = {"ceo_wire": ["CEO Jane Okafor", "CFO Daniel Reyes"],
           "family_bail": ["your granddaughter Mia", "your son Josh"]}
AMOUNTS = {"ceo_wire": [8_000, 20_000, 45_000, 78_000],
           "family_bail": [80, 200, 450, 900]}


GENUINE_NOISE = [
    " Sorry to call after hours.", " It is a bit time-sensitive, if you can.",
    " This is a new vendor we just onboarded.", "",
]


def genuine_call(scenario: str, rng: np.random.Generator, seed: int = 0) -> dict:
    prng = random.Random(seed)
    amount = float(prng.choice(AMOUNTS[scenario]))
    text = scripts.build(scenario, is_vishing=False, amount=amount, rng=prng)
    # real legit calls aren't perfectly clean either — occasional urgency,
    # a genuinely new vendor, an odd hour
    text += prng.choice(GENUINE_NOISE)
    new_vendor = "new vendor" in text
    return {
        "scenario": scenario, "is_vishing": False,
        "biomarkers": bm.sample_genuine(rng),
        "transcript": " ".join(text.split()),
        "meta": {
            "claimed_identity": prng.choice(CLAIMED[scenario]),
            "caller_id_match": prng.random() < 0.88,
            "amount": amount,
            "payee_registered": False if new_vendor else prng.random() < 0.93,
            "out_of_hours": prng.random() < 0.16,
            "prior_calls_this_pattern": 0 if new_vendor else prng.randint(1, 8),
        },
        "clone_quality": None, "evasions": [],
    }
