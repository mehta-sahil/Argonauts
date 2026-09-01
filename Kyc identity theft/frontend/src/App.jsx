import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { IDUpload } from './components/IDUpload';
import { VideoPanel } from './components/VideoPanel';
import { TelemetryPanel } from './components/TelemetryPanel';
import { VerdictBar } from './components/VerdictBar';
import { BlockedModal } from './components/BlockedModal';
import { StepBar } from './components/StepBar';
import { STEPS, stepIndexForPhase, PHASE_PROMPT } from './steps';
import { useEnvironmentCheck } from './hooks/useEnvironmentCheck';
import { useMediaPipe } from './hooks/useMediaPipe';
import { useFrameCapture } from './hooks/useFrameCapture';
import { useWebSocket } from './hooks/useWebSocket';

export const App = () => {
  // Session State
  const [sessionId, setSessionId] = useState(null);
  const [faceCrop, setFaceCrop] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('idle');
  const [phaseTitle, setPhaseTitle] = useState('');
  const [phaseInstruction, setPhaseInstruction] = useState('');
  
  // Phase Challenges & Config
  const [flashConfig, setFlashConfig] = useState(null);
  const [activeFlashColor, setActiveFlashColor] = useState(null);
  const [actionChallenge, setActionChallenge] = useState(null);
  
  // Telemetry & Verdict
  const [telemetry, setTelemetry] = useState({
    automation: { status: 'PENDING', display: 'Pending...' },
    camera_driver: { status: 'PENDING', display: 'Pending...' },
    frame_jitter: { status: 'PENDING', display: 'Pending...' },
    flash_pad: { status: 'PENDING', display: 'Pending...' },
    action_challenge: { status: 'PENDING', display: 'Pending...' },
    sobel_residual: { status: 'PENDING', display: 'Pending...' },
    fft_grid: { status: 'PENDING', display: 'Pending...' },
    ai_fake_score: { status: 'PENDING', display: 'Pending...' },
    face_match: { status: 'PENDING', display: 'Pending...' }
  });
  const [verdict, setVerdict] = useState(null);
  
  // Countdown Timer
  const [timeRemaining, setTimeRemaining] = useState(60);
  const timerIntervalRef = useRef(null);

  // Hard Block Alert
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState(null);
  const [blockDetails, setBlockDetails] = useState(null);

  // 'live' = webcam, 'attack' = replay deepfakevid.mp4 through the same element.
  const [sourceMode, setSourceMode] = useState('live');
  const [showDetails, setShowDetails] = useState(false);

  // References
  const videoRef = useRef(null);
  const isStreamingRef = useRef(false);
  const frameIntervalRef = useRef(null);

  // Hooks
  const { collectEnvironmentData } = useEnvironmentCheck();
  const { captureFrame } = useFrameCapture();

  // Handle Incoming WebSocket Messages
  const handleWebSocketMessage = useCallback((msg) => {
    const type = msg.type;

    if (type === 'session_start') {
      console.log('[App] Session started:', msg.session_id);
    } else if (type === 'phase_change') {
      setCurrentPhase(msg.phase);
      setPhaseTitle(msg.title || msg.phase);
      setPhaseInstruction(msg.instruction || '');

      if (msg.phase === 'flash_pad' && msg.config) {
        setFlashConfig(msg.config);
      } else if (msg.phase === 'action_challenge' && msg.challenge) {
        setActionChallenge(msg.challenge);
        resetCount();
      }
    } else if (type === 'telemetry') {
      setTelemetry((prev) => ({
        ...prev,
        [msg.check]: {
          status: msg.status,
          display: msg.display,
          value: msg.value,
          details: msg.details
        }
      }));
    } else if (type === 'blocked') {
      setIsBlocked(true);
      setBlockReason(msg.reason);
      setBlockDetails(msg.details);
      setIsSessionActive(false);
      isStreamingRef.current = false;
    } else if (type === 'verdict') {
      setVerdict(msg);
      setIsSessionActive(false);
      isStreamingRef.current = false;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, []);

  const { isConnected, connect, disconnect, sendMessage } = useWebSocket(sessionId, handleWebSocketMessage);

  // MediaPipe Hook with action detection callback
  const handleActionEvent = useCallback((ev) => {
    sendMessage({
      type: 'action_event',
      action: ev.action,
      count: ev.count
    });
  }, [sendMessage]);

  const { landmarks, ear, mar, yaw, browRatio, neuralSmile, neuralBrow, actionCount, detectFrame, resetCount } = useMediaPipe(videoRef);

  // Start Verification Pipeline
  const handleStartVerification = useCallback(async () => {
    if (!sessionId || !videoRef.current) return;

    setIsSessionActive(true);
    setVerdict(null);
    setIsBlocked(false);
    setTimeRemaining(60);
    isStreamingRef.current = true;

    // Reset telemetry
    setTelemetry({
      automation: { status: 'CHECKING', display: 'Inspecting...' },
      camera_driver: { status: 'CHECKING', display: 'Inspecting...' },
      frame_jitter: { status: 'CHECKING', display: 'Measuring variance...' },
      flash_pad: { status: 'PENDING', display: 'Pending...' },
      action_challenge: { status: 'PENDING', display: 'Pending...' },
      sobel_residual: { status: 'PENDING', display: 'Pending...' },
      fft_grid: { status: 'PENDING', display: 'Pending...' },
      ai_fake_score: { status: 'PENDING', display: 'Pending...' },
      face_match: { status: 'PENDING', display: 'Pending...' }
    });

    // 1. Connect WebSocket
    connect();

    // 2. Start Countdown Timer
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 3. Collect and send Phase 2 Environment Data
    setTimeout(async () => {
      const envData = await collectEnvironmentData(videoRef.current);
      sendMessage({
        type: 'env_data',
        ...envData
      });
    }, 500);

  }, [sessionId, connect, collectEnvironmentData, sendMessage]);

  // Main Streaming & Tracking Animation Loop (~15 FPS frame stream + 30 FPS landmark detection)
  useEffect(() => {
    let animId;

    const frameLoop = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        // Run MediaPipe Landmark detection
        detectFrame(actionChallenge, handleActionEvent);
      }
      animId = requestAnimationFrame(frameLoop);
    };

    animId = requestAnimationFrame(frameLoop);

    // Frame capture stream at ~15 FPS (every 66ms)
    frameIntervalRef.current = setInterval(() => {
      if (isStreamingRef.current && isConnected && videoRef.current) {
        const frameB64 = captureFrame(videoRef.current, 0.7);
        if (frameB64) {
          const lmsSimple = landmarks ? landmarks.map(p => [p.x, p.y, p.z || 0]) : null;
          sendMessage({
            type: 'frame',
            timestamp: Date.now() / 1000,
            phase: currentPhase,
            flash_color: activeFlashColor,
            frame: frameB64,
            landmarks: lmsSimple
          });
        }
      }
    }, 66);

    return () => {
      cancelAnimationFrame(animId);
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    };
  }, [detectFrame, actionChallenge, handleActionEvent, captureFrame, isConnected, currentPhase, activeFlashColor, landmarks, sendMessage]);

  // Restart Session Handler
  const handleRestart = useCallback(() => {
    disconnect();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsSessionActive(false);
    isStreamingRef.current = false;
    setCurrentPhase('idle');
    setVerdict(null);
    setIsBlocked(false);
    setFlashConfig(null);
    setActiveFlashColor(null);
    setActionChallenge(null);
    setSessionId(null);
    setFaceCrop(null);
    setTimeRemaining(60);
    resetCount();
  }, [disconnect, resetCount]);

  const activeStep = Math.max(0, stepIndexForPhase(currentPhase));
  const step = STEPS[activeStep];
  const failed = verdict && verdict.result && verdict.result !== 'PASSED';

  // One line, written for the person on camera. The action challenge supplies
  // its own wording; everything else comes from the step model, never from the
  // backend's engineer-facing phase titles.
  const prompt =
    currentPhase === 'action_challenge' && actionChallenge
      ? (actionChallenge.instruction || phaseInstruction)
      : PHASE_PROMPT[currentPhase] || step.blurb;

  return (
    <div className="min-h-screen bg-[#0B0C16] text-slate-100 flex flex-col">

      <Header isConnected={isConnected} phase={currentPhase} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 flex flex-col">

        {/* Progress: three dots, not six phase titles */}
        <div className="mb-8">
          <StepBar activeIndex={activeStep} failed={Boolean(failed)} />
        </div>

        {/* One heading, one instruction. Nothing else competes with it. */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-100">{step.heading}</h1>
          <p className="text-sm text-slate-400 mt-2 min-h-[1.25rem]">{prompt}</p>
        </div>

        {/* STEP 1 — Capture */}
        {activeStep === 0 && (
          <div className="space-y-4">
            <IDUpload
              onIDUploaded={({ sessionId, faceCropBase64 }) => {
                setSessionId(sessionId);
                setFaceCrop(faceCropBase64);
              }}
              isSessionActive={isSessionActive}
            />

            {/* Frame source. Live is the real product; attack replays the
                deepfake through the identical pipeline so a judge can watch the
                same three steps reach the opposite verdict. */}
            <div className="flex items-center justify-center gap-1 p-1 rounded-xl bg-navy-dark/60 border border-navy-border w-fit mx-auto">
              {[
                { id: 'live', label: 'Live camera' },
                { id: 'attack', label: 'Deepfake attack' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSourceMode(m.id)}
                  disabled={isSessionActive}
                  className={[
                    'px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40',
                    sourceMode === m.id
                      ? (m.id === 'attack'
                          ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40')
                      : 'text-slate-500 hover:text-slate-300'
                  ].join(' ')}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {sourceMode === 'attack' && (
              <p className="text-xs text-rose-300/80 text-center max-w-md mx-auto">
                Replaying a pre-recorded deepfake instead of your camera. The pipeline
                is not told the difference — it has to catch it.
              </p>
            )}
          </div>
        )}

        {/* The camera mounts once and stays mounted for the whole session.
            Mounting it on step 2 only would start the stream after the session
            had already begun, so jitter sampling would see no frames — and that
            check now fails closed. Visibility is CSS; the stream is continuous. */}
        <div className={activeStep === 1 ? 'block' : 'hidden'}>
          <VideoPanel
            videoRef={videoRef}
            phase={currentPhase}
            phaseTitle={phaseTitle}
            phaseInstruction={phaseInstruction}
            flashConfig={flashConfig}
            actionChallenge={actionChallenge}
            actionCount={actionCount}
            landmarks={landmarks}
            ear={ear}
            mar={mar}
            yaw={yaw}
            browRatio={browRatio}
            neuralSmile={neuralSmile}
            neuralBrow={neuralBrow}
            isStreaming={isSessionActive}
            onFlashColorChange={setActiveFlashColor}
            sourceMode={sourceMode}
          />
        </div>

        {/* STEP 3 — Verify */}
        {activeStep === 2 && (
          <TelemetryPanel telemetry={telemetry} currentPhase={currentPhase} />
        )}

        {/* Details drawer: every signal, collapsed by default. */}
        {activeStep !== 2 && isSessionActive && (
          <div className="mt-4">
            <button
              onClick={() => setShowDetails((v) => !v)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors mx-auto block"
            >
              {showDetails ? 'Hide' : 'Show'} security details
            </button>
            {showDetails && (
              <div className="mt-3">
                <TelemetryPanel telemetry={telemetry} currentPhase={currentPhase} />
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <VerdictBar
            verdict={verdict}
            timeRemaining={timeRemaining}
            totalTime={60}
            isSessionActive={isSessionActive}
            onRestart={handleRestart}
            onStartSession={handleStartVerification}
            hasID={Boolean(sessionId)}
          />
        </div>
      </main>

      {/* Security Block Alert Modal */}
      <BlockedModal
        isBlocked={isBlocked}
        blockReason={blockReason}
        blockDetails={blockDetails}
        onRestart={handleRestart}
      />

    </div>
  );
};
