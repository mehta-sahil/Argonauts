"""
The battle: the voice-cloning attacker vs each defence config.

    python run.py

For every (config x scenario) it runs an adaptive episode across the
clone-quality sweep, then reports fraud success rate, anti-spoof EER, and
genuine-call friction, and writes demo_data.js.
"""

from __future__ import annotations

import json

import numpy as np

import biomarkers as bm
from antispoof import eer, train as train_antispoof
from authprotocol import decide, required_step
from cloner import Cloner
from config import (AVG_FRAUD_LOSS, DEFENSE_CONFIGS, DEMO_DATA_PATH, MAX_ROUNDS,
                    QUALITY_SWEEP, SCENARIOS)
from context import train as train_context
from genuine import genuine_call
import voiceprint


class Defense:
    def __init__(self, name, antispoof, context, rng):
        self.name = name
        self._as = antispoof
        self._ctx = context
        self.rng = rng
        self.voiceprint_on = name in ("voiceprint", "full")
        self.antispoof_on = name in ("antispoof", "full")
        self.context_on = name in ("context", "full")
        self.protocol_on = name == "full"

    def screen(self, call: dict) -> dict:
        """Returns {passed, blocked_by, detail, layers:{...}}."""
        layers = {}
        vp = voiceprint.match_score(call, self.rng)
        layers["voiceprint"] = {"score": round(vp, 2), "accepts": voiceprint.accepts(vp)}
        if self.voiceprint_on and not voiceprint.accepts(vp):
            return {"passed": False, "blocked_by": "voiceprint",
                    "detail": "voice does not match the enrolled speaker", "layers": layers}

        sp = self._as.spoof_prob(call["biomarkers"])
        flagged = bm.flagged_families(call["biomarkers"])
        is_spoof = sp >= self._as.threshold
        layers["antispoof"] = {"spoof_prob": round(sp, 3), "is_spoof": is_spoof,
                               "flagged": flagged}
        cr = self._ctx.risk(call)
        ctx_high = cr >= self._ctx.threshold
        layers["context"] = {"risk": round(cr, 3), "high": ctx_high}

        # single-layer configs hard-block on their own flag
        if self.name == "antispoof" and is_spoof:
            return {"passed": False, "blocked_by": "antispoof",
                    "detail": f"liveness check failed (spoof prob {sp:.2f})",
                    "flagged": flagged, "layers": layers}
        if self.name == "context" and ctx_high:
            return {"passed": False, "blocked_by": "context",
                    "detail": f"call-context risk {cr:.2f} (new payee / urgency / secrecy)",
                    "layers": layers}

        # full: anti-spoof / context are ADVISORY — a flagged call is not
        # dropped, it is escalated to the deterministic protocol, which is the
        # final arbiter. (A clean call still faces the protocol on amount / payee.)
        if self.protocol_on:
            d = decide(call)
            escalated = is_spoof or ctx_high
            layers["protocol"] = {**d, "escalated": escalated}
            if not d["money_moves"]:
                why = "flagged by " + ("liveness+context" if is_spoof and ctx_high
                                       else "liveness" if is_spoof else "context" if ctx_high
                                       else "policy") + f" -> {d['step']}: {d['detail']}"
                return {"passed": False, "blocked_by": "auth_protocol", "detail": why,
                        "flagged": flagged, "layers": layers}
            return {"passed": True, "blocked_by": None, "detail": d["detail"], "layers": layers}

        # voiceprint-only / none: payment goes through on whatever cleared
        return {"passed": True, "blocked_by": None,
                "detail": "voice auth accepted", "layers": layers}


PREP_CAP = 12


def _episode(defense, scenario, quality, rng, seed):
    """The attacker privately iterates a call against the probabilistic
    detectors (anti-spoof, context) until it has one that clears them —
    that's the arms race. Then it places the call, which faces voiceprint
    and the deterministic auth protocol. The protocol is the only layer
    the attacker cannot iterate against."""
    cloner = Cloner(scenario, quality, rng, seed=seed)
    turns = []
    call = cloner.call()

    protocol_tries = 0
    for _ in range(PREP_CAP):
        scr = defense.screen(call)
        turns.append({"round": len(turns), "call": _slim_call(call), "screen": scr})
        if scr["passed"] or scr["blocked_by"] in (None, "voiceprint"):
            break
        if scr["blocked_by"] == "auth_protocol":
            protocol_tries += 1
            # try to look clean so the call isn't escalated; give up once a
            # non-flagged call STILL hits the protocol (or after a few tries)
            if not scr["layers"]["protocol"].get("escalated") or protocol_tries >= 3:
                break
            cloner.adapt("antispoof", scr.get("flagged", []))
            cloner.adapt("context", [])
        else:
            cloner.adapt(scr["blocked_by"], scr.get("flagged", []))
        call = cloner.call()

    # delivery: one real call. The attacker tuned against its own copy of the
    # detectors, but the bank's models differ and each utterance is a fresh
    # draw — a residual chance the live call still trips a probabilistic layer.
    if turns[-1]["screen"]["passed"]:
        deliver = cloner.call()
        scr = defense.screen(deliver)
        turns.append({"round": len(turns), "call": _slim_call(deliver),
                      "screen": scr, "delivery": True})

    last = turns[-1]["screen"]
    success = last["passed"]
    return {"scenario": scenario, "defense": defense.name, "quality": quality,
            "turns": (turns[:MAX_ROUNDS] + turns[-1:]) if len(turns) > MAX_ROUNDS + 1 else turns, "success": success, "rounds": len(turns),
            "final_quality": round(call["clone_quality"], 2),
            "final_evasions": sorted(cloner.evasions),
            "blocked_by": None if success else last["blocked_by"]}


def _slim_call(c):
    return {"scenario": c["scenario"], "transcript": c["transcript"],
            "meta": c["meta"], "clone_quality": c["clone_quality"],
            "evasions": c["evasions"], "context_evasion": c.get("context_evasion", 0), "biomarkers": {k: round(v, 3) for k, v in c["biomarkers"].items()},
            "flagged": bm.flagged_families(c["biomarkers"])}


def _friction(defense, rng, n=60):
    """Genuine calls wrongly stopped, and small known-payee calls that get
    an avoidable callback."""
    blocked = escalated = small = 0
    for i in range(n):
        sc = SCENARIOS[i % 2]
        g = genuine_call(sc, rng, seed=9000 + i)
        scr = defense.screen(g)
        would_accept = required_step(g) == "accepted"
        if would_accept:
            small += 1
        if not scr["passed"]:
            blocked += 1
        elif would_accept and scr["layers"].get("protocol", {}).get("step") not in (None, "accepted"):
            escalated += 1
    return {"blocked": blocked, "n": n, "small_calls": small, "needless_callbacks": escalated}


def main():
    rng = np.random.default_rng(7)
    antispoof, (as_test,) = train_antispoof()
    context = train_context()

    Xte = [r["x"] for r in as_test]; yte = [r["y"] for r in as_test]
    as_eer = eer(yte, antispoof.probs(Xte))

    defenses = {c: Defense(c, antispoof, context, rng) for c in DEFENSE_CONFIGS}

    episodes = []
    summary = {}
    for cfg, dfn in defenses.items():
        rates = {}
        for q in QUALITY_SWEEP:
            wins = 0
            for sc in SCENARIOS:
                ep = _episode(dfn, sc, q, rng, seed=int(q * 1000) + hash(sc + cfg) % 500)
                episodes.append(ep)
                wins += ep["success"]
            rates[q] = wins / len(SCENARIOS)
        overall = float(np.mean(list(rates.values())))
        fr = _friction(dfn, rng)
        summary[cfg] = {"fraud_rate": round(overall, 3),
                        "fraud_by_quality": {str(k): round(v, 3) for k, v in rates.items()},
                        "friction": fr}

    print(f"anti-spoof held-out EER: {as_eer:.3f}\n")
    print(f"{'config':<12} {'fraud rate':>11} {'genuine blocked':>16} {'needless callbacks':>19}")
    for cfg in DEFENSE_CONFIGS:
        s = summary[cfg]; f = s["friction"]
        print(f"{cfg:<12} {s['fraud_rate']:>10.0%} {f['blocked']:>10}/{f['n']} "
              f"{f['needless_callbacks']:>13}/{f['small_calls']}")

    # anti-spoof detection vs quality / evasions (for the adversarial chart)
    det_curve = []
    for q in QUALITY_SWEEP:
        d = np.mean([antispoof.is_spoof(bm.sample_clone(rng, q)) for _ in range(300)])
        det_curve.append({"quality": q, "detected": round(float(d), 3)})

    _write_demo(episodes, summary, as_eer, det_curve)
    print(f"\nwrote {DEMO_DATA_PATH}")


def _write_demo(episodes, summary, as_eer, det_curve):
    # keep one episode per (config, scenario, quality-bucket) so the UI slider
    # can show a real transcript at low / mid / high clone quality
    buckets = {0.2: "low", 0.35: "low", 0.5: "mid", 0.65: "mid", 0.8: "high", 0.95: "high"}
    keep = {}
    for ep in episodes:
        k = (ep["defense"], ep["scenario"], buckets.get(ep["quality"], "mid"))
        if k not in keep or abs(ep["quality"] - {"low": 0.3, "mid": 0.6, "high": 0.9}[k[2]]) \
                < abs(keep[k]["quality"] - {"low": 0.3, "mid": 0.6, "high": 0.9}[k[2]]):
            keep[k] = ep

    payload = {
        "episodes": list(keep.values()),
        "summary": summary,
        "antispoof_eer": round(as_eer, 3),
        "detection_curve": det_curve,
        "quality_sweep": QUALITY_SWEEP,
        "avg_loss": AVG_FRAUD_LOSS,
        "narrative": (
            "An attacker clones a voice from a few seconds of public audio and phones "
            "in a payment authorization. Voiceprint matching passes the clone. The "
            "anti-spoof classifier catches low-quality clones but loses to a good one "
            "with evasions. Only the deterministic callback / dual-authorization "
            "protocol stops a perfect clone — it can't answer a call to the real "
            "registered number."),
    }
    with open(DEMO_DATA_PATH, "w", encoding="utf-8") as fh:
        fh.write("window.DEMO = ")
        json.dump(payload, fh, indent=1)
        fh.write(";\n")




if __name__ == "__main__":
    main()
