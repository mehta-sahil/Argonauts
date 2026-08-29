# AI Defense Lab for Payment Security

Mastercard Innovation Challenge 2026, Global Fintech Fest

A closed-loop red-team / blue-team simulation of distributed CVV
enumeration attacks against payment infrastructure. The attacker
exploits structural gaps in the payment ecosystem to brute-force
unknown CVVs across multiple merchants. The defender detects and blocks
the attack using centralized PAN-level velocity monitoring.

Everything runs against synthetic data inside a sandboxed AWS
environment. No real cards, banks, merchants, or payment networks are
contacted at any point.

---

## What this project demonstrates

The payment authorization chain has five entities: attacker, merchant,
payment processor, card network, and issuing bank. The issuing bank is
the only entity that validates the CVV, but it returns a two-part
response to the merchant: an authorization decision (approved/declined)
AND a separate CVV result code (M = match, N = no match, P = not
processed). These are independent signals.

The vulnerability: some merchants ignore the CVV result code. The bank
approves the funds (card is valid, has balance) and flags CVV as N
(mismatch), but a lax merchant lets the transaction through anyway.
The attacker discovers which merchants are lax by observing response
patterns, then concentrates CVV guesses there.

The defense: aggregate all CVV mismatch events by PAN (card number)
across all merchants in real time. When the count crosses a threshold,
block the card entirely. This is the architecture Mastercard uses in
production (confirmed by Newcastle University, IEEE S&P 2017).

---

## Research grounding

This project is grounded in published research and industry data, not
assumptions.

Ali et al., "Does The Online Card Payment Landscape Unwittingly
Facilitate Fraud?" (IEEE Security & Privacy, 2017). Demonstrated that
a distributed guessing attack can identify a Visa card's CVV in as
few as 6 seconds by spreading guesses across multiple merchant
websites. Mastercard's centralized network caught the attack; Visa's
did not. Studied 389 of the Alexa top-400 merchant payment sites.

Lunghi et al., "FRAUD-RLA: Reinforcement Learning Adversarial Attack
Against Credit Card Fraud Detection" (arXiv 2502.02290, Feb 2025).
Demonstrated that an RL agent can learn to craft fraudulent
transactions that bypass ML-based fraud classifiers with over 90%
success rate, even with severely limited knowledge of the target
system.

Visa reports enumeration attacks cause $1.1 billion in annual fraud
losses (Visa 2025 Biannual Threats Report).

HUMAN Security measured carding volume up 250% since 2022, and
documented an actual AI agent (Perplexity Comet browser instance)
performing carding behavior in the wild.

FIS 2026 analysis confirms modern enumeration attacks are distributed
across thousands of merchants, IPs and devices, with the financial
loss materializing days or months after the testing phase.

---

## Architecture

```
Attacker Script (local Python or web UI)
    |
    | HTTPS POST (pan, expiry, cvv, merchant_id, amount)
    v
Lambda Function URL (public endpoint, AuthType NONE, CORS enabled)
    |
    v
CardingAuthorizeLambda (us-east-1)
    |
    | GetItem / UpdateItem
    v
DynamoDB: MockIssuerDB
    |  - pan (partition key)
    |  - expiry_month, expiry_year, cvv (hidden truth)
    |  - cvvFailedAttempts (atomic counter)
    |  - status (ACTIVE / BLOCKED)
    |
    | DynamoDB Streams (NEW_IMAGE)
    v
CardingMitigationLambda
    |  Reads cvvFailedAttempts from stream record
    |  If >= 5: sets status = BLOCKED
    v
MockIssuerDB.status = "BLOCKED"
    |
    v
Next authorize attempt on this PAN -> instant decline
regardless of CVV correctness
```

The web prototype adds a merchant logic layer in the browser that
interprets the issuer's two-part response according to each
merchant's security posture (strict / moderate / lax).

---

## AWS resources (all in us-east-1, account <ACCOUNT_ID>)

DynamoDB table: MockIssuerDB (PAY_PER_REQUEST, streams enabled)
DynamoDB table: CardingEventLog (PAY_PER_REQUEST, TTL on expires_at,
  Layer-2 feed — per-auth events keyed by pan, plus MERCHANT#<id>
  aggregate counters)
Lambda: CardingAuthorizeLambda (Python 3.12, public Function URL,
  EVENT_TABLE=CardingEventLog)
Lambda: CardingMitigationLambda (Python 3.12, DynamoDB Streams trigger,
  RISK_CUTOFF=0.86)
Lambda: CardingScoringLambda (Python 3.12, MockIssuerDB Streams trigger,
  Layer 2; needs a pandas/numpy/scikit-learn/lightgbm layer)
IAM role: CardingAuthorizeLambdaRole (DynamoDB read/write + CloudWatch)
IAM role: CardingMitigationLambdaRole (DynamoDB streams + write + CloudWatch)
IAM role: CardingScoringLambdaRole (scoring-lambda-policy.json + CloudWatch)
S3: carding-sim-us-east-1-<ACCOUNT_ID> (Lambda deployment zips)
S3: carding-sim-<ACCOUNT_ID> (ap-south-1, earlier iteration artifacts)

Lambda Function URL:
https://YOUR-FUNCTION-URL.lambda-url.us-east-1.on.aws/

The Function URL is AuthType NONE and unauthenticated — anyone with the
URL can invoke it. This is deliberate for a sandbox demo with synthetic
data. Blast radius is bounded by the account's Lambda concurrency limit
(10) and the $1 budget alarm. For anything beyond a demo, switch to
AuthType AWS_IAM with signed requests.

---

## Issuer response format

The authorize Lambda returns a two-part response matching real
issuer behavior (per ISO 8583 CVV2 result codes):

Wrong CVV (card exists, has funds, CVV doesn't match):
```json
{
  "auth_decision": "approved",
  "cvv_result": "N",
  "merchant_id": "merchant_a",
  "pan_status": "ACTIVE",
  "cvvFailedAttempts": 3,
  "amount": 25.0
}
```

Correct CVV:
```json
{
  "auth_decision": "approved",
  "cvv_result": "M",
  "merchant_id": "merchant_b",
  "pan_status": "ACTIVE",
  "amount": 50.0
}
```

Blocked card (regardless of CVV correctness):
```json
{
  "auth_decision": "declined",
  "cvv_result": "P",
  "decline_reason": "card_blocked",
  "pan_status": "BLOCKED",
  "cvvFailedAttempts": 8
}
```

---

## Merchant security postures (implemented in the web prototype)

Merchant A (strict): Rejects any transaction where cvv_result is N.
This is a well-configured merchant.

Merchant B (moderate): Rejects cvv_result N only when the amount
exceeds $50. Lets low-value N transactions through. Common in
real life to reduce checkout friction.

Merchant C (lax): Ignores cvv_result entirely. If the bank approved
the funds, the transaction goes through even with a CVV mismatch.
This is Possibility C from the payment architecture analysis and
the exact gap the attacker exploits.

---

## Three pillars mapping (challenge requirements)

### Identify

Distributed CVV enumeration exploiting fragmented detection across
merchants. Grounded in the Newcastle University research (2017) and
current Visa loss data ($1.1B annually). The attack works because
each merchant sees only its own 3-5 failed guesses (below any
individual rate limit), while the issuing bank's centralized
counter is the only entity that sees the full picture.

GenAI enhances the attack in two ways: (1) adaptive merchant
classification, where the agent discovers which merchants are lax
by analyzing response patterns, and (2) transaction feature shaping,
where the agent varies controllable parameters (amount, timing,
merchant rotation) to stay under the blue team's detection threshold
(per FRAUD-RLA, arXiv 2502.02290).

### Generate

The attacker script supports multiple modes: sequential CVV cycling,
randomized order, common-values-first, and (when API key is
provided) Gemini-driven strategy generation that varies session
parameters per round. The dynamic attacker calls Gemini 2.5 Flash
before each session to author a fresh strategy as structured JSON,
which is then clamped to safe bounds and executed against the
Lambda endpoint.

Synthetic card data is generated with Luhn-valid PANs, realistic
BIN prefixes, and a configurable dead-card ratio (35% default) to
match real stolen-dump characteristics.

### Defend

Layer 1 (hard mitigation): DynamoDB atomic counter per PAN,
incremented on every CVV mismatch regardless of which merchant the
request came through. DynamoDB Streams triggers a mitigation Lambda
that blocks the card at threshold 5. Proven working end-to-end on
live AWS infrastructure.

Layer 2 (ML classifier, built): a LightGBM model scores each PAN over
rolling 1h / 24h / 7d windows and blocks slow-and-low campaigns that
never trip the Layer-1 counter. Feature families: transaction
aggregation (Whitrow et al. 2009; Bahnsen et al. 2016), periodic
time-of-day encoding (Bahnsen et al. 2016), gap-separated session
bursts, a merchant historical CVV-N rate that surfaces lax merchants
without hard-coding merchant identity, and an IsolationForest anomaly
score as an extra input (Carcillo et al. 2021). Imbalance is handled by
undersampling the majority class then calibrating probabilities, and
evaluation is time-ordered with AUC-PR and Precision@k as the headline
metrics, not ROC-AUC (Dal Pozzolo et al. 2018; Dal Pozzolo et al. 2014;
Davis & Goadrich 2006).

The exact same feature code (ml/features.py) runs offline for training
and online in CardingScoringLambda, which reads each PAN's recent
history from CardingEventLog, scores it, and writes risk_score back onto
the card. The mitigation Lambda then blocks on cvvFailedAttempts >= 5 OR
risk_score >= cutoff, recording block_reason ("threshold" / "model").
Layer 1 stays as the deterministic fallback.

Deployed and verified end-to-end on live AWS (us-east-1): a distributed
slow-and-low run against the Function URL is blocked by Layer 2 after a
single CVV mismatch per PAN (risk_score ~0.87, cutoff 0.86), where
Layer 1 alone would have needed 5. The deps live in the carding-ml-deps
Lambda layer (numpy/scipy/scikit-learn/lightgbm/joblib/pandas + libgomp).

---

## File inventory

### AWS Lambda code

lambda_function_v2.py — Authorize Lambda (deployed as
CardingAuthorizeLambda, handler lambda_function.lambda_handler).
Checks PAN + expiry + CVV against MockIssuerDB. Returns two-part issuer
response. Increments cvvFailedAttempts atomically on mismatch. CORS
enabled for browser access. Also appends every auth event to
CardingEventLog and bumps per-merchant CVV-N counters for Layer 2 — this
is additive and wrapped in try/except, so the authorization path is
unaffected if CardingEventLog is absent.

mitigation_lambda.py — Mitigation Lambda (deployed as
CardingMitigationLambda). Triggered by DynamoDB Streams. Blocks PAN
when cvvFailedAttempts >= 5 OR risk_score >= RISK_CUTOFF, and records
block_reason. This file mirrors the deployed code.

scoring_lambda.py — CardingScoringLambda (Layer 2). Triggered by
MockIssuerDB streams. Recomputes the Layer-2 feature row from
CardingEventLog and writes risk_score onto the card. Package with a copy
of ml/features.py and the ml/ model artifacts; needs a Lambda layer for
pandas / numpy / scikit-learn / lightgbm.

scoring-lambda-policy.json — scoped IAM policy for CardingScoringLambda
(read CardingEventLog, update MockIssuerDB, consume the issuer stream).

### Data generation

seed_cards.py — Generates Luhn-valid synthetic cards with random
CVVs and seeds them into MockIssuerDB. Also writes
attacker_card_list.csv (PAN + expiry only, no CVV) for the attacker.

reset_cards.py — Resets every card to cvvFailedAttempts=0,
status=ACTIVE without regenerating PANs/CVVs. Run between demo runs.

### IAM policies

trust-policy.json — Lambda service assume-role trust policy.
dynamodb-lambda-policy.json — Scoped DynamoDB access for the
authorize Lambda.

### Web prototype

prototype.html — Single-file web app. Two-column layout: transaction
feed on the left, issuer-defense column on the right (PAN velocity
ring, Layer-2 risk meter, session totals, merchant posture cards),
event log below, and a "Read more" panel explaining the red-team and
blue-team mechanics and how the simulation is built. Calls the public
Lambda URL directly. No build step, no dependencies, open in browser.

### Local simulation (sim/) — labeled data source for Layer 2

sim/config.py — shared constants (simulated time, not wall clock).
sim/cards.py — synthetic card pool + Luhn helpers, shared with seed_cards.py.
sim/mock_gateway.py — issuer logic mirrored from lambda_function_v2.py +
mitigation_lambda.py, plus the client-side merchant posture check. Import
it in-process, or run `python -m sim.mock_gateway` for a Flask endpoint
with the same JSON contract as the Lambda Function URL.
sim/legit_agent.py — benign customer traffic (known CVV, low fan-out,
daytime-weighted, occasional single typo).
sim/attacker_agent.py — distributed guessing. generate_plan() for batch
runs; run_live() for the reactive --evade robustness pass. Optional
Gemini 2.5 Flash strategy, clamped to safe bounds.
sim/run_sim.py — orchestrator. Writes one time-ordered labeled
events.parquet and prints attack prevalence + how many campaigns evaded
Layer 1.

### Layer 2 model (ml/)

ml/features.py — the feature pipeline. pandas/numpy only, no AWS, so the
identical code runs in training and in CardingScoringLambda.
ml/train.py — time-ordered split, undersample + calibrate, LightGBM +
IsolationForest, AUC-PR / Precision@k / lift-vs-Layer-1. Writes
model.txt, iforest.pkl, calibrator.pkl, feature_list.json, threshold.json.
ml/evaluation.ipynb — PR curve, alert-budget table, SHAP summary, lift.
ml/local_e2e.py — no-AWS end-to-end: model wired to the in-process
issuer, runs a slow-and-low campaign (and `--evade` for Step 5).
ml/test_features_parity.py — asserts batch features == incremental
features, so offline and online scoring never diverge.
requirements-ml.txt — local-only deps (the two production Lambdas stay
dependency-free).

### Documentation

plan.md — Trimmed execution plan for the AWS build.
cvv_enumeration_execution_plan.md — Original plan (superseded).

---

## How to run

### Prerequisites

Python 3.9+, boto3, AWS CLI configured with credentials for account
<ACCOUNT_ID>. A modern browser (Chrome/Edge/Firefox).

### Quick start

1. Seed the database (if not already seeded):
   ```
   cd Argonauts/distributed-cvv-guessing
   python seed_cards.py
   ```

2. Point the web app at your deployed issuer endpoint. The live URL is
   not committed — do one of:
   ```
   cp config.example.js config.js      # then edit config.js with your URL
   ```
   or open `prototype.html?api=https://<your-fn-url>` or paste the URL
   into the "Issuer API" field in the UI.

3. Open prototype.html in a browser. Select a target card from the
   dropdown. Click "Start Attack". Transactions flow to your Lambda
   Function URL and responses render live.

4. Watch Merchant C (lax) let transactions through despite CVV
   mismatch. Watch the defense dashboard counter climb. When it
   hits 5, the mitigation Lambda blocks the card and all further
   attempts are declined — or Layer 2 blocks it sooner on risk score.

### Layer 2: train and check the model (local, no AWS)

```
cd Argonauts/distributed-cvv-guessing
python -m pip install -r requirements-ml.txt
python -m sim.run_sim                 # -> events.parquet (labeled)
python -m pytest ml/test_features_parity.py
python -m ml.train                    # -> ml/model.txt et al. + metrics
python -m ml.local_e2e                # slow-and-low campaign, all blocked by the model
python -m ml.local_e2e --evade        # Step 5 robustness pass
jupyter notebook ml/evaluation.ipynb  # PR curve, SHAP, lift table
```

### Reset cards after a demo run

```
python reset_cards.py
```

Sets every card back to cvvFailedAttempts=0, status=ACTIVE. Or re-run
seed_cards.py to regenerate fresh cards (this also rewrites
attacker_card_list.csv).

### Test the Lambda directly (curl)

Wrong CVV (should return auth_decision: approved, cvv_result: N):
```
curl -s -X POST https://YOUR-FUNCTION-URL.lambda-url.us-east-1.on.aws/ -H "Content-Type: application/json" -d "{\"pan\":\"5300003472283092\",\"expiry_month\":4,\"expiry_year\":2028,\"cvv\":\"999\",\"merchant_id\":\"merchant_a\",\"amount\":25}"
```

Correct CVV (should return auth_decision: approved, cvv_result: M):
```
curl -s -X POST https://YOUR-FUNCTION-URL.lambda-url.us-east-1.on.aws/ -H "Content-Type: application/json" -d "{\"pan\":\"5300003472283092\",\"expiry_month\":4,\"expiry_year\":2028,\"cvv\":\"612\",\"merchant_id\":\"merchant_b\",\"amount\":50}"
```

---

## Cost

All resources are PAY_PER_REQUEST or per-invocation. At demo scale
(hundreds to low thousands of transactions) the total cost is under
$1. A $1 budget alarm exists on the account. $200 in AWS credits are
active through 08/22/2027.

### Teardown (after the challenge)

```
aws lambda delete-function --function-name CardingAuthorizeLambda --region us-east-1
aws lambda delete-function --function-name CardingMitigationLambda --region us-east-1
aws lambda delete-function --function-name CardingScoringLambda --region us-east-1
aws dynamodb delete-table --table-name MockIssuerDB --region us-east-1
aws dynamodb delete-table --table-name CardingEventLog --region us-east-1
aws lambda delete-layer-version --layer-name carding-ml-deps --version-number 2 --region us-east-1
aws lambda delete-layer-version --layer-name carding-ml-deps --version-number 1 --region us-east-1
aws iam delete-role-policy --role-name CardingScoringLambdaRole --policy-name scoring-access
aws iam detach-role-policy --role-name CardingScoringLambdaRole --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam delete-role --role-name CardingScoringLambdaRole
aws s3 rb s3://carding-sim-us-east-1-<ACCOUNT_ID> --force
aws iam delete-role-policy --role-name CardingAuthorizeLambdaRole --policy-name dynamodb-access
aws iam detach-role-policy --role-name CardingAuthorizeLambdaRole --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam remove-role-from-instance-profile --instance-profile-name carding-sim-instance-profile --role-name carding-sim-ec2-role
aws iam delete-instance-profile --instance-profile-name carding-sim-instance-profile
aws iam delete-role --role-name CardingAuthorizeLambdaRole
aws iam delete-role --role-name CardingMitigationLambdaRole
```

---

## What's next (not yet built)

Full closed-loop adversarial retraining: attacker adapts after each
catch, defender retrains, detection rate charted across many rounds.
ml/local_e2e.py --evade does one honest robustness pass; the multi-round
loop with charts is still to do.

Solution walkthrough document (.docx) for submission.
