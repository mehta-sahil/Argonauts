"""
Constants for the push-payment-scam lab.

Conversations are turn-indexed, not wall-clock. Nothing sleeps.
"""

# --- scam archetypes (UK Finance / PSR APP fraud categories) ---
ARCHETYPES = [
    "bank_impersonation",   # "we've spotted fraud — move your money to a safe account"
    "romance",              # rapport built over weeks, now an emergency
    "invoice_redirect",     # "our bank details have changed, pay the new account"
    "purchase",             # too-good-to-be-true item, pay by bank transfer
    "authority",            # police / tax: "pay now or be arrested"
    "investment",           # "guaranteed returns, move funds to this account"
    "ceo_payroll",          # "I'm the CEO — urgent supplier payment, keep it quiet"
]

# --- corpus ---
N_SCAM_CONVOS = 700
N_LEGIT_CONVOS = 700           # hard negatives: also about money / accounts / urgency
MAX_TURNS = 22
CORPUS_SEED = 11
CORPUS_PATH = "data/conversations.jsonl"

# --- classifier ---
CHAR_NGRAMS = (3, 5)
WORD_NGRAMS = (1, 2)
MAX_TFIDF_FEATURES = 20_000
CLASSIFIER_SEED = 0
FLAG_THRESHOLD = 0.60          # conversation_score above this = "scam suspected"

# --- payment guard (fusion) ---
WARN_THRESHOLD = 0.45
HOLD_THRESHOLD = 0.70
BLOCK_THRESHOLD = 0.88
AVG_SCAM_LOSS = 4_200.0        # $ used for the "prevented" headline

# --- adversarial round ---
EVADE_ROUNDS = 3
EVADE_SAMPLE = 150            # scam conversations attacked per strength level (keeps runtime sane)

# --- LLM back-end ---
LLM_MODEL = "claude-opus-5"

# --- output ---
DEMO_DATA_PATH = "demo_data.js"
