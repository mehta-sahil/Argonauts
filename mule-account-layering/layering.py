"""
Inject the attacker's hop-chains into the background graph.

Adds the laundering transactions as edges (kind="launder") and returns
the node label vector: 1 for every account that took part in a
hop-chain (source, mules, cash-out), 0 for everyone else. That is what
the GCN is trained to recover.
"""

import numpy as np

from config import (ATTACK_SEED, LAUNDER_TOTAL, MULE_COVER_TXNS, MULE_POOL_SIZE,
                    N_PATTERNS, WINDOW_HOURS)
import attacker
from background_graph import normal_amount, recruitable_mules


def inject(accounts, txns, seed: int = ATTACK_SEED, use_llm: bool = True):
    rng = np.random.default_rng(seed)
    n = len(accounts)
    labels = np.zeros(n, dtype=int)          # 1 = any account in a hop-chain
    layer_mule = np.zeros(n, dtype=bool)     # the bland pass-through mules (cover traffic, no big
                                             # inflow/drain) — the accounts a tabular model misses
    pool = recruitable_mules(accounts, txns, MULE_POOL_SIZE * N_PATTERNS, seed)

    patterns = []
    launder_txns = []
    for p in range(N_PATTERNS):
        my_pool = pool[p * MULE_POOL_SIZE:(p + 1) * MULE_POOL_SIZE]
        # source: an active business account (where a real front company sits)
        biz = [a["id"] for a in accounts if a["kind"] == "business"]
        source = int(rng.choice(biz))
        result = attacker.plan(source, my_pool, LAUNDER_TOTAL,
                               seed=seed + p, use_llm=use_llm)
        for h in result["hops"]:
            launder_txns.append({"src": h["from"], "dst": h["to"],
                                 "amount": h["amount"], "hour": h["hour"],
                                 "kind": "launder", "stage": h["stage"]})
        s = result["structure"]
        for acc in [s["source"], *s["mules"], *s["cashout"]]:
            labels[acc] = 1
        for acc in s["mules"]:
            if acc != s["source"] and acc not in s["cashout"]:
                layer_mule[acc] = True
        s["pattern_id"] = p
        patterns.append(s)

    cover = _cover_traffic(accounts, patterns, rng)
    return accounts, txns + cover + launder_txns, labels, layer_mule, patterns


def _cover_traffic(accounts, patterns, rng):
    """Ordinary transactions (payroll in, bills out, p2p) for the LAYER
    mules only — enough that their aggregate features land inside the
    normal customer cloud. The source and the cash-out accounts get none:
    a big dirty inflow / a consolidation drain is visible on its own, and
    a plain classifier will catch those. What it misses is the bland
    layer mules in between — those are 1 hop from a flagged node, so the
    graph model still finds them. That gap is the demo.
    """
    biz = [a["id"] for a in accounts if a["kind"] == "business"]
    personal = [a["id"] for a in accounts if a["kind"] == "personal"]
    out = []
    layer_mules = {m for p in patterns for m in p["mules"]}
    for acc in layer_mules:
        for _ in range(int(rng.integers(*MULE_COVER_TXNS))):
            if rng.random() < 0.5:                       # money in (salary etc.)
                src, dst = int(rng.choice(biz)), acc
            else:                                        # money out (bills / p2p)
                src, dst = acc, int(rng.choice(biz if rng.random() < 0.6 else personal))
            out.append({"src": src, "dst": dst, "amount": normal_amount(rng),
                        "hour": int(rng.integers(0, WINDOW_HOURS)), "kind": "normal"})
    return out
