# 01: Project Skeleton & Dashboard Shell

**What to build:**
A functional monorepo foundation with a FastAPI backend and a Vite + React + Tailwind CSS frontend. The user sees a dark-themed "Mastercard AI Defense Lab" dashboard shell that connects to the backend health endpoint and establishes the basic layout (Video panel, Telemetry panel, ID panel, Verdict bar).

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] Monorepo structure initialized with `backend/` and `frontend/` directories.
- [x] Backend FastAPI application running with CORS enabled for `http://localhost:5173`.
- [x] Health check endpoint (`GET /api/health`) returning operational status.
- [x] Frontend React application configured with Tailwind CSS using the Mastercard dark color palette (`navy: #1A1A2E`, `mc-red: #EB001B`, `mc-amber: #F79E1B`).
- [x] Dashboard layout rendered with placeholder quadrants for Live Video, Telemetry, ID Reference, and Verdict Bar.
- [x] Requirements files and package configurations prepared for single-command start.
