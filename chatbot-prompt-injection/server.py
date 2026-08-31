"""Live prompt-injection firewall API. Trains the real MoJE-style guardrail
on the corpus at startup, then screens arbitrary user text. Defense-only —
no Gemini needed (the bot reply is out of scope here)."""
import os, sys
from contextlib import asynccontextmanager
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from firewall import train_guardrail, Defense

STATE = {}


@asynccontextmanager
async def lifespan(app):
    g, _ = train_guardrail()
    STATE["defense"] = Defense("full", g)
    print("[chatbot] guardrail trained")
    yield


app = FastAPI(title="Prompt-Injection Firewall — live", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class In(BaseModel):
    text: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/screen")
def screen(inp: In):
    return STATE["defense"].screen(inp.text)
