"""
Word / phrase lists for the hand-crafted lexical features.

These encode the documented social-engineering levers of APP fraud
(urgency, authority, scarcity, secrecy, isolation, threat) plus the
"move the money" ask itself. Used by features.py alongside TF-IDF.
Deliberately small and readable — a real system would learn these, but
for the demo they double as the explanation of *why* a message scored.
"""

URGENCY = [
    "right now", "immediately", "within the hour", "before it's too late",
    "act fast", "urgent", "time-sensitive", "expires today", "last chance",
    "don't delay", "as soon as possible", "asap", "quickly", "hurry",
    "the window is closing", "only a few minutes",
]

AUTHORITY = [
    "this is the fraud team", "calling from your bank", "police", "hmrc",
    "tax office", "investigator", "official", "on behalf of", "head office",
    "compliance department", "your account manager", "the security team",
    "i am the ceo", "this is the director", "senior management",
]

SECRECY_ISOLATION = [
    "don't tell anyone", "keep this between us", "do not discuss this",
    "the branch staff can't be trusted", "don't mention this to the cashier",
    "this is confidential", "stay on the line", "don't hang up",
    "don't call anyone else", "there's a mole in the branch",
    "we're investigating a member of staff", "say it's for home improvements",
]

THREAT = [
    "you will be arrested", "legal action", "your account will be frozen",
    "you could lose everything", "warrant", "court", "penalty", "fined",
    "criminal charges", "we will have to report you", "blacklisted",
]

PAYMENT_REQUEST = [
    "transfer the money", "move your funds", "send the payment",
    "make a payment", "pay the invoice", "wire the funds",
    "set up a new payee", "add this account", "faster payment",
    "bank transfer", "send it to this account", "top up",
    "buy gift cards", "send crypto", "pay into the safe account",
]

REASSURANCE = [
    "you'll get it all back", "fully refunded", "it's completely safe",
    "guaranteed", "no risk", "just a formality", "standard procedure",
    "you're doing the right thing", "we've done this hundreds of times",
]

# phrases that legit bank / customer-service messages actually use
LEGIT_MARKERS = [
    "we will never ask you to move money", "do not share your pin",
    "visit your nearest branch", "call the number on the back of your card",
    "this is a genuine message", "log in to the app to review",
    "no action is needed", "your statement is ready",
]


def _count(text: str, phrases) -> int:
    t = text.lower()
    return sum(t.count(p) for p in phrases)


def lexical_counts(text: str) -> dict:
    return {
        "lex_urgency": _count(text, URGENCY),
        "lex_authority": _count(text, AUTHORITY),
        "lex_secrecy": _count(text, SECRECY_ISOLATION),
        "lex_threat": _count(text, THREAT),
        "lex_payment": _count(text, PAYMENT_REQUEST),
        "lex_reassurance": _count(text, REASSURANCE),
        "lex_legit_marker": _count(text, LEGIT_MARKERS),
    }
