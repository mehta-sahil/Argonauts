# Argonauts

Red-team / blue-team labs for payment and card fraud attacks. Each
subfolder is one attack type: a synthetic, sandboxed simulation of the
attack plus the detection and mitigation that stops it. No real cards,
banks, merchants, or payment networks are ever contacted.

## Labs

- **distributed-cvv-guessing** - Distributed CVV enumeration. An attacker
  brute-forces an unknown CVV by spreading guesses across many merchants
  to stay under each merchant's rate limit. The issuing bank catches it
  with a centralized per-PAN mismatch counter and blocks the card.
  Runs on live AWS (Lambda + DynamoDB Streams).

- **mule-account-layering** - Money-mule laundering. An LLM agent designs
  a fan-out / layering / gather hop-chain through recruited mule
  accounts; a 2-layer GraphSAGE model flags the mules from transaction
  topology, including the middle-of-the-chain accounts a plain
  classifier misses. Runs locally.

## Adding a lab

New attack types go in their own sibling folder, named after the attack
(for example `bin-attack`, `account-takeover`, `token-replay`). Keep each
lab self-contained: its own README, data generator, attack driver,
defense, and any cloud resources.
