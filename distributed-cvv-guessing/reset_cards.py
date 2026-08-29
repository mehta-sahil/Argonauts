"""
Resets MockIssuerDB to a clean pre-demo state.

For every card: cvvFailedAttempts -> 0, status -> ACTIVE.
Does not change PANs, expiry, or CVV, so attacker_card_list.csv stays valid.

Run this between demo runs. Faster and less error-prone than the
inline AWS CLI one-liner.

    python reset_cards.py
"""

import boto3

TABLE_NAME = "MockIssuerDB"
REGION = "us-east-1"


def main():
    table = boto3.resource("dynamodb", region_name=REGION).Table(TABLE_NAME)

    scanned = table.scan(ProjectionExpression="pan")
    pans = [item["pan"] for item in scanned["Items"]]
    while "LastEvaluatedKey" in scanned:
        scanned = table.scan(
            ProjectionExpression="pan",
            ExclusiveStartKey=scanned["LastEvaluatedKey"],
        )
        pans.extend(item["pan"] for item in scanned["Items"])

    for pan in pans:
        table.update_item(
            Key={"pan": pan},
            UpdateExpression=(
                "SET cvvFailedAttempts = :z, #s = :a "
                "REMOVE risk_score, risk_updated_at, risk_block_candidate, block_reason"),
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={":z": 0, ":a": "ACTIVE"},
        )

    print(f"Reset {len(pans)} cards in {TABLE_NAME}: cvvFailedAttempts=0, status=ACTIVE, "
          "Layer-2 risk fields cleared.")


if __name__ == "__main__":
    main()
