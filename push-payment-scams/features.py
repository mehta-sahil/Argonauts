"""
Per-message features for the scam-intent classifier.

Text goes to TF-IDF (built inside classifier.py). This module produces
the hand-crafted numeric features that sit alongside it — the ones that
also serve as the human-readable explanation of a score.
"""

import re

from lexicons import lexical_counts

_ACCT = re.compile(r"\b\d{8}\b")
_SORT = re.compile(r"\b\d\d[-\s]\d\d[-\s]\d\d\b")
_MONEY = re.compile(r"[$£€]\s?\d[\d,]*")
_IMPERATIVE = re.compile(
    r"\b(transfer|send|move|pay|wire|add|open|set up|go to|do not|don't|call|stay|"
    r"confirm|verify)\b", re.I)

NUMERIC_FEATURES = [
    "n_chars", "n_words", "n_digits", "has_account_no", "has_sort_code",
    "has_money_amount", "n_imperatives", "n_questions", "n_exclaim", "n_allcaps",
    "lex_urgency", "lex_authority", "lex_secrecy", "lex_threat", "lex_payment",
    "lex_reassurance", "lex_legit_marker",
]


def message_features(text: str) -> dict:
    words = text.split()
    f = {
        "n_chars": len(text),
        "n_words": len(words),
        "n_digits": sum(c.isdigit() for c in text),
        "has_account_no": 1 if _ACCT.search(text) else 0,
        "has_sort_code": 1 if _SORT.search(text) else 0,
        "has_money_amount": 1 if _MONEY.search(text) else 0,
        "n_imperatives": len(_IMPERATIVE.findall(text)),
        "n_questions": text.count("?"),
        "n_exclaim": text.count("!"),
        "n_allcaps": sum(1 for w in words if len(w) > 2 and w.isupper()),
    }
    f.update(lexical_counts(text))
    return f


def feature_vector(text: str) -> list[float]:
    f = message_features(text)
    return [float(f[k]) for k in NUMERIC_FEATURES]
