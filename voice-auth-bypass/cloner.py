"""
Red team — the voice-cloning vishing attacker.

Builds a synthetic inbound call: a cloned-voice biomarker vector (quality
+ evasions), a vishing transcript, and spoofed call metadata (caller ID,
new payee, amount, odd hour). Adapts across rounds:

  blocked_by == "antispoof"  -> turn on the evasion that fixes the
                                flagged biomarker family
  blocked_by == "context"    -> soften the script (drop a secrecy /
                                channel-switch marker), lower the amount
  blocked_by == "auth_protocol" -> nothing it can do; the callback goes
                                to the real registered number
"""

from __future__ import annotations

import random

import numpy as np

import biomarkers as bm
import scripts
from config import LOW_LIMIT

CLAIMED ={"ceo_wire": ["CEO Jane Okafor", "CFO Daniel Reyes"],
           "family_bail": ["your granddaughter Mia", "your son Josh"]}
AMOUNTS = {"ceo_wire": [95_000, 180_000, 320_000, 500_000],
           "family_bail": [4_500, 9_000, 15_000, 24_000]}
# which flagged family maps to which evasion
FAMILY_TO_EVASION = {
    "breath_rate_pm": "add_breath", "pause_regularity_cv": "add_breath",
    "bg_snr_db": "add_room_noise", "reverb_rt60_s": "add_room_noise",
    "f0_range_semitones": "longer_sample", "f0_contour_smoothness": "longer_sample",
    "phase_artifact": "better_vocoder", "checkerboard_score": "better_vocoder",
    "hf_energy_ratio": "better_vocoder", "spectral_flatness": "better_vocoder",
    "spectral_tilt_db_oct": "better_vocoder", "codec_mismatch": "better_vocoder",
}


class Cloner:
    def __init__(self, scenario: str, clone_quality: float, rng: np.random.Generator,
                 seed: int = 0):
        self.scenario = scenario
        self.quality = clone_quality
        self.rng = rng
        self.prng = random.Random(seed)
        self.evasions: set[str] = set()
        self.amount = float(self.prng.choice(AMOUNTS[scenario]))
        # the attacker can shrink the ask, but not so far it stops being this crime
        self._amount_floor = 40_000.0 if scenario == "ceo_wire" else LOW_LIMIT * 1.6
        self.script_softening = 0
        self.context_evasion = 0        # 0 none, 1 soft script, 2 +mule payee, 3 +spoofed caller ID

    def _transcript(self) -> str:
        text = scripts.build(self.scenario, is_vishing=True, amount=self.amount, rng=self.prng)
        for _ in range(self.script_softening):          # drop the riskiest markers
            for m in scripts.SECRECY + scripts.CHANNEL_SWITCH:
                text = text.replace(m, "")
        return " ".join(text.split())

    def call(self) -> dict:
        b = bm.sample_clone(self.rng, self.quality, tuple(self.evasions))
        ce = self.context_evasion
        return {
            "scenario": self.scenario, "is_vishing": True,
            "biomarkers": b, "transcript": self._transcript(),
            "meta": {
                "claimed_identity": self.prng.choice(CLAIMED[self.scenario]),
                # ce>=3: the attacker spoofs a caller ID that matches the enrolled number
                "caller_id_match": ce >= 3,
                "amount": self.amount,
                # ce>=2: funds routed to a mule account that passed basic onboarding
                "payee_registered": ce >= 2,
                "out_of_hours": self.prng.random() < (0.2 if ce else 0.55),
                "prior_calls_this_pattern": 0,
            },
            "clone_quality": self.quality, "evasions": sorted(self.evasions),
            "context_evasion": ce,
        }

    _EVASION_ORDER = ["better_vocoder", "add_room_noise", "add_breath", "longer_sample"]

    def adapt(self, blocked_by: str, flagged: list[str]):
        if blocked_by == "antispoof":
            for f in flagged:                            # fix what specifically flagged
                if f in FAMILY_TO_EVASION:
                    self.evasions.add(FAMILY_TO_EVASION[f])
            for e in self._EVASION_ORDER:                # escalate through the rest
                if e not in self.evasions:
                    self.evasions.add(e)
                    break
            self.quality = min(self.quality + 0.15, 0.98)  # buy a better clone / longer sample
        elif blocked_by == "context":
            self.context_evasion += 1                    # soft script -> mule payee -> spoofed ID
            self.script_softening = min(self.context_evasion, 2)
            # and ask for less — but not below the floor, and still above LOW_LIMIT
            self.amount = max(self.amount * 0.6, self._amount_floor)
        # blocked_by == "voiceprint" or "auth_protocol": no move available
