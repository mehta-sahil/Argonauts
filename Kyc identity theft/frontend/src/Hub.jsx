import React, { useState, useEffect, useRef } from 'react';

// ─── Lab data — all 6 labs including the flagship KYC live app ───────────────
const LABS = [
  {
    slug: 'kyc',
    href: '/kyc',
    title: 'KYC Identity Theft',
    live: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeOpacity="0.5"/>
      </svg>
    ),
    attackSummary: 'Deepfake video injection & synthetic ID passed to a KYC liveness check',
    defenseSummary: 'Randomized optical Flash-PAD + action challenge → ArcFace 1:1 verdict',
    tags: ['FastAPI', 'ONNX', 'WebSocket', 'React'],
  },
  {
    slug: 'distributed-cvv-guessing',
    href: '/labs/distributed-cvv-guessing/index.html',
    title: 'Distributed CVV Guessing',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    attackSummary: 'CVV brute-force spread across merchants to evade per-merchant rate limits',
    defenseSummary: 'Centralized per-PAN mismatch counter + LightGBM velocity model',
    tags: ['AWS Lambda', 'DynamoDB', 'LightGBM'],
  },
  {
    slug: 'mule-account-layering',
    href: '/labs/mule-account-layering/index.html',
    title: 'Mule-Account Layering',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="5" r="3"/><circle cx="4" cy="19" r="3"/><circle cx="20" cy="19" r="3"/>
        <line x1="12" y1="8" x2="4" y2="16"/><line x1="12" y1="8" x2="20" y2="16"/>
      </svg>
    ),
    attackSummary: 'LLM launderer designs a fan-out hop-chain through synthetic mule accounts',
    defenseSummary: '2-layer GraphSAGE on transaction graph catches invisible mid-chain mules',
    tags: ['GraphSAGE', 'GNN', 'GenAI'],
  },
  {
    slug: 'push-payment-scams',
    href: '/labs/push-payment-scams/index.html',
    title: 'Push-Payment Scams',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    attackSummary: 'LLM social-engineers a victim into authorizing an APP transfer',
    defenseSummary: 'Streaming scam-intent NLP + payment-risk feature fusion halts the transfer',
    tags: ['NLP', 'LLM', 'Risk Scoring'],
  },
  {
    slug: 'chatbot-prompt-injection',
    href: '/labs/chatbot-prompt-injection/index.html',
    title: 'Chatbot Prompt Injection',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
      </svg>
    ),
    attackSummary: 'Adversarial Gemini agent jailbreaks a banking chatbot into a $500 refund',
    defenseSummary: 'Deterministic policy engine gates the refund tool + canary output scan',
    tags: ['Gemini', 'Policy Engine', 'LLM Guard'],
  },
  {
    slug: 'voice-auth-bypass',
    href: '/labs/voice-auth-bypass/index.html',
    title: 'Voice-Auth Bypass',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    ),
    attackSummary: 'Cloned voice phones in a payment authorization (CEO-fraud scenario)',
    defenseSummary: 'Out-of-band callback + dual-authorization — a clone can\'t answer the real number',
    tags: ['Anti-spoof', 'Scikit-learn', 'Protocol'],
  },
];



const HEADLINES = [
  'Simulate the attack.',
  'Ship the defense.',
  'Prove it holds.',
];

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Run the synthetic attack',
    body: 'A scripted adversary—an LLM agent, a distributed bot net, a voice clone—fires against a sandboxed payment surface. No real rails, real cards, or real accounts involved.',
  },
  {
    n: '02',
    title: 'Detection system observes the signal',
    body: 'The blue-team layer—a graph model, a policy engine, a scam-intent NLP stream—processes every event in near-real-time and emits a confidence score.',
  },
  {
    n: '03',
    title: 'Mitigation fires, result is scored',
    body: 'A deterministic gate executes—block, callback, throttle—and the lab logs precision, recall, and latency. Numbers, not assertions.',
  },
];

const FAQS = [
  {
    q: 'Is this safe to run?',
    a: 'Yes. Every lab operates entirely on synthetic, sandboxed data. No real payment credentials, bank accounts, merchant terminals, or audio are touched at any point. The adversarial agents only interact with simulated endpoints.',
  },
  {
    q: 'Does it touch real payment rails?',
    a: 'Never. The disclaimer is literal: no real cards, banks, merchants, or payment networks are ever contacted. All transaction data is procedurally generated for each lab run.',
  },
  {
    q: 'Can I run it locally?',
    a: 'Most labs run fully local with a single `python run.py` command. The distributed-cvv-guessing lab uses live AWS Lambda + DynamoDB — the lab README documents every resource and a full teardown script. The KYC lab needs a Vite dev server alongside a FastAPI backend.',
  },
  {
    q: 'What\'s the license?',
    a: 'MIT. Fork it, extend it, break it, improve it. If you add a new attack/defense lab, we\'d love a PR.',
  },
  {
    q: 'Why deterministic gates instead of ML-only defenses?',
    a: 'Probabilistic detectors lose the arms race — a guardrail classifier or velocity score can each be evaded by a sufficiently patient adversary. The ML layers buy time and raise attacker cost; the deterministic rule enforced in code is what you actually rely on.',
  },
];

// ─── Hero SVG ─────────────────────────────────────────────────────────────────
const HeroSVG = () => (
  <svg
    viewBox="0 0 520 420"
    className="w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      {/* Glow filters */}
      <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      <filter id="glow-subtle" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      {/* Packet gradient */}
      <radialGradient id="packet-grad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#E5484D"/>
        <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0"/>
      </radialGradient>
      {/* Path for packet travel */}
      <path id="travel-path" d="M 140 160 C 220 140 300 200 370 200" fill="none"/>
      {/* Cyan shield gradient */}
      <radialGradient id="shield-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.25"/>
        <stop offset="100%" stopColor="#22D3EE" stopOpacity="0"/>
      </radialGradient>
      {/* Red attack glow */}
      <radialGradient id="attack-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#E5484D" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#E5484D" stopOpacity="0"/>
      </radialGradient>
    </defs>

    {/* Background nodes (faint) */}
    {[
      [80, 80], [200, 40], [440, 80], [480, 300], [60, 330], [280, 370], [420, 380],
    ].map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r="3" fill="#2A2D33" />
        <circle cx={x} cy={y} r="2" fill="#3A3F4A" />
      </g>
    ))}

    {/* Background edges (faint hairlines) */}
    {[
      [80,80,140,160], [200,40,140,160], [80,80,200,40],
      [440,80,370,200], [480,300,370,200], [420,380,370,200],
      [60,330,140,160], [280,370,370,200], [280,370,60,330],
    ].map(([x1,y1,x2,y2], i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2A2D33" strokeWidth="1"/>
    ))}

    {/* Main connection path (attack → defense) */}
    <path d="M 140 160 C 220 140 300 200 370 200" stroke="#3A3F4A" strokeWidth="1.5" fill="none" strokeDasharray="6 4"/>

    {/* Ripple rings on attack node */}
    <circle cx="140" cy="160" r="26" fill="none" stroke="#E5484D" strokeWidth="1" strokeOpacity="0.3">
      <animate attributeName="r" values="18;46" dur="2.4s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values="0.4;0" dur="2.4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="140" cy="160" r="18" fill="none" stroke="#E5484D" strokeWidth="1" strokeOpacity="0.3">
      <animate attributeName="r" values="14;36" dur="2.4s" begin="0.8s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values="0.3;0" dur="2.4s" begin="0.8s" repeatCount="indefinite"/>
    </circle>

    {/* Attack node glow */}
    <circle cx="140" cy="160" r="40" fill="url(#attack-glow)"/>

    {/* Attack node */}
    <circle cx="140" cy="160" fill="#1C0708" stroke="#E5484D" strokeWidth="2">
      <animate attributeName="r" values="14;18;14" dur="2.4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="140" cy="160" r="8" fill="#E5484D" filter="url(#glow-red)">
      <animate attributeName="r" values="7;10;7" dur="2.4s" repeatCount="indefinite"/>
      <animate attributeName="fill-opacity" values="1;0.6;1" dur="2.4s" repeatCount="indefinite"/>
    </circle>

    {/* Label: attack */}
    <text x="140" y="192" textAnchor="middle" fill="#E5484D" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="500" letterSpacing="1">ATTACK</text>

    {/* Travelling packet */}
    <g>
      <circle r="5" fill="#E5484D" filter="url(#glow-red)">
        <animateMotion dur="3s" repeatCount="indefinite" rotate="auto">
          <mpath href="#travel-path"/>
        </animateMotion>
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="3s" repeatCount="indefinite"/>
      </circle>
    </g>

    {/* Ripple rings on defense node */}
    <circle cx="370" cy="200" r="36" fill="none" stroke="#22D3EE" strokeWidth="1" strokeOpacity="0">
      <animate attributeName="r" values="28;60" dur="2s" begin="2.2s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values="0.5;0" dur="2s" begin="2.2s" repeatCount="indefinite"/>
    </circle>

    {/* Defense node glow */}
    <circle cx="370" cy="200" r="50" fill="url(#shield-glow)"/>

    {/* Shield shape (defense node) */}
    <path
      d="M370 172 L390 180 L390 200 Q390 216 370 224 Q350 216 350 200 L350 180 Z"
      fill="#071419"
      stroke="#22D3EE"
      strokeWidth="1.75"
      filter="url(#glow-cyan)"
    >
      <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
    </path>
    {/* Checkmark inside shield */}
    <polyline points="361,200 367,207 380,193" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <animate attributeName="stroke-opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
    </polyline>

    {/* Label: defense */}
    <text x="370" y="236" textAnchor="middle" fill="#22D3EE" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="500" letterSpacing="1">DEFENSE</text>

    {/* Secondary network nodes */}
    {[
      [260, 100, '#2A2D33', '#3DDC97'],
      [220, 260, '#2A2D33', '#A855F7'],
      [310, 310, '#2A2D33', '#F59E0B'],
    ].map(([x, y, bg, stroke], i) => (
      <g key={i}>
        <line x1={x} y1={y} x2={370} y2={200} stroke="#1E2126" strokeWidth="1"/>
        <circle cx={x} cy={y} r="6" fill={bg} stroke={stroke} strokeWidth="1" strokeOpacity="0.5"/>
        <circle cx={x} cy={y} r="3" fill={stroke} fillOpacity="0.6"/>
      </g>
    ))}

    {/* Decorative corner labels */}
    <text x="24" y="400" fill="#2A2D33" fontSize="8" fontFamily="JetBrains Mono, monospace">ARGONAUTS // RED-BLUE-TEAM</text>
  </svg>
);

// ─── LabCard component ────────────────────────────────────────────────────────
const LabCard = ({ lab }) => (
  <a
    href={lab.href}
    className="group relative flex flex-col overflow-hidden rounded-lg border border-argos-border bg-argos-surface
               transition-all duration-300 hover:-translate-y-1 hover:border-attack/30 focus:outline-none focus:ring-2 focus:ring-attack/40"
  >
    {/* Top attack half */}
    <div className="relative flex-1 p-5 border-b border-argos-border bg-gradient-to-br from-attack/5 to-transparent">
      {/* Red tint accent line */}
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-attack/50 to-transparent"/>
      <div className="flex items-center gap-2.5 mb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded border border-attack/20 bg-attack/10 text-attack">
          {lab.icon}
        </span>
        <span className="text-[10px] font-mono font-medium tracking-widest text-attack uppercase">Attack</span>
      </div>
      <p className="text-[13px] leading-relaxed text-argos-muted">{lab.attackSummary}</p>
    </div>

    {/* Bottom defense half */}
    <div className="relative flex-1 p-5 bg-gradient-to-br from-defense/5 to-transparent">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded border border-defense/20 bg-defense/10 text-defense">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </span>
        <span className="text-[10px] font-mono font-medium tracking-widest text-defense uppercase">Defense</span>
      </div>
      <p className="text-[13px] leading-relaxed text-argos-muted">{lab.defenseSummary}</p>
    </div>

    {/* Footer: lab name + tags + CTA */}
    <div className="px-5 py-4 border-t border-argos-border bg-[#111316]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-argos-text font-grotesk">{lab.title}</h3>
        {lab.live && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
            LIVE
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {lab.tags.map(t => (
          <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono text-argos-muted bg-argos-bg border border-argos-border">
            {t}
          </span>
        ))}
      </div>
      <span className="inline-flex items-center gap-1 text-xs font-medium text-argos-muted group-hover:text-argos-text transition-colors">
        View Lab
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5">
          <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </div>
  </a>
);

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-argos-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left
                   text-argos-text font-grotesk font-medium text-sm hover:bg-argos-surface/60 transition-colors"
        aria-expanded={open}
      >
        <span>{q}</span>
        <svg
          viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
          className={`w-4 h-4 shrink-0 text-argos-muted transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
        >
          <line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/>
        </svg>
      </button>
      <div className={`faq-answer ${open ? 'open' : ''}`}>
        <div>
          <div className="px-6 pb-5 text-[14px] leading-relaxed text-argos-muted border-t border-argos-border pt-4">
            {a}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Cycling headline hook ────────────────────────────────────────────────────
const useCyclingHeadline = (lines, interval = 2600) => {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('in'); // 'in' | 'out'

  useEffect(() => {
    const outTimer = setTimeout(() => setPhase('out'), interval - 600);
    const inTimer  = setTimeout(() => {
      setIndex(i => (i + 1) % lines.length);
      setPhase('in');
    }, interval);
    return () => { clearTimeout(outTimer); clearTimeout(inTimer); };
  }, [index, interval, lines.length]);

  return { line: lines[index], phase };
};

// ─── Hub (landing page) ───────────────────────────────────────────────────────
export const Hub = () => {
  const { line: headline, phase } = useCyclingHeadline(HEADLINES, 2800);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="relative min-h-screen bg-argos-bg text-argos-text font-inter overflow-x-hidden">

      {/* ═══ 0. Background grid ════════════════════════════════════════════════ */}
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-grid opacity-100" />
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none fixed -top-64 -left-64 w-[700px] h-[700px] rounded-full bg-attack/8 blur-[160px]"/>
      <div aria-hidden className="pointer-events-none fixed top-1/2 -right-64 w-[600px] h-[600px] rounded-full bg-defense/6 blur-[160px]"/>

      {/* ═══ 1. STICKY NAVBAR ══════════════════════════════════════════════════ */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          navScrolled
            ? 'bg-argos-bg/90 backdrop-blur-xl border-b border-argos-border shadow-lg shadow-black/30'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 h-16">
          {/* Wordmark */}
          <a href="/" className="flex items-center gap-3 group">
            <svg viewBox="0 0 32 32" className="w-7 h-7 shrink-0" aria-hidden>
              <path d="M16 2 L28 8 L28 22 Q28 29 16 30 Q4 29 4 22 L4 8 Z"
                fill="#0A0B0D" stroke="#E5484D" strokeWidth="1.5"/>
              <path d="M16 8 L22 11 L22 20 Q22 24 16 26 Q10 24 10 20 L10 11 Z"
                fill="#071419" stroke="#22D3EE" strokeWidth="1"/>
              <circle cx="16" cy="16" r="2.5" fill="#22D3EE"/>
            </svg>
            <span className="font-grotesk font-semibold text-sm tracking-[0.15em] text-argos-text uppercase">
              Argonauts
            </span>
          </a>

          {/* Nav links — desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {['Labs', 'How It Works', 'Contribute'].map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1.5 text-[13px] font-medium text-argos-muted hover:text-argos-text transition-colors rounded"
              >
                {link}
              </a>
            ))}
          </div>

          {/* GitHub CTA */}
          <a
            href="https://github.com/sahilmehta2024/Argonauts"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded text-[13px] font-medium
                       border border-argos-border text-argos-text hover:border-argos-muted hover:bg-argos-surface
                       transition-all duration-200"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-label="GitHub">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                       0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                       -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
                       .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
                       -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27
                       .68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
                       .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
                       0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            View on GitHub
          </a>
        </nav>
      </header>

      {/* ═══ 2. HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-16 lg:pt-28 lg:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div className="anim-fade-up">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-attack/25 bg-attack/8 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-attack animate-pulse"/>
              <span className="text-[11px] font-mono font-medium tracking-[0.2em] text-attack uppercase">
                Mastercard Innovation Challenge 2026 · Global Fintech Fest
              </span>
            </div>

            {/* Cycling headline */}
            <h1 className="font-grotesk font-bold text-5xl lg:text-6xl leading-[1.05] tracking-tight text-argos-text mb-2 min-h-[4.5rem] overflow-hidden">
              <span
                key={headline}
                className={phase === 'in' ? 'headline-in block' : 'headline-out block'}
              >
                {headline}
              </span>
            </h1>

            {/* Subhead */}
            <p className="mt-6 max-w-xl text-[16px] leading-[1.7] text-argos-muted">
              Argonauts is an open-source collection of red-team / blue-team fraud simulation labs.
              Each lab pairs a <span className="text-attack font-medium">synthetic sandboxed attack</span> with
              the <span className="text-defense font-medium">detection system that stops it</span> —
              measured and scored, not asserted.
              No real cards, banks, merchants, or payment networks are ever contacted.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#labs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold
                           bg-attack text-white hover:bg-attack/90 transition-colors shadow-lg shadow-attack/20"
              >
                Explore the Labs
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 -mt-px">
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a
                href="https://github.com/sahilmehta2024/Argonauts"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold
                           border border-argos-border text-argos-text hover:bg-argos-surface hover:border-argos-muted
                           transition-all duration-200"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                View Source
              </a>
            </div>
          </div>

          {/* Right: SVG network visual */}
          <div className="relative lg:h-[420px] flex items-center justify-center">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-attack/5 via-transparent to-defense/5 border border-argos-border"/>
            <div className="relative w-full h-full p-4 anim-drift">
              <HeroSVG />
            </div>
          </div>
        </div>
      </section>



      {/* ═══ 4. LABS GRID ═══════════════════════════════════════════════════════ */}
      <section id="labs" className="relative z-10 mx-auto max-w-7xl px-6 py-20 scroll-mt-20">
        {/* Section header */}
        <div className="mb-8">
          <h2 className="font-grotesk font-bold text-3xl lg:text-4xl tracking-tight text-argos-text">
            Six Labs. Six Attacks. Six Defenses.
          </h2>
          <p className="mt-3 text-argos-muted max-w-xl">
            Each lab is an independent, self-contained red-team / blue-team simulation you can run today.
          </p>
        </div>

        {/* 6 lab cards grid: 3 + 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {LABS.map(lab => <LabCard key={lab.slug} lab={lab}/>)}
        </div>
      </section>

      {/* ═══ 5. HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 border-y border-argos-border bg-argos-surface/30 py-20 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12">
            <span className="text-[10px] font-mono tracking-widest text-argos-muted uppercase">Process</span>
            <h2 className="mt-2 font-grotesk font-bold text-3xl lg:text-4xl tracking-tight text-argos-text">
              How it works
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-px bg-argos-border rounded-lg overflow-hidden">
            {HOW_IT_WORKS.map(({ n, title, body }, i) => (
              <div key={n} className="bg-argos-bg p-8 relative">
                {/* Connector arrow (desktop) */}
                {i < 2 && (
                  <div className="hidden lg:block absolute -right-[1px] top-1/2 -translate-y-1/2 z-10">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M8 12h8M13 8l4 4-4 4" stroke="#2A2D33" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <div className="font-mono text-[11px] font-medium text-argos-muted mb-4 tracking-widest">{n}</div>
                <div className={`w-8 h-1 rounded mb-5 ${i === 0 ? 'bg-attack' : i === 1 ? 'bg-argos-muted' : 'bg-defense'}`}/>
                <h3 className="font-grotesk font-semibold text-lg text-argos-text mb-3">{title}</h3>
                <p className="text-[14px] leading-[1.7] text-argos-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. CODE / DETECTION DEMO ════════════════════════════════════════════ */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10">
          <span className="text-[10px] font-mono tracking-widest text-argos-muted uppercase">Detection in action</span>
          <h2 className="mt-2 font-grotesk font-bold text-3xl lg:text-4xl tracking-tight text-argos-text">
            See what the defense sees
          </h2>
        </div>

        {/* Code editor card */}
        <div className="rounded-lg border border-argos-border overflow-hidden shadow-2xl shadow-black/40">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#0E1012] border-b border-argos-border">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56]"/>
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E]"/>
            <span className="w-3 h-3 rounded-full bg-[#27C93F]"/>
            <div className="ml-3 flex gap-px">
              <span className="px-3 py-1 text-[11px] font-mono text-argos-muted bg-argos-surface rounded-t border border-b-0 border-argos-border">
                cvv_defense.py
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-defense/10 border border-defense/25 text-[11px] font-mono font-medium text-defense">
                <span className="w-1.5 h-1.5 rounded-full bg-defense animate-pulse"/>
                ✓ blocked
              </span>
            </div>
          </div>

          {/* Code body */}
          <div className="bg-[#0D0F11] overflow-x-auto">
            <table className="w-full text-[13px] font-mono">
              <tbody>
                {[
                  { n: '1',  line: <><span className="token-keyword">import</span> <span className="token-function">boto3</span>, json, time</> },
                  { n: '2',  line: <></> },
                  { n: '3',  line: <><span className="token-keyword">def</span> <span className="token-function">check_pan_velocity</span>(<span className="token-param">pan_hash</span>, <span className="token-param">table</span>):</> },
                  { n: '4',  line: <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-string">"""Return (is_blocked, mismatch_count)."""</span></> },
                  { n: '5',  line: <>&nbsp;&nbsp;&nbsp;&nbsp;resp = table.<span className="token-function">get_item</span>({'('}Key={'{'}<span className="token-string">"pan_hash"</span>: pan_hash{'}'}{')'}</> },
                  { n: '6',  line: <>&nbsp;&nbsp;&nbsp;&nbsp;item = resp.<span className="token-function">get</span>(<span className="token-string">"Item"</span>, {'{}'})</> },
                  { n: '7',  line: <>&nbsp;&nbsp;&nbsp;&nbsp;count = item.<span className="token-function">get</span>(<span className="token-string">"mismatch_count"</span>, <span className="token-number">0</span>)</> },
                  { n: '8',  line: <></> },
                  {
                    n: '9',
                    attack: true,
                    line: <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-keyword">if</span> count &gt;= <span className="token-number">5</span>:  <span className="token-comment"># ⚠ attack pattern detected — PAN mismatch threshold</span></>,
                  },
                  { n: '10', line: <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-keyword">return</span> (<span className="token-defense">True</span>, count)  <span className="token-comment"># deterministic block — no ML needed</span></> },
                  { n: '11', line: <></> },
                  { n: '12', line: <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-comment"># Layer-2: LightGBM velocity score for slow-and-low attackers</span></> },
                  { n: '13', line: <>&nbsp;&nbsp;&nbsp;&nbsp;velocity_score = <span className="token-function">score_velocity</span>(item.<span className="token-function">get</span>(<span className="token-string">"events"</span>, []))</> },
                  { n: '14', line: <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-keyword">if</span> velocity_score &gt; <span className="token-number">0.85</span>:</> },
                  { n: '15', line: <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-keyword">return</span> (<span className="token-defense">True</span>, count)</> },
                  { n: '16', line: <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="token-keyword">return</span> (<span className="token-defense">False</span>, count)</> },
                ].map(({ n, line, attack }) => (
                  <tr
                    key={n}
                    className={`${attack ? 'bg-attack/8 border-l-2 border-attack' : ''}`}
                  >
                    <td className="select-none pl-4 pr-6 py-0.5 text-[11px] text-argos-border text-right w-10 align-top">
                      {n}
                    </td>
                    <td className={`py-0.5 pr-6 whitespace-pre ${attack ? 'text-attack/90' : 'text-[#CDD6F4]'}`}>
                      {line}
                      {attack && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-mono bg-attack/15 border border-attack/30 text-attack px-1.5 py-0.5 rounded">
                          ⚠ attack pattern detected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>





      {/* ═══ 9. CONTRIBUTE ══════════════════════════════════════════════════════ */}
      <section id="contribute" className="relative z-10 border-y border-argos-border bg-argos-surface/30 py-20 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-argos-muted uppercase">Contribute</span>
              <h2 className="mt-2 font-grotesk font-bold text-3xl lg:text-4xl tracking-tight text-argos-text">
                Adding a Lab
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-argos-muted max-w-lg">
                New attack types go in their own sibling folder, named after the attack
                (e.g. <code className="font-mono text-defense text-[13px]">bin-attack</code>, <code className="font-mono text-defense text-[13px]">account-takeover</code>, <code className="font-mono text-defense text-[13px]">token-replay</code>).
              </p>
              <a
                href="https://github.com/sahilmehta2024/Argonauts/pulls"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold
                           bg-defense/10 border border-defense/30 text-defense
                           hover:bg-defense/20 hover:border-defense/50 transition-all duration-200"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                Open a PR
              </a>
            </div>

            <ol className="space-y-4">
              {[
                { n: '1', title: 'Own README', desc: 'Document the attack, the threat model, and your results table.' },
                { n: '2', title: 'Data generator', desc: 'A script that creates synthetic, sandboxed data — no real credentials ever.' },
                { n: '3', title: 'Attack driver', desc: 'The red-team agent (script, LLM, or simulator) that fires against your target.' },
                { n: '4', title: 'Defense', desc: 'The blue-team layer: model, policy engine, protocol — whatever stops the attack.' },
                { n: '5', title: 'Cloud resources (optional)', desc: 'Document every resource and include a teardown script in your README.' },
              ].map(({ n, title, desc }) => (
                <li key={n} className="flex gap-4 items-start p-4 rounded-lg border border-argos-border bg-argos-bg">
                  <span className="font-mono text-[11px] font-medium text-defense border border-defense/25 bg-defense/8 rounded px-1.5 py-0.5 mt-0.5 shrink-0">
                    {n}
                  </span>
                  <div>
                    <div className="font-grotesk font-semibold text-sm text-argos-text">{title}</div>
                    <div className="mt-0.5 text-[13px] text-argos-muted">{desc}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ═══ 10. FAQ ═════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10">
          <span className="text-[10px] font-mono tracking-widest text-argos-muted uppercase">FAQ</span>
          <h2 className="mt-2 font-grotesk font-bold text-3xl lg:text-4xl tracking-tight text-argos-text">
            Common questions
          </h2>
        </div>
        <div className="max-w-3xl space-y-3">
          {FAQS.map(({ q, a }) => <FAQItem key={q} q={q} a={a}/>)}
        </div>
      </section>

      {/* ═══ 11. FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-argos-border bg-argos-surface/30">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Wordmark col */}
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" aria-hidden>
                  <path d="M16 2 L28 8 L28 22 Q28 29 16 30 Q4 29 4 22 L4 8 Z"
                    fill="#0A0B0D" stroke="#E5484D" strokeWidth="1.5"/>
                  <path d="M16 8 L22 11 L22 20 Q22 24 16 26 Q10 24 10 20 L10 11 Z"
                    fill="#071419" stroke="#22D3EE" strokeWidth="1"/>
                  <circle cx="16" cy="16" r="2.5" fill="#22D3EE"/>
                </svg>
                <span className="font-grotesk font-semibold text-sm tracking-[0.15em] text-argos-text uppercase">
                  Argonauts
                </span>
              </div>
              <p className="text-[13px] text-argos-muted leading-relaxed max-w-[200px]">
                Open-source red-team / blue-team fraud simulation labs.
              </p>
            </div>

            {/* Labs col */}
            <div>
              <div className="text-[10px] font-mono tracking-widest text-argos-muted uppercase mb-4">Labs</div>
              <ul className="space-y-2.5">
                {[
                  { label: 'KYC Identity Theft', href: '/kyc' },
                  { label: 'Distributed CVV Guessing', href: '/labs/distributed-cvv-guessing/index.html' },
                  { label: 'Mule-Account Layering', href: '/labs/mule-account-layering/index.html' },
                  { label: 'Push-Payment Scams', href: '/labs/push-payment-scams/index.html' },
                  { label: 'Chatbot Injection', href: '/labs/chatbot-prompt-injection/index.html' },
                  { label: 'Voice-Auth Bypass', href: '/labs/voice-auth-bypass/index.html' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-[13px] text-argos-muted hover:text-argos-text transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources col */}
            <div>
              <div className="text-[10px] font-mono tracking-widest text-argos-muted uppercase mb-4">Resources</div>
              <ul className="space-y-2.5">
                {[
                  { label: 'README', href: 'https://github.com/sahilmehta2024/Argonauts/blob/main/README.md' },
                  { label: 'Architecture Docs', href: 'https://github.com/sahilmehta2024/Argonauts/tree/main/Kyc%20identity%20theft/docs' },
                  { label: 'Contributing Guide', href: '#contribute' },
                  { label: 'GitHub Actions CI', href: 'https://github.com/sahilmehta2024/Argonauts/actions' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                       className="text-[13px] text-argos-muted hover:text-argos-text transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community col */}
            <div>
              <div className="text-[10px] font-mono tracking-widest text-argos-muted uppercase mb-4">Community</div>
              <ul className="space-y-2.5">
                {[
                  { label: 'GitHub Repository', href: 'https://github.com/sahilmehta2024/Argonauts' },
                  { label: 'Open Issues', href: 'https://github.com/sahilmehta2024/Argonauts/issues' },
                  { label: 'Pull Requests', href: 'https://github.com/sahilmehta2024/Argonauts/pulls' },
                  { label: 'Discussions', href: 'https://github.com/sahilmehta2024/Argonauts/discussions' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer"
                       className="text-[13px] text-argos-muted hover:text-argos-text transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-argos-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-[12px] font-mono text-argos-border leading-relaxed max-w-lg">
              <span className="text-attack">⚠</span>{' '}
              No real cards, banks, merchants, or payment networks are ever contacted. This is a research and demo platform.
            </p>
            <p className="text-[11px] text-argos-border font-mono shrink-0">MIT License · Argonauts 2026</p>
          </div>
        </div>
      </footer>

    </div>
  );
};
