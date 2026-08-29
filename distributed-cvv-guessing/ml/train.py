"""
Train and evaluate the Layer 2 classifier.

    python -m ml.train                 # reads events.parquet

Method (each choice is cited in plan.md / the README):
  * time-ordered split 60 / 20 / 20, no shuffling  -- Dal Pozzolo 2018
  * undersample benign in the TRAIN fold to ~1:10, then calibrate
    probabilities                                    -- Dal Pozzolo 2018
  * LightGBM gradient-boosted trees                  -- Ke 2017
  * IsolationForest anomaly score as an extra feature -- Carcillo 2021
  * headline metrics: AUC-PR and Precision@k for a fixed hourly alert
    budget; ROC-AUC is reported but not trusted      -- Davis & Goadrich
                                                        2006, Dal Pozzolo 2014
  * lift vs the Layer-1 threshold-only baseline on the same test slice

Artifacts written to ml/:
  model.txt          LightGBM booster (raw margin) -- used by the Lambda
  iforest.pkl        fitted IsolationForest
  calibrator.pkl     raw-score -> probability mapping
  feature_list.json  ordered feature names
  threshold.json     {"cutoff": p, "k_per_hour": k}
"""

import json
import pathlib

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, roc_auc_score

import lightgbm as lgb

from ml import features

HERE = pathlib.Path(__file__).parent
EVENTS = HERE.parent / "events.parquet"
K_PER_HOUR = 6                       # analyst alert budget (card-windows/hour)
UNDERSAMPLE_RATIO = 10              # benign : attack in the train fold


def time_split(df: pd.DataFrame):
    df = df.sort_values("ts").reset_index(drop=True)
    t0, t1 = df.ts.quantile(0.60), df.ts.quantile(0.80)
    return df[df.ts <= t0], df[(df.ts > t0) & (df.ts <= t1)], df[df.ts > t1]


def undersample(train: pd.DataFrame, seed: int = 0) -> pd.DataFrame:
    atk = train[train.label == "attack"]
    ben = train[train.label == "benign"]
    keep = min(len(ben), len(atk) * UNDERSAMPLE_RATIO) if len(atk) else len(ben)
    ben = ben.sample(n=keep, random_state=seed) if keep < len(ben) else ben
    return pd.concat([atk, ben]).sample(frac=1, random_state=seed).reset_index(drop=True)


def precision_recall_at_k(df: pd.DataFrame, score_col: str, k_per_hour: int):
    """Flag the top-k scoring card-windows per clock hour, then score."""
    df = df.copy()
    df["hour_bucket"] = (df.ts // 3600).astype(int)
    flagged = (
        df.sort_values(score_col, ascending=False)
        .groupby("hour_bucket")
        .head(k_per_hour)
    )
    # an analyst only works alerts, not a forced quota of low-score noise
    flagged = flagged[flagged[score_col] >= 0.5]
    tp = (flagged.label == "attack").sum()
    precision = tp / len(flagged) if len(flagged) else 0.0
    recall = tp / (df.label == "attack").sum() if (df.label == "attack").any() else 0.0
    return precision, recall, len(flagged)


def layer1_baseline(events: pd.DataFrame, test_window):
    """Threshold-5 rule replayed on the test slice: campaigns caught and
    guesses each campaign landed before its first PAN got blocked."""
    ev = events[(events.ts > test_window[0]) & (events.ts <= test_window[1])]
    atk = ev[ev.label == "attack"]
    caught, guesses_before = 0, []
    for cid, g in atk.groupby("campaign_id"):
        g = g.sort_values("ts")
        trip = g[g.cvv_failed_attempts >= 5]
        if len(trip):
            caught += 1
            first_trip_ts = trip.ts.iloc[0]
            guesses_before.append(int((g.ts <= first_trip_ts).sum()))
        else:
            guesses_before.append(int(len(g)))
    return {
        "campaigns": atk.campaign_id.nunique(),
        "caught": caught,
        "median_guesses_before_catch": float(np.median(guesses_before)) if guesses_before else 0.0,
    }


def main():
    events = pd.read_parquet(EVENTS)
    print(f"events: {len(events):,}")

    feats = features.compute_features_batch(events)
    print(f"feature rows: {len(feats):,}  attack: {(feats.label=='attack').mean():.2%}")

    train, val, test = time_split(feats)
    fcols = features.feature_columns(feats)

    # --- unsupervised anomaly score, fit on benign train rows only ---
    iforest = IsolationForest(n_estimators=200, contamination="auto", random_state=0)
    iforest.fit(train[train.label == "benign"][fcols].to_numpy())
    for part in (train, val, test):
        part["anomaly_score"] = -iforest.score_samples(part[fcols].to_numpy())
    fcols = fcols + ["anomaly_score"]

    tr = undersample(train)
    y_tr = (tr.label == "attack").astype(int)
    y_val = (val.label == "attack").astype(int)
    y_te = (test.label == "attack").astype(int)

    booster = lgb.train(
        params={"objective": "binary", "metric": "average_precision",
                "num_leaves": 47, "learning_rate": 0.05, "feature_fraction": 0.8,
                "bagging_fraction": 0.8, "bagging_freq": 1, "verbose": -1},
        train_set=lgb.Dataset(tr[fcols], label=y_tr),
        valid_sets=[lgb.Dataset(val[fcols], label=y_val)],
        num_boost_round=600,
        callbacks=[lgb.early_stopping(40, verbose=False)],
    )

    raw_val = booster.predict(val[fcols], num_iteration=booster.best_iteration)
    raw_te = booster.predict(test[fcols], num_iteration=booster.best_iteration)

    # calibrate raw margin -> probability with a sigmoid fit on the val fold
    calib = LogisticRegression(max_iter=1000)
    calib.fit(raw_val.reshape(-1, 1), y_val)
    p_val = calib.predict_proba(raw_val.reshape(-1, 1))[:, 1]
    p_te = calib.predict_proba(raw_te.reshape(-1, 1))[:, 1]

    test = test.assign(score=p_te)
    val = val.assign(score=p_val)

    # choose cutoff on validation: highest cutoff that still keeps recall >= 0.80
    order = np.argsort(-p_val)
    rec_curve = np.cumsum(y_val.to_numpy()[order]) / max(y_val.sum(), 1)
    idx = np.searchsorted(rec_curve, 0.80)
    cutoff = float(np.sort(p_val)[::-1][min(idx, len(p_val) - 1)])

    ap = average_precision_score(y_te, p_te)
    roc = roc_auc_score(y_te, p_te)
    prec_k, rec_k, n_flagged = precision_recall_at_k(test, "score", K_PER_HOUR)
    at_cutoff = test[test.score >= cutoff]
    fp_rate_benign = (at_cutoff.label == "benign").sum() / max((test.label == "benign").sum(), 1)

    base = layer1_baseline(events, (test.ts.min(), test.ts.max()))
    model_campaigns_caught = test[test.label == "attack"].groupby("campaign_id").score.max()
    model_caught = int((model_campaigns_caught >= cutoff).sum())

    print("\n=== TEST METRICS ===")
    print(f"AUC-PR (average precision) : {ap:.3f}     <- headline")
    print(f"Precision@k / Recall@k     : {prec_k:.3f} / {rec_k:.3f}  "
          f"(k={K_PER_HOUR}/hr, {n_flagged} flagged)  <- headline")
    print(f"ROC-AUC (reference only)   : {roc:.3f}")
    print(f"chosen cutoff              : {cutoff:.3f}")
    print(f"benign false-positive rate : {fp_rate_benign:.4f}")
    print("\n=== LIFT vs LAYER 1 (threshold-5 only) on the test slice ===")
    print(f"attack campaigns in slice  : {base['campaigns']}")
    print(f"Layer 1 caught             : {base['caught']}  "
          f"(median {base['median_guesses_before_catch']:.0f} guesses before catch)")
    print(f"Layer 2 (this model) caught: {model_caught}")

    _save(booster, iforest, calib, fcols, cutoff)
    _importances(booster, fcols)


def _save(booster, iforest, calib, fcols, cutoff):
    booster.save_model(str(HERE / "model.txt"))
    joblib.dump(iforest, HERE / "iforest.pkl")
    joblib.dump(calib, HERE / "calibrator.pkl")
    (HERE / "feature_list.json").write_text(json.dumps(fcols, indent=2))
    (HERE / "threshold.json").write_text(
        json.dumps({"cutoff": cutoff, "k_per_hour": K_PER_HOUR}, indent=2))
    print(f"\nsaved artifacts to {HERE}/")


def _importances(booster, fcols):
    imp = sorted(zip(fcols, booster.feature_importance(importance_type="gain")),
                 key=lambda x: -x[1])[:12]
    print("\ntop features by gain:")
    for name, val in imp:
        print(f"  {name:32s} {val:,.0f}")


if __name__ == "__main__":
    main()
