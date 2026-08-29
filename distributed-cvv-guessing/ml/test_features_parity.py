"""
Parity guard: the offline batch path and the online per-PAN path must
produce identical feature vectors.

The Lambda (scoring_lambda.py) calls features.compute_feature_row once
per event with just that PAN's history. Training calls
features.compute_features_batch over everything. If they ever diverge,
the model scores one thing offline and another in production.

    pytest ml/test_features_parity.py
"""

import numpy as np
import pandas as pd

from ml import features


def _toy_events() -> pd.DataFrame:
    rng = np.random.default_rng(0)
    rows = []
    base = 1_760_000_000.0
    for i in range(60):
        pan = f"PAN{i % 4}"
        rows.append({
            "ts": base + i * 137.0 + rng.uniform(0, 30),
            "pan": pan,
            "merchant_id": f"merchant_{'abc'[i % 3]}",
            "amount": round(float(rng.uniform(1, 120)), 2),
            "auth_decision": "approved" if i % 5 else "declined",
            "cvv_result": "N" if i % 3 == 0 else ("M" if i % 7 == 0 else "P"),
            "label": "attack" if pan == "PAN1" else "benign",
            "campaign_id": "attack_00" if pan == "PAN1" else "",
        })
    return pd.DataFrame(rows).sort_values("ts").reset_index(drop=True)


def test_batch_matches_incremental():
    events = _toy_events()
    batch = features.compute_features_batch(events).sort_values(["pan", "ts"]).reset_index(drop=True)

    # incremental: resolve merchant rates the same way, score each event alone
    resolve = features._merchant_rate_resolver(events)
    fcols = features.feature_columns(batch)
    for _, brow in batch.iterrows():
        pan_events = events[events.pan == brow["pan"]]
        inc = features.compute_feature_row(pan_events, brow["ts"], resolve(brow["ts"]))
        for c in fcols:
            assert np.isclose(inc[c], brow[c], rtol=1e-9, atol=1e-9), (
                f"{c} mismatch for {brow['pan']} @ {brow['ts']}: "
                f"incremental={inc[c]} batch={brow[c]}"
            )
