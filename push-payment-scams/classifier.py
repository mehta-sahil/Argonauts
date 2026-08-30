"""
Blue team, layer 1: scam-intent text classifier.

char-n-gram TF-IDF + word-n-gram TF-IDF + the hand-crafted lexical /
structural features from features.py, into a calibrated linear model
(logistic regression, class-weighted). Linear beats a transformer by a
point or two on scam-text and needs no GPU / large download — see the
smishing-detection literature (Nature Sci Reports 2025; arXiv 2603.11358).

Scores one message at a time. `conversation_score` up to turn t is the
running max over the other party's messages so far — a single benign
opener doesn't sink the score, and once pressure starts it stays flagged.
"""

import numpy as np
from scipy.sparse import csr_matrix, hstack
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

from config import (CHAR_NGRAMS, CLASSIFIER_SEED, FLAG_THRESHOLD,
                    MAX_TFIDF_FEATURES, WORD_NGRAMS)
from features import feature_vector


class ScamClassifier:
    def __init__(self):
        self.char_vec = TfidfVectorizer(analyzer="char_wb", ngram_range=CHAR_NGRAMS,
                                        min_df=3, max_features=MAX_TFIDF_FEATURES)
        self.word_vec = TfidfVectorizer(analyzer="word", ngram_range=WORD_NGRAMS,
                                        min_df=2, max_features=MAX_TFIDF_FEATURES,
                                        sublinear_tf=True)
        self.scaler = StandardScaler()
        self.clf = LogisticRegression(max_iter=2000, C=4.0,
                                      class_weight="balanced", random_state=CLASSIFIER_SEED)

    def _matrix(self, texts, fit=False):
        num = np.array([feature_vector(t) for t in texts], dtype=float)
        if fit:
            Xc = self.char_vec.fit_transform(texts)
            Xw = self.word_vec.fit_transform(texts)
            Xn = self.scaler.fit_transform(num)
        else:
            Xc = self.char_vec.transform(texts)
            Xw = self.word_vec.transform(texts)
            Xn = self.scaler.transform(num)
        return hstack([Xc, Xw, csr_matrix(Xn)]).tocsr()

    def fit(self, texts, y):
        X = self._matrix(texts, fit=True)
        self.clf.fit(X, y)
        return self

    def score(self, texts):
        """P(scam) for each message."""
        X = self._matrix(list(texts))
        return self.clf.predict_proba(X)[:, 1]

    def score_one(self, text: str) -> float:
        return float(self.score([text])[0])

    # magnitude-only features that aren't a human-readable "reason"
    _NOT_REASONS = {"n_chars", "n_words", "n_digits"}

    def explain(self, text: str, top=4):
        """Which meaningful hand features fired (for the UI chips)."""
        from features import message_features
        f = message_features(text)
        active = [(k, v) for k, v in f.items() if v and k not in self._NOT_REASONS]
        active.sort(key=lambda kv: -kv[1])
        return active[:top]


# --- corpus -> training rows -----------------------------------------------------

BENIGN_STAGES = {"open"}   # a scammer's first line carries no intent yet


def messages_from(rows, only_them=True):
    """Explode conversations into (text, label, conv_id, turn) rows.

    A message is labelled 1 only if it actually carries scam intent — the
    benign opener of a scam conversation is labelled 0, so the model
    learns the pressure / secrecy / ask language rather than 'this person
    messaged me'.
    """
    out = []
    for r in rows:
        scam = r["label"] == "scam"
        for t in r["turns"]:
            if only_them and t["speaker"] != "them":
                continue
            y = 1 if (scam and t["stage"] not in BENIGN_STAGES) else 0
            out.append({"text": t["text"], "y": y, "conv_id": r["id"], "turn": t["turn"]})
    return out


def conversation_scores(clf: ScamClassifier, rows):
    """Running max scam score after each of the other party's turns.
    Returns {conv_id: [(turn, running_score), ...]}."""
    out = {}
    for r in rows:
        them = [t for t in r["turns"] if t["speaker"] == "them"]
        if not them:
            out[r["id"]] = [(0, 0.0)]
            continue
        s = clf.score([t["text"] for t in them])
        run, seq = 0.0, []
        for t, sc in zip(them, s):
            run = max(run, float(sc))
            seq.append((t["turn"], run))
        out[r["id"]] = seq
    return out


def early_detection(rows, conv_seq, threshold=FLAG_THRESHOLD):
    """For scam conversations: was the score over threshold BEFORE the
    payment ask? Returns (flagged_before_ask, total_with_ask, mean_lead_turns)."""
    before, total, leads = 0, 0, []
    for r in rows:
        if r["label"] != "scam" or r["ask_turn"] is None:
            continue
        total += 1
        crossed = next((turn for turn, sc in conv_seq[r["id"]] if sc >= threshold), None)
        if crossed is not None and crossed <= r["ask_turn"]:
            before += 1
            leads.append(r["ask_turn"] - crossed)
    return before, total, (float(np.mean(leads)) if leads else 0.0)
