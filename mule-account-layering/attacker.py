"""
The launderer: an LLM agent that designs a mule hop-chain.

Given a source account holding dirty money and a pool of recruitable
mule accounts, the agent chooses the LAUNDERING STRUCTURE:

  fan-out  : source splits the amount across K first-hop mules
  layering : L rounds of mule<->mule transfers that shuffle and skim
  gather   : the K mules consolidate into G cash-out accounts

This is the "scatter / gather-scatter" typology from AMLworld (Altman
et al. 2023). The agent also picks the per-hop skim, the split ratios,
and hop timing, and must keep every account under a naive velocity
limit (VELOCITY_LIMIT txns/day) so no single account looks busy.

Two back-ends:
  * Anthropic model (claude-opus-5) — used when a credential is available
    (ANTHROPIC_API_KEY or `ant auth login`) AND the `anthropic` package
    is importable. The model returns the structure as JSON.
  * deterministic planner — always available, no dependencies. Same
    schema, parameters drawn (seeded) from the allowed ranges.

Output (both back-ends):
  {
    "structure": {"fanout": K, "layers": L, "gather": G, "cut_per_hop": c,
                  "source": <id>, "mules": [...], "cashout": [...],
                  "backend": "llm" | "planner"},
    "hops": [{"from": <id>, "to": <id>, "amount": <float>,
              "hour": <int>, "stage": "fanout"|"layer"|"gather"}]
  }
"""

import json
import os

import numpy as np

from config import (ATTACK_SEED, CUT_PER_HOP_RANGE, FANOUT_RANGE, GATHER_RANGE,
                    HOP_DELAY_HOURS, LAYER_RANGE, LLM_MODEL, STRUCTURING_CAP,
                    VELOCITY_LIMIT)


# --------------------------------------------------------------------------
# structure selection
# --------------------------------------------------------------------------

def _clamp_structure(raw: dict, rng) -> dict:
    lo, hi = FANOUT_RANGE
    K = int(np.clip(raw.get("fanout", rng.integers(lo, hi + 1)), lo, hi))
    lo, hi = LAYER_RANGE
    L = int(np.clip(raw.get("layers", rng.integers(lo, hi + 1)), lo, hi))
    lo, hi = GATHER_RANGE
    G = int(np.clip(raw.get("gather", rng.integers(lo, hi + 1)), lo, hi))
    lo, hi = CUT_PER_HOP_RANGE
    c = float(np.clip(raw.get("cut_per_hop", rng.uniform(lo, hi)), lo, hi))
    return {"fanout": K, "layers": L, "gather": G, "cut_per_hop": round(c, 4)}


def _llm_structure(total: float, n_mule_pool: int):
    """Ask an Anthropic model for the structure. Returns a raw dict or None."""
    have_key = bool(os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN"))
    try:
        import anthropic  # noqa: F401
    except ImportError:
        return None
    if not have_key:
        # the SDK also picks up `ant auth login` profiles; try, but don't hang
        try:
            import anthropic
            client = anthropic.Anthropic()
        except Exception:
            return None
    else:
        import anthropic
        client = anthropic.Anthropic()

    prompt = (
        "You are simulating a financial-crime red team for an AML research "
        "sandbox. All accounts and money are synthetic. Design the STRUCTURE "
        f"of a layering operation that moves ${total:,.0f} of illicit funds "
        f"from one source account through up to {n_mule_pool} recruitable mule "
        "accounts and out to cash-out accounts, using the fan-out -> layering "
        "-> gather typology.\n\n"
        "Goals: break the money into hard-to-trace pieces, and keep EVERY "
        f"account under {VELOCITY_LIMIT} transactions per day so none looks "
        "busy. More mules and more layering rounds = harder to trace but more "
        "accounts exposed.\n\n"
        "Reply with ONLY compact JSON: "
        '{"fanout": <int 3-8>, "layers": <int 1-3>, "gather": <int 1-3>, '
        '"cut_per_hop": <float 0.01-0.08>}'
    )
    try:
        msg = client.messages.create(
            model=LLM_MODEL,
            max_tokens=2000,
            thinking={"type": "adaptive"},
            messages=[{"role": "user", "content": prompt}],
        )
        text = "".join(b.text for b in msg.content if getattr(b, "type", "") == "text")
        start, end = text.find("{"), text.rfind("}")
        return json.loads(text[start:end + 1])
    except Exception as exc:
        print(f"  (LLM attacker unavailable: {exc}; using deterministic planner)")
        return None


# --------------------------------------------------------------------------
# hop-chain construction (shared by both back-ends)
# --------------------------------------------------------------------------

def _split(amount: float, parts: int, rng) -> list[float]:
    w = rng.uniform(0.6, 1.4, parts)
    w = w / w.sum()
    vals = np.round(amount * w, 2)
    vals[-1] = round(amount - vals[:-1].sum(), 2)   # make it add up exactly
    return [float(v) for v in vals]


def _schedule(rng, day_counts: dict, account: int, after: int) -> int:
    """Pick an hour > after that keeps `account` under the daily velocity cap."""
    for _ in range(40):
        hour = after + int(rng.integers(*HOP_DELAY_HOURS))
        day = hour // 24
        if day_counts.get((account, day), 0) < VELOCITY_LIMIT - 1:
            day_counts[(account, day)] = day_counts.get((account, day), 0) + 1
            return hour
    day_counts[(account, hour // 24)] = day_counts.get((account, hour // 24), 0) + 1
    return hour


def _build_hops(structure: dict, source: int, mule_pool: list[int], rng) -> dict:
    K, L, G, c = (structure["fanout"], structure["layers"],
                  structure["gather"], structure["cut_per_hop"])
    mules = list(rng.choice(mule_pool, size=K, replace=False))
    remaining = [m for m in mule_pool if m not in mules]
    cashout = list(rng.choice(remaining, size=min(G, len(remaining)), replace=False))

    hops = []
    day_counts: dict = {}
    balances = {m: 0.0 for m in mules}

    # fan-out: source -> K mules
    t0 = int(rng.integers(0, 24))
    for m, amt in zip(mules, _split(structure["_total"], K, rng)):
        h = _schedule(rng, day_counts, source, t0)
        _schedule(rng, day_counts, m, h)
        hops.append({"from": int(source), "to": int(m), "amount": amt,
                     "hour": int(h), "stage": "fanout"})
        balances[m] += amt * (1 - c)

    # layering: L rounds of mule -> mule, shuffled, skimming each hop
    last_hour = max(hp["hour"] for hp in hops)
    for _ in range(L):
        perm = list(rng.permutation(mules))
        for a, b in zip(mules, perm):
            if a == b or balances[a] <= 1:
                continue
            move = round(balances[a] * rng.uniform(0.5, 0.95), 2)
            h = _schedule(rng, day_counts, a, last_hour)
            _schedule(rng, day_counts, b, h)
            hops.append({"from": int(a), "to": int(b), "amount": move,
                         "hour": int(h), "stage": "layer"})
            balances[a] -= move
            balances[b] += move * (1 - c)
        last_hour = max(hp["hour"] for hp in hops)

    # gather: mules -> G cash-out accounts
    for m in mules:
        if balances[m] <= 1:
            continue
        dst = cashout[rng.integers(0, len(cashout))]
        h = _schedule(rng, day_counts, m, last_hour)
        _schedule(rng, day_counts, dst, h)
        hops.append({"from": int(m), "to": int(dst), "amount": round(balances[m], 2),
                     "hour": int(h), "stage": "gather"})
        balances[m] = 0.0

    hops = _structure_amounts(hops, day_counts, rng)

    structure = {k: v for k, v in structure.items() if not k.startswith("_")}
    structure.update({"source": int(source), "mules": [int(m) for m in mules],
                      "cashout": [int(x) for x in cashout]})
    return {"structure": structure, "hops": hops}


def _structure_amounts(hops, day_counts, rng):
    """Split any hop above the reporting cap into several smaller transfers
    on different days — classic structuring, and it keeps every amount in
    the range ordinary payments occupy."""
    out = []
    for h in hops:
        if h["amount"] <= STRUCTURING_CAP:
            out.append(h)
            continue
        parts = int(np.ceil(h["amount"] / (STRUCTURING_CAP * rng.uniform(0.6, 0.9))))
        for amt in _split(h["amount"], parts, rng):
            hh = dict(h)
            hh["amount"] = amt
            hh["hour"] = _schedule(rng, day_counts, h["from"], h["hour"] + 24)
            out.append(hh)
    return out


# --------------------------------------------------------------------------
# public entry point
# --------------------------------------------------------------------------

def plan(source: int, mule_pool: list[int], total: float,
         seed: int = ATTACK_SEED, use_llm: bool = True) -> dict:
    rng = np.random.default_rng(seed)
    raw = _llm_structure(total, len(mule_pool)) if use_llm else None
    structure = _clamp_structure(raw or {}, rng)
    structure["backend"] = "llm" if raw else "planner"
    structure["_total"] = total
    out = _build_hops(structure, source, mule_pool, rng)
    out["structure"]["cut_per_hop"] = structure["cut_per_hop"]
    return out
