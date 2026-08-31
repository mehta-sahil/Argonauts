# Deepfake video generation prompt (third-party)

Hand this to a **commodity** face-animation / talking-head tool — the kind
a real fraudster actually has access to (D-ID, HeyGen free tier,
SadTalker, Wav2Lip, LivePortrait, basic Runway). The **source identity
image** is the same government-ID portrait you upload to the KYC pipeline
as the baseline (`--id`), so the face matches the ArcFace reference.

Save the result as **`deepfakevid.mp4`** in this folder.

> **This is deliberately a *basic* deepfake.** The point of the lab is that
> the blue-team pipeline (randomized Flash-PAD colors + randomized live
> action challenge) catches a pre-recorded clip, because the clip cannot
> react to a challenge it has never seen. Do **not** use a high-end
> avatar/real-time pipeline — that's a different threat model.

---

## Generation prompt

> Photorealistic frontal talking-head video of the person in the source
> photo, framed from the shoulders up, face centered, looking straight
> into the camera the whole time. Plain indoor background, flat frontal
> lighting, no colored light, no visible light source, constant exposure.
> No eyeglasses, no hat.
>
> The subject stays in a mostly neutral pose for the full clip with only
> small, natural idle motion:
>
> - relaxed neutral expression, mouth closed, direct gaze
> - occasional natural blinks (roughly every 3–5 seconds)
> - one brief, small smile around the middle of the clip, then back to
>   neutral
> - very slight head drift only (a few degrees), no deliberate turns
>
> Output: 15 seconds, 24–30 fps, around 480p (will be resized to
> 640×480). Standard export — do not hand-retouch, do not stabilize, do
> not upscale.

---

## Why it stays basic — and where it therefore fails

| Pipeline layer | What a basic clip does | Result |
|---|---|---|
| Phase 1 · ID match | face is the ID portrait | **passes** (that's the identity being impersonated) |
| Phase 2 · Environment | injected via a normal browser context | passes on browser flags — this layer isn't the deepfake detector |
| Phase 3 · Flash-PAD | server flashes a *random* color sequence at the screen; a flat-lit recorded clip shows no matching skin reflection | **fails** — optical reflection mismatch |
| Phase 4 · Action challenge | server picks a *random* action (blink N / smile-hold / **turn head** / **raise eyebrows**) with a live deadline; the clip only idles and blinks | **fails** on any non-blink challenge — the clip can't turn its head or raise its brows on cue |
| Phase 5 · Forensics | commodity generator leaves boundary/frequency artifacts, flat affect | contributes to the fake score |

Net verdict: **FAILED / HIGH RISK** — the deepfake is detected. The
attacker would need a real-time, pose-controllable avatar *and* a way to
fake screen-light reflectance to get past Phases 3–4, which is out of
scope for this lab.
