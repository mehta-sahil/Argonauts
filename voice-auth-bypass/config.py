"""
Constants for the voice-auth-bypass lab.
"""

# --- scenarios ---
SCENARIOS = ["ceo_wire", "family_bail"]

# --- corpus ---
N_GENUINE = 900
N_CLONE = 900
CORPUS_SEED = 13
CLONE_QUALITY_TRAIN = (0.15, 0.98)     # clones span the whole quality range in training

# --- anti-spoof classifier ---
ANTISPOOF_SEED = 0
TARGET_FALSE_ACCEPT = 0.01             # report detection rate at 1% false-accept

# --- deterministic authorization protocol (the control that holds) ---
LOW_LIMIT = 1_000.0                    # phone auth alone OK up to here, registered payee only
HIGH_LIMIT = 25_000.0                  # above this: dual authorization required
COOLING_OFF_MIN = 30                   # secrecy / channel-switch requests: mandatory delay

# --- the battle ---
DEFENSE_CONFIGS = ["none", "voiceprint", "antispoof", "context", "full"]
QUALITY_SWEEP = [0.2, 0.35, 0.5, 0.65, 0.8, 0.95]
MAX_ROUNDS = 4
AVG_FRAUD_LOSS = {"ceo_wire": 180_000.0, "family_bail": 12_000.0}


# --- output ---
DEMO_DATA_PATH = "demo_data.js"
