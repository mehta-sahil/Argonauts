import React from 'react';
import { Check } from 'lucide-react';
import { STEPS } from '../steps';

// Three dots and a rail. Deliberately the only progress indicator on screen —
// the per-phase titles it replaces read like log lines.
export const StepBar = ({ activeIndex, failed = false }) => (
  <div className="flex items-center justify-center gap-2 sm:gap-4 w-full max-w-xl mx-auto">
    {STEPS.map((step, i) => {
      const done = i < activeIndex;
      const active = i === activeIndex;
      const bad = failed && active;

      return (
        <React.Fragment key={step.id}>
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={[
                'flex items-center justify-center rounded-full shrink-0 transition-all duration-500',
                'h-7 w-7 text-xs font-semibold',
                bad
                  ? 'bg-rose-500 text-white'
                  : done
                  ? 'bg-emerald-500 text-white'
                  : active
                  ? 'bg-cyan-400 text-slate-900 ring-4 ring-cyan-400/20'
                  : 'bg-slate-700/60 text-slate-400'
              ].join(' ')}
            >
              {done ? <Check size={14} strokeWidth={3} /> : step.n}
            </div>
            <span
              className={[
                'text-xs sm:text-sm font-medium truncate transition-colors',
                active ? 'text-slate-100' : done ? 'text-slate-400' : 'text-slate-600'
              ].join(' ')}
            >
              {step.label}
            </span>
          </div>

          {i < STEPS.length - 1 && (
            <div className="flex-1 h-px bg-slate-700/60 relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-700"
                style={{ width: i < activeIndex ? '100%' : '0%' }}
              />
            </div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);
