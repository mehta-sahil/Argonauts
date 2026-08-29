"""
Simulation orchestrator.

Builds one benign plan + N attack-campaign plans, merges them on the
virtual clock, replays every action through the mirrored issuer, and
writes a single time-ordered labeled event log to events.parquet.

    python -m sim.run_sim
    python -m sim.run_sim --gemini      # let Gemini author campaign strategy

Sanity output at the end reports attack prevalence and how many attack
campaigns never tripped the Layer-1 threshold on any PAN -- that
population is exactly what Layer 2 has to catch.
"""

import argparse

import pandas as pd

from sim import cards, config, legit_agent, attacker_agent
from sim.mock_gateway import IssuerState, issuer_authorize, merchant_decision


def run(use_gemini: bool = False, out_path: str = config.EVENTS_PATH) -> pd.DataFrame:
    pool = cards.generate_card_pool(config.N_CARDS, config.DEAD_CARD_RATIO,
                                    seed=config.POOL_SEED)
    state = IssuerState.from_pool(pool)

    actions = legit_agent.generate_plan(pool, seed=1)
    actions += attacker_agent.generate_plan(pool, seed=2, use_gemini=use_gemini)
    actions.sort(key=lambda a: a["ts"])

    rows = []
    for a in actions:
        resp = issuer_authorize(state, a)
        mdec = merchant_decision(a["posture"], resp)
        rows.append({
            "ts": a["ts"],
            "pan": a["pan"],
            "merchant_id": a["merchant_id"],
            "amount": a["amount"],
            "expiry_month": a["expiry_month"],
            "expiry_year": a["expiry_year"],
            "auth_decision": resp["auth_decision"],
            "cvv_result": resp["cvv_result"],
            "decline_reason": resp.get("decline_reason", ""),
            "pan_status": resp["pan_status"],
            "cvv_failed_attempts": int(resp.get("cvvFailedAttempts", 0)),
            "merchant_accepted": mdec["accepted"],
            "merchant_kind": mdec["kind"],
            "label": a["label"],
            "campaign_id": a["campaign_id"],
            "agent_id": a["agent_id"],
        })

    df = pd.DataFrame(rows).sort_values("ts").reset_index(drop=True)
    df.to_parquet(out_path, index=False)
    _report(df, state)
    return df


def _report(df: pd.DataFrame, state: IssuerState) -> None:
    n = len(df)
    atk = df[df.label == "attack"]
    blocked_pans = {p for p, s in state.status.items() if s == "BLOCKED"}
    atk_campaigns = atk.groupby("campaign_id")
    evaded = sum(
        1 for _, g in atk_campaigns
        if not set(g.pan) & blocked_pans
    )
    print(f"wrote {n:,} events to {config.EVENTS_PATH}")
    print(f"  benign: {(df.label == 'benign').sum():,}   "
          f"attack: {len(atk):,} ({len(atk) / n:.1%})")
    print(f"  attack campaigns: {atk.campaign_id.nunique()}   "
          f"never tripped Layer 1 on any PAN: {evaded}")
    print(f"  PANs blocked by Layer 1: {len(blocked_pans)}")
    cracked = df[df.cvv_result == "M"].groupby("label").pan.nunique().to_dict()
    print(f"  distinct PANs with a CVV match, by label: {cracked}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--gemini", action="store_true")
    ap.add_argument("--out", default=config.EVENTS_PATH)
    args = ap.parse_args()
    run(use_gemini=args.gemini, out_path=args.out)
