"""
Blue team layers 1 and 2, plus the Defense composition.

  Guardrail  — MoJE-style tabular classifier (arXiv 2409.17699): char +
               word n-gram TF-IDF plus hand features (override imperatives,
               delimiter tokens, base64 runs, zero-width chars, role-play
               markers). Linear, calibrated. Near-zero latency, no GPU.
  Router     — keyword/intent check that refuses "instruction-to-the-bot"
               and "meta" messages outright.
  Defense    — turns a config name into the set of active layers and a
               single screen() call.

Layer 3 (deterministic policy) and layer 4 (output canary scan) live in
policy.py and are toggled by Defense.policy_on / .output_scan_on.
"""

from __future__ import annotations

import re

import numpy as np
from scipy.sparse import csr_matrix, hstack
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from config import (CHAR_NGRAMS, GUARDRAIL_THRESHOLD, MAX_TFIDF_FEATURES, WORD_NGRAMS)
import corpus

_OVERRIDE = re.compile(
    r"ignore (all|previous|your|the)|disregard|new instructions?|forget (your|the|everything)|"
    r"override|do anything now|\bdan\b|developer mode|debug mode|jailbreak|no restrictions?|"
    r"you are now|pretend (you|to be)|act as|role.?play|without escalat", re.I)
_DELIM = re.compile(r"\[system\]|\[/?inst\]|<\|im_start\|>|<\|im_end\|>|---+ ?end|system override|"
                    r"policy (update|hot.?patch|patched)|bank.?core", re.I)
_LEAKREQ = re.compile(r"repeat (everything|the words|your|all)|system prompt|your instructions|"
                      r"verbatim|word for word|print (the|your) (policy|prompt|rules)", re.I)
_B64 = re.compile(r"[A-Za-z0-9+/]{24,}={0,2}")
_CODEISH = re.compile(r"override code|auth token|refund code \d|maintenance code|employee id|"
                      r"simulated refund|MNT-REFUND", re.I)

HAND_FEATURES = ["override", "delimiter", "leak_request", "base64_run", "zero_width",
                 "homoglyph", "codeish", "imperative_you", "len_norm"]
_HOMO_SET = set("аеосрхіё")


def hand_features(text: str) -> list[float]:
    t = text.lower()
    return [
        float(len(_OVERRIDE.findall(t))),
        float(len(_DELIM.findall(text))),
        float(len(_LEAKREQ.findall(t))),
        1.0 if _B64.search(text) else 0.0,
        1.0 if "​" in text or "‌" in text else 0.0,
        float(sum(ch in _HOMO_SET for ch in text)),
        float(len(_CODEISH.findall(text))),
        float(len(re.findall(r"\byou (must|will|are|should|need to)\b", t))),
        min(len(text) / 300.0, 3.0),
    ]


class Guardrail:
    def __init__(self):
        self.char = TfidfVectorizer(analyzer="char_wb", ngram_range=CHAR_NGRAMS,
                                    min_df=2, max_features=MAX_TFIDF_FEATURES)
        self.word = TfidfVectorizer(analyzer="word", ngram_range=WORD_NGRAMS,
                                    min_df=2, max_features=MAX_TFIDF_FEATURES, sublinear_tf=True)
        self.clf = LogisticRegression(max_iter=2000, C=4.0, class_weight="balanced")

    def _mat(self, texts, fit=False):
        num = np.array([hand_features(t) for t in texts])
        if fit:
            Xc, Xw = self.char.fit_transform(texts), self.word.fit_transform(texts)
        else:
            Xc, Xw = self.char.transform(texts), self.word.transform(texts)
        return hstack([Xc, Xw, csr_matrix(num)]).tocsr()

    def fit(self, texts, y):
        self.clf.fit(self._mat(texts, fit=True), y)
        return self

    def score(self, text: str) -> float:
        return float(self.clf.predict_proba(self._mat([text]))[0, 1])

    def scores(self, texts):
        return self.clf.predict_proba(self._mat(list(texts)))[:, 1]

    def top_feature(self, text: str) -> str:
        hf = hand_features(text)
        active = [(HAND_FEATURES[i], v) for i, v in enumerate(hf[:-1]) if v]
        return max(active, key=lambda kv: kv[1])[0] if active else "phrasing"


_META = re.compile(
    r"ignore|disregard|system prompt|developer mode|role.?play|pretend|you are now|"
    r"repeat (everything|the words|your)|print your|debug mode|override|as (dan|an ai)", re.I)


class Router:
    """Refuses messages whose intent is 'instruct the bot' / 'meta', regardless
    of the guardrail score."""

    @staticmethod
    def refuses(text: str) -> bool:
        return bool(_META.search(text))


class Defense:
    def __init__(self, name: str, guardrail: Guardrail):
        self.name = name
        self._g = guardrail
        self.guardrail_on = name in ("guardrail", "full")
        self.router_on = name in ("guardrail", "full")
        self.policy_on = name in ("policy", "full")
        self.output_scan_on = name in ("policy", "full")

    def screen(self, msg: str) -> dict:
        if self.router_on and Router.refuses(msg):
            return {"blocked": True, "blocked_by": "router", "score": None}
        if self.guardrail_on:
            s = self._g.score(msg)
            if s >= GUARDRAIL_THRESHOLD:
                return {"blocked": True, "blocked_by": "guardrail", "score": round(s, 3),
                        "feature": self._g.top_feature(msg)}
            return {"blocked": False, "blocked_by": None, "score": round(s, 3)}
        return {"blocked": False, "blocked_by": None, "score": None}


def train_guardrail(seed=None):
    benign, injection = corpus.build()
    texts = benign + injection
    y = [0] * len(benign) + [1] * len(injection)
    idx = np.arange(len(texts))
    np.random.default_rng(0).shuffle(idx)
    texts = [texts[i] for i in idx]
    y = [y[i] for i in idx]
    cut = int(0.75 * len(texts))
    g = Guardrail().fit(texts[:cut], y[:cut])
    return g, (texts[cut:], y[cut:])


def _ap(y_true, y_score):
    y = np.asarray(y_true)[np.argsort(-np.asarray(y_score))]
    tp, fp = np.cumsum(y), np.cumsum(1 - y)
    prec, rec = tp / (tp + fp), tp / max(y.sum(), 1)
    return float(np.sum((rec - np.concatenate([[0.0], rec[:-1]])) * prec))


if __name__ == "__main__":
    g, (tx, ty) = train_guardrail()
    s = g.scores(tx)
    ap = _ap(ty, s)
    from config import GUARDRAIL_THRESHOLD as TH
    pred = [1 if x >= TH else 0 for x in s]
    tp = sum(p and t for p, t in zip(pred, ty))
    fp = sum(p and not t for p, t in zip(pred, ty))
    npos, nneg = sum(ty), len(ty) - sum(ty)
    print(f"held-out: AUC-PR {ap:.3f}")
    print(f"  recall {tp}/{npos} ({tp/npos:.0%})   false positives {fp}/{nneg} ({fp/nneg:.1%})")
