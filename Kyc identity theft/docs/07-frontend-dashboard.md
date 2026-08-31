# Spec 07: Frontend Dashboard & UI

> **Component:** Frontend · **Label:** `ready-for-agent`

## Problem Statement

The KYC verification pipeline has six phases producing over a dozen real-time metrics. Hackathon judges need to see all of this working simultaneously — the live camera feed, the active challenge, the flash overlay, the forensic scores updating, and the final verdict — without clicking through multiple pages. The UI must be visually impressive (dark security-operations-center aesthetic), technically transparent (showing the underlying metrics), and functionally simple (upload ID → click start → watch it work).

## Solution

A single-page React dashboard built with Vite and styled with Tailwind CSS. The layout has four quadrants: video feed (top-left), telemetry panel (right), ID reference (bottom-left), and verdict bar (bottom). All phases transition in-place on the video panel — the flash overlay, action challenge prompt, and face mesh all render as overlays on the same video feed. The telemetry panel updates in real-time via WebSocket messages, creating a "security operations center" feel.

## User Stories

1. As a **user**, I want a single-page experience where I upload my ID and click one button to start verification, so that the flow is simple and linear.
2. As a **user**, I want to see my live camera feed with the challenge prompts overlaid, so that I can perform the requested actions while watching myself.
3. As a **user**, I want to see all security check results updating in real-time on the right panel, so that I can follow the verification progress.
4. As a **user**, I want the Flash-PAD color overlay to be semi-transparent, so that I can still see my face during the flash sequence.
5. As a **user**, I want a countdown timer visible at all times during verification, so that I know how much time remains.
6. As a **user**, I want the final verdict to appear with a clear visual distinction (green for pass, red for fail), so that the outcome is immediately obvious.
7. As a **user**, I want a "Download Report" button after the verdict, so that I can save the verification results as JSON.
8. As a **judge**, I want the face mesh wireframe visible on the video feed (toggle-able), so that I can see the landmark tracking technology working.
9. As a **judge**, I want the UI to feel like a professional security product, not a student project, so that the team's technical capability is evident.
10. As a **developer**, I want component-level separation (VideoPanel, TelemetryPanel, IDUpload, VerdictBar), so that each panel can be developed and tested independently.
11. As a **developer**, I want custom hooks for WebSocket, MediaPipe, frame capture, and environment checks, so that logic is reusable and the components stay clean.
12. As a **developer**, I want Tailwind's utility classes for rapid dark-theme styling, so that I spend time on functionality not CSS.

## Implementation Decisions

### Project Setup

- **Scaffolding**: `npm create vite@latest frontend -- --template react`
- **Tailwind**: Install via `npm install -D tailwindcss @tailwindcss/vite`; configure in `vite.config.js` and `tailwind.config.js`
- **No component library**: Pure Tailwind utility classes. No MUI, Chakra, or other component frameworks.
- **Structure**:
  ```
  frontend/
  ├── src/
  │   ├── App.jsx              # Root layout + session state machine
  │   ├── main.jsx             # Vite entry point
  │   ├── index.css            # Tailwind directives + custom styles
  │   ├── components/
  │   │   ├── VideoPanel.jsx   # Camera feed + overlays
  │   │   ├── TelemetryPanel.jsx # Real-time check status cards
  │   │   ├── IDUpload.jsx     # Drag-and-drop ID upload
  │   │   └── VerdictBar.jsx   # Countdown + final verdict
  │   ├── hooks/
  │   │   ├── useWebSocket.js  # WS lifecycle management
  │   │   ├── useMediaPipe.js  # Face Mesh initialization + landmark computation
  │   │   ├── useFrameCapture.js # Canvas capture + base64 encoding
  │   │   └── useEnvironmentCheck.js # Client-side env checks
  │   └── utils/
  │       └── flashPad.js      # Flash sequence timing + overlay control
  ├── tailwind.config.js
  ├── vite.config.js
  └── package.json
  ```

### Color Palette & Theme

| Token | Hex | Usage |
|-------|-----|-------|
| `navy` | `#1A1A2E` | Primary background |
| `navy-light` | `#16213E` | Card backgrounds |
| `navy-dark` | `#0F0F23` | Deepest background |
| `mc-red` | `#EB001B` | Mastercard primary, fail states |
| `mc-amber` | `#F79E1B` | Mastercard secondary, warning states |
| `mc-orange` | `#FF5F00` | Mastercard accent |
| `success` | `#10B981` | Pass states (Tailwind emerald-500) |
| `text-primary` | `#F1F5F9` | Primary text (Tailwind slate-100) |
| `text-secondary` | `#94A3B8` | Secondary text (Tailwind slate-400) |

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER: Mastercard AI Defense Lab — Automated KYC Verification Pipeline   │
├────────────────────────────────┬────────────────────────────────────────────┤
│                                │                                            │
│   ┌────────────────────────┐   │  Live Security Telemetry & Forensics       │
│   │                        │   │  ┌──────────────────────────────────────┐  │
│   │   <video> element      │   │  │ • Automation:      [PASSED]  🟢     │  │
│   │   + Flash overlay      │   │  │ • Camera Driver:   [HARDWARE OK] 🟢 │  │
│   │   + Face mesh wireframe│   │  │ • Frame Jitter:    [0.42 ms²]  🟢   │  │
│   │   + Action prompt      │   │  │ • Flash-PAD Sync:  [91% MATCH] 🟢  │  │
│   │                        │   │  │ • Sobel Residual:  [0.04 CLEAN] 🟢  │  │
│   └────────────────────────┘   │  │ • FFT Anomaly:     [NO ARTIFACTS]🟢 │  │
│                                │  │ • AI Fake Score:   [0.08]       🟢  │  │
│   Prompt: "Blink 3 Times"     │  │ • Face Match:      [92.4% SIM]  🟢  │  │
│   Count: [ 2 / 3 ]            │  └──────────────────────────────────────┘  │
│                                │                                            │
│   ┌────────────────────────┐   │                                            │
│   │ ID Reference:          │   │                                            │
│   │ [Uploaded Doc] [Crop]  │   │                                            │
│   └────────────────────────┘   │                                            │
├────────────────────────────────┴────────────────────────────────────────────┤
│  VERDICT BAR: ⏱ 42s remaining  |  Final Verdict: [ VERIFIED — LOW RISK ] ✅│
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Grid**: CSS Grid with `grid-template-columns: 1fr 1fr` and `grid-template-rows: auto 1fr auto`.
- **Responsive**: Optimized for 1280px+ screens (hackathon demo on a laptop/projector). Not mobile-responsive.

### Component Details

**App.jsx** — Session state machine:
- States: `IDLE → UPLOADING → READY → VERIFYING → COMPLETE`
- `IDLE`: Shows IDUpload component
- `UPLOADING`: Uploading indicator
- `READY`: ID processed, shows "Start Verification" button
- `VERIFYING`: Full dashboard visible, WebSocket active, timer counting
- `COMPLETE`: Verdict displayed, "Download Report" and "Start New" buttons

**VideoPanel.jsx**:
- Initializes `getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })`
- Renders `<video autoPlay playsInline muted>` element
- Overlay layers (z-indexed):
  1. Base: `<video>` element
  2. Flash overlay: `<div>` with dynamic `backgroundColor` and `opacity: 0.7`
  3. Face mesh: `<canvas>` with MediaPipe wireframe drawing
  4. Action prompt: absolutely-positioned text with counter
- Client-side guards run here: multiple camera blocking, framerate monitoring

**TelemetryPanel.jsx**:
- 8 check rows, each rendered as a card with:
  - Check name
  - Status badge: 🟢 PASSED / 🔴 FAILED / 🟡 PENDING / ⏳ CHECKING (animated)
  - Detail value (variance, correlation, score, percentage)
- Receives updates via the WebSocket hook
- Cards animate in when they transition from PENDING to PASSED/FAILED

**IDUpload.jsx**:
- Drag-and-drop zone with dashed border
- Accepts JPEG, PNG, WebP
- Shows upload progress → shows document thumbnail + extracted face crop
- "Upload a different ID" link to re-upload

**VerdictBar.jsx**:
- Fixed to the bottom of the dashboard
- Left side: countdown timer (60s → 0s) with progress bar
- Right side: verdict display
  - Before verdict: "Analyzing..." with pulsing animation
  - VERIFIED: green background, checkmark icon, "KYC VERIFIED — LOW RISK"
  - FAILED: red background, X icon, "VERIFICATION FAILED" + fraud flag list
- "Download Report" button (appears after verdict)

### Custom Hooks

**useWebSocket.js**:
- Connects to `ws://localhost:8000/ws/{sessionId}`
- Exposes: `{ send, lastMessage, isConnected, disconnect }`
- Auto-reconnect: 1 attempt with 2-second delay (don't fight it in a demo)
- Parses incoming JSON messages and dispatches to state handlers

**useMediaPipe.js**:
- Loads `@mediapipe/tasks-vision` (FaceLandmarker)
- Initializes with WASM runtime
- Processes each video frame to produce 468 landmarks
- Computes derived metrics: EAR, MAR, yaw angle, eyebrow distance
- Exposes: `{ landmarks, ear, mar, yaw, eyebrowRaise, isTracking }`

**useFrameCapture.js**:
- Creates an offscreen `<canvas>` for frame extraction
- Captures frames at ~15 FPS using `setInterval` or `requestVideoFrameCallback`
- Encodes as JPEG (quality 0.7) → base64
- Records `requestVideoFrameCallback` timestamps for jitter computation
- Exposes: `{ startCapture, stopCapture, jitterDeltas }`

**useEnvironmentCheck.js**:
- Checks `navigator.webdriver`, `navigator.plugins`, `window.chrome`
- Enumerates devices via `navigator.mediaDevices.enumerateDevices()`
- Counts video inputs; blocks if > 1
- Monitors ongoing frame delivery rate
- Exposes: `{ envData, isBlocked, blockReason }`

### Animations & Polish

- Telemetry cards: fade-in + slide-up when status transitions (CSS transition on opacity + transform)
- Verdict bar: background color transition (0.5s ease) from navy → green/red
- Flash overlay: instant color transitions (no CSS transition — must be sharp for chromaticity analysis)
- Timer: smooth width animation on the progress bar
- Header: Mastercard logo (SVG or text fallback) with subtle glow effect

## Testing Decisions

- **Good tests** for frontend components verify rendering and state transitions, not internal implementation.
- **Modules to test**:
  - App session state machine — verify correct component rendering per state
  - TelemetryPanel — verify correct status badges given various telemetry messages
  - VerdictBar — verify correct rendering for VERIFIED vs. FAILED verdicts
- **Testing approach**: Manual visual testing for the hackathon. Component tests via React Testing Library if time permits.
- **Prior art**: Standard Vite + React testing setup with Vitest if tests are added.

## Out of Scope

- Mobile responsive design. Dashboard is optimized for laptop/projector display.
- Dark/light theme toggle. Dark theme only.
- Internationalization (i18n). English only.
- Accessibility (ARIA, screen reader support). Not a priority for hackathon demo.
- Browser support beyond Chrome. Chrome-only.

## Further Notes

- The header should prominently display "Mastercard AI Defense Lab" as the product name. Use the Mastercard color scheme (red/amber/orange interlocking circles or text treatment) to reinforce brand identity.
- The face mesh wireframe overlay is a high-impact visual for judges — seeing 468 green landmarks tracking the face in real-time immediately communicates "this is advanced AI." Make it toggle-able with a small button in the corner of the video panel.
- The telemetry panel is the soul of the demo. Each check transitioning from ⏳ to 🟢 in sequence tells a story of multi-layered security. Time the phases so that checks light up progressively over the 60-second session.
