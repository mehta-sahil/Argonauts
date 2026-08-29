"""
Synthetic card pool for the local simulation.

The Luhn helpers are shared with seed_cards.py so the AWS seeder and the
local simulation generate PANs the same way. Import from here, do not
copy.

A card in the pool carries the "hidden truth" the issuer checks against:
  pan, expiry_month, expiry_year, cvv   - what a correct auth must match
  is_dead                               - True for a card with no funds /
                                          closed account. The issuer
                                          declines every auth on it
                                          regardless of CVV. Matches the
                                          dead-card ratio in real stolen
                                          dumps (~35%).
"""

import random

BIN_PREFIXES = [
    "411111", "424242", "400000",   # Visa-style test BINs
    "510000", "520000", "530000",   # Mastercard-style test BINs
]

DEAD_CARD_RATIO = 0.35


def luhn_checksum(number: str) -> bool:
    digits = [int(d) for d in number]
    odd = digits[-1::-2]
    even = digits[-2::-2]
    checksum = sum(odd)
    for d in even:
        checksum += sum(divmod(d * 2, 10))
    return checksum % 10 == 0


def generate_valid_number(bin_prefix: str, rng: random.Random | None = None) -> str:
    rng = rng or random
    while True:
        body = "".join(str(rng.randint(0, 9)) for _ in range(9))
        partial = bin_prefix + body
        for check_digit in range(10):
            candidate = partial + str(check_digit)
            if luhn_checksum(candidate):
                return candidate


def generate_card_pool(n_cards: int, dead_ratio: float = DEAD_CARD_RATIO,
                       seed: int | None = None) -> list[dict]:
    """Return a list of card-truth dicts for the issuer to check against."""
    rng = random.Random(seed)
    pool = []
    for _ in range(n_cards):
        bin_prefix = rng.choice(BIN_PREFIXES)
        pool.append({
            "pan": generate_valid_number(bin_prefix, rng),
            "expiry_month": rng.randint(1, 12),
            "expiry_year": rng.randint(2026, 2030),
            "cvv": f"{rng.randint(0, 999):03d}",
            "is_dead": rng.random() < dead_ratio,
        })
    return pool
