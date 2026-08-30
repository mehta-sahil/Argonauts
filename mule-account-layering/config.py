"""
Shared constants for the mule-account layering lab.

Time is simulated hours from a fixed t0 (no wall clock, nothing sleeps).
The whole thing is downscaled from IBM's AMLworld generator so it runs
in seconds and stays self-contained.
"""

# --- background transaction graph ---
N_ACCOUNTS = 720
BUSINESS_FRACTION = 0.16
N_NORMAL_TXNS = 6400
WINDOW_HOURS = 30 * 24                    # 30-day observation window
PREF_ATTACH_BIAS = 1.0                    # 0 = uniform partners, higher = more hub-heavy
# amounts are a mixture: everyday spend + a fat tail of rent/payroll/invoices,
# so mid-thousands transfers exist in the honest population too
NORMAL_AMOUNT_SMALL = (4.6, 1.0)         # (ln-mean, ln-std) — ~80% of txns, median ~$100
NORMAL_AMOUNT_LARGE = (8.0, 0.7)         # ~20% of txns, median ~$3000
NORMAL_LARGE_FRACTION = 0.2
GRAPH_SEED = 7

# --- the laundering operation the attacker designs ---
LAUNDER_TOTAL = 18_000.0                  # one cell of a larger operation; kept small on purpose
STRUCTURING_CAP = 6_000.0                 # no single hop above this (stay under reporting radar)
MULE_COVER_TXNS = (11, 22)                # cover traffic on the layer mules -> their
                                          # aggregate stats sit inside the normal customer cloud
N_PATTERNS = 8                            # independent hop-chains injected
MULE_POOL_SIZE = 26                       # mid-activity accounts the attacker can recruit
# hard bounds the attacker is clamped to (also the fallback planner's ranges)
FANOUT_RANGE = (5, 9)                     # source -> this many first-hop mules
LAYER_RANGE = (1, 3)                      # rounds of mule<->mule shuffling
GATHER_RANGE = (1, 3)                     # mules -> this many cash-out accounts
CUT_PER_HOP_RANGE = (0.01, 0.08)         # skim taken at each hop (fees / mule cut)
HOP_DELAY_HOURS = (2, 36)
VELOCITY_LIMIT = 5                        # keep any account under this many txns/day (evasion)
ATTACK_SEED = 21

# --- LLM attacker ---
LLM_MODEL = "claude-opus-5"              # used only if an Anthropic credential is available

# --- defender: 2-layer GraphSAGE ---
HIDDEN_DIM = 24
EPOCHS = 400
LEARNING_RATE = 0.02
WEIGHT_DECAY = 1e-4
TRAIN_FRAC = 0.60
VAL_FRAC = 0.20                           # remainder is test
GCN_SEED = 0

# --- output ---
DEMO_DATA_PATH = "demo_data.js"
VIZ_MAX_NORMAL_LINKS = 900                # cap normal edges drawn in the browser (all launder edges always shown)
