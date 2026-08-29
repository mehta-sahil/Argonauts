"""
Feature pipeline for Layer 2.

ONE code path, run in two places:
  * offline (ml/train.py) over the whole events.parquet, and
  * online (scoring_lambda.py) over one PAN's last 7 days pulled from
    DynamoDB.

So this module is import-clean: pandas + numpy + stdlib only, no boto3,
no sklearn. ml/test_features_parity.py asserts batch == incremental.

Feature families and their grounding:
  * transaction aggregation over 1h / 24h / 7d windows
    -- Whitrow et al. 2009 (Data Mining and Knowledge Discovery),
       Bahnsen et al. 2016 (Expert Systems with Applications)
  * periodic time-of-day encoding (sin/cos, night flag)
    -- Bahnsen et al. 2016
  * session burst features (gap-separated)
  * merchant historical CVV-N rate as a lax-merchant risk amplifier,
    resolved by the caller as of eval_ts (never hard-codes merchant id)
  * an unsupervised anomaly score is appended later by the model layer
    -- Carcillo et al. 2021 (Information Sciences)

All features use only fields the ISSUER sees on an auth request:
pan, merchant_id, amount, auth_decision, cvv_result, timestamp.
"""

from __future__ import annotations

import datetime as _dt

import numpy as np
import pandas as pd

WINDOWS = {"1h": 3_600, "24h": 86_400, "7d": 604_800}
SESSION_GAP_SEC = 1_800
SMALL_AMOUNT_CUTOFF = 5.0
NIGHT_HOURS = set(range(0, 6))

EVENT_COLUMNS = ["ts", "pan", "merchant_id", "amount", "auth_decision", "cvv_result"]


def _entropy(counts: np.ndarray) -> float:
    total = counts.sum()
    if total <= 0:
        return 0.0
    p = counts[counts > 0] / total
    return float(-(p * np.log2(p)).sum())


def _max_consecutive(mask: np.ndarray) -> int:
    best = cur = 0
    for v in mask:
        cur = cur + 1 if v else 0
        best = max(best, cur)
    return best


def compute_feature_row(pan_events: pd.DataFrame, eval_ts: float,
                        merchant_n_rate: dict[str, float] | None = None) -> dict:
    """Feature vector for one PAN evaluated at eval_ts.

    pan_events: all events for this PAN (any order). Only rows with
        ts <= eval_ts are used.
    merchant_n_rate: merchant_id -> historical fraction of that merchant's
        auth attempts that came back cvv_result == 'N', as of eval_ts.
        Caller supplies it (batch precomputes, Lambda reads counters).
        Missing merchant -> treated as 0.
    """
    merchant_n_rate = merchant_n_rate or {}
    e = pan_events[pan_events["ts"] <= eval_ts].sort_values("ts")
    feat: dict[str, float] = {}

    ts = e["ts"].to_numpy(dtype=float)
    amt = e["amount"].to_numpy(dtype=float)
    is_n = (e["cvv_result"].to_numpy() == "N")
    is_declined = (e["auth_decision"].to_numpy() == "declined")
    is_approved = (e["auth_decision"].to_numpy() == "approved")
    merch = e["merchant_id"].to_numpy()

    for wname, wsec in WINDOWS.items():
        m = ts > (eval_ts - wsec)
        n = int(m.sum())
        feat[f"{wname}_attempts"] = n
        wn = int(is_n[m].sum())
        feat[f"{wname}_mismatch_count"] = wn
        feat[f"{wname}_mismatch_rate"] = wn / n if n else 0.0
        wm = merch[m]
        feat[f"{wname}_distinct_merchants"] = int(len(set(wm))) if n else 0
        if n:
            _, mc = np.unique(wm, return_counts=True)
            feat[f"{wname}_merchant_entropy"] = _entropy(mc)
        else:
            feat[f"{wname}_merchant_entropy"] = 0.0
        wa = amt[m]
        feat[f"{wname}_distinct_amounts"] = int(len(np.unique(np.round(wa, 2)))) if n else 0
        feat[f"{wname}_amount_mean"] = float(wa.mean()) if n else 0.0
        feat[f"{wname}_amount_std"] = float(wa.std()) if n else 0.0
        feat[f"{wname}_small_amount_fraction"] = float((wa < SMALL_AMOUNT_CUTOFF).mean()) if n else 0.0
        feat[f"{wname}_decline_rate"] = float(is_declined[m].mean()) if n else 0.0
        feat[f"{wname}_approved_with_N_fraction"] = float((is_approved[m] & is_n[m]).mean()) if n else 0.0

    # --- velocity / timing (24h window) ---
    m24 = ts > (eval_ts - WINDOWS["24h"])
    ts24 = ts[m24]
    if len(ts24) >= 2:
        diffs = np.diff(ts24)
        feat["inter_attempt_mean"] = float(diffs.mean())
        feat["inter_attempt_std"] = float(diffs.std())
    else:
        feat["inter_attempt_mean"] = 0.0
        feat["inter_attempt_std"] = 0.0
    m1h = ts > (eval_ts - WINDOWS["1h"])
    ts1h = ts[m1h]
    if len(ts1h):
        buckets = np.floor((ts1h - ts1h.min()) / 60.0)
        _, bc = np.unique(buckets, return_counts=True)
        feat["attempts_per_minute_peak"] = int(bc.max())
    else:
        feat["attempts_per_minute_peak"] = 0
    feat["time_since_first_attempt"] = float(eval_ts - ts.min()) if len(ts) else 0.0

    # --- periodic (Bahnsen 2016) ---
    hour = _dt.datetime.fromtimestamp(eval_ts, _dt.timezone.utc).hour
    feat["hour_sin"] = float(np.sin(2 * np.pi * hour / 24))
    feat["hour_cos"] = float(np.cos(2 * np.pi * hour / 24))
    feat["is_night"] = 1.0 if hour in NIGHT_HOURS else 0.0

    # --- merchant risk amplifier (lax-merchant signal) ---
    touched = set(merch[m24]) if m24.any() else set()
    feat["merchant_hist_N_rate_max"] = max((merchant_n_rate.get(x, 0.0) for x in touched), default=0.0)
    feat["merchant_hist_N_rate_mean"] = (
        float(np.mean([merchant_n_rate.get(x, 0.0) for x in touched])) if touched else 0.0
    )

    # --- current session (last gap-separated burst up to eval_ts) ---
    if len(ts):
        session_start_idx = 0
        for i in range(1, len(ts)):
            if ts[i] - ts[i - 1] > SESSION_GAP_SEC:
                session_start_idx = i
        s = slice(session_start_idx, len(ts))
        s_amt, s_n, s_merch = amt[s], is_n[s], merch[s]
        feat["session_attempts"] = int(len(s_amt))
        feat["session_max_mismatch_streak"] = _max_consecutive(s_n)
        feat["session_merchant_switch_rate"] = (
            float(np.sum(s_merch[1:] != s_merch[:-1]) / max(len(s_merch) - 1, 1))
        )
        _, sac = np.unique(np.round(s_amt, 2), return_counts=True)
        feat["session_amount_entropy"] = _entropy(sac)
        third = max(len(s_amt) // 3, 1)
        early, late = s_amt[:third].mean(), s_amt[-third:].mean()
        feat["session_probe_then_escalate"] = 1.0 if early < 0.5 * late else 0.0
    else:
        for k in ("session_attempts", "session_max_mismatch_streak",
                  "session_merchant_switch_rate", "session_amount_entropy",
                  "session_probe_then_escalate"):
            feat[k] = 0.0

    return feat


# --- batch driver (offline only) ---

def _merchant_rate_resolver(events: pd.DataFrame):
    """Precompute per-merchant cumulative N-rate lookups over all events."""
    ev = events.sort_values("ts")
    per = {}
    for mid, g in ev.groupby("merchant_id"):
        t = g["ts"].to_numpy(dtype=float)
        cum_attempts = np.arange(1, len(t) + 1)
        cum_n = np.cumsum((g["cvv_result"].to_numpy() == "N").astype(int))
        per[mid] = (t, cum_attempts, cum_n)

    def resolve(eval_ts: float) -> dict[str, float]:
        out = {}
        for mid, (t, ca, cn) in per.items():
            j = int(np.searchsorted(t, eval_ts, side="right"))
            out[mid] = (cn[j - 1] / ca[j - 1]) if j > 0 else 0.0
        return out

    return resolve


def compute_features_batch(events: pd.DataFrame,
                           eval_points: pd.DataFrame | None = None,
                           label_window_sec: int = WINDOWS["1h"]) -> pd.DataFrame:
    """One feature row per (pan, eval_ts).

    eval_points: DataFrame with columns pan, ts. Default: every event.
    A row is labeled "attack" if any of that PAN's events in the trailing
    label_window are attack-labeled, else "benign".
    """
    events = events.sort_values("ts").reset_index(drop=True)
    resolve = _merchant_rate_resolver(events)
    by_pan = {p: g for p, g in events.groupby("pan")}

    if eval_points is None:
        eval_points = events[["pan", "ts"]].copy()

    rows = []
    for pan, ep in eval_points.groupby("pan"):
        g = by_pan.get(pan)
        if g is None:
            continue
        g_ts = g["ts"].to_numpy(dtype=float)
        g_atk = (g["label"].to_numpy() == "attack") if "label" in g else np.zeros(len(g), bool)
        for eval_ts in ep["ts"].to_numpy(dtype=float):
            feat = compute_feature_row(g, eval_ts, resolve(eval_ts))
            feat["pan"] = pan
            feat["ts"] = eval_ts
            win = (g_ts <= eval_ts) & (g_ts > eval_ts - label_window_sec)
            feat["label"] = "attack" if g_atk[win].any() else "benign"
            if "campaign_id" in g.columns:
                cids = g.loc[win & g_atk, "campaign_id"] if "campaign_id" in g else []
                feat["campaign_id"] = cids.iloc[0] if len(cids) else ""
            rows.append(feat)

    df = pd.DataFrame(rows)
    front = ["pan", "ts", "label"] + (["campaign_id"] if "campaign_id" in df.columns else [])
    return df[front + [c for c in df.columns if c not in front]]


def feature_columns(df: pd.DataFrame) -> list[str]:
    drop = {"pan", "ts", "label", "campaign_id", "anomaly_score"}
    return [c for c in df.columns if c not in drop]
