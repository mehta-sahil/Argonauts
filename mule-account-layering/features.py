"""
Per-account features for the GCN.

These are deliberately GENERIC account-activity aggregates — the kind of
columns any transaction table gives you for free. We do NOT hand-build a
"mule score" feature (pass-through ratio, structuring ratio, etc.); the
point of the GCN is to learn that from graph structure instead. On these
plain features alone a mule with cover traffic looks a lot like an
ordinary active customer — it's the neighbourhood (a tight cluster of
freshly-active accounts moving money among themselves and out through a
shared drain) that gives the operation away.
"""

import numpy as np

FEATURE_NAMES = [
    "in_degree", "out_degree", "in_count", "out_count",
    "total_in", "total_out", "mean_in", "mean_out", "std_out",
    "max_daily_count",
    "burstiness",              # std(gaps)/mean(gaps) of this account's txns
    "account_age_days", "is_business",
]


def build_features(accounts, txns):
    n = len(accounts)
    f = {k: np.zeros(n) for k in
         ["in_count", "out_count", "total_in", "total_out"]}
    in_partners = [set() for _ in range(n)]
    out_partners = [set() for _ in range(n)]
    out_amounts = [[] for _ in range(n)]
    times = [[] for _ in range(n)]
    day_count: dict = {}

    for t in txns:
        s, d, a, h = t["src"], t["dst"], t["amount"], t["hour"]
        f["out_count"][s] += 1
        f["in_count"][d] += 1
        f["total_out"][s] += a
        f["total_in"][d] += a
        out_partners[s].add(d)
        in_partners[d].add(s)
        out_amounts[s].append(a)
        times[s].append(h)
        times[d].append(h)
        for acc in (s, d):
            day_count[(acc, h // 24)] = day_count.get((acc, h // 24), 0) + 1

    X = np.zeros((n, len(FEATURE_NAMES)))
    for i in range(n):
        tin, tout = f["total_in"][i], f["total_out"][i]
        cin, cout = f["in_count"][i], f["out_count"][i]
        oa = np.array(out_amounts[i]) if out_amounts[i] else np.array([0.0])
        ts = np.sort(np.array(times[i])) if times[i] else np.array([0.0])
        gaps = np.diff(ts) if len(ts) > 1 else np.array([0.0])
        my_days = [v for (acc, _), v in day_count.items() if acc == i]

        X[i] = [
            len(in_partners[i]),
            len(out_partners[i]),
            cin,
            cout,
            tin,
            tout,
            tin / cin if cin else 0.0,
            tout / cout if cout else 0.0,
            float(oa.std()),
            max(my_days) if my_days else 0.0,
            float(gaps.std() / gaps.mean()) if gaps.mean() > 0 else 0.0,
            accounts[i]["age_days"],
            1.0 if accounts[i]["kind"] == "business" else 0.0,
        ]

    return X


def standardize(X, train_mask):
    mu = X[train_mask].mean(axis=0)
    sd = X[train_mask].std(axis=0)
    sd[sd == 0] = 1.0
    return (X - mu) / sd
