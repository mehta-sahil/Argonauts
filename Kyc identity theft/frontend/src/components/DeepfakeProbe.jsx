import React, { useState, useRef } from 'react';
import { Upload, ShieldAlert, ShieldCheck, Loader2, AlertCircle, Film } from 'lucide-react';

/**
 * Red-team probe. The live flow only ever sees webcam frames, so there was no
 * way to demonstrate the forensics catching a known deepfake. This posts a clip
 * to /api/analyze-video, which runs the same Sobel / FFT / classifier path the
 * live session uses.
 */
export const DeepfakeProbe = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [filename, setFilename] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('video/')) {
      setError('Please upload a video file (MP4, WebM or MOV).');
      return;
    }

    setError(null);
    setResult(null);
    setFilename(file.name);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiBase = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
      const response = await fetch(`${apiBase}/api/analyze-video`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Analysis failed.');
      }
      setResult(await response.json());
    } catch (err) {
      setError(err.message || 'Error communicating with the forensics server.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const flagged = result?.flagged;

  return (
    <div className="bg-navy-card/90 rounded-2xl border border-navy-border p-5 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center space-x-2 mb-1">
        <Film className="w-4 h-4 text-mc-amber" />
        <h2 className="font-bold text-sm text-slate-100">Deepfake Forensic Probe</h2>
      </div>
      <p className="text-[11px] text-slate-400 mb-4 font-mono">
        Upload a synthetic clip and run the same engine the live session uses.
      </p>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isAnalyzing}
        className="w-full border-2 border-dashed border-navy-border hover:border-mc-amber rounded-xl p-5 transition-colors disabled:opacity-50 flex flex-col items-center space-y-2"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-6 h-6 text-mc-amber animate-spin" />
            <span className="text-xs font-mono text-slate-300">Sampling frames…</span>
          </>
        ) : (
          <>
            <Upload className="w-6 h-6 text-slate-400" />
            <span className="text-xs font-mono text-slate-300">
              {filename || 'Drop a video or click to select'}
            </span>
            <span className="text-[10px] text-slate-500">MP4 / WebM / MOV · max 50MB</span>
          </>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && (
        <div className="mt-3 flex items-start space-x-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-3">
          <div
            className={`rounded-xl border-2 p-3 flex items-center space-x-3 ${
              flagged
                ? 'border-red-500/60 bg-red-500/10'
                : 'border-emerald-500/60 bg-emerald-500/10'
            }`}
          >
            {flagged ? (
              <ShieldAlert className="w-7 h-7 text-red-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
            )}
            <div className="min-w-0">
              <div className={`font-bold text-sm ${flagged ? 'text-red-300' : 'text-emerald-300'}`}>
                {flagged ? 'FLAGGED — SYNTHETIC' : 'PASSED — LOOKS REAL'}
              </div>
              <div className="text-[11px] font-mono text-slate-400 truncate">{result.verdict}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ['AI FAKE', result.ai_fake_score],
              ['SOBEL', result.sobel_residual],
              ['FFT', result.fft_anomaly],
            ].map(([label, value]) => (
              <div key={label} className="bg-navy-dark/60 rounded-lg p-2 border border-navy-border">
                <div className="text-[9px] text-slate-500 font-mono">{label}</div>
                <div className="text-sm font-bold text-slate-200 font-mono">{value?.toFixed(3)}</div>
              </div>
            ))}
          </div>

          {/* Stated outright so the demo never implies the neural model ran when
              it did not — right now the heuristics carry the verdict. */}
          <div className="text-[10px] font-mono text-slate-500 leading-relaxed border-t border-navy-border pt-2">
            <div>Frames analysed: {result.frames_analyzed}</div>
            <div>Engine: {result.engine}</div>
            <div>
              Neural classifier:{' '}
              <span className={result.neural_model_loaded ? 'text-emerald-400' : 'text-amber-400'}>
                {result.neural_model_loaded ? 'loaded' : 'not loaded — heuristics only'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
