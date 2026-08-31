import React from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Lock, Radio } from 'lucide-react';

export const Header = ({ isConnected, phase }) => {
  return (
    <header className="border-b border-navy-border bg-navy-dark/95 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

        {/* Left: Mastercard Branding */}
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <div className="relative flex items-center shrink-0">
            {/* Mastercard Interlocking Circles */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-mc-red shadow-lg shadow-mc-red/40" />
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-mc-amber -ml-4 mix-blend-screen opacity-90 shadow-lg shadow-mc-amber/40" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center">
                Mastercard <span className="text-mc-amber ml-1.5 font-semibold">AI Defense Lab</span>
              </h1>
              <span className="bg-mc-red/20 text-mc-red text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-full border border-mc-red/30">
                v1.0-LIVE
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-400 font-mono truncate">
              Deepfake-Resilient KYC Biometric Authentication Pipeline
            </p>
          </div>
        </div>

        {/* Right: Security & Network Telemetry */}
        <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
          <div className="hidden md:flex items-center space-x-3 bg-navy-card/80 px-3.5 py-1.5 rounded-lg border border-navy-border text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300">TLS-256 E2E</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-mc-amber" />
              <span className="text-slate-300">WASM Landmarker</span>
            </div>
          </div>

          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${
            isConnected 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-800/40 border-slate-700 text-slate-400'
          }`}>
            <span className="relative flex h-2 w-2">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
            </span>
            <span>{isConnected ? 'NODE ONLINE' : 'NODE READY'}</span>
          </div>
        </div>

      </div>
    </header>
  );
};
