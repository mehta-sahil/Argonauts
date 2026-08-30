# Mule-Account Layering — GNN vs GenAI

Red-team / blue-team lab for money-mule laundering.

An LLM agent plays launderer: it designs a **fan-out → layering →
gather** hop-chain that moves dirty money through recruited mule
accounts. A 2-layer GraphSAGE model plays the FIU: it scores every
account on the transaction graph and flags the mules — including the
"invisible" middle-of-the-chain accounts a plain classifier misses.

Everything is synthetic and runs locally in a few seconds. No real
accounts, banks, or payment data.

---

## What this demonstrates

Real laundering doesn't hide in single transactions — every individual
transfer is an ordinary-looking amount. It hides in **structure**: a
burst of money split across a set of freshly-recruited accounts that
transact among themselves and drain into a shared cash-out, all tracing
back to one source. That shape is what a graph model sees and a
row-per-account classifier doesn't.

The lab makes the point measurable. The **source** account (big dirty
inflow) and the **cash-out** accounts (consolidation drain) are visible
on their own — a tabular classifier catches them. The **layer mules** in
between are given heavy cover traffic so their per-account features sit
inside the normal-customer cloud. Only their position in the graph — one
hop from a flagged node, inside a dense freshly-active cluster — gives
them away.

Held-out test set, mean over 5 stratified splits (`python run.py`):

| | avg precision, all hop-chain accounts | bland layer mules caught (alert budget) |
|---|---|---|
| Logistic regression on node features | ~0.60 | ~64% |
| 2-layer GraphSAGE (same features + graph) | ~0.78 | ~80% |

Same features for both models. The only difference is that GraphSAGE
also aggregates each account's neighbourhood.

---

## Research grounding

**IBM AMLworld** — Altman, Blanuša, von Niederhäusern, Egressy,
Anghel, Atasu, *"Realistic Synthetic Financial Transactions for
Anti-Money Laundering Models"* (NeurIPS Datasets & Benchmarks, 2023).
The laundering typologies (fan-out, fan-in, gather-scatter,
scatter-gather, cycle, stack) and the idea of a hub-heavy background
graph with a small illicit fraction come from here. `background_graph.py`
and `attacker.py` reproduce the shape, downscaled (~720 accounts vs
their millions) so it runs in seconds and stays self-contained.

**Elliptic / GCN for financial crime** — Weber, Domeniconi, Chen,
Weidele, Bellei, Robinson, Leiserson, *"Anti-Money Laundering in
Bitcoin: Experimenting with Graph Convolutional Networks for Financial
Forensics"* (KDD workshop / IEEE, 2019). Establishes node-classification
with a GCN on a transaction graph, and the tabular-vs-GNN comparison.

**GraphSAGE** — Hamilton, Ying, Leskovec, *"Inductive Representation
Learning on Large Graphs"* (NeurIPS 2017). `gcn.py` is the mean
aggregator: each layer concatenates a node's own features with the mean
of its neighbours', so the model can never do worse than a plain
classifier on the same features.

**FRAUD-RLA** — Lunghi et al. (arXiv 2502.02290, 2025). Motivates the
"agent shapes controllable parameters (split, timing, mule count) to
stay under a naive threshold" framing of the attacker.

---

## Architecture

```
attacker.py            LLM agent (or deterministic planner) picks the
  |                     structure: fan-out width, layering depth, gather
  |                     width, per-hop skim, split ratios, hop timing.
  |                     Clamped to keep every account < 5 txns/day.
  v
layering.py            turns the hop-chain into graph edges, adds cover
  |                     traffic to the layer mules, labels the nodes
  v
background_graph.py    ~720 accounts, ~6400 hub-heavy normal txns
  |                     (preferential attachment, mixture-of-lognormal
  |                     amounts) — the crowd to hide in
  v
features.py            13 generic per-account aggregates (degrees,
  |                     counts, volumes, timing) — no hand-built
  |                     "mule score"
  v
gcn.py                 2-layer GraphSAGE-mean, numpy, manual backprop +
  |                     Adam. Trains in ~1 s on CPU.
  v
run.py                 glue: 5 stratified splits, GraphSAGE vs logistic
  |                     regression, writes demo_data.js
  v
prototype.html         D3 force-directed graph: colour by GraphSAGE
                        score / tabular score / ground truth, toggle the
                        laundering transfers, threshold slider
```

---

## Files

| File | Role |
|---|---|
| `config.py` | all constants (graph size, attack bounds, GCN hyperparams) |
| `background_graph.py` | synthetic background transaction graph + mule recruitment pool |
| `attacker.py` | the launderer — Anthropic model (`claude-opus-5`) or deterministic planner, same JSON schema |
| `layering.py` | injects the hop-chains, adds layer-mule cover traffic, builds node labels |
| `features.py` | generic per-account features + train-set standardisation |
| `gcn.py` | 2-layer GraphSAGE-mean in numpy (forward, manual backprop, Adam, AP metric) |
| `run.py` | glue + evaluation, writes `demo_data.js` |
| `prototype.html` | single-file D3 graph explorer (loads `demo_data.js`) |
| `requirements.txt` | numpy, scikit-learn; `anthropic` optional |

---

## How to run

```
cd Argonauts/mule-account-layering
python -m pip install -r requirements.txt

python run.py            # deterministic attacker planner
python run.py --llm      # let an Anthropic model design the structure
                         # (needs `pip install anthropic` + ANTHROPIC_API_KEY
                         #  or `ant auth login`)
```

Then open `prototype.html` in a browser (needs internet the first time —
it pulls d3 from a CDN). Colour the nodes by **GraphSAGE risk score**,
then switch to **Tabular model score** and watch the amber "bland layer
mule" nodes go dark — those are the accounts the graph model keeps and
the classifier drops.

`run.py` prints the mean ± std comparison. `demo_data.js` is
regenerated each run and is git-ignored.

---

## Notes / knobs

- The attacker is genuinely agentic in `--llm` mode: the model chooses
  the laundering *structure* (how wide to fan out, how many layering
  rounds, how much to skim), not a hardcoded template. The deterministic
  planner draws the same parameters from the allowed ranges so the demo
  always runs.
- Difficulty is tunable in `config.py`: `MULE_COVER_TXNS` (how well the
  layer mules blend in), `LAUNDER_TOTAL`, `N_PATTERNS`. More cover
  traffic widens the GraphSAGE-vs-tabular gap.
- PyTorch would be the textbook choice for the GNN; it is not used here
  because it does not fit on the build machine and, at ~720 nodes, a
  numpy GraphSAGE trains faster than torch would import. `gcn.py` is the
  only file that would change to swap it in.

---

## What's next (not built)

- Temporal split (train on weeks 1–3, test on week 4) instead of a
  random node split — closer to how an FIU actually deploys.
- Edge features (amount, delay) on the aggregator.
- A second attacker round that adapts after the model catches it.
