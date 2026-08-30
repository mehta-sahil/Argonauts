"""
Layer 4 — the deterministic authorization protocol. The part that holds.

Runs AFTER the probabilistic layers. It does not care whether the voice
was real: a payment over a threshold, to a new payee, or with secrecy /
channel-switch markers requires an OUT-OF-BAND step:

  * callback to the payee's / caller's REGISTERED number — the attacker
    spoofed the inbound number, but the outbound callback goes to the
    real person, who says "I never made that call"  -> BLOCKED;
  * dual authorization above HIGH_LIMIT — a second approver;
  * a cooling-off delay for secrecy / channel-switch requests.

A small, registered-payee call under LOW_LIMIT clears on voice auth
alone (that is the normal, low-friction path).

`decide()` returns the required step and the outcome. For the simulation,
the callback is resolved by the ground-truth `is_vishing` flag: a genuine
caller confirms, a cloned caller is exposed.
"""

from __future__ import annotations

import scripts
from config import COOLING_OFF_MIN, HIGH_LIMIT, LOW_LIMIT

DECISIONS = ("accepted", "callback", "dual_auth", "cooling_off_callback", "blocked")


def required_step(call: dict) -> str:
    m = call["meta"]
    ms = scripts.marker_scores(call["transcript"])
    secrecy = ms["secrecy"] + ms["channel_switch"] > 0
    amount = m["amount"]

    if amount > HIGH_LIMIT:
        return "dual_auth"
    if secrecy:
        return "cooling_off_callback"
    if amount > LOW_LIMIT or not m["payee_registered"]:
        return "callback"
    return "accepted"


def decide(call: dict) -> dict:
    step = required_step(call)
    is_vishing = call["is_vishing"]

    if step == "accepted":
        # no out-of-band step — the payment goes through whoever is calling
        return {"step": "accepted", "outcome": "accepted", "money_moves": True,
                "detail": "small payment to a registered payee — voice auth sufficient"}

    if step == "dual_auth":
        # a second approver independently reviews; on a vishing call they
        # can't reach the real executive to confirm -> not approved
        approved = not is_vishing
        return {"step": "dual_auth", "outcome": "approved" if approved else "blocked",
                "money_moves": approved,
                "detail": ("second approver confirmed with the executive"
                           if approved else
                           "second approver could not reach the executive to confirm")}

    # callback / cooling_off_callback -> ring the REGISTERED number
    confirmed = not is_vishing
    detail = ("registered number answered — caller confirmed the request"
              if confirmed else
              "registered number answered — \"I never made that call\"")
    if step == "cooling_off_callback" and not confirmed:
        detail = f"{COOLING_OFF_MIN}-min hold, then callback: " + detail
    return {"step": step, "outcome": "confirmed" if confirmed else "blocked",
            "money_moves": confirmed, "detail": detail}


if __name__ == "__main__":
    from cloner import Cloner
    from genuine import genuine_call
    import numpy as np
    rng = np.random.default_rng(0)
    ok = True

    # a perfect clone (quality 1.0, every evasion) must still be blocked
    c = Cloner("ceo_wire", 1.0, rng, seed=1)
    c.evasions = {"add_breath", "add_room_noise", "longer_sample", "better_vocoder"}
    d = decide(c.call())
    print(f"  perfect clone / CEO wire  -> {d['step']} / {d['outcome']} / money_moves={d['money_moves']}")
    ok &= not d["money_moves"]

    # a genuine large call gets a callback and clears
    g = genuine_call("ceo_wire", rng, seed=2)
    g["meta"]["amount"] = 60_000.0
    d = decide(g)
    print(f"  genuine large CEO call    -> {d['step']} / {d['outcome']} / money_moves={d['money_moves']}")
    ok &= d["money_moves"]

    # a genuine small registered-payee call clears with no callback
    g2 = genuine_call("family_bail", rng, seed=3)
    g2["meta"].update(amount=200.0, payee_registered=True)
    g2["transcript"] = "Hey Mum can you send me the 200 for the tickets, same account, no rush"
    d = decide(g2)
    print(f"  genuine small known payee -> {d['step']} / {d['outcome']} / money_moves={d['money_moves']}")
    ok &= d["step"] == "accepted" and d["money_moves"]

    print("ALL PASS" if ok else "SOME FAILED")
