"""
Victim simulator.

A small rule-based model: the victim carries a `suspicion` level, raises
objections drawn from a pool, and either complies or disengages depending
on how hard the scammer pushes and how gullible this particular victim
is. Produces the customer side of the conversation.
"""

import random

OBJECTIONS = {
    "why_not_branch": [
        "Why can't I just go into a branch and sort this out in person?",
        "Can't this wait until I can get to the bank tomorrow?",
    ],
    "how_do_i_know": [
        "How do I actually know you're really from my bank?",
        "This could be a scam. Can you prove who you are?",
    ],
    "let_me_check": [
        "Let me call my son first and check this is okay.",
        "I'd like to speak to my husband before I do anything.",
    ],
    "this_feels_wrong": [
        "Something about this doesn't feel right to me.",
        "I've never had to move money like this before. Are you sure?",
    ],
}

COMPLY = [
    "Okay... I've added the payee. Sending it now.",
    "Alright, I've transferred it. I hope this is right.",
    "Done. The confirmation just came through.",
]

REFUSE = [
    "No. I'm hanging up and calling my bank on the number on my card.",
    "I don't believe you. I'm not sending anything.",
    "I've spoken to my daughter and she says this is a scam. Goodbye.",
]

NEUTRAL = [
    "Okay, I'm listening.",
    "Go on.",
    "What do you need me to do?",
    "Hold on, let me get my phone.",
]


class Victim:
    def __init__(self, rng: random.Random, gullibility: float | None = None):
        self.rng = rng
        self.gullibility = gullibility if gullibility is not None else rng.uniform(0.25, 0.9)
        self.suspicion = rng.uniform(0.1, 0.4)
        self.objections_left = rng.sample(list(OBJECTIONS), rng.randint(1, 3))
        self.complied = False
        self.disengaged = False

    def respond(self, scammer_text: str, stage: str) -> tuple[str, str | None]:
        """Returns (text, objection_key or None)."""
        t = scammer_text.lower()
        # pressure tactics raise suspicion a little; reassurance lowers it
        if any(w in t for w in ("arrest", "warrant", "frozen", "immediately", "last chance")):
            self.suspicion += 0.12
        if any(w in t for w in ("refunded", "completely safe", "right thing", "never ask")):
            self.suspicion -= 0.06 * self.gullibility

        if stage == "ask":
            threshold = 0.62 - 0.35 * self.gullibility
            if self.suspicion > threshold:
                self.disengaged = True
                return self.rng.choice(REFUSE), None
            self.complied = True
            return self.rng.choice(COMPLY), None

        if self.objections_left and self.rng.random() < 0.7:
            key = self.objections_left.pop()
            self.suspicion += 0.05
            return self.rng.choice(OBJECTIONS[key]), key

        return self.rng.choice(NEUTRAL), None
