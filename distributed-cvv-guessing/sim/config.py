"""
Shared constants for the local simulation.

Simulated time, not wall-clock: every event carries a synthetic unix
timestamp. run_sim.py advances a virtual clock so a multi-day campaign
generates in seconds. Nothing here sleeps.
"""

# --- issuer / Layer 1 (must match the deployed AWS code) ---
BLOCK_THRESHOLD = 5          # mitigation_lambda.py BLOCK_THRESHOLD
CVV_RESULT_MATCH = "M"
CVV_RESULT_NO_MATCH = "N"
CVV_RESULT_NOT_PROCESSED = "P"

# --- merchant postures (README: strict / moderate / lax) ---
MERCHANTS = {
    "merchant_a": {"name": "A", "posture": "strict"},
    "merchant_b": {"name": "B", "posture": "moderate"},
    "merchant_c": {"name": "C", "posture": "lax"},
}
MODERATE_AMOUNT_CUTOFF = 50.0   # merchant B rejects N above this

# --- card pool ---
N_CARDS = 4_000
DEAD_CARD_RATIO = 0.35
POOL_SEED = 42

# --- simulation span ---
SIM_DAYS = 7
SIM_START_TS = 1_760_000_000.0          # arbitrary fixed epoch for reproducibility
SECONDS_PER_DAY = 86_400

# --- benign traffic ---
N_LEGIT_CUSTOMERS = 2_400
LEGIT_TXNS_PER_CUSTOMER = (1, 22)       # uniform range over the whole span
LEGIT_TYPO_RATE = 0.05                  # fraction of customers who fat-finger the CVV once
LEGIT_MERCHANT_FANOUT = (1, 3)          # distinct merchants a real customer touches

# --- attack campaigns ---
N_ATTACK_CAMPAIGNS = 22
AGGRESSIVE_CAMPAIGN_FRACTION = 0.30     # these trip Layer 1; the rest stay under it
CAMPAIGN_CARDS = (18, 45)               # PANs tested per campaign (disjoint across campaigns)
CAMPAIGN_MISMATCH_BUDGET_PER_PAN = 3    # slow-and-low: deliberately under BLOCK_THRESHOLD
AGGRESSIVE_MISMATCH_BUDGET_PER_PAN = 8  # aggressive: trips BLOCK_THRESHOLD on purpose
CAMPAIGN_INTER_REQUEST_SEC = (20, 240)  # spacing between guesses in a campaign
CAMPAIGN_AMOUNT_RANGE = (1.5, 8.0)      # small "does it authorize" probes
CAMPAIGN_STRATEGIES = ["sequential", "random", "common_first"]
COMMON_CVVS = ["123", "000", "111", "999", "007", "420", "666", "321",
               "777", "888", "555", "333", "100", "200", "500"]

# --- feature windows (seconds) ---
WINDOWS = {"1h": 3_600, "24h": 86_400, "7d": 604_800}
SESSION_GAP_SEC = 1_800                 # bursts separated by >30 min are new sessions
SMALL_AMOUNT_CUTOFF = 5.0
NIGHT_HOURS = range(0, 6)

# --- output ---
EVENTS_PATH = "events.parquet"
