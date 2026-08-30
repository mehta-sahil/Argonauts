"""
2-layer GraphSAGE-mean network, hand-rolled in numpy.

Each layer concatenates a node's own features with the MEAN of its
neighbours' features, then applies a linear map + ReLU (Hamilton, Ying &
Leskovec, "Inductive Representation Learning on Large Graphs",
NeurIPS 2017). The GCN baseline in Weber et al.'s Elliptic bitcoin study
(IEEE, 2019) is the same idea with a symmetric-normalised adjacency.

    H1 = ReLU( [X ; P X] W0 )           P = row-normalised adjacency (no self loop)
    Z  = [H1 ; P H1] W1                 -> 2-class logits, softmax

Concatenating self + neighbourhood (rather than pure GCN smoothing)
keeps the node's own signal AND adds graph context, so it never does
worse than a plain classifier on the same features — the whole point of
the comparison in run.py.

numpy only — torch would not fit on this machine and, for ~600 nodes,
is not needed (trains in ~1 s on CPU).
"""

import numpy as np

from config import (EPOCHS, GCN_SEED, HIDDEN_DIM, LEARNING_RATE, TRAIN_FRAC,
                    VAL_FRAC, WEIGHT_DECAY)


def neighbor_mean_operator(n, edges):
    """Row-normalised adjacency P (no self-loop): (P X)[i] = mean of i's neighbours."""
    A = np.zeros((n, n))
    for s, d in edges:
        A[s, d] = 1.0
        A[d, s] = 1.0
    deg = A.sum(axis=1, keepdims=True)
    deg[deg == 0] = 1.0
    return A / deg


def split_masks(labels, seed=GCN_SEED):
    """Stratified: each of train/val/test gets a proportional share of the
    (rare) positive nodes, so metrics aren't at the mercy of the split."""
    rng = np.random.default_rng(seed)
    n = len(labels)
    train = np.zeros(n, bool); val = np.zeros(n, bool); test = np.zeros(n, bool)
    for cls in (0, 1):
        idx = rng.permutation(np.where(labels == cls)[0])
        a, b = int(TRAIN_FRAC * len(idx)), int((TRAIN_FRAC + VAL_FRAC) * len(idx))
        train[idx[:a]] = True
        val[idx[a:b]] = True
        test[idx[b:]] = True
    return train, val, test


def _softmax(z):
    z = z - z.max(axis=1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=1, keepdims=True)


class GCN:
    """2-layer GraphSAGE-mean. Name kept short for the demo."""

    def __init__(self, in_dim, hidden=HIDDEN_DIM, seed=GCN_SEED):
        rng = np.random.default_rng(seed)
        self.W0 = rng.normal(0, np.sqrt(2 / (2 * in_dim)), (2 * in_dim, hidden))
        self.W1 = rng.normal(0, np.sqrt(2 / (2 * hidden)), (2 * hidden, 2))
        self._m = {k: 0.0 for k in ("W0", "W1")}
        self._v = {k: 0.0 for k in ("W0", "W1")}
        self._t = 0

    def forward(self, P, X):
        self.X = X
        self.g0 = np.concatenate([X, P @ X], axis=1)           # [self ; neighbour mean]
        self.h_pre = self.g0 @ self.W0
        self.h = np.maximum(self.h_pre, 0.0)
        self.g1 = np.concatenate([self.h, P @ self.h], axis=1)
        self.z = self.g1 @ self.W1
        return _softmax(self.z)

    def train(self, P, X, y, train_mask, val_mask,
              epochs=EPOCHS, lr=LEARNING_RATE, wd=WEIGHT_DECAY, verbose=False):
        hid = self.W0.shape[1]
        cls_w = np.array([1.0, train_mask.sum() / max(y[train_mask].sum(), 1)])
        Y = np.eye(2)[y]
        best_val, best = -1.0, None

        for ep in range(epochs):
            p = self.forward(P, X)

            w = cls_w[y] * train_mask
            dz = (p - Y) * w[:, None] / train_mask.sum()
            dW1 = self.g1.T @ dz + wd * self.W1
            dg1 = dz @ self.W1.T
            dh = dg1[:, :hid] + P.T @ dg1[:, hid:]
            dh_pre = dh * (self.h_pre > 0)
            dW0 = self.g0.T @ dh_pre + wd * self.W0

            self._adam({"W0": dW0, "W1": dW1}, lr)

            if ep % 10 == 0 or ep == epochs - 1:
                vp = self.forward(P, X)[:, 1]
                ap = _ap(y[val_mask], vp[val_mask])
                if ap > best_val:
                    best_val, best = ap, (self.W0.copy(), self.W1.copy())
                if verbose and ep % 50 == 0:
                    print(f"  epoch {ep:3d}  val AP {ap:.3f}")

        if best:
            self.W0, self.W1 = best
        return self

    def _adam(self, grads, lr, b1=0.9, b2=0.999, eps=1e-8):
        self._t += 1
        for k, g in grads.items():
            self._m[k] = b1 * self._m[k] + (1 - b1) * g
            self._v[k] = b2 * self._v[k] + (1 - b2) * (g * g)
            mhat = self._m[k] / (1 - b1**self._t)
            vhat = self._v[k] / (1 - b2**self._t)
            setattr(self, k, getattr(self, k) - lr * mhat / (np.sqrt(vhat) + eps))

    def scores(self, P, X):
        return self.forward(P, X)[:, 1]


def _ap(y_true, y_score):
    """Average precision (area under PR curve), no sklearn dependency."""
    order = np.argsort(-y_score)
    y = y_true[order]
    tp = np.cumsum(y)
    fp = np.cumsum(1 - y)
    precision = tp / (tp + fp)
    recall = tp / max(y.sum(), 1)
    rec_prev = np.concatenate([[0.0], recall[:-1]])
    return float(np.sum((recall - rec_prev) * precision))
