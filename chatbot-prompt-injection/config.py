"""
Constants for the chatbot-prompt-injection lab.
"""

# --- Gemini (raw HTTPS, no SDK — disk-constrained machine) ---
GEMINI_MODEL = "gemini-flash-lite-latest"   # newer keys can't call gemini-2.5-flash
GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
GEMINI_TIMEOUT = 45
GEMINI_MIN_INTERVAL = 4.5       # seconds between live calls (free tier ~15 rpm)
MAX_GEMINI_CALLS = 350          # hard budget guard for one --llm run (free tier day cap)
CACHE_PATH = "data/llm_cache.json"

# --- the battle ---
MAX_ROUNDS = 8                  # attacker turns per episode
LLM_MAX_ROUNDS = 4             # shorter episodes when driving real Gemini (rate limits)
LLM_TECHNIQUES = {"refund": ["direct_override", "fake_system", "refund_code_ruse"],
                  "leak": ["direct_override", "hypothetical_leak"]}
LLM_CONFIGS = ["none", "full"]  # run the real-Gemini battle only for the two story-telling configs
TARGET_REFUND = 500.0
DEFENSE_CONFIGS = ["none", "guardrail", "policy", "full"]

# --- deterministic refund policy (ground truth) ---
POLICY = {
    "max_amount": 50.0,
    "min_account_age_days": 30,
    "max_refunds_in_12mo": 0,
    "required_status": "good_standing",
}

# --- guardrail classifier ---
CHAR_NGRAMS = (3, 5)
WORD_NGRAMS = (1, 2)
MAX_TFIDF_FEATURES = 12_000
GUARDRAIL_THRESHOLD = 0.55
CORPUS_SEED = 5
N_BENIGN = 900
N_INJECTION = 900

# --- adversarial evasion sweep ---
EVASION_STEPS = 4

# --- output ---
DEMO_DATA_PATH = "demo_data.js"
