// The backend runs six phases. Showing six labelled stages to a person being
// verified is noise — they only need to know which of three things is happening
// to them right now. This maps the wire protocol onto that smaller story; the
// backend state machine is untouched.

export const STEPS = [
  {
    id: 'capture',
    n: 1,
    label: 'Capture',
    heading: 'Show us your ID',
    blurb: 'Upload a government ID. We read the portrait from it.',
    phases: ['idle', 'id_ingestion']
  },
  {
    id: 'liveness',
    n: 2,
    label: 'Liveness',
    heading: 'Prove you are here',
    blurb: 'Look at the screen and follow the prompt.',
    phases: ['env_check', 'flash_pad', 'action_challenge']
  },
  {
    id: 'verify',
    n: 3,
    label: 'Verify',
    heading: 'Checking it is really you',
    blurb: 'Matching your face against the ID.',
    phases: ['forensics', 'face_match', 'verdict', 'completed']
  }
];

export const stepForPhase = (phase) =>
  STEPS.find((s) => s.phases.includes(phase)) || STEPS[0];

export const stepIndexForPhase = (phase) =>
  STEPS.findIndex((s) => s.phases.includes(phase));

// What the person actually reads mid-step. The backend's own instruction text is
// written for engineers ("Measuring skin chromaticity reflections"), so it is
// deliberately not surfaced here — it stays available in the details drawer.
export const PHASE_PROMPT = {
  env_check: 'Checking your camera and browser.',
  flash_pad: 'Hold still. The screen will flash.',
  action_challenge: null, // replaced by the live action instruction
  forensics: 'Analysing the video.',
  face_match: 'Comparing with your ID.',
  verdict: 'Almost done.'
};

// Which telemetry keys belong to which step, for the details drawer.
export const STEP_CHECKS = {
  capture: [],
  liveness: ['automation', 'camera_driver', 'frame_jitter', 'flash_pad', 'action_challenge'],
  verify: ['sobel_residual', 'fft_grid', 'ai_fake_score', 'face_match']
};
