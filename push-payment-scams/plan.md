# Lab: push-payment-scams — LLM scammer vs scam-intent NLP + payment friction

Red-team / blue-team lab for **Authorized Push Payment (APP) fraud** — the
scam where a criminal talks a victim into *authorizing* a payment
themselves. No card is stolen, no account is hacked; the victim presses
send. It is the #1 scam category in the UK (mandatory reimbursement since
Oct 2024) and generative AI is making the "talk them into it" step cheap,
fluent, and adaptive.

Everything is synthetic and runs locally. No real people, messages, or
payments.

---

## The two sides

### Red team — the LLM scammer

`scammer.py` runs a multi-turn conversation trying to get a simulated
victim to push money to an attacker-controlled account. It:

- picks a **scam archetype** (bank-impersonation "safe account", romance,
  invoice/mandate redirection, purchase scam, police/tax impersonation,
  investment, CEO/payroll) — these are the real UK Finance / PSR APP
  categories;
- works the classic social-engineering levers — **urgency, authority,
  scarcity, secrecy, isolation** (Cialdini; the documented psychology of
  APP fraud);
- **adapts across turns**: builds rapport, applies pressure, handles the
  victim's objections, escalates, and only asks for the transfer once the
  victim is softened up.

Two back-ends, same output schema (mirrors `attacker.py` in
`mule-account-layering`):

- **LLM** — Anthropic `claude-opus-5` when a credential is available.
  Genuinely adaptive dialogue.
- **Deterministic dialogue engine** — a per-archetype state machine with
  slot-filled lines, escalation ladder, and objection handlers. Always
  available; this is what generates the training corpus at scale and
  drives the demo offline.

### Victim simulator — `victim.py`

A small victim model with a `suspicion` level. It raises objections
("why can't I do this at the branch?", "how do I know you're really my
bank?"), and complies or disengages depending on how well the scammer
answers and how much pressure is applied. Parameterised by gullibility.
Purpose: produce realistic **two-sided** conversations and drive the live
demo.

### Blue team, layer 1 — scam-intent text classifier (`classifier.py`)

Scores the conversation as it unfolds — this models the bank's in-app
chat / SMS-scanning / "check this message" feature.

Features (grounded in the smishing / scam-text literature — scam messages
are longer, urgency-heavy, name a payee, and carry phone numbers ~97% of
the time / URLs ~32%):

- char n-grams (3–5) + word n-grams (1–2), TF-IDF;
- lexical hits from `lexicons.py`: urgency, authority, secrecy/isolation,
  threat, payment-request, new-account-number / sort-code mentions,
  "move your money", "don't tell the bank staff";
- structural: message length, imperative ratio, digit runs that look like
  account numbers, first-time-in-conversation payee mention.

Model: calibrated **Linear SVM / logistic regression** on TF-IDF +
features. The literature shows linear models within ~2 points of BERT on
this task, and they are the buildable choice here (numpy + scikit-learn
only — no torch / transformers). Outputs a streaming `message_score` and
a running `conversation_score`.

Headline metrics: AUC-PR, precision / recall at an operating point, and
**early detection** — does the score cross threshold *before* the payment
is requested?

### Blue team, layer 2 — payment-risk fusion (`payment_guard.py`)

When a payment is initiated, fuse:

- `conversation_score` from layer 1;
- payment features: first-time payee, payee account age, amount vs the
  customer's history, faster-payment vs scheduled, round amount, odd
  hour, recent limit increase, scam-like words in the payment reference,
  velocity;
- behavioural: did the customer pause on / override a warning.

Fusion model: `HistGradientBoostingClassifier` (sklearn) →
`payment_risk`. Decision policy: **allow / warn (friction) / hold /
block**, mirroring Confirmation of Payee + dynamic scam warnings.

Metrics: share of scam payments stopped, false-positive rate on genuine
payments (the friction cost), and $ prevented.

### Adversarial round — `evade.py`

The scammer rewrites its messages to lower the classifier score while
keeping the intent (synonym swap, drop trigger words, split the ask over
more turns, soften urgency). Retrain, chart detection across rounds
(FRAUD-RLA framing). Expected finding: the **text-only** score degrades,
but the **fusion** layer holds up — a first-time payee is still a
first-time payee. That is the argument for defence-in-depth.

---

## Research grounding

| Claim in the lab | Source |
|---|---|
| APP fraud is the top UK scam category; mandatory reimbursement Oct 2024 | UK Finance Annual Fraud Report; PSR APP scams policy |
| GenAI is "the single most disruptive factor" in 2025 fraud; social engineering at scale | CrowdStrike 2025 Global Threat Report |
| Deepfake fraud reports +1,740% 2022→2023; Arup deepfake-CEO case = $25M | industry reporting (Feedzai, CUNA) |
| Scam-as-a-service AI kits on Telegram ~$20/month | CrowdStrike / ACAMS |
| Scam archetypes: bank-impersonation "safe account", romance, invoice, purchase, authority, investment | UK Finance / PSR APP category taxonomy |
| Social-engineering levers: urgency / authority / scarcity / secrecy / isolation | Cialdini, *Influence*; APP-fraud psychology literature |
| Scam messages measurably longer, urgency terms, phone number ~97%, URL ~32% | SMS/smishing detection literature (Nature Sci Reports 2025; arXiv smishing studies) |
| Linear SVM ≈ BERT −2pts on scam-text classification; TF-IDF + char-CNN competitive | arXiv 2603.11358; SpotSpam (BERT ~98%) |
| Payment-side fusion + dynamic warnings + Confirmation of Payee | Feedzai; UK CoP scheme |
| Adversarial text evasion of fraud classifiers | Lunghi et al., FRAUD-RLA (arXiv 2502.02290); adversarial-NLP paraphrase attacks |

---

## Files

```
push-payment-scams/
  config.py           archetypes, sizes, thresholds, model hyperparams
  lexicons.py         urgency / authority / secrecy / threat / payment word lists (cited inline)
  scammer.py          red team: LLM or deterministic dialogue engine + escalation + objection handlers
  victim.py           victim simulator (suspicion, objections, compliance)
  corpus.py           generate labelled scam + hard-negative legit conversations -> data/conversations.jsonl
  features.py         message + conversation feature extraction (TF-IDF built in classifier)
  classifier.py       scam-intent linear model, streaming per-message + per-conversation score
  payment_guard.py    fusion of conversation score + payment features -> allow/warn/hold/block
  evade.py            adversarial paraphrase round + retrain, detection-vs-round curve
  run.py              glue: corpus -> classifier -> fusion -> eval -> adversarial -> demo_data.js
  prototype.html      D3/HTML: chat replay, per-message risk, payment decision, metrics, arms-race chart
  requirements.txt    numpy, scikit-learn ; anthropic optional
  README.md
```

---

## Build order

1. `config.py`, `lexicons.py` — constants and word lists.
2. `scammer.py` + `victim.py` — deterministic engine first (LLM path is a thin wrapper added after).
3. `corpus.py` — produce `data/conversations.jsonl` with scam + legit, inspect class balance and that legit conversations are genuinely hard (they also discuss money / accounts / urgency).
4. `features.py` + `classifier.py` — train, report AUC-PR + early-detection turn.
5. `payment_guard.py` — fusion model, allow/warn/hold/block policy, $ saved.
6. `evade.py` — one adversarial round, detection-vs-round curve.
7. `run.py` — glue + `demo_data.js`.
8. `prototype.html` — chat replay UI with the two-layer decision.
9. `README.md`, parent README entry, `.gitignore` for `data/` + `demo_data.js`.
10. Headless-render check, commit, push.

## Verification

- `python corpus.py` → balanced labelled corpus; spot-check 3 scam + 3 legit transcripts read realistically.
- `python run.py` prints: classifier AUC-PR (target > 0.9), early-detection (scam flagged before the payment ask in most conversations), fusion payments-stopped % and legit FP rate, adversarial degradation (text-only drops, fusion holds).
- `prototype.html` renders headless: pick a scam scenario → messages light up red as pressure builds → payment panel blocks; pick a legit scenario → stays green, payment allowed.

## Constraints / deviations

- **No PyTorch / transformers / HF models** — disk is full and the
  research says linear + TF-IDF is competitive for scam text. If that
  changes, only `classifier.py` swaps.
- `anthropic` is optional; the deterministic dialogue engine is the
  default and generates the corpus. `--llm` upgrades the scammer (and
  optionally the victim) to `claude-opus-5`.
- Local only, like `mule-account-layering`.

## Out of scope

- Voice / audio deepfakes (needs audio models + datasets).
- Real message data (synthetic only).
- Multi-language (English only).
