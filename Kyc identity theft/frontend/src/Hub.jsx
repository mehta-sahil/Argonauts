import React from 'react';
import {
  ScanFace, MessageSquareWarning, CreditCard, Network, HandCoins, AudioLines,
  ArrowRight, ArrowDown, Swords
} from 'lucide-react';

// One card per attack/defense simulation. `href` is where the card navigates.
// The KYC lab is the live interactive app (served by this same React bundle at
// /kyc); the rest are self-contained static prototypes under /labs/<slug>/.
const LABS = [
  {
    slug: 'kyc', href: '/kyc', title: 'KYC Identity Theft', Icon: ScanFace,
    attack: 'Deepfake video injection & synthetic ID',
    defense: 'Liveness (Flash-PAD + action) → ArcFace 1:1 verdict',
    tags: ['FastAPI', 'ONNX', 'WebSocket'], live: true, accent: '#EB001B',
  },
  {
    slug: 'chatbot-prompt-injection', href: '/labs/chatbot-prompt-injection/index.html',
    title: 'Chatbot Prompt Injection', Icon: MessageSquareWarning,
    attack: 'Adversarial LLM jailbreaks a banking assistant',
    defense: 'LLM firewall + deterministic policy guard',
    tags: ['LLM', 'Gemini', 'Policy'], accent: '#F79E1B',
  },
  {
    slug: 'distributed-cvv-guessing', href: '/labs/distributed-cvv-guessing/index.html',
    title: 'Distributed CVV Guessing', Icon: CreditCard,
    attack: 'Distributed card-testing across many merchants',
    defense: 'ML velocity scoring + adaptive throttling',
    tags: ['AWS Lambda', 'ML', 'DynamoDB'], accent: '#00C2FF',
  },
  {
    slug: 'mule-account-layering', href: '/labs/mule-account-layering/index.html',
    title: 'Mule-Account Layering', Icon: Network,
    attack: 'GenAI structures funds through mule networks',
    defense: 'Graph Neural Network on the transaction graph',
    tags: ['GNN', 'GraphML', 'GenAI'], accent: '#10B981',
  },
  {
    slug: 'push-payment-scams', href: '/labs/push-payment-scams/index.html',
    title: 'Push-Payment Scams', Icon: HandCoins,
    attack: 'LLM social-engineers a victim into paying',
    defense: 'Scam-intent NLP + real-time payment friction',
    tags: ['NLP', 'LLM', 'Risk'], accent: '#A855F7',
  },
  {
    slug: 'voice-auth-bypass', href: '/labs/voice-auth-bypass/index.html',
    title: 'Voice-Auth Bypass', Icon: AudioLines,
    attack: 'AI voice cloning defeats voice biometrics',
    defense: 'Anti-spoofing biomarkers + callback protocol',
    tags: ['Anti-spoof', 'Audio', 'Protocol'], accent: '#38BDF8',
  },
];

// Faint 40px grid used behind the hero — no external asset.
const GRID = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),' +
    'linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
  backgroundSize: '44px 44px',
};

const MastercardMark = ({ className = 'h-8' }) => (
  <span className={`relative inline-flex items-center ${className}`}>
    <span className="h-full aspect-square rounded-full bg-mc-red" />
    <span className="h-full aspect-square rounded-full bg-mc-amber -ml-3 mix-blend-screen opacity-90" />
  </span>
);

const Card = ({ lab }) => {
  const { Icon } = lab;
  return (
    <a
      href={lab.href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10
                 bg-[#12131F] p-6 transition-all duration-300 hover:-translate-y-1.5
                 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
    >
      {/* accent glow that blooms on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0
                   blur-3xl transition-opacity duration-300 group-hover:opacity-30"
        style={{ backgroundColor: lab.accent }}
      />
      {/* top hairline in the accent colour */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${lab.accent}, transparent)` }} />

      <div className="relative flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset ring-white/10"
             style={{ backgroundColor: `${lab.accent}1A`, color: lab.accent }}>
          <Icon size={24} strokeWidth={1.75} />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1
                         text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>

      <h3 className="relative mt-5 text-lg font-semibold text-slate-100">{lab.title}</h3>

      <dl className="relative mt-3 space-y-1.5 text-sm">
        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold text-rose-400">Attack</dt>
          <dd className="text-slate-400">{lab.attack}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold text-emerald-400">Defense</dt>
          <dd className="text-slate-400">{lab.defense}</dd>
        </div>
      </dl>

      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {lab.tags.map((t) => (
          <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-slate-400 ring-1 ring-inset ring-white/5">{t}</span>
        ))}
      </div>

      <div className="relative mt-5 flex items-center gap-1.5 text-sm font-medium text-slate-300 transition-colors group-hover:text-white">
        Launch simulation
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </div>
    </a>
  );
};

export const Hub = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0C16] text-slate-100">
      {/* ---- Ambient background: grid + team-colour glows ---- */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={GRID} />
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-mc-red/20 blur-[130px]" />
      <div aria-hidden className="pointer-events-none absolute top-24 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#00C2FF]/10 blur-[130px]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mc-amber/40 to-transparent" />

      {/* ---- Nav ---- */}
      <header className="relative z-10 border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <MastercardMark className="h-7" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              AI Defense Lab
            </span>
          </div>
          <a href="#simulations"
             className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5
                        px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10">
            Launch simulation <ArrowRight size={15} />
          </a>
        </div>
      </header>

      {/* ---- Hero ---- */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-14 sm:pt-24 sm:pb-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1
                        text-xs font-medium text-slate-300">
          <Swords size={13} className="text-mc-amber" />
          Six adversarial security scenarios
        </div>

        <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-slate-50 sm:text-6xl">
          Where AI attacks meet{' '}
          <span className="bg-gradient-to-r from-mc-red via-mc-orange to-mc-amber bg-clip-text text-transparent">
            AI defense
          </span>.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          A hands-on lab of payment-security threats — each one an AI attacker pitted against an
          AI-plus-rules defense. Explore any scenario on its own; they are independent, not a sequence.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a href="#simulations"
             className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r
                        from-mc-red via-mc-orange to-mc-amber px-6 py-3.5 text-sm font-bold text-white
                        shadow-xl shadow-mc-red/25 transition-transform hover:scale-[1.02]">
            Launch a simulation <ArrowDown size={16} />
          </a>
        </div>
      </section>

      {/* ---- Simulations grid ---- */}
      <section id="simulations" className="relative z-10 mx-auto max-w-6xl scroll-mt-16 px-6 pb-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
              Attack &amp; Defense Simulations
            </h2>
            <p className="mt-2 max-w-xl text-slate-400">
              Pick any simulation to see the attacker and the defender go head to head.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LABS.map((lab) => <Card key={lab.slug} lab={lab} />)}
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <MastercardMark className="h-6" />
            <span className="text-sm text-slate-400">AI Defense Lab</span>
          </div>
          <p className="text-sm text-slate-500">Built for the Mastercard AI Defense Hackathon.</p>
        </div>
      </footer>
    </div>
  );
};
