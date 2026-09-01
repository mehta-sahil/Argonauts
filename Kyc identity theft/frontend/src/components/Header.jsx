import React from 'react';

// The five static labs all render the same `#argos-nav` bar. This is that bar,
// rebuilt in React so the flagship KYC app sits under the same chrome instead
// of its own Mastercard-branded one. Values are copied from the lab pages'
// stylesheet verbatim (56px tall, #2A2D33 hairline, 0.85 alpha ground) rather
// than approximated through Tailwind tokens, so the two match exactly.
const ACCENT = '#E5484D';   // this lab's accent, per LABS[0] in Hub.jsx
const LINE = '#2A2D33';
const MUTED = '#9A9EA6';

export const Header = ({ isConnected }) => (
  <nav
    className="sticky top-0 z-40 flex items-center justify-between gap-4 px-6"
    style={{
      height: 56,
      background: 'rgba(10,11,13,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${LINE}`,
      fontFamily: 'Inter, system-ui, sans-serif'
    }}
  >
    <div className="flex items-center gap-3 min-w-0">
      <a href="/" className="flex items-center gap-2.5 no-underline shrink-0">
        <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
          <path d="M16 2 L28 8 L28 22 Q28 29 16 30 Q4 29 4 22 L4 8 Z" fill="#0A0B0D" stroke="#E5484D" strokeWidth="1.5" />
          <path d="M16 8 L22 11 L22 20 Q22 24 16 26 Q10 24 10 20 L10 11 Z" fill="#071419" stroke="#22D3EE" strokeWidth="1" />
          <circle cx="16" cy="16" r="2.5" fill="#22D3EE" />
        </svg>
        <span
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontWeight: 600, fontSize: 13, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#F5F6F7'
          }}
        >
          Argonauts
        </span>
      </a>

      <span style={{ width: 1, height: 18, background: LINE }} className="shrink-0" />

      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          fontWeight: 600, color: ACCENT, opacity: 0.7
        }}
      >
        01
      </span>
      <span
        className="truncate"
        style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontSize: 13, fontWeight: 600, color: ACCENT
        }}
      >
        KYC Identity Theft
      </span>
    </div>

    <div className="flex items-center gap-3 shrink-0">
      {/* Kept from the old header because it is live state, not decoration:
          it tells you whether the verification socket is actually connected. */}
      <span
        className="hidden sm:inline-flex items-center gap-2"
        style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: MUTED }}
      >
        <span
          style={{
            width: 6, height: 6, borderRadius: '50%',
            background: isConnected ? '#22D3EE' : '#4A4F57'
          }}
        />
        {isConnected ? 'connected' : 'offline'}
      </span>

      <a
        href="/"
        className="inline-flex items-center gap-1.5 no-underline transition-colors"
        style={{
          fontSize: 12, fontWeight: 500, color: MUTED,
          padding: '6px 12px', borderRadius: 6, border: `1px solid ${LINE}`
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#F5F6F7'; e.currentTarget.style.borderColor = MUTED; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = LINE; }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 4l-5 4 5 4" />
        </svg>
        All Labs
      </a>
    </div>
  </nav>
);
