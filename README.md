# Argonauts — AI Defense Labs for Payment & Identity Fraud

*Mastercard Innovation Challenge 2026 · Global Fintech Fest*

Six self-contained red-team / blue-team labs. Each one takes a real
payment- or identity-fraud attack, builds a working AI-driven attacker
against it, and then shows the layered defence that stops it — measured,
not asserted. Everything is synthetic and sandboxed: no real cards,
banks, merchants, accounts, audio, faces, or payment networks are ever
contacted.

The labs share one thesis, and every result restates it:

> **Probabilistic detectors lose the arms race; deterministic
> constraints win it.** A guardrail classifier, an anti-spoof model, a
> scam-intent NLP layer, or a fraud-velocity score can each be evaded by
> a good-enough adversary. What holds the line is a rule enforced *in
> code* — a policy engine that gates the money, an out-of-band callback
> to a registered number, a per-PAN counter the attacker can't see, a
> randomized liveness challenge a recording can't answer. The ML layers
> aren't wasted: they buy time, raise the attacker's cost, and catch the
> lazy majority — but the deterministic gate is the thing you rely on
> for the fake you didn't anticipate.

---

## The labs

| Lab | Attack | The defence that actually holds | Stack | Runs on |
|---|---|---|---|---|
| **[Kyc identity theft](./Kyc%20identity%20theft/)** | Deepfake video injection + synthetic/stolen ID passed to a KYC liveness check | Randomized **optical Flash-PAD** + **action challenge** a recording can't react to, then a 1:1 ArcFace verdict | FastAPI · React/Vite · MediaPipe · ONNX ArcFace · WebSocket | Live web app (Docker/ECR) |
| **[distributed-cvv-guessing](./distributed-cvv-guessing/)** | CVV brute-force spread across many merchants to stay under each one's rate limit | Centralized **per-PAN mismatch counter** (blocks at 5) + a LightGBM velocity model for slow-and-low | AWS Lambda · DynamoDB Streams · LightGBM | Live AWS |
| **[mule-account-layering](./mule-account-layering/)** | LLM launderer designs a fan-out → layering → gather hop-chain through mule accounts | **2-layer GraphSAGE** on the transaction graph — catches the invisible middle-of-chain mules a tabular model misses | numpy GraphSAGE · scikit-learn · D3 | Local |
| **[push-payment-scams](./push-payment-scams/)** | LLM scammer social-engineers a victim into *authorizing* an APP transfer | Streaming **scam-intent NLP** (flags before the payment ask) fused with **payment-risk features** (fresh payee, amount, instant) | TF-IDF linear model · gradient boosting · D3 | Local |
| **[chatbot-prompt-injection](./chatbot-prompt-injection/)** | Adversarial Gemini agent jailbreaks a bank support bot into a $500 refund and a prompt leak | **Deterministic policy engine** gates the refund tool in code + an output canary scan for the leak | Gemini · numpy/scikit-learn guardrail · policy engine | Local (real Gemini via `--llm`) |
| **[voice-auth-bypass](./voice-auth-bypass/)** | Cloned voice phones in a payment authorization (CEO-fraud / "family bail") | **Out-of-band callback / dual-authorization** protocol — a perfect clone can't answer the call to the real registered number | scikit-learn anti-spoof · logistic context model · D3 | Local (feature-level, no audio) |

Each lab folder carries its own detailed `README.md` (research grounding,
architecture, file inventory, results tables, and run instructions).
Start with a lab's README before running it.

---

## Repository layout

```
Argonauts/
├── Kyc identity theft/          # flagship live app + the unified hub landing page
│   ├── backend/                 # FastAPI 6-phase pipeline + tests
│   ├── frontend/                # React/Vite — serves the Hub (/) and the KYC app (/kyc)
│   │   └── public/labs/         # the 5 static lab prototypes, served at /labs/<slug>/
│   ├── redteam/                 # deepfake-injection attacker against the pipeline
│   ├── models/                  # ArcFace / face-detector model downloader
│   ├── docs/                    # per-phase architecture specs + algorithms
│   ├── tickets/                 # tracer-bullet delivery tickets
│   └── Dockerfile               # backend container (built & pushed by CI)
├── distributed-cvv-guessing/    # AWS Lambda + DynamoDB + LightGBM Layer-2
│   ├── sim/  ml/                # local labeled-data sim + the ML model
├── mule-account-layering/       # numpy GraphSAGE vs LLM launderer
├── push-payment-scams/          # scam-intent NLP + payment fusion
├── chatbot-prompt-injection/    # LLM firewall + deterministic policy engine
├── voice-auth-bypass/           # anti-spoof biomarkers + callback protocol
└── .github/workflows/           # CI: build & test the KYC backend image, push to ECR
```

### The unified hub

The KYC frontend doubles as the front door for the whole project. Its
React bundle does lightweight path-based routing (`frontend/src/main.jsx`):

- **`/`** → the **Hub** landing page (`Hub.jsx`), a card per lab linking
  to each simulation;
- **`/kyc`** → the live KYC verification app;
- **`/labs/<slug>/`** → the five other labs, shipped as their
  self-contained static `prototype.html` prototypes under
  `frontend/public/labs/`, served directly by the web server.

So the five local labs are both runnable standalone (each has its own
`run.py` → `demo_data.js` → `prototype.html`) and reachable as static
demos through the hub.

---

## Running a lab

Every lab is independent. In short:

- **KYC** — a FastAPI backend (`python -m uvicorn app.main:app`) plus a
  Vite dev server (`npm run dev`); open `http://localhost:5173`. See the
  [KYC README](./Kyc%20identity%20theft/README.md).
- **distributed-cvv-guessing** — seed synthetic cards into DynamoDB, open
  `prototype.html` against the Lambda Function URL; train the Layer-2 ML
  model locally with the `sim/` + `ml/` pipeline. See the
  [CVV README](./distributed-cvv-guessing/README.md).
- **mule / push-payment / chatbot / voice** — `pip install -r
  requirements.txt`, `python run.py` (add `--llm` where noted for a real
  model), then open that lab's `prototype.html`. Each writes a
  git-ignored `demo_data.js` the prototype loads.

The prototypes pull D3 from a CDN, so they need internet the first time.

---

## Deployment & CI

The KYC backend is containerized ([`Kyc identity theft/Dockerfile`](./Kyc%20identity%20theft/Dockerfile)):
a build stage fetches the ArcFace `w600k_r50.onnx` weights, the runtime
stage pins Python 3.12 (numpy wheel constraint) on `opencv-python-headless`.
The GitHub Actions workflow
([`.github/workflows/kyc-backend-image.yml`](./.github/workflows/kyc-backend-image.yml))
assumes an AWS role via **OIDC** (no long-lived keys), builds the image,
**runs the pytest suite inside the built image**, and only then pushes it
to ECR — a broken image is never published.

The distributed-cvv-guessing lab runs live on AWS (Lambda + DynamoDB
Streams) in `us-east-1`; its README documents every resource and a full
teardown script.

---

## What's committed vs generated

Secrets and live endpoints are never committed. `.env` files, `config.js`
files carrying real Lambda / API URLs, and every generated
`demo_data.js` / `events.parquet` / training artifact are git-ignored —
re-create them by running the lab. Each lab README says exactly what to
regenerate.

---

## Adding a lab

New attack types go in their own sibling folder, named after the attack
(for example `bin-attack`, `account-takeover`, `token-replay`). Keep each
lab self-contained: its own README, data generator, attack driver,
defence, prototype, and any cloud resources. To surface it in the hub,
add a card to `LABS` in
`Kyc identity theft/frontend/src/Hub.jsx` and drop its static prototype
under `frontend/public/labs/<slug>/`.
