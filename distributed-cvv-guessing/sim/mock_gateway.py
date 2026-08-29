"""
Local mock issuer + merchant layer for the simulation.

The issuer logic is a line-for-line mirror of the deployed authorize
Lambda (lambda_function_v2.py) plus the Layer-1 mitigation
(mitigation_lambda.py): atomic per-PAN mismatch counter, block at
BLOCK_THRESHOLD, decline everything on a blocked or dead card.

Two ways to use it:
  * In-process (fast, used by run_sim.py): make an IssuerState, call
    issuer_authorize(state, req). No HTTP, no sleeps.
  * Over HTTP (matches the AWS shape): `python -m sim.mock_gateway`
    starts a Flask app exposing POST / with the same JSON contract as
    the Lambda Function URL.

The merchant posture check (strict / moderate / lax) is applied
client-side by the agents, exactly as the web prototype does it in the
browser. The issuer does not know or care about posture.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from sim import config


@dataclass
class IssuerState:
    """Holds card truth + mutable per-PAN counters. One per simulation."""
    cards: dict[str, dict]                      # pan -> truth dict from cards.generate_card_pool
    failed: dict[str, int] = field(default_factory=dict)
    status: dict[str, str] = field(default_factory=dict)   # pan -> ACTIVE / BLOCKED

    @classmethod
    def from_pool(cls, pool: list[dict]) -> "IssuerState":
        cards = {c["pan"]: c for c in pool}
        return cls(
            cards=cards,
            failed={p: 0 for p in cards},
            status={p: "ACTIVE" for p in cards},
        )


def issuer_authorize(state: IssuerState, req: dict) -> dict:
    """Mirror of lambda_function_v2.lambda_handler's body logic.

    req keys: pan, expiry_month, expiry_year, cvv, merchant_id, amount
    """
    pan = str(req.get("pan", ""))
    merchant_id = req.get("merchant_id", "unknown_merchant")
    amount = float(req.get("amount", 1.0))
    card = state.cards.get(pan)

    if card is None:
        return {"auth_decision": "declined", "cvv_result": "P",
                "decline_reason": "unknown_card", "merchant_id": merchant_id,
                "pan_status": "UNKNOWN", "amount": amount}

    # Layer 1 enforcement point: blocked PAN declines regardless of CVV.
    if state.status[pan] == "BLOCKED":
        return {"auth_decision": "declined", "cvv_result": "P",
                "decline_reason": "card_blocked", "merchant_id": merchant_id,
                "pan_status": "BLOCKED", "cvvFailedAttempts": state.failed[pan],
                "amount": amount}

    # Dead card: valid number, no funds. Issuer never authorizes.
    if card["is_dead"]:
        return {"auth_decision": "declined", "cvv_result": "P",
                "decline_reason": "do_not_honor", "merchant_id": merchant_id,
                "pan_status": "ACTIVE", "amount": amount}

    expiry_matches = (
        int(card["expiry_month"]) == int(req.get("expiry_month", -1))
        and int(card["expiry_year"]) == int(req.get("expiry_year", -1))
    )
    if not expiry_matches:
        return {"auth_decision": "declined", "cvv_result": "P",
                "decline_reason": "expiry_mismatch", "merchant_id": merchant_id,
                "pan_status": "ACTIVE", "amount": amount}

    if str(card["cvv"]) == str(req.get("cvv", "")):
        return {"auth_decision": "approved", "cvv_result": "M",
                "merchant_id": merchant_id, "pan_status": "ACTIVE",
                "amount": amount}

    # Wrong CVV: funds are fine, so the issuer approves and flags N, and
    # atomically bumps the cross-merchant mismatch counter (Layer 1).
    state.failed[pan] += 1
    new_count = state.failed[pan]
    if new_count >= config.BLOCK_THRESHOLD:
        state.status[pan] = "BLOCKED"
    return {"auth_decision": "approved", "cvv_result": "N",
            "merchant_id": merchant_id, "pan_status": state.status[pan],
            "cvvFailedAttempts": new_count, "amount": amount}


def merchant_decision(posture: str, issuer_resp: dict) -> dict:
    """Client-side posture check. Mirrors prototype.html merchantCall()."""
    if issuer_resp["auth_decision"] == "declined":
        return {"accepted": False, "kind": "issuer_declined"}
    if issuer_resp["cvv_result"] == "M":
        return {"accepted": True, "kind": "cvv_match"}
    # cvv_result == "N"
    if posture == "strict":
        return {"accepted": False, "kind": "rejected_cvv_n"}
    if posture == "moderate":
        if issuer_resp.get("amount", 0.0) > config.MODERATE_AMOUNT_CUTOFF:
            return {"accepted": False, "kind": "rejected_high_value"}
        return {"accepted": True, "kind": "allowed_low_value"}
    return {"accepted": True, "kind": "ignored_cvv"}   # lax


# --- optional HTTP wrapper (parity with the Lambda Function URL) ---

def _make_flask_app(state: IssuerState):
    from flask import Flask, jsonify, request

    app = Flask(__name__)

    @app.post("/")
    def authorize():
        body = request.get_json(force=True, silent=True) or {}
        return jsonify(issuer_authorize(state, body))

    return app


if __name__ == "__main__":
    from sim import cards

    pool = cards.generate_card_pool(config.N_CARDS, config.DEAD_CARD_RATIO,
                                    seed=config.POOL_SEED)
    _make_flask_app(IssuerState.from_pool(pool)).run(port=8000)
