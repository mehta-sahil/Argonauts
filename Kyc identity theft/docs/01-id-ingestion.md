# Spec 01: ID Document Ingestion & Face Embedding

> **Phase:** 1 · **Label:** `ready-for-agent`

## Problem Statement

Before any liveness or fraud check can run, the system needs a trusted reference face to compare against. The user possesses a government-issued photo ID (Driver's License, Passport, or Aadhaar). The system must extract the face from this document, generate a high-dimensional embedding vector, and store it for the duration of the verification session as the identity baseline.

## Solution

A simple photo-upload flow where the user selects an ID document image from their device. The backend detects the face on the document using RetinaFace (bundled with InsightFace), generates a 512-dimensional ArcFace embedding, and returns a session ID plus a cropped face preview to the frontend. This embedding becomes the ground truth for Phase 6 identity matching.

## User Stories

1. As a **user**, I want to upload a photo of my government ID, so that the system can extract my reference face for verification.
2. As a **user**, I want to see a cropped preview of the face the system detected on my ID, so that I can confirm it extracted the right face before proceeding.
3. As a **user**, I want to receive clear feedback if my uploaded image doesn't contain a detectable face, so that I can upload a better photo.
4. As a **user**, I want to drag-and-drop my ID image or click to browse, so that uploading is convenient regardless of my preference.
5. As a **user**, I want the upload to accept common image formats (JPEG, PNG, WebP), so that I don't have to convert my photo.
6. As a **user**, I want the upload to reject files that are too small or too large, so that the system tells me upfront rather than failing silently.
7. As the **backend**, I want to validate that exactly one face is detected on the ID document, so that ambiguous multi-face documents don't create an unreliable baseline.
8. As the **backend**, I want to generate a 512-d ArcFace embedding from the detected face, so that Phase 6 can compute cosine similarity against live frames.
9. As the **backend**, I want to create an in-memory session keyed by a UUID, storing the embedding and session metadata, so that the WebSocket phase can look up the reference embedding.
10. As the **frontend**, I want to display the uploaded document thumbnail alongside the extracted face crop in the ID Reference panel, so that the dashboard layout matches the wireframe.

## Implementation Decisions

- **Face detection model**: RetinaFace via `insightface` Python package. This is bundled with InsightFace and provides bounding box + 5-point landmark alignment. No separate MTCNN dependency needed.
- **Face embedding model**: ArcFace (ResNet-100 backbone) via `insightface`. Produces a 512-d L2-normalized embedding vector.
- **Model loading**: InsightFace `buffalo_l` model pack. Auto-downloads on first use to `~/.insightface/models/`. For offline demos, pre-download into the `models/` directory.
- **Upload endpoint**: `POST /api/upload-id` accepts `multipart/form-data` with a single image file. Returns JSON: `{ session_id, face_crop_base64, face_bbox, embedding_dim }`.
- **Validation rules**:
  - File size: 100KB–10MB
  - Formats: JPEG, PNG, WebP
  - Exactly 1 face detected (0 → "No face found", >1 → "Multiple faces detected")
  - Minimum face size: 80×80 pixels after detection
- **Session storage**: Python dictionary keyed by UUID string. Session object stores: `session_id`, `id_embedding` (numpy array), `id_face_crop` (base64), `created_at`, `phase` (enum), `telemetry` (dict).
- **Face crop for UI**: The detected face is cropped with a 20% margin, resized to 150×150, JPEG-encoded, and returned as base64 for the ID Reference panel.

## Testing Decisions

- **Good tests** for this module test the external API contract: given an image with a clear face → returns session ID + crop. Given an image with no face → returns 400 error. Given an oversized file → returns 413.
- **Modules to test**:
  - Upload endpoint (HTTP integration test via FastAPI TestClient)
  - Face extraction logic (unit test with fixture images)
  - Session creation/retrieval (unit test)
- **Test fixtures**: Include 3-4 sample ID photos in `tests/fixtures/` — one valid, one with no face, one with multiple faces, one low-resolution.

## Out of Scope

- OCR / text extraction from the ID document (name, DOB, ID number).
- Document authenticity verification (hologram detection, MRZ parsing).
- Camera-based ID capture (user holds ID up to webcam).
- Document type classification (passport vs. license vs. Aadhaar).

## Further Notes

- The embedding is stored only in memory for the session lifetime. No face data is persisted to disk or database.
- The `buffalo_l` model pack is ~300MB. The download script in `models/download_models.py` should handle this with progress indication.
- ArcFace embeddings are L2-normalized, so cosine similarity is equivalent to dot product. This simplifies the Phase 6 computation.
