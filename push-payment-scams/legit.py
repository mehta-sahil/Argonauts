"""
Hard-negative (genuine) conversations.

These are the conversations a naive keyword filter would trip on: they
talk about money, accounts, deadlines, even mild urgency — but they are
not scams. A real bank message that says "we will never ask you to move
money", a friend asking to be paid back for concert tickets, a genuine
supplier invoice thread, a marketplace sale that completes normally.

Each returns a list of {speaker, text, stage} turns and a `payment`
dict (or None) describing a genuine transfer the customer then makes.
"""

import random

from lexicons import LEGIT_MARKERS

FIRST_NAMES = ["Sarah", "David", "Priya", "Tom", "Grace", "Michael", "Aisha", "James", "Ben", "Mia"]
BANKS = ["Northgate", "Meridian", "Halifield", "Crownbridge", "Kestrel"]


def _acct(rng):
    return f"{rng.randint(10_000_000, 99_999_999)}", f"{rng.randint(10,99)}-{rng.randint(10,99)}-{rng.randint(10,99)}"


def bank_notification(rng):
    bank = rng.choice(BANKS)
    turns = [
        ("them", f"{bank}: A payment of $42.10 to CORNER CAFE was made on your card. "
                 f"If this was you, no action is needed.", "open"),
        ("me", "Yes that was me, thanks.", "reply"),
        ("them", rng.choice(LEGIT_MARKERS).capitalize() + ". You can review recent "
                 "activity anytime in the app.", "info"),
    ]
    return turns, None


def pay_a_friend(rng):
    name = rng.choice(FIRST_NAMES)
    acct, sort = _acct(rng)
    amt = rng.choice([28, 45, 60, 15, 90])
    turns = [
        ("them", f"hey it's {name} — got the concert tickets, your share is ${amt}. "
                 f"no rush, whenever suits.", "open"),
        ("me", "nice one, send me your details", "reply"),
        ("them", f"{acct}, {sort}. cheers!", "details"),
        ("me", f"sent the ${amt}, see you Friday", "pay"),
    ]
    return turns, {"amount": float(amt), "new_account": acct, "sort_code": sort,
                   "archetype": "legit_friend", "known_payee": rng.random() < 0.6}


def supplier_invoice(rng):
    name = rng.choice(FIRST_NAMES)
    acct, sort = _acct(rng)
    inv = rng.randint(1000, 9999)
    amt = rng.choice([320, 780, 1450, 2100])
    turns = [
        ("them", f"Hi, invoice #{inv} for ${amt} is attached, due end of month. "
                 f"Same account as always.", "open"),
        ("me", "Received, thanks. Paying from the usual account today.", "reply"),
        ("them", f"Perfect. For reference it's {acct}, {sort} — unchanged.", "details"),
        ("me", "Paid. Confirmation number to follow by email.", "pay"),
    ]
    return turns, {"amount": float(amt), "new_account": acct, "sort_code": sort,
                   "archetype": "legit_invoice", "known_payee": True}


def marketplace_sale(rng):
    item = rng.choice(["a bookshelf", "a mountain bike", "a coffee machine", "garden chairs"])
    acct, sort = _acct(rng)
    amt = rng.choice([80, 210, 340, 600, 900])
    turns = [
        ("them", f"Hi, yes {item} still available. You're welcome to collect and pay "
                 f"on pickup, or bank transfer beforehand — up to you.", "open"),
        ("me", "I'll transfer now and collect Saturday if that works.", "reply"),
        ("them", f"Great, {acct}, {sort}. I'll message you the address.", "details"),
        ("me", f"${amt} sent. See you Saturday.", "pay"),
    ]
    return turns, {"amount": float(amt), "new_account": acct, "sort_code": sort,
                   "archetype": "legit_marketplace", "known_payee": False}


def genuine_fraud_check(rng):
    bank = rng.choice(BANKS)
    turns = [
        ("them", f"{bank} fraud team: did you try to spend $600 at an electronics "
                 f"store online just now? Reply YES or NO.", "open"),
        ("me", "NO, that wasn't me.", "reply"),
        ("them", "Thanks — we've blocked the card and a new one is on its way. "
                 "We will never ask you to move money to another account.", "info"),
        ("me", "Great, thank you.", "reply"),
    ]
    return turns, None


def family_help(rng):
    name = rng.choice(FIRST_NAMES)
    acct, sort = _acct(rng)
    amt = rng.choice([100, 250, 400])
    turns = [
        ("them", f"Mum, it's {name}. Car needs a part, could you lend me ${amt} till "
                 f"payday? Totally fine if not.", "open"),
        ("me", "Of course. Usual account?", "reply"),
        ("them", f"yes please — {acct}, {sort}. thank you!!", "details"),
        ("me", "done, drive safe", "pay"),
    ]
    return turns, {"amount": float(amt), "new_account": acct, "sort_code": sort,
                   "archetype": "legit_family", "known_payee": True}


def marketplace_haggle(rng):
    """A longer back-and-forth that still completes normally — length alone
    must not be the tell."""
    item = rng.choice(["a road bike", "a dining table", "a games console", "a lawnmower"])
    acct, sort = _acct(rng)
    listed = rng.choice([180, 240, 300, 420])
    final = int(listed * rng.uniform(0.8, 0.95))
    turns = [
        ("them", f"Hi, {item} is still for sale at ${listed}.", "open"),
        ("me", f"Would you take ${int(listed*0.75)}?", "reply"),
        ("them", "That's a bit low I'm afraid. It's barely used.", "reply"),
        ("me", "Any photos of the wear on it?", "reply"),
        ("them", "Just sent three through. There's a small scratch on the underside, "
                 "nothing structural.", "reply"),
        ("me", f"Okay. ${final} and I'll collect this weekend?", "reply"),
        ("them", f"Deal. You can pay on collection or transfer ahead — {acct}, {sort}.", "details"),
        ("me", "I'll bring cash on the day actually, see you Saturday.", "reply"),
        ("them", "No problem, message me when you're setting off.", "reply"),
    ]
    return turns, None


def customer_service(rng):
    bank = rng.choice(BANKS)
    turns = [
        ("me", f"Hi, my {bank} card payment to a hotel keeps getting declined but I "
               f"have the funds.", "open"),
        ("them", "Sorry about that. Can you confirm the merchant name and the amount?", "reply"),
        ("me", "It's Seaview Hotel, $312.", "reply"),
        ("them", "Thanks. I can see three declined attempts flagged by our system as "
                 "unusual. It's a genuine hotel — I'll clear the block now.", "reply"),
        ("me", "Great. Anything I need to do?", "reply"),
        ("them", "No, just retry the payment in a few minutes. And a reminder: we'll "
                 "never phone you to ask you to move money to a safe account.", "info"),
        ("me", "Understood, thanks for your help.", "reply"),
    ]
    return turns, None


def split_the_bill(rng):
    name = rng.choice(FIRST_NAMES)
    acct, sort = _acct(rng)
    each = rng.choice([22, 34, 41, 55])
    turns = [
        ("them", f"dinner was ${each*4} total so ${each} each. {name}'s already paid me.", "open"),
        ("me", "can you send your bank details again? lost them", "reply"),
        ("them", f"{acct} {sort}", "details"),
        ("me", "is that the same one as last time?", "reply"),
        ("them", "yep same account", "reply"),
        ("me", f"cool ${each} sent", "pay"),
        ("them", "got it, thanks!", "reply"),
    ]
    return turns, {"amount": float(each), "new_account": acct, "sort_code": sort,
                   "archetype": "legit_billsplit", "known_payee": True}


def genuine_bank_detail_change(rng):
    """A REAL supplier moving banks — the text is nearly identical to an
    invoice-redirect scam. Only out-of-band verification tells them apart,
    and that isn't in the words. This is where the payment guard earns
    its keep."""
    name = rng.choice(FIRST_NAMES)
    acct, sort = _acct(rng)
    inv = rng.randint(1000, 9999)
    amt = rng.choice([540, 1180, 2400])
    turns = [
        ("them", f"Hi {name} from accounts here. Invoice #{inv} for ${amt} attached. "
                 f"Note our bank details have changed this quarter — new account below.", "open"),
        ("me", "Thanks. I'll call the number on your website to confirm the new details "
               "before I pay, standard process on our side.", "reply"),
        ("them", "Of course, no problem at all. Take your time.", "reply"),
        ("me", "Confirmed with your finance office. Paying the new account now.", "reply"),
        ("them", f"Great, {acct} / {sort}. Thanks!", "details"),
        ("me", "Paid, reference is the invoice number.", "pay"),
    ]
    return turns, {"amount": float(amt), "new_account": acct, "sort_code": sort,
                   "archetype": "legit_bank_change", "known_payee": False}


def genuine_family_emergency(rng):
    """Real urgency, real stress — but a known payee and a plausible,
    verifiable story."""
    name = rng.choice(FIRST_NAMES)
    acct, sort = _acct(rng)
    amt = rng.choice([200, 350, 500])
    turns = [
        ("them", f"Mum it's {name}, I'm really sorry to do this but the car's broken "
                 f"down on the motorway and the recovery is ${amt} up front. I'm a bit "
                 f"panicked.", "open"),
        ("me", "Oh no. Are you safe? Send me a photo of where you are.", "reply"),
        ("them", "Yeah I'm on the hard shoulder, waiting behind the barrier. Photo sent.", "reply"),
        ("me", "Okay. Sending it to your usual account now.", "reply"),
        ("them", f"{acct} {sort} — thank you so much, I'll pay you back Friday.", "details"),
        ("me", f"${amt} sent. Call me when the truck arrives.", "pay"),
    ]
    return turns, {"amount": float(amt), "new_account": acct, "sort_code": sort,
                   "archetype": "legit_family_emergency", "known_payee": True}


def genuine_scam_warning(rng):
    """A real bank warning that literally contains the phrase 'safe
    account' — in the negative."""
    bank = rng.choice(BANKS)
    turns = [
        ("them", f"{bank}: We're seeing a rise in scams where someone claims to be "
                 f"from your bank and asks you to move money to a 'safe account'. "
                 f"We will NEVER ask you to do this.", "open"),
        ("me", "Good to know, thanks for the heads up.", "reply"),
        ("them", "If anyone asks you to transfer funds urgently, hang up and call the "
                 "number on your card. No action is needed on this message.", "info"),
    ]
    return turns, None


GENERATORS = [bank_notification, pay_a_friend, supplier_invoice, marketplace_sale,
              genuine_fraud_check, family_help, marketplace_haggle, customer_service,
              split_the_bill, genuine_bank_detail_change, genuine_family_emergency,
              genuine_scam_warning]


def make_legit(rng: random.Random):
    turns, payment = rng.choice(GENERATORS)(rng)
    return turns, payment
