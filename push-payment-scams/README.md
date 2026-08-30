# Push-Payment Scams — LLM scammer vs scam-intent NLP + payment friction

Red-team / blue-team lab for **Authorized Push Payment (APP) fraud** — the
scam where a criminal talks a victim into *authorizing* the payment
themselves. No card is stolen, no account is hacked; the victim presses
send. It is the largest scam category by value in the UK (mandatory
reimbursement since Oct 2024), and generative AI has made the
"talk them into it" step cheap, fluent, and adaptive.

Everything is synthetic and runs locally in a few seconds. No real
people, messages, or payments.

---

## The two sides

### Red team — the scammer (`scammer.py`)

A dialogue engine that runs a multi-turn conversation to get a simulated
victim to push money to an attacker account. It picks a **scam archetype**
(bank-impersonation "safe account", romance, invoice/mandate redirection,
purchase, police/tax impersonation, investment, CEO/payroll — the real UK
Finance / PSR categories), opens with something **completely benign**,
then works the classic social-engineering levers — urgency, authority,
scarcity, secrecy, isolation — building pressure and handling the
victim's objections before it ever mentions a transfer.

Two back-ends, same output:

- **deterministic** — a per-archetype state machine (open → rapport →
  pressure → objection handling → ask → close) with slot-filled lines.
  Always runs; generates the training corpus.
- **LLM** (`--llm`) — hands the dialogue to `claude-opus-5` for genuinely
  adaptive conversation. Falls back to the deterministic engine with no
  key / package.

`victim.py` is a small rule-based victim (a `suspicion` level, objections,
compliance) that produces the customer side.

### Blue team, layer 1 — scam-intent text classifier (`classifier.py`)

Scores every message as the conversation unfolds — models the bank's
in-app chat / SMS-scanning / "check this message" feature.

- char n-grams (3–5) + word n-grams (1–2) TF-IDF;
- hand-crafted lexical hits (`lexicons.py`): urgency, authority,
  secrecy/isolation, threat, payment-request, reassurance, plus the
  genuine-bank markers that legit messages use;
- structure: length, imperative verbs, account-number / sort-code
  patterns, question and exclamation counts.

Model: a calibrated **linear model** (logistic regression, class-weighted).
The smishing / scam-text literature puts linear models within ~2 points
of a transformer here, and they need no GPU or large download.

The **conversation score** at turn *t* is the running max over the other
party's messages so far — a benign opener doesn't sink it, and once
pressure starts it stays flagged. Headline: does it cross threshold
*before* the payment is requested?

### Blue team, layer 2 — payment-risk fusion (`payment_guard.py`)

When the payment is initiated, a gradient-boosted model fuses:

- the layer-1 conversation score;
- payment features — first-time payee, amount, faster-payment vs
  scheduled, round amount, scam-like words in the reference, a recent
  limit increase, time of day;
- the number of message turns before the payment.

Decision policy: **allow / warn / hold / block**, mirroring Confirmation
of Payee + dynamic scam warnings. Metrics: share of scam payments
stopped, friction on genuine payments, and $ prevented.

### Adversarial round (`evade.py`)

The scammer rewrites its messages to slip under the text model:
vocabulary softening plus a greedy query-based word attack (TextFooler
style — Jin et al., AAAI 2020) that deletes the word that most lowers the
score, up to a budget. Result: the **text-only** recall falls sharply as
the attack strengthens, while the **fusion** recall barely moves — a
first-time payee and a large instant transfer can't be reworded. That gap
is the case for defence-in-depth (FRAUD-RLA, arXiv 2502.02290, makes the
same argument for transaction models).

---

## Results (held-out, `python run.py`)

Scam conversations come in two flavours:

- **pressure** (~75%) — the scammer works urgency / authority / secrecy /
  threat. These are also passed through a random softener + surface
  mutator (`mutate.py`), and ~30% are "soft" (already de-risked
  language). The text still gives them away.
- **camouflaged** (~28%) — generated from the *same templates as a
  genuine marketplace sale / invoice / bill-split*. No tells at all; only
  the metadata (a fresh payee, goods that never arrive) betrays them.
  These are meant to slip past a text model.

| | |
|---|---|
| scam-intent classifier — conversation AUC-PR | **~0.95** |
| recall — **pressure** scams | ~100% |
| recall — **camouflaged** scams | **~25–30%** (they read like normal transactions) |
| flagged **before** the payment ask | ~70–75% of scam conversations |
| novel archetype (`investment` held out of training) | ~100% recall |
| payment guard — scam payments stopped, overall | **~90%** |
| payment guard — pressure / camouflaged | ~100% / ~70% |
| payment guard — genuine friction / hard false-block | ~2% / ~2% |
| adversarial: text-only recall vs paraphrase strength | **~0.76 → ~0.59** |
| adversarial: fusion recall | flat (~0.90) |

The story: the text layer catches overt manipulation and flags it several
turns before the victim is asked to pay, but it misses conversations
written to look ordinary. The payment guard recovers most of those via
payment features (fresh payee, amount, instant transfer) — but not all.
Fully camouflaged low-value scams evade both layers; catching those needs
downstream signals (payee-account reputation, mule-network features,
goods-not-received reports) this lab doesn't model. The hardest single
case — **invoice-redirect scam text is nearly identical to a genuine "our
bank details changed" message** (`legit.genuine_bank_detail_change`) — is
separated only at the payment step, if at all.

The templates are still synthetic and finite, so a live deployment on
real traffic would score differently — but the corpus is no longer
trivially separable, and the numbers above move when you retune
`CAMOUFLAGE_RATE`, `INTENSITY`, and `mutate.py`.

---

## Research grounding

| Claim | Source |
|---|---|
| APP fraud is the top UK scam by value; mandatory reimbursement Oct 2024 | UK Finance Annual Fraud Report; PSR APP scams policy |
| GenAI is "the single most disruptive factor" in 2025 fraud; social engineering at scale | CrowdStrike 2025 Global Threat Report |
| Deepfake fraud reports +1,740% 2022→2023; Arup deepfake-CEO case = $25M; scam-as-a-service AI kits ~$20/mo | Feedzai, CUNA, ACAMS reporting |
| Scam archetypes taxonomy | UK Finance / PSR APP categories |
| Social-engineering levers (urgency / authority / scarcity / secrecy / isolation) | Cialdini, *Influence*; APP-fraud psychology literature |
| Scam messages measurably longer, urgency-heavy, phone ~97% / URL ~32% | SMS/smishing detection literature (Nature Sci Reports 2025) |
| Linear model ≈ transformer −2pts on scam text | arXiv 2603.11358; SpotSpam |
| Payment-side fusion, dynamic warnings, Confirmation of Payee | Feedzai; UK CoP scheme |
| Camouflaged / "no red flags" scams that read like ordinary transactions | UK Finance purchase-scam & invoice-fraud case data |
| Greedy word-substitution attack on text classifiers | Jin et al., "Is BERT Really Robust?", AAAI 2020 |
| Adversarial evasion of fraud models; defence-in-depth | Lunghi et al., FRAUD-RLA, arXiv 2502.02290 |

---

## Files

| File | Role |
|---|---|
| `config.py` | archetypes, corpus size, thresholds, hyperparams |
| `lexicons.py` | urgency / authority / secrecy / threat / payment word lists |
| `scammer.py` | red team — deterministic dialogue engine + LLM back-end |
| `mutate.py` | generation-time surface mutation (synonyms, contractions, fillers, casing, typos) applied to every line |
| `victim.py` | victim simulator (suspicion, objections, compliance) |
| `legit.py` | genuine hard-negative conversations (incl. the bank-detail-change look-alike) |
| `corpus.py` | build `data/conversations.jsonl` — pressure + camouflaged scams + hard negatives |
| `features.py` | per-message lexical / structural features |
| `classifier.py` | scam-intent linear model, streaming per-message + per-conversation score |
| `payment_guard.py` | fusion model + allow/warn/hold/block policy |
| `evade.py` | adversarial paraphrase + greedy word attack, detection-vs-strength curve |
| `run.py` | glue → `demo_data.js` |
| `prototype.html` | chat replay UI: per-message risk, rising conversation score, payment decision, arms-race chart |
| `requirements.txt` | numpy, scikit-learn ; `anthropic` optional |

---

## How to run

```
cd Argonauts/push-payment-scams
python -m pip install -r requirements.txt

python corpus.py            # -> data/conversations.jsonl (inspect a few transcripts)
python run.py               # train both layers, adversarial round, write demo_data.js
python run.py --llm         # scammer driven by an Anthropic model
python run.py --fresh       # rebuild the corpus first
```

Then open `prototype.html` (needs internet once — it pulls d3 from a CDN).
Pick a scenario, press **Play**, and watch the conversation score rise as
the scammer applies pressure; the payment guard's verdict appears when the
customer tries to send money. Switch to a genuine scenario and it stays
green.

`data/` and `demo_data.js` are git-ignored (regenerated by `run.py`).

---

## Constraints / deviations

- **No PyTorch / transformers / HF models** — the build machine's disk is
  full, and the research says linear + TF-IDF is competitive for scam
  text. Only `classifier.py` would change to swap in a transformer.
- `anthropic` is optional; the deterministic engine is the default.
- Local only, like `mule-account-layering`.

## Out of scope

- Voice / audio deepfakes (needs audio models + datasets).
- Real message data; multi-language.
