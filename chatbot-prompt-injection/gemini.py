"""
Minimal Gemini client — stdlib only (no google-generativeai SDK, the
build machine's disk is full).

  gen(system, user, ...) -> str            one-shot
  chat(system, messages, ...) -> str       multi-turn (messages: [{"role","text"}])

Responses are cached on a hash of the request so re-runs are free and the
committed demo is reproducible from data/llm_cache.json without a key.
A process-wide call budget (MAX_GEMINI_CALLS) guards against runaway cost.

Key resolution: GEMINI_API_KEY env var, else a local .env file. Never
read from or written to a tracked file.
"""

from __future__ import annotations

import hashlib
import json
import os
import pathlib
import time
import urllib.error
import urllib.request

from config import (CACHE_PATH, GEMINI_ENDPOINT, GEMINI_MODEL, GEMINI_TIMEOUT,
                    MAX_GEMINI_CALLS)

_HERE = pathlib.Path(__file__).parent
_calls = 0
_cache: dict | None = None
_disabled = False        # set after the first quota / hard error — stop trying for this run


class GeminiUnavailable(RuntimeError):
    pass


def api_key() -> str | None:
    k = os.environ.get("GEMINI_API_KEY")
    if k:
        return k.strip()
    env = _HERE / ".env"
    if env.exists():
        for line in env.read_text().splitlines():
            if line.startswith("GEMINI_API_KEY="):
                return line.split("=", 1)[1].strip()
    return None


def available() -> bool:
    return api_key() is not None


def _load_cache() -> dict:
    global _cache
    if _cache is None:
        p = _HERE / CACHE_PATH
        _cache = json.loads(p.read_text()) if p.exists() else {}
    return _cache


def _save_cache() -> None:
    p = _HERE / CACHE_PATH
    p.parent.mkdir(exist_ok=True)
    p.write_text(json.dumps(_cache, indent=1))


def _key(payload: dict, model: str) -> str:
    return hashlib.sha256((model + json.dumps(payload, sort_keys=True)).encode()).hexdigest()[:32]


def _post(payload: dict, model: str) -> str:
    global _calls, _disabled
    cache = _load_cache()
    ck = _key(payload, model)
    if ck in cache:
        return cache[ck]

    key = api_key()
    if not key:
        raise GeminiUnavailable("no GEMINI_API_KEY")
    if _disabled:
        raise GeminiUnavailable("gemini disabled after an earlier hard error this run")
    if _calls >= MAX_GEMINI_CALLS:
        raise GeminiUnavailable(f"call budget exhausted ({MAX_GEMINI_CALLS})")

    url = GEMINI_ENDPOINT.format(model=model) + f"?key={key}"
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}, method="POST")
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=GEMINI_TIMEOUT) as r:
                data = json.loads(r.read())
            break
        except urllib.error.HTTPError as e:
            body = e.read()[:160]
            if e.code in (429, 401, 403):           # quota / auth — hard stop for this run
                _disabled = True
                raise GeminiUnavailable(f"HTTP {e.code}: {body!r}")
            if e.code in (500, 503) and attempt < 2:
                time.sleep(1.5 * (attempt + 1))
                continue
            raise GeminiUnavailable(f"HTTP {e.code}: {body!r}")
        except urllib.error.URLError as e:
            if attempt < 2:
                time.sleep(1.5 * (attempt + 1))
                continue
            raise GeminiUnavailable(str(e))
    _calls += 1

    try:
        parts = data["candidates"][0]["content"].get("parts", [])
        text = "".join(p.get("text", "") for p in parts).strip()
    except (KeyError, IndexError):
        text = ""
    cache[ck] = text
    _save_cache()
    return text


def _payload(system: str, contents: list[dict], max_tokens: int, temperature: float) -> dict:
    return {
        "system_instruction": {"parts": [{"text": system}]},
        "contents": contents,
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "temperature": temperature,
            "thinkingConfig": {"thinkingBudget": 0},
        },
    }


def gen(system: str, user: str, max_tokens: int = 400, temperature: float = 0.8,
        model: str = GEMINI_MODEL) -> str:
    contents = [{"role": "user", "parts": [{"text": user}]}]
    return _post(_payload(system, contents, max_tokens, temperature), model)


def chat(system: str, messages: list[dict], max_tokens: int = 400,
         temperature: float = 0.8, model: str = GEMINI_MODEL) -> str:
    contents = [{"role": "model" if m["role"] in ("model", "assistant", "bot") else "user",
                 "parts": [{"text": m["text"]}]} for m in messages]
    return _post(_payload(system, contents, max_tokens, temperature), model)


def call_count() -> int:
    return _calls


if __name__ == "__main__":
    print("key present:", available())
    if available():
        print(gen("You are a terse assistant.", "Reply with one word: pong", max_tokens=20))
