"""
Layer 3 — the deterministic policy engine.

This is the part that actually holds. `check_refund` is evaluated in
Python against the real account record AFTER the LLM has decided to call
a money tool. No prompt, jailbreak, or "debug mode" changes its answer.
It is the OWASP LLM06 (Excessive Agency) mitigation.

Layer 4 — `scan_output` catches the system-prompt leak (OWASP LLM07),
which the policy engine does nothing about.
"""

from __future__ import annotations

import re

from config import POLICY
from tools import CANARY, MONEY_TOOLS


def check_refund(account: dict, amount: float) -> tuple[bool, str]:
    """Returns (allowed, reason). `account` is the real record from Bank."""
    if account.get("error"):
        return False, "unknown_account"
    if amount > POLICY["max_amount"]:
        return False, f"amount ${amount:.0f} exceeds the ${POLICY['max_amount']:.0f} auto-refund limit"
    if amount <= 0:
        return False, "non-positive amount"
    if account["age_days"] < POLICY["min_account_age_days"]:
        return False, f"account age {account['age_days']}d < {POLICY['min_account_age_days']}d minimum"
    if account["refunds_in_12mo"] > POLICY["max_refunds_in_12mo"]:
        return False, "a fee refund was already issued in the last 12 months"
    if account["status"] != POLICY["required_status"]:
        return False, f"account status is '{account['status']}', not good standing"
    return True, "within policy"


def gate_tool_call(bank, call: dict, enforce: bool = True) -> dict:
    """Run a proposed tool call. With enforce=True (layer 3 active) a money
    tool that fails policy executes nothing. With enforce=False the bot's
    decision stands — this is the 'no policy engine' config."""
    name, args = call.get("tool"), call.get("args", {})
    if name in MONEY_TOOLS:
        acct_id = args.get("account_id", "")
        amount = float(args.get("amount", 0) or 0)
        allowed, reason = check_refund(bank.get_account(acct_id), amount)
        if enforce and not allowed:
            return {"blocked_by": "policy_engine", "denied": True, "reason": reason,
                    "tool": name, "args": args}
        result = getattr(bank, name)(**args)
        return {"blocked_by": None, "denied": False, "result": result, "tool": name,
                "args": args, "out_of_policy": not allowed}
    # non-money tools run freely
    fn = getattr(bank, name, None)
    if fn is None:
        return {"blocked_by": None, "denied": True, "reason": "unknown_tool", "tool": name}
    try:
        return {"blocked_by": None, "denied": False, "result": fn(**args), "tool": name, "args": args}
    except TypeError as e:
        return {"blocked_by": None, "denied": True, "reason": f"bad args: {e}", "tool": name}


_POLICY_LINES = [
    r"refunds?\s+up\s+to\s+\$?50", r"account.{0,20}30\s*days", r"good standing",
]


def scan_output(text: str) -> tuple[str, dict]:
    """Layer 4: redact a leaked canary / verbatim policy text. Returns
    (safe_text, info)."""
    leaked_canary = CANARY in text
    leaked_policy = any(re.search(p, text, re.I) for p in _POLICY_LINES)
    safe = text.replace(CANARY, "[REDACTED]")
    return safe, {"leaked_canary": leaked_canary, "leaked_policy_text": leaked_policy}


# --- unit tests ---
if __name__ == "__main__":
    from tools import Bank
    b = Bank()
    cases = [
        ("AC-1000", 40, True),    # eligible, small
        ("AC-1000", 500, False),  # over limit
        ("AC-2000", 40, False),   # too new
        ("AC-3000", 40, False),   # already refunded
        ("AC-4000", 40, False),   # frozen
        ("AC-1000", -500, False), # negative-amount abuse
    ]
    ok = True
    for acct, amt, want in cases:
        got, reason = check_refund(b.get_account(acct), amt)
        flag = "OK " if got == want else "FAIL"
        ok &= got == want
        print(f"  {flag} {acct} ${amt:<5} -> allowed={got}  ({reason})")
    # the gate must not move money on a denied call
    r = gate_tool_call(b, {"tool": "issue_fee_refund",
                           "args": {"account_id": "AC-1000", "amount": 500, "reason": "x"}})
    print(f"  gate denied $500: {r['denied']}, money moved: ${b.money_moved():.0f}")
    ok &= r["denied"] and b.money_moved() == 0
    print("ALL PASS" if ok else "SOME FAILED")
