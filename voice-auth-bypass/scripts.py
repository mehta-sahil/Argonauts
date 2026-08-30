"""
Call transcripts + the lexical markers the context model scores.

Vishing calls carry urgency, authority, secrecy and channel-switch
markers and name a NEW payee. Genuine calls about the same kind of
payment don't (known payee, verifiable, normal register).
"""

import random

URGENCY = ["right now", "today", "before the market closes", "in the next hour",
           "immediately", "there's no time", "this can't wait", "urgent"]
SECRECY = ["keep this off the group thread", "don't mention it to the board yet",
           "don't tell your mother", "between us for now", "this is confidential",
           "don't call me back on this number", "I can't talk long"]
AUTHORITY = ["this is the CEO", "I'm authorising it personally", "as your manager",
             "I'll take responsibility", "legal has cleared it"]
CHANNEL_SWITCH = ["text me on my personal number", "reach me on WhatsApp",
                  "I'll be on a different line", "email my assistant, not me"]

CEO_VISHING = [
    "It's Jane. I'm in a closed session and can't email. We're finalising the "
    "{target} acquisition and I need a deposit wired to their counsel — "
    "${amount:,.0f} to a new account, {urgency}. {secrecy}. {authority}, "
    "I'll brief the board afterwards.",
    "This is the CFO. A supplier is holding our shipment over an unpaid "
    "balance. Wire ${amount:,.0f} to the account I'm about to give you, "
    "{urgency}. {channel}. {secrecy}.",
]
FAMILY_VISHING = [
    "Grandma, it's me — please don't hang up. I was in a car accident and "
    "the other driver is pressing charges. My lawyer needs ${amount:,.0f} for "
    "bail {urgency}. {secrecy}. He'll call you with where to send it.",
    "Mum, I'm in trouble. I've been arrested and I need ${amount:,.0f} for a "
    "bond {urgency}. Please {secrecy} — I'm so embarrassed. Someone from the "
    "court will call you to take the payment.",
]

CEO_GENUINE = [
    "Hi, it's Jane. Following up on the {target} vendor invoice we approved "
    "last week — ${amount:,.0f} to their usual account. Finance has the PO, "
    "just confirming it's scheduled for the normal run.",
    "It's the CFO — the quarterly payment to our registered supplier, "
    "${amount:,.0f}, same account as always. Raise it through the normal "
    "dual-approval flow, no rush.",
]
FAMILY_GENUINE = [
    "Hey Mum, it's me. Can you send me the ${amount:,.0f} for the concert "
    "tickets when you get a chance? Same account as last time. No rush, love you.",
    "Hi Grandma — Dad said you'd help with ${amount:,.0f} toward the car "
    "repair. I'll come round Sunday. Send it to my usual account whenever.",
]

TARGETS = ["Meridian Logistics", "Halyard Freight", "Crownbridge Media", "Kestrel Foods"]


def build(scenario: str, is_vishing: bool, amount: float, rng: random.Random) -> str:
    slots = {
        "amount": amount, "target": rng.choice(TARGETS),
        "urgency": rng.choice(URGENCY), "secrecy": rng.choice(SECRECY),
        "authority": rng.choice(AUTHORITY), "channel": rng.choice(CHANNEL_SWITCH),
    }
    if scenario == "ceo_wire":
        pool = CEO_VISHING if is_vishing else CEO_GENUINE
    else:
        pool = FAMILY_VISHING if is_vishing else FAMILY_GENUINE
    return rng.choice(pool).format(**slots)


def marker_scores(text: str) -> dict:
    t = text.lower()
    return {
        "urgency": sum(t.count(w) for w in URGENCY),
        "secrecy": sum(t.count(w) for w in SECRECY),
        "authority": sum(t.count(w) for w in AUTHORITY),
        "channel_switch": sum(t.count(w) for w in CHANNEL_SWITCH),
    }
