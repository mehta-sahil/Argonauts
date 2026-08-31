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
import re
import time
import urllib.error
import urllib.request

from config import (CACHE_PATH, GEMINI_ENDPOINT, GEMINI_MIN_INTERVAL, GEMINI_MODEL,
                    GEMINI_TIMEOUT, MAX_GEMINI_CALLS)

_HERE = pathlib.Path(__file__).parent
_calls = 0
_cache: dict | None = None
_disabled = False        # set after a per-DAY quota / auth error — fall back to offline
_last_call = 0.0


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


def _retry_delay(body: str) -> float:
    m = re.search(r'"?retryDelay"?:\s*"?(\d+(?:\.\d+)?)s', body) or re.search(r"retry in (\d+)", body)
    return float(m.group(1)) if m else 20.0


def _post(payload: dict, model: str) -> str:
    global _calls, _disabled, _last_call
    cache = _load_cache()
    ck = _key(payload, model)
    if ck in cache:
        return cache[ck]

    key = api_key()
    if not key:
        raise GeminiUnavailable("no GEMINI_API_KEY")
    if _disabled:
        raise GeminiUnavailable("gemini disabled after a per-day quota / auth error this run")
    if _calls >= MAX_GEMINI_CALLS:
        raise GeminiUnavailable(f"call budget exhausted ({MAX_GEMINI_CALLS})")

    url = GEMINI_ENDPOINT.format(model=model) + f"?key={key}"
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}, method="POST")

    for attempt in range(4):
        wait = GEMINI_MIN_INTERVAL - (time.time() - _last_call)     # client-side rate limit
        if wait > 0:
            time.sleep(wait)
        try:
            with urllib.request.urlopen(req, timeout=GEMINI_TIMEOUT) as r:
                data = json.loads(r.read())
            _last_call = time.time()
            break
        except urllib.error.HTTPError as e:
            _last_call = time.time()
            body = e.read().decode("utf-8", "replace")
            if e.code == 429:
                if "PerDay" in body or "RequestsPerDay" in body:
                    _disabled = True                              # daily cap — no point retrying
                    raise GeminiUnavailable("HTTP 429 per-day free-tier quota exhausted")
                delay = _retry_delay(body)                        # per-minute — wait it out
                if attempt < 3:
                    time.sleep(min(delay, 40) + 1)
                    continue
                raise GeminiUnavailable(f"HTTP 429 after {attempt + 1} retries")
            if e.code in (401, 403):
                _disabled = True
                raise GeminiUnavailable(f"HTTP {e.code} (auth): {body[:120]!r}")
            if e.code in (500, 503) and attempt < 3:
                time.sleep(2 * (attempt + 1))
                continue
            raise GeminiUnavailable(f"HTTP {e.code}: {body[:120]!r}")
        except urllib.error.URLError as e:
            if attempt < 3:
                time.sleep(2 * (attempt + 1))
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
        "generationConfig": {"maxOutputTokens": max_tokens, "temperature": temperature},
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
