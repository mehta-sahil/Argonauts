"""
Authorize Lambda for the CVV enumeration case.

Deployed as CardingAuthorizeLambda behind a public Lambda Function URL
(handler: lambda_function.lambda_handler, AuthType NONE).

Receives (HTTPS POST, JSON body): pan, expiry_month, expiry_year, cvv,
merchant_id, amount.

Logic:
  1. Look up the PAN in MockIssuerDB.
  2. Not found            -> declined, cvv_result P (unknown card).
  3. status == BLOCKED    -> declined, cvv_result P, regardless of CVV.
                            This is the hard-mitigation enforcement point.
  4. Expiry mismatch      -> declined, cvv_result P.
  5. Expiry + CVV match   -> approved, cvv_result M.
  6. Wrong CVV            -> approved (funds ok), cvv_result N, AND
                            atomically increment cvvFailedAttempts. That
                            increment feeds the mitigation Lambda via
                            DynamoDB Streams.

merchant_id is only a label for logging / detection. It does not change
authorization logic, matching the real carding pattern of one PAN being
tested across many merchants.
"""

import decimal
import os
import time
import json
import uuid

import boto3

TABLE_NAME = "MockIssuerDB"
EVENT_TABLE_NAME = os.environ.get("EVENT_TABLE", "CardingEventLog")
EVENT_TTL_DAYS = 14

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)
# Layer 2 feed. Additive: if the table is absent or the write fails, the
# authorization path is unaffected.
try:
    event_table = dynamodb.Table(EVENT_TABLE_NAME)
except Exception:  # pragma: no cover
    event_table = None


def log_event(pan, merchant_id, amount, body):
    """Append one auth event + bump the per-merchant CVV-N counters."""
    if event_table is None or not pan:
        return
    now = time.time()
    try:
        event_table.put_item(Item={
            "pk": pan,
            "sk": f"{now:015.3f}#{uuid.uuid4().hex[:8]}",
            "ts": decimal.Decimal(str(round(now, 3))),
            "merchant_id": str(merchant_id),
            "amount": decimal.Decimal(str(amount)),
            "auth_decision": body.get("auth_decision", "error"),
            "cvv_result": body.get("cvv_result", "P"),
            "expires_at": int(now + EVENT_TTL_DAYS * 86400),
        })
        is_n = 1 if body.get("cvv_result") == "N" else 0
        event_table.update_item(
            Key={"pk": f"MERCHANT#{merchant_id}", "sk": "AGG"},
            UpdateExpression="ADD attempts :one, n_count :n",
            ExpressionAttributeValues={":one": 1, ":n": is_n},
        )
    except Exception as exc:  # pragma: no cover
        print(f"log_event failed (non-fatal): {exc}")


def response(status_code, body_dict):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(body_dict),
    }


def lambda_handler(event, context):
    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return response(200, {})

    try:
        req = json.loads(event.get("body") or "{}")
    except (TypeError, ValueError):
        return response(400, {"auth_decision": "error", "reason": "invalid_json_body"})

    status_code, body = _decide(req)
    if status_code == 200 and body.get("auth_decision") != "error":
        log_event(str(req.get("pan", "")), req.get("merchant_id", "unknown_merchant"),
                  req.get("amount", 1.00), body)
    return response(status_code, body)


def _decide(body):
    """Pure authorization logic. Returns (status_code, body_dict)."""
    pan = str(body.get("pan", ""))
    expiry_month = body.get("expiry_month")
    expiry_year = body.get("expiry_year")
    cvv_tried = str(body.get("cvv", ""))
    merchant_id = body.get("merchant_id", "unknown_merchant")
    amount = body.get("amount", 1.00)

    if not pan or expiry_month is None or expiry_year is None or not cvv_tried:
        return 400, {"auth_decision": "error", "reason": "missing_fields"}

    item_resp = table.get_item(Key={"pan": pan})
    item = item_resp.get("Item")

    if item is None:
        return 200, {
            "auth_decision": "declined",
            "cvv_result": "P",
            "decline_reason": "unknown_card",
            "merchant_id": merchant_id,
            "pan_status": "UNKNOWN",
        }

    if item.get("status") == "BLOCKED":
        return 200, {
            "auth_decision": "declined",
            "cvv_result": "P",
            "decline_reason": "card_blocked",
            "merchant_id": merchant_id,
            "pan_status": "BLOCKED",
            "cvvFailedAttempts": int(item.get("cvvFailedAttempts", 0)),
            "block_reason": str(item.get("block_reason", "threshold")),
        }

    expiry_matches = (
        int(item["expiry_month"]) == int(expiry_month)
        and int(item["expiry_year"]) == int(expiry_year)
    )

    if not expiry_matches:
        return 200, {
            "auth_decision": "declined",
            "cvv_result": "P",
            "decline_reason": "expiry_mismatch",
            "merchant_id": merchant_id,
            "pan_status": str(item.get("status", "ACTIVE")),
        }

    cvv_matches = str(item["cvv"]) == cvv_tried

    if cvv_matches:
        return 200, {
            "auth_decision": "approved",
            "cvv_result": "M",
            "merchant_id": merchant_id,
            "pan_status": "ACTIVE",
            "amount": amount,
        }

    update_resp = table.update_item(
        Key={"pan": pan},
        UpdateExpression="ADD cvvFailedAttempts :inc",
        ExpressionAttributeValues={":inc": 1},
        ReturnValues="UPDATED_NEW",
    )
    new_count = int(update_resp["Attributes"]["cvvFailedAttempts"])

    out = {
        "auth_decision": "approved",
        "cvv_result": "N",
        "merchant_id": merchant_id,
        "pan_status": "ACTIVE",
        "cvvFailedAttempts": new_count,
        "amount": amount,
    }
    if item.get("risk_score") is not None:
        out["risk_score"] = float(item["risk_score"])
    return 200, out
