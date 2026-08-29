"""
Mitigation Lambda for the CVV enumeration case.

Triggered by DynamoDB Streams on MockIssuerDB (NEW_IMAGE view).

Logic:
  For each changed card, read cvvFailedAttempts and risk_score from the
  stream image. Block the card (status = BLOCKED) when EITHER:
    * cvvFailedAttempts >= BLOCK_THRESHOLD          (Layer 1, deterministic)
    * risk_score >= RISK_CUTOFF                     (Layer 2, the ML model
      in scoring_lambda.py, catches slow-and-low campaigns that never
      trip the counter)
  block_reason records which layer fired ("threshold" or "model").
  The authorize Lambda then declines every further attempt on that PAN.

Layer 1 is the "centralized PAN-level velocity" control: the counter is
incremented by the authorize Lambda on every CVV mismatch, across all
merchants, so the issuer sees the whole attack even though each
merchant only sees its own few failed guesses. Layer 2 adds behavioural
shape on top of raw count.

RISK_CUTOFF comes from ml/threshold.json (set it as the RISK_CUTOFF env
var on the deployed function; the default here matches a fresh train).

This file mirrors the code currently deployed as CardingMitigationLambda
(handler: lambda_function.lambda_handler).
"""

import os

import boto3

TABLE_NAME = "MockIssuerDB"
BLOCK_THRESHOLD = 5
RISK_CUTOFF = float(os.environ.get("RISK_CUTOFF", "0.86"))

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)


def lambda_handler(event, context):
    for record in event.get("Records", []):
        if record.get("eventName") not in ("MODIFY", "INSERT"):
            continue

        new_image = record.get("dynamodb", {}).get("NewImage", {})
        pan = new_image.get("pan", {}).get("S", "")
        failed_attempts = int(new_image.get("cvvFailedAttempts", {}).get("N", "0"))
        status = new_image.get("status", {}).get("S", "ACTIVE")
        risk_score = float(new_image.get("risk_score", {}).get("N", "0"))

        if not pan or status == "BLOCKED":
            continue

        reason = None
        if failed_attempts >= BLOCK_THRESHOLD:
            reason = "threshold"
        elif risk_score >= RISK_CUTOFF:
            reason = "model"
        if reason is None:
            continue

        table.update_item(
            Key={"pan": pan},
            UpdateExpression="SET #s = :b, block_reason = :r",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={":b": "BLOCKED", ":r": reason},
        )
        print(f"BLOCKED {pan[:6]}... reason={reason} "
              f"(mismatches={failed_attempts}, risk={risk_score:.3f})")

    return {"statusCode": 200}
