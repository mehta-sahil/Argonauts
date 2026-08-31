import React from 'react';
import { 
  Bot, 
  Video, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  Fingerprint, 
  ShieldAlert,
  Layers,
  Cpu
} from 'lucide-react';

const checkConfig = [
  {
    key: 'automation',
    label: 'Headless / Automation Gate',
    sub: 'navigator.webdriver & headless signature inspection',
    icon: Bot
  },
  {
    key: 'camera_driver',
    label: 'Camera Driver & Loopback',
    sub: 'OBS, v4l2loopback, VirtualCam filter',
    icon: Video
  },
  {
    key: 'frame_jitter',
    label: 'Frame Delivery Jitter',
    sub: 'requestVideoFrameCallback timing variance',
    icon: Activity
  },
  {
    key: 'flash_pad',
    label: 'Optical Flash-PAD Sync',
    sub: 'Skin chromaticity reflection correlation',
    icon: Sparkles
  },
  {
    key: 'action_challenge',
    label: 'Dynamic Action Liveness',
    sub: 'MediaPipe landmark biometric state machine',
    icon: Zap
  },
  {
    key: 'sobel_residual',
    label: 'Sobel Boundary Residual',
    sub: 'Perimeter gradient variance & blending cuts',
    icon: Layers
  },
  {
    key: 'fft_grid',
    label: '2D FFT Grid Anomaly',
    sub: 'Transposed convolution periodic peak detection',
    icon: Cpu
  },
  {
    key: 'ai_fake_score',
    label: 'AI Deepfake Probability',
    sub: 'Neural classifier synthetic artifact score (< 0.20)',
    icon: ShieldAlert
  },
  {
    key: 'face_match',
    label: '1:1 Face Embedding Similarity',
    sub: 'ArcFace 512-d cosine similarity baseline (≥ 0.85)',
    icon: Fingerprint
  }
];

export const TelemetryPanel = ({ telemetry, currentPhase }) => {
  return (
    <div className="bg-navy-card/90 rounded-2xl border border-navy-border p-5 shadow-2xl backdrop-blur-sm flex flex-col justify-between h-full">
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-mc-amber/10 border border-mc-amber/30 flex items-center justify-center text-mc-amber font-mono font-bold text-sm">
              03
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Security Telemetry & Forensics</h2>
              <p className="text-xs text-slate-400 font-mono">Real-Time Multi-Layer Defense Matrix</p>
            </div>
          </div>

          <span className="text-[11px] font-mono bg-navy-dark px-2.5 py-1 rounded-full border border-navy-border text-slate-400">
            9 CHECKS ACTIVE
          </span>
        </div>

        {/* Check Grid / Rows */}
        <div className="space-y-2.5">
          {checkConfig.map((item) => {
            const data = telemetry?.[item.key] || { status: 'PENDING', display: 'Pending...' };
            const Icon = item.icon;

            const isPassed = data.status === 'PASSED' || data.status === 'PASS';
            const isFailed = data.status === 'FAILED';
            const isChecking = data.status === 'CHECKING';

            let badgeBg = 'bg-slate-900/60 text-slate-400 border-slate-800';
            let iconColor = 'text-slate-400';

            if (isPassed) {
              badgeBg = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20';
              iconColor = 'text-emerald-400';
            } else if (isFailed) {
              badgeBg = 'bg-mc-red/20 text-mc-red border-mc-red/40 animate-pulse';
              iconColor = 'text-mc-red';
            } else if (isChecking) {
              badgeBg = 'bg-mc-amber/20 text-mc-amber border-mc-amber/40 animate-pulse';
              iconColor = 'text-mc-amber';
            }

            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-2.5 rounded-xl bg-navy-dark/70 border border-navy-border hover:border-slate-700 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded-lg bg-navy-light/80 border border-navy-border ${iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-200">{item.label}</h3>
                    <p className="text-[10px] text-slate-500 font-mono">{item.sub}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${badgeBg}`}>
                    {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />}
                    {isFailed && <XCircle className="w-3.5 h-3.5 text-mc-red inline" />}
                    {isChecking && <Clock className="w-3.5 h-3.5 text-mc-amber animate-spin inline" />}
                    <span>{data.display || data.status}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Engine Specs */}
      <div className="mt-4 pt-3 border-t border-navy-border/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>ARC-FACE 512-D ONNX</span>
        <span>•</span>
        <span>SOBEL 3X3 RESIDUAL</span>
        <span>•</span>
        <span>2D FFT 256X256</span>
      </div>

    </div>
  );
};
