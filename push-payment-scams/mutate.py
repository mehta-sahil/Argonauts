"""
Generation-time surface mutation.

Applied to EVERY line — scam and legit alike — so the mutation itself
carries no class signal. Its job is to break the char-n-gram
memorisation that makes a small template set trivially separable:
synonym swaps, contraction toggling, filler insertion, casing and
punctuation drift, the occasional typo.

The result is a corpus where the model has to learn *what is being said*
(pressure, secrecy, a payment ask to a new account) rather than
*which exact sentence* — which is the point, and also what makes the
adversarial evasion in evade.py meaningful.
"""

import random
import re

# phrase -> alternatives (all interchangeable in these registers)
SYN = {
    r"\bhello\b": ["hi", "hey", "hiya", "good afternoon", "good morning"],
    r"\bhi\b": ["hello", "hey", "hiya"],
    r"\bplease\b": ["please", "pls", "if you could", "when you can", "if you don't mind"],
    r"\bimmediately\b": ["immediately", "right away", "straight away", "asap", "now",
                         "as soon as you can"],
    r"\burgent\b": ["urgent", "pressing", "time-sensitive", "quite urgent", "important"],
    r"\btransfer the money\b": ["transfer the money", "send the payment", "move the funds",
                                "make the transfer", "get the payment across", "pop it over"],
    r"\bmove your funds\b": ["move your funds", "shift the balance", "transfer your money",
                             "move the money across"],
    r"\bsend the payment\b": ["send the payment", "make the payment", "arrange the transfer",
                              "get the money sent"],
    r"\bbank transfer\b": ["bank transfer", "faster payment", "direct transfer", "online transfer"],
    r"\bnew account\b": ["new account", "updated account", "different account", "new details"],
    r"\bsort code\b": ["sort code", "sort", "s/c"],
    r"\baccount\b": ["account", "acc"],
    r"\bi need you to\b": ["i need you to", "can you", "could you", "i'd like you to", "would you"],
    r"\bcan you\b": ["can you", "could you", "would you be able to", "are you able to"],
    r"\bthank you\b": ["thank you", "thanks", "cheers", "much appreciated", "ta"],
    r"\bconfirm\b": ["confirm", "let me know", "check", "verify"],
    r"\bquickly\b": ["quickly", "fast", "without delay", "promptly"],
    r"\bright now\b": ["right now", "at the moment", "as we speak", "currently"],
    r"\bsuspicious activity\b": ["suspicious activity", "unusual activity", "an odd transaction",
                                 "some unexpected activity"],
    r"\bhang up\b": ["hang up", "end the call", "put the phone down"],
}

FILLERS_START = ["", "", "", "just ", "quick one — ", "sorry to bother you, ", "honestly, ",
                 "look, ", "ok so ", "right, "]
FILLERS_END = ["", "", "", "", " thanks", " ok?", " if that's alright", " when you can",
               " — appreciate it", " let me know"]
EMOJI = ["", "", "", "", " :)", " 🙏", " !!"]


def _syn_swap(text, rng, rate):
    for pat, alts in SYN.items():
        if rng.random() < rate and re.search(pat, text, re.I):
            text = re.sub(pat, lambda _: rng.choice(alts), text, count=1, flags=re.I)
    return text


def _contractions(text, rng):
    pairs = [("do not", "don't"), ("cannot", "can't"), ("i am", "i'm"),
             ("you are", "you're"), ("it is", "it's"), ("we have", "we've"),
             ("will not", "won't"), ("i will", "i'll"), ("that is", "that's")]
    for full, short in pairs:
        if rng.random() < 0.5:
            text = re.sub(rf"\b{full}\b", short, text, flags=re.I)
        else:
            text = re.sub(rf"\b{re.escape(short)}\b", full, text, flags=re.I)
    return text


def _typo(text, rng):
    if len(text) < 12 or rng.random() > 0.12:
        return text
    i = rng.randrange(1, len(text) - 1)
    if text[i] == " " or text[i - 1] == " ":
        return text
    return text[:i] + text[i + 1] + text[i] + text[i + 2:]   # swap adjacent chars


def mutate(text: str, rng: random.Random, casual: bool = False) -> str:
    strength = rng.uniform(0.15, 0.55)
    out = _syn_swap(text, rng, strength)
    out = _contractions(out, rng)
    if rng.random() < 0.5:
        out = rng.choice(FILLERS_START) + out
    if rng.random() < 0.4:
        out = out.rstrip(".") + rng.choice(FILLERS_END)
    if casual and rng.random() < 0.6:
        out = out.lower()
        if rng.random() < 0.4:
            out = out.rstrip(".")
        out += rng.choice(EMOJI)
    if rng.random() < 0.15:
        out = out.replace(". ", ".  ")            # stray double space
    out = _typo(out, rng)
    return re.sub(r"\s+", " ", out).strip()
