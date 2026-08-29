"""
Seeds MockIssuerDB with synthetic card data.

For each card, writes:
  pan                 - partition key, Luhn-valid synthetic card number
  expiry_month/year   - expiry date
  cvv                 - the correct CVV (only the backend/table knows this)
  cvvFailedAttempts   - starts at 0, incremented by the authorize Lambda
                        on every wrong-CVV guess
  status              - starts ACTIVE, flipped to BLOCKED by the
                        mitigation Lambda once cvvFailedAttempts hits
                        the threshold

Run once before any attacker traffic. Safe to re-run — it will just
overwrite existing items with fresh random data.
"""

import random

import boto3

# Luhn helpers live in sim/cards.py so the AWS seeder and the local
# simulation generate PANs identically.
from sim.cards import BIN_PREFIXES, generate_valid_number, luhn_checksum  # noqa: F401

TABLE_NAME = "MockIssuerDB"
REGION = "us-east-1"
N_CARDS = 30  # small, deliberate — this is a focused demo, not a load test


def main():
    dynamodb = boto3.resource("dynamodb", region_name=REGION)
    table = dynamodb.Table(TABLE_NAME)

    pans = []
    for _ in range(N_CARDS):
        bin_prefix = random.choice(BIN_PREFIXES)
        pan = generate_valid_number(bin_prefix)
        expiry_month = random.randint(1, 12)
        expiry_year = random.randint(2025, 2029)
        cvv = f"{random.randint(0, 999):03d}"

        table.put_item(Item={
            "pan": pan,
            "expiry_month": expiry_month,
            "expiry_year": expiry_year,
            "cvv": cvv,
            "cvvFailedAttempts": 0,
            "status": "ACTIVE",
        })
        pans.append({"pan": pan, "expiry_month": expiry_month, "expiry_year": expiry_year})

    print(f"Seeded {N_CARDS} cards into {TABLE_NAME}.")
    print("\nAttacker's view (PAN + expiry, NO cvv — this is what the red team script uses):")
    for p in pans[:5]:
        print(f"  {p['pan']}  exp {p['expiry_month']:02d}/{p['expiry_year']}")
    print(f"  ... and {len(pans) - 5} more")

    # write the attacker's card list (no CVV) to a local file for the attacker script
    with open("attacker_card_list.csv", "w") as f:
        f.write("pan,expiry_month,expiry_year\n")
        for p in pans:
            f.write(f"{p['pan']},{p['expiry_month']},{p['expiry_year']}\n")
    print("\nWrote attacker_card_list.csv (pan + expiry only, no CVV) for the attacker script.")


if __name__ == "__main__":
    main()
