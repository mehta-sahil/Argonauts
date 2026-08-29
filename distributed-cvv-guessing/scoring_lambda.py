"""
CardingScoringLambda — Layer 2 online scoring.

Trigger: DynamoDB Streams on MockIssuerDB (same source as the Layer-1
mitigation Lambda). Fires when the authorize Lambda bumps
cvvFailedAttempts on a PAN.

Per invocation, for each PAN whose mismatch counter changed:
  1. Query CardingEventLog for that PAN's last 7 days of auth events.
  2. Read per-merchant CVV-N rates from the CardingEventLog aggregate
     items (MERCHANT#<id> / AGG), maintained by the authorize Lambda.
  3. Recompute the Layer-2 feature row with the SAME code training uses
     (features.py, packaged into this zip).
  4. Score: LightGBM booster (model.txt) + IsolationForest anomaly
     feature (iforest.pkl) + sigmoid calibration (calibrator.pkl).
  5. Write risk_score / risk_updated_at / risk_block_candidate back onto
     the MockIssuerDB card item.

The block decision itself stays in mitigation_lambda.py, which now
blocks on cvvFailedAttempts >= 5 OR risk_score >= cutoff. This Lambda
never writes status, so there is no scoring<->blocking loop; it also
skips stream records where cvvFailedAttempts did not change (its own
risk_score writes do not re-trigger scoring work).

Layout in the deployment zip:
  scoring_lambda.py        (this file, handler scoring_lambda.lambda_handler)
  features.py              (copied from ml/features.py)
  model.txt, iforest.pkl, calibrator.pkl, feature_list.json, threshold.json
Needs a Lambda layer providing pandas, numpy, scikit-learn, lightgbm, joblib.
"""

import decimal
import json
import os
import pathlib
import time

import boto3
import joblib
import lightgbm as lgb
import pandas as pd
from boto3.dynamodb.conditions import Key

try:
    import features            # in the Lambda zip, features.py sits alongside
except ModuleNotFoundError:    # running from the repo
    from ml import features

REGION = os.environ.get("AWS_REGION", "us-east-1")
ISSUER_TABLE = os.environ.get("ISSUER_TABLE", "MockIssuerDB")
EVENT_TABLE = os.environ.get("EVENT_TABLE", "CardingEventLog")
SEVEN_DAYS = 604_800

_HERE = pathlib.Path(__file__).parent
if not (_HERE / "model.txt").exists() and (_HERE / "ml" / "model.txt").exists():
    _HERE = _HERE / "ml"          # running from the repo, not the Lambda zip
_ddb = boto3.resource("dynamodb", region_name=REGION)
_issuer = _ddb.Table(ISSUER_TABLE)
_events = _ddb.Table(EVENT_TABLE)

# cold-start: load model artifacts once
_BOOSTER = lgb.Booster(model_file=str(_HERE / "model.txt"))
_IFOREST = joblib.load(_HERE / "iforest.pkl")
_CALIB = joblib.load(_HERE / "calibrator.pkl")
_FEATURES = json.loads((_HERE / "feature_list.json").read_text())
# RISK_CUTOFF env overrides the trained value; keep it in sync with the
# mitigation Lambda (that one makes the actual block decision).
_CUTOFF = float(os.environ.get(
    "RISK_CUTOFF", json.loads((_HERE / "threshold.json").read_text())["cutoff"]))
_BASE_FEATURES = [f for f in _FEATURES if f != "anomaly_score"]


DEBOUNCE_SEC = 8   # min gap between risk writes on one PAN; also breaks the
                   # scoring -> risk write -> stream -> scoring self-trigger,
                   # since MockIssuerDB's stream is NEW_IMAGE only (no diff).


def _changed_pans(event) -> set[str]:
    pans = set()
    for rec in event.get("Records", []):
        if rec.get("eventName") not in ("INSERT", "MODIFY"):
            continue
        img = rec["dynamodb"].get("NewImage", {})
        pan = img.get("pan", {}).get("S")
        status = img.get("status", {}).get("S", "ACTIVE")
        new_c = int(img.get("cvvFailedAttempts", {}).get("N", "0"))
        if pan and status != "BLOCKED" and new_c > 0:
            pans.add(pan)
    return pans


def _load_pan_events(pan: str, now: float) -> pd.DataFrame:
    cutoff = f"{now - SEVEN_DAYS:015.3f}"
    resp = _events.query(
        KeyConditionExpression=Key("pk").eq(pan) & Key("sk").gt(cutoff))
    rows = []
    for it in resp.get("Items", []):
        rows.append({
            "ts": float(it["ts"]),
            "pan": pan,
            "merchant_id": it["merchant_id"],
            "amount": float(it["amount"]),
            "auth_decision": it["auth_decision"],
            "cvv_result": it["cvv_result"],
        })
    return pd.DataFrame(rows, columns=features.EVENT_COLUMNS)


def _merchant_n_rates(merchant_ids: set[str]) -> dict[str, float]:
    out = {}
    for mid in merchant_ids:
        it = _events.get_item(Key={"pk": f"MERCHANT#{mid}", "sk": "AGG"}).get("Item")
        if it:
            attempts = float(it.get("attempts", 0)) or 1.0
            out[mid] = float(it.get("n_count", 0)) / attempts
    return out


def _score_pan(pan: str, now: float) -> dict | None:
    ev = _load_pan_events(pan, now)
    if ev.empty:
        return None
    merchant_rates = _merchant_n_rates(set(ev["merchant_id"]))
    feat = features.compute_feature_row(ev, now, merchant_rates)
    x = pd.DataFrame([feat])[_BASE_FEATURES]
    anomaly = -_IFOREST.score_samples(x.to_numpy())[0]
    x_full = x.assign(anomaly_score=anomaly)[_FEATURES]
    raw = _BOOSTER.predict(x_full.to_numpy())[0]
    prob = float(_CALIB.predict_proba([[raw]])[0, 1])
    return {"risk_score": prob, "anomaly_score": float(anomaly)}


def lambda_handler(event, context):
    now = time.time()
    scored = 0
    for pan in _changed_pans(event):
        result = _score_pan(pan, now)
        if result is None:
            continue
        try:
            _issuer.update_item(
                Key={"pan": pan},
                UpdateExpression=(
                    "SET risk_score = :s, risk_updated_at = :t, "
                    "risk_block_candidate = :b"),
                ConditionExpression=(
                    "attribute_not_exists(risk_updated_at) OR risk_updated_at < :cut"),
                ExpressionAttributeValues={
                    ":s": decimal.Decimal(str(round(result["risk_score"], 4))),
                    ":t": decimal.Decimal(str(round(now, 3))),
                    ":b": result["risk_score"] >= _CUTOFF,
                    ":cut": decimal.Decimal(str(round(now - DEBOUNCE_SEC, 3))),
                },
            )
        except _ddb.meta.client.exceptions.ConditionalCheckFailedException:
            continue          # a very recent write already covers this PAN
        scored += 1
        print(f"scored {pan[:6]}... risk={result['risk_score']:.3f} "
              f"candidate={result['risk_score'] >= _CUTOFF}")
    return {"statusCode": 200, "scored": scored}
