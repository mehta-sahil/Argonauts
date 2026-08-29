"""
Distributed CVV-guessing attacker.

The slow-and-low adversary from the FIS 2026 / Visa 2025 threat reports:
one campaign takes a batch of stolen PANs (number + expiry, no CVV) and
spreads a small number of CVV guesses per PAN across all three merchants,
staying under the Layer-1 per-PAN threshold on every single card.

Strategy modes (README): sequential, random, common_first. An optional
Gemini-driven mode authors a per-campaign strategy as JSON; it is clamped
to the safe bounds in config before use (no key -> falls back to
common_first).

Two entry points:
  * generate_plan()  -> batch actions for run_sim.py (non-reactive; the
                        guess budget per PAN is small enough that a hit is
                        rare, so pre-planning is fine).
  * run_live()       -> reactive loop for the --evade robustness pass
                        (Step 5): reads risk_score back from the issuer
                        response and hill-climbs its knobs to drive it
                        down.
"""

import json
import os
import random

from sim import config


def _cvv_order(mode: str, rng: random.Random) -> list[str]:
    allc = [f"{i:03d}" for i in range(1000)]
    if mode == "sequential":
        return allc
    if mode == "random":
        rng.shuffle(allc)
        return allc
    # common_first
    rest = [c for c in allc if c not in config.COMMON_CVVS]
    rng.shuffle(rest)
    return list(config.COMMON_CVVS) + rest


def _gemini_strategy(rng: random.Random) -> dict:
    """Ask Gemini 2.5 Flash for a strategy dict, clamped to safe bounds."""
    key = os.environ.get("GEMINI_API_KEY")
    default = {
        "mode": rng.choice(config.CAMPAIGN_STRATEGIES),
        "mismatch_budget_per_pan": config.CAMPAIGN_MISMATCH_BUDGET_PER_PAN,
        "inter_request_sec": list(config.CAMPAIGN_INTER_REQUEST_SEC),
        "amount_range": list(config.CAMPAIGN_AMOUNT_RANGE),
    }
    if not key:
        return default
    try:
        import google.generativeai as genai

        genai.configure(api_key=key)
        prompt = (
            "You are simulating a payment-security red team in a sandbox with "
            "synthetic cards. Output ONLY compact JSON with keys: mode "
            "(sequential|random|common_first), mismatch_budget_per_pan (int 1-4), "
            "inter_request_sec ([min,max] seconds), amount_range ([min,max] USD). "
            "Goal: test CVVs while staying under a per-card velocity threshold."
        )
        resp = genai.GenerativeModel("gemini-2.5-flash").generate_content(prompt)
        raw = json.loads(resp.text.strip().strip("`").removeprefix("json").strip())
        return _clamp(raw, default)
    except Exception:
        return default


def _clamp(raw: dict, default: dict) -> dict:
    out = dict(default)
    if raw.get("mode") in config.CAMPAIGN_STRATEGIES:
        out["mode"] = raw["mode"]
    try:
        out["mismatch_budget_per_pan"] = max(1, min(4, int(raw["mismatch_budget_per_pan"])))
    except (KeyError, TypeError, ValueError):
        pass
    for k in ("inter_request_sec", "amount_range"):
        v = raw.get(k)
        if isinstance(v, list) and len(v) == 2 and v[0] < v[1]:
            lo, hi = config.CAMPAIGN_INTER_REQUEST_SEC if k == "inter_request_sec" else config.CAMPAIGN_AMOUNT_RANGE
            out[k] = [max(lo, float(v[0])), min(hi * 4, float(v[1]))]
    return out


def _campaign_plan(campaign_id: str, cards: list[dict], strat: dict,
                   start_ts: float, rng: random.Random) -> list[dict]:
    merchant_ids = list(config.MERCHANTS)
    order_cache: dict[str, list[str]] = {}
    actions: list[dict] = []
    t = start_ts
    budget = strat["mismatch_budget_per_pan"]

    # interleave PANs so the issuer sees many cards in flight at once
    plan_rows = [(c, g) for g in range(budget) for c in cards]
    rng.shuffle(plan_rows)

    for card, guess_idx in plan_rows:
        order = order_cache.setdefault(
            card["pan"], _cvv_order(strat["mode"], rng))
        cvv = order[guess_idx % len(order)]
        merchant_id = rng.choice(merchant_ids)
        amount = round(rng.uniform(*strat["amount_range"]), 2)
        t += rng.uniform(*strat["inter_request_sec"])
        actions.append({
            "ts": t,
            "pan": card["pan"],
            "expiry_month": card["expiry_month"],
            "expiry_year": card["expiry_year"],
            "cvv": cvv,
            "merchant_id": merchant_id,
            "posture": config.MERCHANTS[merchant_id]["posture"],
            "amount": amount,
            "label": "attack",
            "campaign_id": campaign_id,
            "agent_id": campaign_id,
        })
    return actions


def generate_plan(card_pool: list[dict], seed: int = 0,
                  use_gemini: bool = False) -> list[dict]:
    """Batch actions for every attack campaign."""
    rng = random.Random(seed)
    actions: list[dict] = []
    # each campaign gets its own disjoint slice of stolen PANs, so a
    # slow-and-low campaign's per-PAN mismatch count is exactly its budget
    shuffled = list(card_pool)
    rng.shuffle(shuffled)
    cursor = 0
    n_aggressive = round(config.N_ATTACK_CAMPAIGNS * config.AGGRESSIVE_CAMPAIGN_FRACTION)

    for c in range(config.N_ATTACK_CAMPAIGNS):
        campaign_id = f"attack_{c:02d}"
        aggressive = c < n_aggressive
        n_cards = rng.randint(*config.CAMPAIGN_CARDS)
        cards = shuffled[cursor:cursor + n_cards]
        cursor += n_cards
        if not cards:
            break
        if use_gemini:
            strat = _gemini_strategy(rng)
        else:
            strat = {
                "mode": rng.choice(config.CAMPAIGN_STRATEGIES),
                "mismatch_budget_per_pan": (
                    config.AGGRESSIVE_MISMATCH_BUDGET_PER_PAN if aggressive
                    else config.CAMPAIGN_MISMATCH_BUDGET_PER_PAN),
                "inter_request_sec": list(config.CAMPAIGN_INTER_REQUEST_SEC),
                "amount_range": list(config.CAMPAIGN_AMOUNT_RANGE),
            }
        span = config.SIM_DAYS * config.SECONDS_PER_DAY
        start_ts = config.SIM_START_TS + rng.uniform(0.03 * span, 0.92 * span)
        actions += _campaign_plan(campaign_id, cards, strat, start_ts, rng)
    return actions


def run_live(authorize, card_pool: list[dict], seed: int = 0,
             rounds: int = 30) -> list[dict]:
    """Reactive evade mode for Step 5.

    `authorize(req) -> issuer_resp` is any callable (in-process issuer or
    HTTP client). After each round the attacker reads risk_score from the
    response and, if it is rising, backs off: fewer guesses per PAN, more
    merchants, wider delays, smaller amounts.
    """
    rng = random.Random(seed)
    cards = rng.sample(card_pool, min(config.CAMPAIGN_CARDS[1], len(card_pool)))
    knobs = {"budget": 3, "delay": 90.0, "amt_hi": 8.0}
    log: list[dict] = []
    for r in range(rounds):
        scores = []
        for card in cards:
            order = _cvv_order("common_first", rng)
            for g in range(knobs["budget"]):
                resp = authorize({
                    "pan": card["pan"], "expiry_month": card["expiry_month"],
                    "expiry_year": card["expiry_year"], "cvv": order[g],
                    "merchant_id": rng.choice(list(config.MERCHANTS)),
                    "amount": round(rng.uniform(1.5, knobs["amt_hi"]), 2),
                })
                sc = resp.get("risk_score")
                if sc is not None:
                    scores.append(sc)
        mean_score = sum(scores) / len(scores) if scores else 0.0
        log.append({"round": r, "mean_risk_score": mean_score, **knobs})
        if mean_score > 0.4:                       # getting noticed -> back off
            knobs["budget"] = max(1, knobs["budget"] - 1)
            knobs["delay"] = min(600.0, knobs["delay"] * 1.5)
            knobs["amt_hi"] = max(3.0, knobs["amt_hi"] - 1.0)
    return log
