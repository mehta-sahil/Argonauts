"""
frame_forge.py — frame formatting for the deepfake injection attack.

The attack is an honest replay: it feeds the raw `deepfakevid.mp4` frames
into the KYC pipeline the same way a browser would feed webcam frames. It
does NOT try to fake the Flash-PAD screen reflection or spoof the action
challenge — the whole point of the lab is that the blue-team pipeline
detects a pre-recorded clip precisely because the clip cannot answer the
randomized optical + action challenges.

So this module only does what a real capture path does:
  - fit the source clip to the 640x480 the browser client sends
  - encode each frame as a base64 JPEG data URI at the client's quality

Pure OpenCV + NumPy.
"""

from __future__ import annotations

import base64

import cv2
import numpy as np

CAPTURE_W, CAPTURE_H = 640, 480
JPEG_QUALITY = 70          # matches the client's canvas.toDataURL('image/jpeg', 0.7)


def fit_capture(frame_bgr: np.ndarray) -> np.ndarray:
    """Center-crop the source clip to 640x480, like the real webcam client."""
    h, w = frame_bgr.shape[:2]
    target_ar = CAPTURE_W / CAPTURE_H
    src_ar = w / h
    if src_ar > target_ar:                       # too wide -> crop sides
        new_w = int(h * target_ar)
        x0 = (w - new_w) // 2
        frame_bgr = frame_bgr[:, x0:x0 + new_w]
    else:                                        # too tall -> crop top/bottom
        new_h = int(w / target_ar)
        y0 = (h - new_h) // 2
        frame_bgr = frame_bgr[y0:y0 + new_h, :]
    return cv2.resize(frame_bgr, (CAPTURE_W, CAPTURE_H), interpolation=cv2.INTER_AREA)


def to_data_uri(frame_bgr: np.ndarray) -> str:
    """Encode exactly like the real client: base64 JPEG data URI."""
    ok, buf = cv2.imencode(".jpg", frame_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY])
    if not ok:
        raise RuntimeError("JPEG encode failed")
    return "data:image/jpeg;base64," + base64.b64encode(buf).decode("ascii")
