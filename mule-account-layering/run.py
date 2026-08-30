"""
Glue: background graph -> attacker designs layering -> inject -> GCN
flags the mule accounts -> write demo_data.js for prototype.html.

    python run.py               # deterministic attacker planner
    python run.py --llm         # use an Anthropic model for the structure
                                # (needs ANTHROPIC_API_KEY + `pip install anthropic`)

Prints test-set metrics. The GCN sees the whole graph (transductive);
loss is computed only on the train mask, metrics only on the held-out
test mask.
"""

import argparse
import json

import numpy as np

from config import DEMO_DATA_PATH, VIZ_MAX_NORMAL_LINKS
import background_graph
import layering
import features as feat
from gcn import GCN, neighbor_mean_operator, split_masks, _ap


def _tabular_scores(X, y, train):
    """Logistic regression on the same node features, no graph structure —
    the fair 'why not just a classifier' comparison. Returns a score per node."""
    from sklearn.linear_model import LogisticRegression
    clf = LogisticRegression(max_iter=2000, class_weight="balanced")
    clf.fit(X[train], y[train])
    return clf.predict_proba(X)[:, 1]


def _caught(score, mask, targets, budget):
    """How many `targets` (bool, node-indexed) fall in the top-`budget`
    scored nodes within `mask`."""
    ids = np.where(mask)[0]
    top = set(ids[np.argsort(-score[mask])[:budget]])
    return int(sum(targets[i] for i in top))


def _metrics(y, score, mask):
    ap = _ap(y[mask], score[mask])
    k = int(y[mask].sum())
    top = np.argsort(-score[mask])[:k]
    prec_at_k = y[mask][top].mean() if k else 0.0
    # recall of the *whole* injected operation, at the top-k operating point
    flagged = set(np.where(mask)[0][top])
    chain = set(np.where(y == 1)[0])
    chain_recall = len(flagged & chain & set(np.where(mask)[0])) / max(
        len(chain & set(np.where(mask)[0])), 1)
    return {"average_precision": round(ap, 3),
            "precision_at_k": round(float(prec_at_k), 3),
            "recall_at_k": round(float(chain_recall), 3),
            "k": k}


def main(use_llm: bool):
    accounts, txns = background_graph.build_background()
    accounts, txns, labels, layer_mule, patterns = layering.inject(
        accounts, txns, use_llm=use_llm)
    n = len(accounts)
    print(f"graph: {n} accounts, {len(txns)} transactions "
          f"({sum(t['kind']=='launder' for t in txns)} laundering), "
          f"{int(labels.sum())} accounts in a hop-chain")
    for p in patterns:
        print(f"  pattern {p['pattern_id']}: fan-out {p['fanout']} -> "
              f"{p['layers']} layer round(s) -> gather {p['gather']}, "
              f"skim {p['cut_per_hop']:.0%}/hop  [{p['backend']}]")

    edges = [(t["src"], t["dst"]) for t in txns]
    P = neighbor_mean_operator(n, edges)
    Xraw = feat.build_features(accounts, txns)

    # Evaluate over several stratified splits — the positive set is small,
    # so a single split is noisy. Report mean +/- std. Split 0's model
    # feeds the visualisation.
    gcn_ap, lr_ap, gcn_hit, lr_hit, n_bland_all = [], [], [], [], []
    keep_score = keep_lr = keep_metrics = None
    for s in range(5):
        train, val, test = split_masks(labels, seed=s)
        X = feat.standardize(Xraw, train)
        model = GCN(X.shape[1]).train(P, X, labels, train, val, verbose=(s == 0))
        score = model.scores(P, X)
        lr_score = _tabular_scores(X, labels, train)

        gcn_ap.append(_ap(labels[test], score[test]))
        lr_ap.append(_ap(labels[test], lr_score[test]))
        budget = int(labels[test].sum())
        n_b = int((test & layer_mule).sum())
        n_bland_all.append(n_b)
        gcn_hit.append(_caught(score, test, layer_mule, budget) / max(n_b, 1))
        lr_hit.append(_caught(lr_score, test, layer_mule, budget) / max(n_b, 1))

        if s == 0:
            keep_score, keep_lr = score, lr_score
            keep_metrics = _metrics(labels, score, test)

    def ms(v):
        return f"{np.mean(v):.2f} +/- {np.std(v):.2f}"

    print("\n=== held-out test set, mean over 5 stratified splits ===")
    print("average precision over all hop-chain accounts:")
    print(f"  logistic reg. on node features        : {ms(lr_ap)}")
    print(f"  2-layer GraphSAGE (same feats + graph) : {ms(gcn_ap)}")
    print("\nfraction of the feature-bland layer mules caught within the alert budget:")
    print(f"  logistic reg.  : {ms(lr_hit)}")
    print(f"  GraphSAGE      : {ms(gcn_hit)}")

    summary = {
        "gcn_ap_mean": round(float(np.mean(gcn_ap)), 3),
        "gcn_ap_std": round(float(np.std(gcn_ap)), 3),
        "lr_ap_mean": round(float(np.mean(lr_ap)), 3),
        "lr_ap_std": round(float(np.std(lr_ap)), 3),
        "gcn_bland_recall_mean": round(float(np.mean(gcn_hit)), 3),
        "lr_bland_recall_mean": round(float(np.mean(lr_hit)), 3),
        "n_layer_mules": int(np.sum(layer_mule)),
        **keep_metrics,
    }
    _write_demo(accounts, txns, labels, layer_mule, keep_score, keep_lr, patterns, summary)
    print(f"\nwrote {DEMO_DATA_PATH} — open prototype.html")


def _write_demo(accounts, txns, labels, layer_mule, score, lr_score, patterns, metrics):
    deg = np.zeros(len(accounts))
    for t in txns:
        deg[t["src"]] += 1; deg[t["dst"]] += 1

    stage_of = {}
    for p in patterns:
        stage_of[p["source"]] = "source"
        for mu in p["mules"]:
            stage_of.setdefault(mu, "mule")
        for co in p["cashout"]:
            stage_of.setdefault(co, "cashout")

    nodes = [{"id": a["id"], "kind": a["kind"],
              "score": round(float(score[a["id"]]), 4),
              "lr_score": round(float(lr_score[a["id"]]), 4),
              "label": int(labels[a["id"]]),
              "layer_mule": bool(layer_mule[a["id"]]),
              "stage": stage_of.get(a["id"], ""),
              "degree": int(deg[a["id"]])}
             for a in accounts]

    launder = [t for t in txns if t["kind"] == "launder"]
    normal = [t for t in txns if t["kind"] == "normal"]
    rng = np.random.default_rng(0)
    keep = rng.choice(len(normal), min(VIZ_MAX_NORMAL_LINKS, len(normal)), replace=False)
    links = ([{"source": t["src"], "target": t["dst"], "amount": t["amount"],
               "kind": "normal"} for i in keep for t in [normal[i]]]
             + [{"source": t["src"], "target": t["dst"], "amount": t["amount"],
                 "kind": "launder", "stage": t["stage"]} for t in launder])

    meta = {
        "patterns": patterns,
        "metrics": metrics,
        "n_accounts": len(accounts),
        "n_txns": len(txns),
        "n_launder_txns": len(launder),
        "narrative": (
            "An LLM agent designs a money-mule laundering chain the way real "
            "launderers structure fan-out / layering / gather patterns; a graph "
            "neural net trained on transaction topology flags the mule accounts "
            "even though no single transfer looks suspicious on its own."),
    }
    with open(DEMO_DATA_PATH, "w") as fh:
        fh.write("window.DEMO = ")
        json.dump({"nodes": nodes, "links": links, "meta": meta}, fh, indent=1)
        fh.write(";\n")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--llm", action="store_true", help="use an Anthropic model for the attack structure")
    main(ap.parse_args().llm)
