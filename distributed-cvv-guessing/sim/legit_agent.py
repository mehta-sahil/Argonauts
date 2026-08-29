"""
Benign customer traffic generator.

A real customer:
  * uses one card they own, and knows the CVV,
  * buys from a small number of merchants (1-3 over a week),
  * pays realistic, varied amounts,
  * shops during waking hours, weighted to daytime/evening,
  * occasionally fat-fingers the CVV once, then gets it right.

Each customer is its own "campaign" (campaign_id = legit_<pan>) and every
event it produces is labeled "benign".
"""

import random

from sim import config


def _daytime_offset(rng: random.Random, day: int) -> float:
    """Seconds-from-sim-start for an event on `day`, weighted to 08:00-23:00."""
    hour = rng.choices(
        population=list(range(24)),
        weights=[1, 1, 1, 1, 1, 2, 4, 7, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 9, 7, 5, 3, 2],
        k=1,
    )[0]
    sec_in_hour = rng.uniform(0, 3600)
    return day * config.SECONDS_PER_DAY + hour * 3600 + sec_in_hour


def _amount(rng: random.Random) -> float:
    # log-ish spread: most purchases small, a few large
    base = rng.choice([rng.uniform(3, 25), rng.uniform(10, 60), rng.uniform(40, 220)])
    return round(base, 2)


def generate_plan(card_pool: list[dict], seed: int = 0) -> list[dict]:
    """Return a list of planned auth actions for all benign customers."""
    rng = random.Random(seed)
    # customers own distinct, live cards (a real customer's card is not dead)
    live = [c for c in card_pool if not c["is_dead"]]
    rng.shuffle(live)
    customers = live[: config.N_LEGIT_CUSTOMERS]

    merchant_ids = list(config.MERCHANTS)
    actions: list[dict] = []

    for card in customers:
        n_txn = rng.randint(*config.LEGIT_TXNS_PER_CUSTOMER)
        fanout = rng.randint(*config.LEGIT_MERCHANT_FANOUT)
        my_merchants = rng.sample(merchant_ids, min(fanout, len(merchant_ids)))
        makes_typo = rng.random() < config.LEGIT_TYPO_RATE
        typo_at = rng.randrange(n_txn) if makes_typo and n_txn else -1

        for i in range(n_txn):
            day = rng.randrange(config.SIM_DAYS)
            ts = config.SIM_START_TS + _daytime_offset(rng, day)
            merchant_id = rng.choice(my_merchants)
            amount = _amount(rng)
            if i == typo_at:
                # one wrong digit, then the corrected retry a few seconds later
                wrong = f"{(int(card['cvv']) + rng.randint(1, 9)) % 1000:03d}"
                actions.append(_action(card, wrong, merchant_id, amount, ts))
                actions.append(_action(card, card["cvv"], merchant_id, amount, ts + rng.uniform(4, 40)))
            else:
                actions.append(_action(card, card["cvv"], merchant_id, amount, ts))

    return actions


def _action(card: dict, cvv: str, merchant_id: str, amount: float, ts: float) -> dict:
    return {
        "ts": ts,
        "pan": card["pan"],
        "expiry_month": card["expiry_month"],
        "expiry_year": card["expiry_year"],
        "cvv": cvv,
        "merchant_id": merchant_id,
        "posture": config.MERCHANTS[merchant_id]["posture"],
        "amount": amount,
        "label": "benign",
        "campaign_id": f"legit_{card['pan']}",
        "agent_id": f"legit_{card['pan']}",
    }
