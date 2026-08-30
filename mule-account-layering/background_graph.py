"""
Synthetic background transaction graph.

Downscaled from IBM AMLworld (Altman et al., "Realistic Synthetic
Financial Transactions for Anti-Money Laundering Models", NeurIPS
Datasets & Benchmarks 2023): a directed multigraph of accounts and
payments, with a hub-heavy (preferential-attachment) degree
distribution and heavy-tailed amounts. No laundering yet — that is
injected by layering.py on top of this.

An account:  id, kind ("personal"/"business"), age_days
A txn:       {src, dst, amount, hour, kind}   kind is "normal" here
"""

import numpy as np

from config import (BUSINESS_FRACTION, GRAPH_SEED, N_ACCOUNTS, N_NORMAL_TXNS,
                    NORMAL_AMOUNT_SMALL, NORMAL_AMOUNT_LARGE, NORMAL_LARGE_FRACTION,
                    PREF_ATTACH_BIAS, WINDOW_HOURS)


def normal_amount(rng):
    mu, sd = (NORMAL_AMOUNT_LARGE if rng.random() < NORMAL_LARGE_FRACTION
              else NORMAL_AMOUNT_SMALL)
    return float(np.round(rng.lognormal(mu, sd), 2))


def build_background(seed: int = GRAPH_SEED):
    rng = np.random.default_rng(seed)

    kinds = np.where(rng.random(N_ACCOUNTS) < BUSINESS_FRACTION, "business", "personal")
    age_days = rng.integers(30, 3000, N_ACCOUNTS)
    accounts = [
        {"id": int(i), "kind": str(kinds[i]), "age_days": int(age_days[i])}
        for i in range(N_ACCOUNTS)
    ]

    # preferential attachment: partner-selection weight grows with activity.
    activity = np.ones(N_ACCOUNTS)
    # businesses start more active (they receive a lot)
    activity[kinds == "business"] += 6.0

    txns = []
    for _ in range(N_NORMAL_TXNS):
        p = activity**PREF_ATTACH_BIAS
        p = p / p.sum()
        src, dst = rng.choice(N_ACCOUNTS, size=2, replace=False, p=p)
        amount = normal_amount(rng)
        hour = int(rng.integers(0, WINDOW_HOURS))
        txns.append({"src": int(src), "dst": int(dst), "amount": amount,
                     "hour": hour, "kind": "normal"})
        activity[src] += 1.0
        activity[dst] += 1.5          # receiving pulls in more future flow

    return accounts, txns


def recruitable_mules(accounts, txns, k, seed):
    """k personal account ids from the LOWER-MIDDLE activity band.

    Not the busiest (a hub is watched), not stone-dead (a dormant account
    suddenly moving $60k is its own red flag) — ordinary-looking accounts
    with a little real history, so their node features overlap with
    genuine customers. What gives the operation away is the graph
    structure, not any one account in isolation.
    """
    deg = np.zeros(len(accounts))
    for t in txns:
        deg[t["src"]] += 1
        deg[t["dst"]] += 1
    rng = np.random.default_rng(seed)
    personal = np.array([a["id"] for a in accounts if a["kind"] == "personal"])
    pdeg = deg[personal]
    band = personal[(pdeg >= np.quantile(pdeg, 0.15)) & (pdeg <= np.quantile(pdeg, 0.78))]
    rng.shuffle(band)
    return [int(x) for x in band[:k]]
