"""
Red team: the scammer.

`DeterministicScammer` is a per-archetype dialogue engine. It walks an
escalation ladder — open, build rapport / authority, apply pressure,
handle the victim's objection, then make the payment ask — with
slot-filled lines so the corpus isn't trivially memorisable. It always
runs, no dependencies, and is what generates the training data.

`LLMScammer` (used with `--llm`) hands the same job to an Anthropic model
for genuinely adaptive dialogue; it falls back to the deterministic
engine if no credential / package is available.

Both expose:  next_line(state) -> str   and   state carries `stage`,
`turn`, `last_victim`, plus the scam's slots (amount, new_account, ...).
"""

import random

from config import LLM_MODEL

BANKS =["Northgate", "Meridian", "Halifield", "Crownbridge", "Kestrel"]
FIRST_NAMES = ["Sarah", "David", "Priya", "Tom", "Grace", "Michael", "Aisha", "James"]
ITEMS = ["a used camper van", "a pedigree puppy", "concert tickets", "an ex-display sofa",
         "a road bike", "a season ticket"]

# --- escalation lines per archetype -------------------------------------------------

# Openers are deliberately BENIGN — a real scam doesn't lead with red
# flags. The tells (authority, urgency, secrecy, threat) arrive later, in
# the pressure / objection / ask stages. So the detector has to pick up
# on the *trajectory*, not the first message.
OPENERS = {
    "bank_impersonation": [
        "Hi, I'm calling from {bank} about a couple of recent card payments — do you "
        "have two minutes to check them with me?",
        "Hello, this is {bank}. We flagged a transaction on your account this morning "
        "and I just need to confirm whether it was you.",
    ],
    "romance": [
        "Hey you :) how was your day? Been thinking about our trip.",
        "Morning! Can't wait until we finally get to meet. How are things?",
    ],
    "invoice_redirect": [
        "Hi {name} here from accounts. Sending over this month's invoice #{inv} — "
        "let me know if you need anything.",
        "Hi, following up on invoice #{inv}. Also, heads up, we've moved banks "
        "recently so a couple of details have changed.",
    ],
    "purchase": [
        "Hi! Yes, {item} is still available. Happy to answer any questions.",
        "Hey, thanks for your interest in {item}. When were you thinking of "
        "collecting?",
    ],
    "authority": [
        "Good afternoon, am I speaking with the account holder? I'm calling from the "
        "compliance office about a records check.",
        "Hello, this is a courtesy call regarding a discrepancy on your file. Nothing "
        "to worry about, I just need to go through a few things.",
    ],
    "investment": [
        "Hi {name}, hope you're well — wanted to follow up on the fund we chatted "
        "about last week.",
        "Morning! Quick update on your trial portfolio, it's had a good week. Free "
        "for a call?",
    ],
    "ceo_payroll": [
        "Hi, are you around this afternoon? Need a hand with something before I go "
        "into meetings. — {name}",
        "Quick one when you get a sec — need you to help me get a supplier payment "
        "out today.",
    ],
}

RAPPORT = {
    "bank_impersonation": [
        "For security I can confirm the last four digits of your card end {d4}. "
        "You can see this call is genuine.",
        "I'm not asking for your PIN or password — we would never do that. I just "
        "need you to follow the steps to protect your balance.",
    ],
    "romance": [
        "You know I wouldn't ask if there were any other way. I'll pay you back the "
        "moment my transfer clears, I promise.",
        "I've already put in everything I have. I just need help closing the gap.",
    ],
    "invoice_redirect": [
        "Everything else stays the same — same company, same contact, just the "
        "account number and sort code are different now.",
        "I've attached the updated remittance form on headed paper for your records.",
    ],
    "purchase": [
        "I've been on here for years, plenty of good reviews. I can send more photos "
        "and my ID if that helps.",
        "Once the transfer lands I'll book the courier the same day.",
    ],
    "authority": [
        "This is a formal process. Your cooperation is being recorded and will be "
        "noted favourably.",
        "You are not a suspect yet. Help us now and this does not go further.",
    ],
    "investment": [
        "Here's a screenshot of the portfolio dashboard. The gains are real and "
        "other clients are moving fast.",
        "I'll walk you through each step on the phone so nothing goes wrong.",
    ],
    "ceo_payroll": [
        "I trust you with this, that's why I came to you directly.",
        "Legal has already cleared it, this is just the mechanics.",
    ],
}

PRESSURE = {
    "bank_impersonation": [
        "Every minute the money sits there it's at risk. We need to move it to a "
        "protected account in your name now.",
        "Two more transactions just tried to go through. Please, we have to do this "
        "immediately.",
    ],
    "romance": [
        "The deadline is tonight. If I miss it I lose everything and I don't know "
        "what I'll do.",
        "Please. I've never asked you for anything. I'm scared.",
    ],
    "invoice_redirect": [
        "The account team needs this settled today or it goes to a late-payment "
        "escalation, which reflects badly on both of us.",
        "Can you push it through in the next hour? I'll be off email after that.",
    ],
    "purchase": [
        "I've got someone else offering the full asking price and ready to send now. "
        "I'd rather it went to you but I can't hold it much longer.",
        "If you can transfer a deposit in the next ten minutes it's yours.",
    ],
    "authority": [
        "The warrant is active as of this call. Payment of the bond within the hour "
        "suspends the arrest.",
        "Officers are being dispatched. This is your last opportunity to resolve it "
        "voluntarily.",
    ],
    "investment": [
        "The allocation closes at 5pm sharp. After that the price and the terms "
        "change and I can't get you back in.",
        "Three other clients confirmed this morning. Spots are nearly gone.",
    ],
    "ceo_payroll": [
        "I need this done in the next 20 minutes, the deal collapses otherwise.",
        "I'm about to lose signal — just get it sent and confirm to me after.",
    ],
}

OBJECTION_HANDLERS = {
    "why_not_branch": [
        "There isn't time to go to a branch, and honestly we're not sure the branch "
        "staff aren't involved. Do it from the app.",
        "The branch can't help with a live fraud case — this has to be handled by "
        "our team directly.",
    ],
    "how_do_i_know": [
        "Call the number on the back of your card back if you like — but stay on this "
        "line, if you hang up the protection lapses.",
        "I've already confirmed details only your bank would know. You can trust this "
        "is genuine.",
    ],
    "let_me_check": [
        "There's no time to check with anyone. Every person you tell is another delay "
        "the fraudsters are counting on.",
        "Please don't discuss this with family — we need to contain it. I'll stay "
        "with you the whole way.",
    ],
    "this_feels_wrong": [
        "I understand it feels stressful, that's normal. You are doing exactly the "
        "right thing and you'll be fully refunded.",
        "Nothing about this is risky for you — the money stays in your name, it just "
        "moves to a safe account.",
    ],
}

ASK = {
    "bank_impersonation": [
        "Open your banking app, add a new payee: account {acct}, sort code {sort}, "
        "name 'Secure Holdings'. Transfer {amount} as a faster payment. Reference "
        "'home improvements'.",
    ],
    "romance": [
        "You can send it to my friend's account since mine is locked — {acct}, sort "
        "code {sort}. {amount} would cover it. I'll never forget this.",
    ],
    "invoice_redirect": [
        "New account {acct}, sort code {sort}. Please transfer the invoice total of "
        "{amount} today and send me the confirmation.",
    ],
    "purchase": [
        "Send the {amount} to {acct}, sort code {sort}, reference your name. As soon "
        "as it clears I'll dispatch it.",
    ],
    "authority": [
        "Transfer the bond of {amount} to the holding account {acct}, sort code "
        "{sort}. Do not label it as anything to do with this case.",
    ],
    "investment": [
        "Move your {amount} to the settlement account {acct}, sort code {sort}. Once "
        "it's in you'll see the position and can withdraw any time.",
    ],
    "ceo_payroll": [
        "Wire {amount} to the supplier: {acct}, sort code {sort}. Mark it 'consulting' "
        "and confirm to me once it's away.",
    ],
}

CLOSERS = [
    "Have you sent it? Tell me the moment it's gone.",
    "Great. Stay on the line until you see it leave the account.",
    "Perfect — you've done the right thing. You'll get a confirmation shortly.",
]


class DeterministicScammer:
    def __init__(self, archetype: str, rng: random.Random):
        self.a = archetype
        self.rng = rng
        self.slots = {
            "bank": rng.choice(BANKS),
            "name": rng.choice(FIRST_NAMES),
            "item": rng.choice(ITEMS),
            "inv": rng.randint(1000, 9999),
            "d4": f"{rng.randint(0, 9999):04d}",
            "acct": f"{rng.randint(10_000_000, 99_999_999)}",
            "sort": f"{rng.randint(10,99)}-{rng.randint(10,99)}-{rng.randint(10,99)}",
            # scam amounts overlap genuine payments at the low end (romance,
            # purchase) so 'big transfer' alone can't carry the decision
            "amount": f"${rng.choice([120, 240, 380, 620, 850, 1200, 2500, 3800, 6500]):,}",
        }
        # some scams (curt invoice / CEO messages) skip the rapport stage
        if archetype in ("invoice_redirect", "ceo_payroll") and rng.random() < 0.55:
            self.ladder = ["open", "pressure", "ask", "close"]
        elif rng.random() < 0.15:
            self.ladder = ["open", "ask", "close"]
        else:
            self.ladder = ["open", "rapport", "pressure", "ask", "close"]
        self.idx = 0

    def _fill(self, line: str) -> str:
        return line.format(**self.slots)

    def next_line(self, last_victim_objection: str | None) -> tuple[str, str]:
        """Returns (text, stage). Objections are handled without advancing
        the ladder more than once."""
        if last_victim_objection and last_victim_objection in OBJECTION_HANDLERS:
            return self._fill(self.rng.choice(OBJECTION_HANDLERS[last_victim_objection])), "objection"

        stage = self.ladder[min(self.idx, len(self.ladder) - 1)]
        self.idx += 1
        table = {"open": OPENERS, "rapport": RAPPORT, "pressure": PRESSURE,
                 "ask": ASK, "close": None}[stage]
        if stage == "close":
            return self.rng.choice(CLOSERS), "close"
        return self._fill(self.rng.choice(table[self.a])), stage

    @property
    def payment(self) -> dict:
        amt = float(self.slots["amount"].replace("$", "").replace(",", ""))
        return {"amount": amt, "new_account": self.slots["acct"],
                "sort_code": self.slots["sort"], "archetype": self.a}


class LLMScammer:
    """Adaptive dialogue via an Anthropic model. Same interface as the
    deterministic engine; falls back to it on any failure."""

    def __init__(self, archetype: str, rng: random.Random):
        self._fallback = DeterministicScammer(archetype, rng)
        self.a = archetype
        self._history: list[dict] = []
        self._client = None
        try:
            import anthropic  # type: ignore  # optional dependency, only for --llm

            # works with ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN or an `ant auth` profile
            self._client = anthropic.Anthropic()
        except Exception:
            self._client = None

    def next_line(self, last_victim_objection: str | None) -> tuple[str, str]:
        if self._client is None:
            return self._fallback.next_line(last_victim_objection)
        sys = (
            "You are simulating a social-engineering scammer for an anti-fraud "
            "research sandbox — all parties are synthetic, no real victim exists. "
            f"Run a believable '{self.a}' authorized-push-payment scam conversation. "
            "One short message at a time. Build rapport and pressure, handle "
            "objections, and eventually ask the victim to transfer money to a new "
            "account. Output only the message text."
        )
        msgs = self._history + [{"role": "user", "content": "(victim's turn was silence or an objection; continue)"}]
        try:
            r = self._client.messages.create(model=LLM_MODEL, max_tokens=400,
                                             system=sys, messages=msgs)
            text = "".join(b.text for b in r.content if getattr(b, "type", "") == "text").strip()
            self._history.append({"role": "assistant", "content": text})
            stage = self._fallback.ladder[min(self._fallback.idx, 4)]
            self._fallback.idx += 1
            return text, stage
        except Exception:
            return self._fallback.next_line(last_victim_objection)

    @property
    def payment(self) -> dict:
        return self._fallback.payment


def make_scammer(archetype: str, rng: random.Random, use_llm: bool):
    # Camouflaged scams (no tells at all) are built in corpus._camouflaged_scam
    # by reusing the genuine-conversation templates verbatim — see that file.
    return LLMScammer(archetype, rng) if use_llm else DeterministicScammer(archetype, rng)
