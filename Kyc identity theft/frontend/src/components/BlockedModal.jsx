import React from 'react';
import { ShieldAlert, RotateCcw, AlertTriangle, Terminal } from 'lucide-react';

export const BlockedModal = ({ isBlocked, blockReason, blockDetails, onRestart }) => {
  if (!isBlocked) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-navy-card border-2 border-mc-red rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl shadow-mc-red/30 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center space-x-3 mb-4">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-mc-red/20 border border-mc-red flex items-center justify-center text-mc-red">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center flex-wrap gap-x-2 gap-y-1">
              <span>Security Integrity Alert</span>
              <span className="bg-mc-red text-white text-[10px] font-mono px-2 py-0.5 rounded whitespace-nowrap">
                HARD BLOCK
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">Phase 2 Environment Gate Triggered</p>
          </div>
        </div>

        <div className="bg-navy-dark/90 rounded-xl p-4 border border-navy-border mb-4">
          <p className="text-sm font-semibold text-mc-red mb-2 flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>{blockReason || 'Hardware / Automation Anomaly Detected'}</span>
          </p>
          <p className="text-xs text-slate-300 mb-3">
            The verification session was terminated because a virtual camera loopback (OBS/v4l2loopback/ManyCam) or automated browser environment (Puppeteer/Selenium) was detected.
          </p>

          {blockDetails && (
            <div className="bg-black/50 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto">
              <div className="text-slate-500 mb-1 flex items-center space-x-1">
                <Terminal className="w-3 h-3" />
                <span>DIAGNOSTIC LOG:</span>
              </div>
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(blockDetails, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onRestart}
            className="px-5 py-2.5 rounded-xl bg-mc-red hover:bg-mc-red/90 text-white text-xs font-mono font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-lg shadow-mc-red/30"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry with Physical Hardware</span>
          </button>
        </div>

      </div>
    </div>
  );
};
