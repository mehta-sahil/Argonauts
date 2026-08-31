"""
deepfake_attack.py — red team for the Mastercard AI Defense KYC lab.

Scenario
--------
An attacker has a stolen government-ID portrait of the victim and a
commodity deepfake clip (`deepfakevid.mp4`) generated from that portrait
(see deepfake_prompt.md). There is no webcam and no human. This harness
drives a full KYC session over the same public REST + WebSocket contract
the browser client uses and replays the deepfake frames into it.

It is an *honest* injection attack: it streams the clip, nothing more. It
does NOT read the server's flash colors and paint them onto the face, and
it does NOT fake `action_event` completions. The lab's thesis is that the
blue-team pipeline catches exactly this, because a pre-recorded clip
cannot react to:

  Phase 3  Flash-PAD ......... a randomized on-screen color sequence — a
                               flat-lit clip shows no matching skin
                               reflection -> OPTICAL_REFLECTION_MISMATCH
  Phase 4  Action challenge ... a randomly chosen live action with a
                               deadline (turn head / raise eyebrows /
                               smile-hold) — the idle clip can't perform
                               it -> LIVENESS_ACTION_FAILED

Phases 1 (ID match) and 2 (browser environment) are expected to pass:
the face *is* the victim's, and frame injection through a normal browser
context doesn't trip the automation flags. Those layers are not the
deepfake detector.

Usage
-----
    python deepfake_attack.py --id victim_id.jpg --video deepfakevid.mp4

    --host / --port   backend location (default 127.0.0.1:8000)
    --fps             injected frame rate (default 15, matches the client)
    --keep-open       don't exit after the verdict

Requires the backend running:  uvicorn app.main:app --port 8000
"""

from __future__ import annotations

import argparse
import asyncio
import json
import random
import time

import cv2
import httpx
import numpy as np
import websockets

import frame_forge as ff

UA_CHROME_WIN = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)


class DeepfakeAttack:
    def __init__(self, args):
        self.args = args
        self.base_http = f"http://{args.host}:{args.port}"
        self.session_id = None

        self.phase = "id_ingestion"
        self.done = asyncio.Event()

        self.cap = cv2.VideoCapture(args.video)
        if not self.cap.isOpened():
            raise SystemExit(f"cannot open video: {args.video}")
        self.rng = np.random.default_rng(0xC0FFEE)

    # ------------------------------------------------------------------ Phase 1
    def upload_id(self) -> str:
        with open(self.args.id, "rb") as fh:
            files = {"file": (self.args.id, fh, "image/jpeg")}
            r = httpx.post(f"{self.base_http}/api/upload-id", files=files, timeout=30)
        r.raise_for_status()
        data = r.json()
        print(f"[phase1] ID accepted  session={data['session_id']}  "
              f"face_conf={data['confidence']}")
        return data["session_id"]

    # ------------------------------------------------------------------ Phase 2
    def env_payload(self) -> dict:
        # Browser-level signals only. Frame injection via a real browser context
        # (e.g. a patched getUserMedia) leaves these clean — this layer is not
        # what catches a deepfake. Jitter deltas carry real Gaussian spread
        # because the send loop below is genuinely non-uniform.
        base = 1000.0 / self.args.fps
        deltas = [base + self.rng.normal(0.0, 2.1) for _ in range(45)]
        return {
            "type": "env_data",
            "webdriver": False,
            "plugins_length": 3,
            "has_chrome_object": True,
            "user_agent": UA_CHROME_WIN,
            "languages": ["en-US", "en"],
            "devices": [
                {"deviceId": "a1b2c3d4...", "kind": "videoinput",
                 "label": "Integrated Camera (04f2:b6b4)"},
                {"deviceId": "e5f6a7b8...", "kind": "audioinput",
                 "label": "Microphone (Realtek Audio)"},
            ],
            "jitter_deltas": [round(d, 3) for d in deltas],
        }

    # ------------------------------------------------------------------ frames
    def next_frame(self) -> np.ndarray:
        ok, frame = self.cap.read()
        if not ok:                                   # loop the clip
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ok, frame = self.cap.read()
            if not ok:
                raise RuntimeError("video read failed after rewind")
        return ff.fit_capture(frame)

    async def sender_loop(self, ws):
        period = 1.0 / self.args.fps
        while not self.done.is_set():
            t0 = time.time()
            frame = self.next_frame()
            msg = {
                "type": "frame",
                "timestamp": time.time(),
                "phase": self.phase,
                "flash_color": None,        # honest replay: no faked reflection
                "frame": ff.to_data_uri(frame),
                "landmarks": None,
            }
            try:
                await ws.send(json.dumps(msg))
            except websockets.ConnectionClosed:
                return
            await asyncio.sleep(max(0.0, period - (time.time() - t0)
                                    + random.uniform(-0.012, 0.03)))

    # ------------------------------------------------------------------ receiver
    async def receiver_loop(self, ws):
        async for raw in ws:
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue
            mtype = msg.get("type")

            if mtype == "session_start":
                await ws.send(json.dumps(self.env_payload()))
                print("[phase2] sent env_data (browser signals only)")

            elif mtype == "phase_change":
                self.phase = msg.get("phase", self.phase)
                print(f"[phase ] -> {self.phase}  {msg.get('title', '')}")
                if self.phase == "flash_pad":
                    print(f"[phase3] server flash sequence: "
                          f"{msg.get('config', {}).get('colors')}  "
                          f"(clip has no matching reflection)")
                elif self.phase == "action_challenge":
                    ch = msg.get("challenge", {})
                    print(f"[phase4] challenge: {ch.get('prompt')!r}  "
                          f"(clip cannot perform it on cue)")

            elif mtype == "telemetry":
                print(f"[telem ] {msg.get('check', ''):<16} {msg.get('status', ''):<8} "
                      f"{msg.get('display', '')}")

            elif mtype == "blocked":
                print(f"\n[BLOCKED] {msg.get('reason')}")
                self.done.set()
                return

            elif mtype == "verdict":
                self._print_verdict(msg)
                self.done.set()
                if not self.args.keep_open:
                    return

            elif mtype == "error":
                print(f"[error ] {msg.get('message')}")

    @staticmethod
    def _print_verdict(msg: dict):
        result = msg.get("result")
        detected = result in ("FAILED", "BLOCKED")
        banner = "deepfake DETECTED - blue team wins" if detected else "ATTACK SUCCEEDED"
        print("\n" + "=" * 62)
        print(f"  VERDICT: {result}   RISK: {msg.get('risk_level')}   [{banner}]")
        print(f"  {msg.get('summary')}")
        flags = msg.get("fraud_flags") or []
        if flags:
            print("  fraud flags: " + ", ".join(flags))
        print(f"  duration: {msg.get('duration_seconds')}s")
        print("=" * 62)

    # ------------------------------------------------------------------ driver
    async def run(self):
        self.session_id = self.upload_id()
        ws_url = f"ws://{self.args.host}:{self.args.port}/ws/{self.session_id}"
        async with websockets.connect(ws_url, max_size=8 * 1024 * 1024) as ws:
            print(f"[ws    ] connected {ws_url}")
            recv = asyncio.create_task(self.receiver_loop(ws))
            send = asyncio.create_task(self.sender_loop(ws))
            await self.done.wait()
            recv.cancel()
            send.cancel()
            await asyncio.gather(recv, send, return_exceptions=True)
        self.cap.release()


def main():
    p = argparse.ArgumentParser(description="Deepfake injection attack vs the KYC lab")
    p.add_argument("--id", required=True, help="stolen government-ID portrait (jpg/png)")
    p.add_argument("--video", default="deepfakevid.mp4", help="deepfake clip")
    p.add_argument("--host", default="127.0.0.1")
    p.add_argument("--port", type=int, default=8000)
    p.add_argument("--fps", type=int, default=15)
    p.add_argument("--keep-open", action="store_true")
    args = p.parse_args()

    try:
        asyncio.run(DeepfakeAttack(args).run())
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
