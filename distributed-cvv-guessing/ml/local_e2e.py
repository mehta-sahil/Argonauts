"""
Local end-to-end check for Layer 2, no AWS.

Wires the trained model to the in-process issuer the same way the AWS
build wires it: every auth event is logged, features are recomputed from
that PAN's history, the model scores it, and the card is blocked on
cvvFailedAttempts >= 5 OR risk_score >= cutoff (block_reason records
which). Then it runs a fresh slow-and-low campaign and reports how each
PAN was stopped.

    python -m ml.local_e2e            # slow-and-low campaign
    python -m ml.local_e2e --evade    # Step 5: attacker hill-climbs to
                                      # drive its own risk score down

Requires ml/model.txt et al. (run `python -m ml.train` first).
"""

import argparse
import json
import pathlib

import joblib
import lightgbm as lgb
import pandas as pd

from ml import features
from sim import cards, config
from sim.mock_gateway import IssuerState, issuer_authorize

HERE = pathlib.Path(__file__).parent


def _load_model():
    booster = lgb.Booster(model_file=str(HERE / "model.txt"))
    iforest = joblib.load(HERE / "iforest.pkl")
    calib = joblib.load(HERE / "calibrator.pkl")
    flist = json.loads((HERE / "feature_list.json").read_text())
    cutoff = json.loads((HERE / "threshold.json").read_text())["cutoff"]
    base = [f for f in flist if f != "anomaly_score"]
    return booster, iforest, calib, flist, base, cutoff


class ScoredIssuer:
    """issuer_authorize + Layer-2 scoring + the OR block rule."""

    def __init__(self, state: IssuerState):
        self.state = state
        self.log: list[dict] = []
        (self.booster, self.iforest, self.calib,
         self.flist, self.base, self.cutoff) = _load_model()
        self.block_reason: dict[str, str] = {}

    def __call__(self, req: dict) -> dict:
        resp = issuer_authorize(self.state, req)
        pan = str(req["pan"])
        self.log.append({
            "ts": len(self.log), "pan": pan, "merchant_id": req["merchant_id"],
            "amount": float(req["amount"]), "auth_decision": resp["auth_decision"],
            "cvv_result": resp["cvv_result"],
        })

        ev = pd.DataFrame([r for r in self.log if r["pan"] == pan],
                          columns=features.EVENT_COLUMNS)
        rates = features._merchant_rate_resolver(
            pd.DataFrame(self.log, columns=features.EVENT_COLUMNS))(ev["ts"].max())
        feat = features.compute_feature_row(ev, ev["ts"].max(), rates)
        x = pd.DataFrame([feat])[self.base]
        x["anomaly_score"] = -self.iforest.score_samples(x.to_numpy())
        raw = self.booster.predict(x[self.flist].to_numpy())[0]
        risk = float(self.calib.predict_proba([[raw]])[0, 1])
        resp["risk_score"] = risk

        if self.state.status[pan] != "BLOCKED":
            if self.state.failed.get(pan, 0) >= config.BLOCK_THRESHOLD:
                self._block(pan, "threshold")
            elif risk >= self.cutoff:
                self._block(pan, "model")
        return resp

    def _block(self, pan: str, reason: str):
        self.state.status[pan] = "BLOCKED"
        self.block_reason[pan] = reason


def main(evade: bool):
    pool = cards.generate_card_pool(config.N_CARDS, config.DEAD_CARD_RATIO,
                                    seed=config.POOL_SEED)
    issuer = ScoredIssuer(IssuerState.from_pool(pool))

    if evade:
        from sim import attacker_agent
        rounds = attacker_agent.run_live(issuer, pool, seed=7, rounds=25)
        print("round  mean_risk_score  budget  delay  amt_hi")
        for r in rounds:
            print(f"{r['round']:>4}  {r['mean_risk_score']:>14.3f}  "
                  f"{r['budget']:>6}  {r['delay']:>5.0f}  {r['amt_hi']:>5.1f}")
        blocked = sum(1 for s in issuer.state.status.values() if s == "BLOCKED")
        by_model = sum(1 for v in issuer.block_reason.values() if v == "model")
        print(f"\nPANs blocked: {blocked}  (by model: {by_model})")
        print("If mean_risk_score falls and stays under the cutoff while the "
              "attacker keeps guessing, the model was evaded -- at the cost of "
              "a much lower guess rate (see budget/delay columns).")
        return

    # slow-and-low: 3 guesses per PAN, never trips Layer 1
    from sim import attacker_agent
    import random
    rng = random.Random(3)
    targets = rng.sample(pool, 30)
    for card in targets:
        order = attacker_agent._cvv_order("common_first", rng)
        for g in range(3):
            issuer({"pan": card["pan"], "expiry_month": card["expiry_month"],
                    "expiry_year": card["expiry_year"], "cvv": order[g],
                    "merchant_id": rng.choice(list(config.MERCHANTS)),
                    "amount": round(rng.uniform(1.5, 8.0), 2)})

    reasons = issuer.block_reason
    model_blocks = [p for p, r in reasons.items() if r == "model"]
    thr_blocks = [p for p, r in reasons.items() if r == "threshold"]
    print(f"targets: {len(targets)}   blocked: {len(reasons)}")
    print(f"  by Layer 2 (model, before 5 mismatches): {len(model_blocks)}")
    print(f"  by Layer 1 (threshold):                  {len(thr_blocks)}")
    max_fail_on_model = max((issuer.state.failed[p] for p in model_blocks), default=0)
    print(f"  max cvvFailedAttempts on a model-blocked PAN: {max_fail_on_model} "
          f"(< {config.BLOCK_THRESHOLD} confirms Layer 1 would have missed it)")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--evade", action="store_true")
    main(ap.parse_args().evade)
