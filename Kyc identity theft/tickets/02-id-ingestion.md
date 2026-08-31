# 02: ID Document Ingestion & Face Embedding

**What to build:**
The complete Phase 1 flow where a user uploads a government photo ID. The backend detects the face using RetinaFace/OpenCV, extracts a 512-dimensional ArcFace/DCT embedding vector, initializes an in-memory session, and returns a cropped face thumbnail preview for display in the ID Reference panel on the frontend.

**Blocked by:**
- 01: Project Skeleton & Dashboard Shell

**Status:** completed

- [x] `POST /api/upload-id` endpoint accepting multipart image uploads (JPEG, PNG, WebP).
- [x] Backend face detection validating that exactly one face exists on the document (rejecting 0 or multiple faces).
- [x] 512-dimensional L2-normalized ArcFace embedding extracted and stored in an in-memory session dictionary keyed by UUID.
- [x] Frontend drag-and-drop / file selector component in the ID Reference quadrant.
- [x] Cropped face thumbnail returned from backend and rendered in the frontend UI alongside the upload confirmation.
- [x] "Start Verification" button enabled once a valid ID document has been ingested and session created.
