"""Live scam-intent scoring API. Trains the real ScamClassifier on the
deterministic corpus at startup, then scores arbitrary user text."""
import os, sys
from contextlib import asynccontextmanager
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import corpus as corpus_mod
from classifier import ScamClassifier, messages_from
from config import FLAG_THRESHOLD

STATE = {}


@asynccontextmanager
async def lifespan(app):
    rows = corpus_mod.build(use_llm=False)
    tr = messages_from(rows)
    STATE["clf"] = ScamClassifier().fit([m["text"] for m in tr], [m["y"] for m in tr])
    print(f"[push-payment] trained on {len(tr)} messages")
    yield


app = FastAPI(title="Push-Payment Scam — live", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class In(BaseModel):
    text: str


@app.get("/api/health")
def health():
    return {"status": "ok", "threshold": FLAG_THRESHOLD}


@app.post("/api/score")
def score(inp: In):
    clf = STATE["clf"]
    s = clf.score_one(inp.text)
    return {
        "score": round(s, 3),
        "flagged": s >= FLAG_THRESHOLD,
        "threshold": FLAG_THRESHOLD,
        "fired": [k for k, _ in clf.explain(inp.text)],
    }
