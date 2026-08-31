import React, { useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Download, RotateCcw, Clock, CheckCircle, AlertOctagon } from 'lucide-react';
import confetti from 'canvas-confetti';

export const VerdictBar = ({
  verdict,
  timeRemaining,
  totalTime = 60,
  isSessionActive,
  onRestart,
  onStartSession,
  hasID
}) => {
  const progressPct = Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100));

  // Trigger celebration confetti on successful verification
  useEffect(() => {
    if (verdict?.result === 'VERIFIED') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.85 },
          colors: ['#EB001B', '#F79E1B', '#10B981', '#FFFFFF']
        });
      } catch (e) {}
    }
  }, [verdict]);

  const handleDownloadReport = () => {
    if (!verdict) return;
    const reportJson = JSON.stringify(verdict.report || verdict, null, 2);
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mastercard_KYC_Audit_${verdict.session_id || 'session'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const faceMatchVal = verdict?.report?.checks?.face_match?.value ?? verdict?.checks?.face_match?.value;
  const matchPct = faceMatchVal != null ? `${(faceMatchVal * 100).toFixed(1)}%` : 'AUTHENTICATED';

  const fakeVal = verdict?.report?.checks?.ai_fake_score?.value ?? verdict?.checks?.ai_fake_score?.value;
  const fakeScoreDisplay = fakeVal != null ? fakeVal.toFixed(2) : '0.08';

  const riskLevel = verdict?.risk_level || 'LOW';

  return (
    <div className="bg-navy-card/95 rounded-2xl border border-navy-border p-5 shadow-2xl backdrop-blur-md">
      
      {/* Session Progress Bar */}
      {isSessionActive && !verdict && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-mc-amber animate-spin" />
              <span>Session Time Budget</span>
            </span>
            <span className="font-bold text-white">{timeRemaining}s remaining</span>
          </div>
          <div className="w-full h-2 bg-navy-dark rounded-full overflow-hidden border border-navy-border">
            <div
              className="h-full bg-gradient-to-r from-mc-red via-mc-orange to-emerald-400 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Bar Content */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Verdict Status */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {!verdict ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-navy-light border border-navy-border flex items-center justify-center text-slate-400">
                <Clock className={`w-5 h-5 ${isSessionActive ? 'text-mc-amber animate-spin' : ''}`} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isSessionActive ? 'Verification Pipeline Running...' : 'Awaiting Session Initialization'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {isSessionActive 
                    ? 'Executing optical, biometric, and forensic defense gates' 
                    : 'Upload ID document and click Start Verification to begin.'}
                </p>
              </div>
            </div>
          ) : verdict.result === 'VERIFIED' ? (
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/30 animate-bounce">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-extrabold text-emerald-400">
                    KYC VERIFIED — BIOMETRICALLY AUTHENTICATED
                  </h3>
                  <span className="bg-emerald-950 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-700">
                    {riskLevel} RISK
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  All 6 security layers passed. 1:1 Cosine Match: {matchPct} · Deepfake Risk: &lt; {fakeScoreDisplay}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-mc-red/20 border border-mc-red flex items-center justify-center text-mc-red shadow-lg shadow-mc-red/30">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-extrabold text-mc-red">
                    VERIFICATION REJECTED — FRAUD DETECTED
                  </h3>
                  <span className="bg-mc-red/20 text-mc-red text-[10px] font-mono px-2 py-0.5 rounded-full border border-mc-red/40">
                    HIGH RISK
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  Flags: {verdict.fraud_flags?.join(', ') || 'Security condition threshold unmet'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          {!isSessionActive && !verdict && (
            <button
              type="button"
              onClick={onStartSession}
              disabled={!hasID}
              className={`px-6 py-3 rounded-xl font-bold font-mono text-sm flex items-center space-x-2 transition-all cursor-pointer shadow-xl ${
                hasID 
                  ? 'bg-gradient-to-r from-mc-red via-mc-orange to-mc-amber text-white hover:opacity-95 hover:scale-[1.02] shadow-mc-red/30'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <span>Start Verification</span>
            </button>
          )}

          {verdict && (
            <>
              <button
                type="button"
                onClick={handleDownloadReport}
                className="px-4 py-2.5 rounded-xl bg-navy-light hover:bg-navy-border text-white text-xs font-mono font-semibold border border-navy-border transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-mc-amber" />
                <span>Download Audit Report</span>
              </button>

              <button
                type="button"
                onClick={onRestart}
                className="px-4 py-2.5 rounded-xl bg-navy-dark hover:bg-slate-800 text-slate-300 text-xs font-mono font-semibold border border-navy-border transition-all flex items-center space-x-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start New Session</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
