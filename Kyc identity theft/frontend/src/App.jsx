import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { IDUpload } from './components/IDUpload';
import { DeepfakeProbe } from './components/DeepfakeProbe';
import { VideoPanel } from './components/VideoPanel';
import { TelemetryPanel } from './components/TelemetryPanel';
import { VerdictBar } from './components/VerdictBar';
import { BlockedModal } from './components/BlockedModal';
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

  return (
    <div className="min-h-screen bg-[#0B0C16] text-slate-100 flex flex-col justify-between">
      
      {/* Top Bar */}
      <Header isConnected={isConnected} phase={currentPhase} />

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          
          {/* Left Column (7 cols): ID Upload + Live Video */}
          <div className="lg:col-span-7 space-y-6">
            <IDUpload
              onIDUploaded={({ sessionId, faceCropBase64 }) => {
                setSessionId(sessionId);
                setFaceCrop(faceCropBase64);
              }}
              isSessionActive={isSessionActive}
            />

            <DeepfakeProbe />

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
            />
          </div>

          {/* Right Column (5 cols): Security Telemetry */}
          <div className="lg:col-span-5 h-full">
            <TelemetryPanel
              telemetry={telemetry}
              currentPhase={currentPhase}
            />
          </div>

        </div>

        {/* Bottom Verdict Bar */}
        <div className="mt-4 sm:mt-6">
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
