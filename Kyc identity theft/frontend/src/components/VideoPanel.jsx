import React, { useState, useEffect, useRef } from 'react';
import { Camera, Eye, Scan, RefreshCw, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { FaceMeshOverlay } from './FaceMeshOverlay';

export const VideoPanel = ({
  videoRef,
  phase,
  phaseTitle,
  phaseInstruction,
  flashConfig,
  actionChallenge,
  actionCount,
  landmarks,
  ear,
  mar,
  yaw,
  browRatio = 1.0,
  neuralSmile = 0.0,
  neuralBrow = 0.0,
  isStreaming,
  onStreamReady,
  onFlashColorChange,
  sourceMode = 'live',
  attackClip = '/sample/deepfakevid.mp4'
}) => {
  const [showMesh, setShowMesh] = useState(true);
  const [flashColor, setFlashColor] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(Date.now());

  // Initialize the frame source.
  // 'attack' replays the deepfake clip through the same <video> element the
  // camera would use, so every downstream consumer — frame capture, MediaPipe,
  // the websocket — is byte-identical to a live session. That is the point: the
  // pipeline is not told which source it is looking at.
  useEffect(() => {
    let stream = null;

    const startClip = () => {
      setCameraError(null);
      const el = videoRef.current;
      if (!el) return;
      el.srcObject = null;
      el.src = attackClip;
      el.loop = true;
      el.muted = true;
      el.playsInline = true;
      el.onloadedmetadata = () => {
        el.play().catch((e) => setCameraError('Could not play the attack clip: ' + e.message));
        if (onStreamReady) onStreamReady(el);
      };
      el.onerror = () => setCameraError('Attack clip failed to load from ' + attackClip);
    };

    const startCamera = async () => {
      try {
        setCameraError(null);
        if (videoRef.current) videoRef.current.src = '';
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
            frameRate: { ideal: 30 }
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            if (onStreamReady) onStreamReady(videoRef.current);
          };
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setCameraError("Camera permission denied or camera device in use.");
      }
    };

    if (sourceMode === 'attack') {
      startClip();
    } else {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const el = videoRef.current;
      if (el) {
        el.onloadedmetadata = null;
        el.onerror = null;
      }
    };
  }, [videoRef, onStreamReady, sourceMode, attackClip]);

  // FPS Counter
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastFpsTimeRef.current) / 1000;
      if (delta > 0) {
        setFps(Math.round(frameCountRef.current / delta));
      }
      frameCountRef.current = 0;
      lastFpsTimeRef.current = now;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Flash-PAD Sequence Controller
  useEffect(() => {
    if (phase === 'flash_pad' && flashConfig && flashConfig.colors) {
      const colors = flashConfig.colors;
      const duration = flashConfig.duration_ms || 400;
      const delayBefore = flashConfig.delay_before_ms || 400;

      const timeouts = [];

      // Initial preparation delay
      const startTimeout = setTimeout(() => {
        colors.forEach((color, idx) => {
          const t = setTimeout(() => {
            setFlashColor(color);
            if (onFlashColorChange) onFlashColorChange(color);
          }, idx * duration);
          timeouts.push(t);
        });

        // Clear flash after sequence ends
        const endTimeout = setTimeout(() => {
          setFlashColor(null);
          if (onFlashColorChange) onFlashColorChange(null);
        }, colors.length * duration);
        timeouts.push(endTimeout);

      }, delayBefore);

      timeouts.push(startTimeout);

      return () => {
        timeouts.forEach(t => clearTimeout(t));
        setFlashColor(null);
        if (onFlashColorChange) onFlashColorChange(null);
      };
    } else {
      setFlashColor(null);
      if (onFlashColorChange) onFlashColorChange(null);
    }
  }, [phase, flashConfig, onFlashColorChange]);

  return (
    <>
    {/* Flash-PAD emitter. Fixed to the viewport and fully opaque so the screen
        itself becomes the light source — that reflected light off real skin is
        what the backend measures. Tinting the video preview instead would
        change the recorded pixels while leaving the face unlit. */}
    {flashColor && (
      <div
        className="fixed inset-0 z-[100] pointer-events-none"
        style={{ backgroundColor: flashColor, opacity: 1 }}
        aria-hidden="true"
      />
    )}

    <div 
      className={`bg-navy-card/90 rounded-2xl border p-5 shadow-2xl backdrop-blur-sm relative overflow-hidden flex flex-col justify-between transition-colors duration-200 ${
        flashColor ? 'border-2 border-mc-amber shadow-[0_0_50px_rgba(247,158,27,0.3)]' : 'border-navy-border'
      }`}
    >
      
      {/* Top Controls & Status */}
      <div className="flex items-center justify-between gap-2 mb-3 z-20">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-mc-red/10 border border-mc-red/30 flex items-center justify-center text-mc-red font-mono font-bold text-sm">
            02
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Live Biometric Sensor</span>
              {isStreaming && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </h2>
            <p className="text-xs text-slate-400 font-mono">640×480 @ {fps > 0 ? fps : 30} FPS · RGB Spectrum</p>
          </div>
        </div>

        {/* Mesh Toggle Button */}
        <button
          type="button"
          onClick={() => setShowMesh(!showMesh)}
          className={`shrink-0 flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
            showMesh 
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' 
              : 'bg-navy-dark border-navy-border text-slate-400'
          }`}
        >
          <Scan className="w-3.5 h-3.5" />
          <span>{showMesh ? 'Mesh: ON' : 'Mesh: OFF'}</span>
        </button>
      </div>

      {/* Main Video Viewport */}
      <div className="relative aspect-[4/3] w-full bg-navy-dark rounded-xl overflow-hidden border border-navy-border shadow-inner">
        
        {/* Flash-PAD Status Banner */}
        {flashColor && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[101] max-w-[92%] bg-navy-dark/95 text-white px-3 sm:px-4 py-1.5 rounded-full border-2 border-mc-amber text-[10px] sm:text-xs font-mono font-bold animate-pulse flex items-center space-x-2 shadow-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-mc-amber animate-ping shrink-0" />
            <span className="truncate">OPTICAL FLASH-PAD ACTIVE (400ms): {flashColor}</span>
          </div>
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform -scale-x-100"
          onTimeUpdate={() => { frameCountRef.current++; }}
        />

        {/* MediaPipe FaceMesh Wireframe Overlay */}
        {showMesh && landmarks && (
          <FaceMeshOverlay landmarks={landmarks} width={640} height={480} />
        )}

        {/* Cyber Reticle Corners */}
        <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-mc-amber/60 pointer-events-none" />
        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-mc-amber/60 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-mc-amber/60 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-mc-amber/60 pointer-events-none" />

        {/* Action Challenge Prompt HUD */}
        {phase === 'action_challenge' && actionChallenge && (
          <div className="absolute bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-30 bg-navy-dark/95 border-2 border-mc-amber rounded-xl p-3 sm:p-3.5 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-mc-amber uppercase tracking-wider font-bold">
                  ACTIVE CHALLENGE REQUIRED
                </span>
                <p className="text-sm font-bold text-white">{actionChallenge.prompt}</p>
              </div>

              {/* Counter Display & Neural Activation Status */}
              {actionChallenge.action === 'BLINK_N' && (
                <div className="bg-navy-light px-3 py-1.5 rounded-lg border border-navy-border flex items-center space-x-2 font-mono">
                  <span className="text-xs text-slate-400">Count:</span>
                  <span className="text-base font-bold text-mc-amber">
                    {actionCount} / {actionChallenge.params?.target_count || 3}
                  </span>
                </div>
              )}

              {actionChallenge.action === 'SMILE_HOLD' && (
                <div className="bg-navy-light px-3 py-1.5 rounded-lg border border-navy-border flex items-center space-x-2 font-mono">
                  <span className="text-xs text-slate-400">CNN Smile:</span>
                  <span className={`text-sm font-bold ${neuralSmile > 0.45 || mar > 0.55 ? 'text-emerald-400' : 'text-mc-amber'}`}>
                    {(neuralSmile > 0 ? neuralSmile * 100 : mar * 100).toFixed(0)}%
                  </span>
                </div>
              )}

              {actionChallenge.action === 'EYEBROW_RAISE' && (
                <div className="bg-navy-light px-3 py-1.5 rounded-lg border border-navy-border flex items-center space-x-2 font-mono">
                  <span className="text-xs text-slate-400">CNN Brow:</span>
                  <span className={`text-sm font-bold ${neuralBrow > 0.40 || browRatio >= 1.22 ? 'text-emerald-400' : 'text-mc-amber'}`}>
                    {(neuralBrow > 0 ? neuralBrow * 100 : (browRatio - 1.0) * 100).toFixed(0)}%
                  </span>
                </div>
              )}

              {actionChallenge.action === 'HEAD_TURN' && (
                <div className="bg-navy-light px-3 py-1.5 rounded-lg border border-navy-border flex items-center space-x-2 font-mono">
                  <span className="text-xs text-slate-400">Yaw:</span>
                  <span className={`text-sm font-bold ${actionCount >= 1 ? 'text-emerald-400' : 'text-mc-amber'}`}>
                    {yaw > 0 ? `+${yaw.toFixed(1)}°` : `${yaw.toFixed(1)}°`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase Notification Banner */}
        {phaseTitle && phase !== 'action_challenge' && !flashColor && (
          <div className="absolute bottom-3 left-3 right-3 z-20 bg-navy-dark/90 border border-navy-border rounded-lg px-3 py-2 text-xs font-mono backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-200">
              <Activity className="w-3.5 h-3.5 text-mc-amber animate-spin" />
              <span>{phaseInstruction || phaseTitle}</span>
            </div>
          </div>
        )}

        {/* Camera Error Alert */}
        {cameraError && (
          <div className="absolute inset-0 bg-navy-dark/95 flex flex-col items-center justify-center p-6 text-center z-40">
            <AlertTriangle className="w-12 h-12 text-mc-red mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Camera Sensor Unavailable</h3>
            <p className="text-xs text-slate-400 max-w-xs">{cameraError}</p>
          </div>
        )}

      </div>

      {/* Real-time Facial Metric Telemetry Bar (4 Columns) */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono bg-navy-dark/80 p-2.5 rounded-xl border border-navy-border">
        <div>
          <span className="text-slate-500 block text-[10px]">EAR (BLINK)</span>
          <span className={`font-bold ${ear < 0.22 ? 'text-mc-amber' : 'text-slate-300'}`}>
            {ear.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">CNN SMILE</span>
          <span className={`font-bold ${neuralSmile > 0.45 || mar > 0.55 ? 'text-emerald-400' : 'text-slate-300'}`}>
            {neuralSmile > 0 ? `${(neuralSmile * 100).toFixed(0)}%` : mar.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">CNN BROW</span>
          <span className={`font-bold ${neuralBrow > 0.40 || browRatio >= 1.22 ? 'text-emerald-400' : 'text-slate-300'}`}>
            {neuralBrow > 0 ? `${(neuralBrow * 100).toFixed(0)}%` : `${browRatio.toFixed(2)}x`}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">HEAD YAW</span>
          <span className="font-bold text-slate-300">
            {yaw > 0 ? `+${yaw.toFixed(0)}°` : `${yaw.toFixed(0)}°`}
          </span>
        </div>
      </div>

    </div>
    </>
  );
};
