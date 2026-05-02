import { useEffect, useRef, useState } from 'react';
import {
  Stethoscope, MessageCircle, BookOpen, Star,
  ShieldCheck, Zap, AlertTriangle, Lock,
  Play, LayoutGrid, Activity, ChevronRight,
} from 'lucide-react';

interface Props {
  onGetStarted: () => void;
  onSignIn: () => void;
  onAbout: () => void;
  onDemo?: () => void;
}

/* ─────────────────── DATA ─────────────────── */
const FEATURES = [
  {
    num: '01',
    tag: 'NLU Engine',
    icon: MessageCircle,
    title: 'Neural Symptom Extraction',
    desc: 'Utilizes Natural Language Understanding (NLU) to parse unstructured patient descriptions into actionable clinical data points.',
    pill: 'llama3.2 via Ollama',
  },
  {
    num: '02',
    tag: 'Consensus Layer',
    icon: Activity,
    title: 'Multi-Model Consensus Engine',
    desc: 'Goes beyond single-model bias by calculating a weighted consensus across three distinct ML algorithms for maximum diagnostic reliability.',
    pill: 'SVM · RF · Naive Bayes',
  },
  {
    num: '03',
    tag: 'RAG Validation',
    icon: BookOpen,
    title: 'RAG Knowledge Validation',
    desc: 'Cross-references statistical ML predictions against a curated medical vector database, ensuring results are grounded in verified clinical facts.',
    pill: 'Vector DB · Verified Facts',
  },
  {
    num: '04',
    tag: 'XAI Output',
    icon: Star,
    title: 'Explainable AI Output',
    desc: 'Generates transparent, human-readable justifications. The system explicitly maps matching symptoms and calculates exact confidence intervals.',
    pill: 'Confidence Intervals · XAI',
  },
];

const BADGES = [
  {
    color: 'blue' as const,
    icon: Zap,
    title: 'Confidence Calibration',
    sub: 'Standard Deviation Penalty logic prevents overconfidence.',
  },
  {
    color: 'purple' as const,
    icon: LayoutGrid,
    title: 'Human-in-the-Loop OCR',
    sub: 'Integrated EasyOCR with explicit user validation.',
  },
  {
    color: 'green' as const,
    icon: ShieldCheck,
    title: 'Edge-Optimized Privacy',
    sub: '100% local inference via Llama 3.2.',
  },
];

const BADGE_COLORS = {
  blue:   { bg: 'bg-[hsl(222_100%_93%)]', icon: 'text-primary' },
  purple: { bg: 'bg-[hsl(260_60%_90%)]',  icon: 'text-[hsl(260_70%_65%)]' },
  green:  { bg: 'bg-[hsl(155_60%_88%)]',  icon: 'text-[hsl(155_55%_40%)]' },
};

/* ─────────────────── PARTICLE CANVAS ─────────────────── */
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.5 + 0.1,
      hue: Math.random() > 0.5 ? 222 : 260,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 87%, 72%, ${p.o})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ─────────────────── TYPEWRITER ─────────────────── */
const WORDS = ['Clinical Decision Support', 'Explainable AI Health', 'Multi-Agent Diagnostics'];

function TypewriterText() {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = WORDS[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < target.length) {
      timeout = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 55);
    } else if (!deleting && displayed.length === target.length) {
      timeout = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 28);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setWordIdx(i => (i + 1) % WORDS.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIdx]);

  return (
    <span className="gradient-text">
      {displayed}
      <span className="inline-block w-[3px] h-[0.85em] bg-primary ml-1 align-middle animate-[blink_0.8s_step-end_infinite]" />
    </span>
  );
}

/* ─────────────────── FEATURE CARD ─────────────────── */
function FeatureCard({ f, idx }: { f: typeof FEATURES[0]; idx: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const Icon = f.icon;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), idx * 120); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [idx]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.35s ease, border-color 0.3s ease',
        boxShadow: hovered
          ? '0 20px 60px rgba(124,158,245,0.22), 0 8px 24px rgba(124,158,245,0.12)'
          : '0 4px 20px rgba(124,158,245,0.08)',
      }}
      className="card-medicare p-7 relative overflow-hidden cursor-default group"
    >
      {/* Top glow border on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[20px] transition-transform duration-400 origin-left"
        style={{
          background: 'linear-gradient(90deg, hsl(222,87%,72%), hsl(260,70%,82%))',
          transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 0.4s ease',
        }}
      />

      {/* Subtle glow overlay */}
      <div
        className="absolute inset-0 rounded-[20px] pointer-events-none transition-opacity duration-350"
        style={{
          background: 'linear-gradient(135deg, rgba(124,158,245,0.08), rgba(184,168,240,0.05))',
          opacity: hovered ? 1 : 0,
        }}
      />

      <div className="relative z-10">
        {/* Number + tag */}
        <div className="flex items-center gap-2 mb-5">
          <span className="font-heading font-bold text-[11px] text-primary tracking-[2px] uppercase">{f.num}</span>
          <span className="h-px flex-1 bg-border" />
          <span className="font-heading font-bold text-[10px] text-muted-foreground tracking-[1px] uppercase">{f.tag}</span>
        </div>

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-5 transition-all duration-300"
          style={{
            background: hovered
              ? 'linear-gradient(135deg, rgba(124,158,245,0.25), rgba(184,168,240,0.18))'
              : 'linear-gradient(135deg, rgba(124,158,245,0.12), rgba(184,168,240,0.08))',
            border: hovered ? '1.5px solid rgba(124,158,245,0.4)' : '1.5px solid rgba(124,158,245,0.18)',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          <Icon className="w-5 h-5 text-primary" />
        </div>

        <h3 className="font-heading font-extrabold text-[17px] mb-3 text-foreground">{f.title}</h3>
        <p className="text-muted-foreground text-[13.5px] leading-relaxed">{f.desc}</p>

        {/* Bottom pill */}
        <div className="mt-5 inline-flex items-center gap-1.5 bg-primary-light border border-[rgba(124,158,245,0.25)] rounded-full px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-heading font-bold text-[11px] text-primary">{f.pill}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── MAIN COMPONENT ─────────────────── */
export default function LandingScreen({ onGetStarted, onSignIn, onAbout, onDemo }: Props) {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    // Trigger hero entrance
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const animStyle = (delay: number) => ({
    opacity: heroVisible ? 1 : 0,
    transform: heroVisible ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
  });

  return (
    <div className="screen-fade min-h-screen">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" />
          <span className="font-heading font-extrabold text-[17px] text-primary">MediCare AI</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onAbout} className="btn-ghost text-sm py-2 px-4">About</button>
          <button onClick={onSignIn} className="btn-ghost text-sm py-2 px-4">Sign In</button>
          <button
            onClick={onGetStarted}
            className="btn-primary text-sm py-2 px-5"
            style={{ animation: 'glowPulse 3s ease-in-out infinite' }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Mesh gradient orbs */}
          <div
            className="absolute rounded-full opacity-40"
            style={{
              width: 600, height: 600, top: -150, right: -150,
              background: 'radial-gradient(circle, rgba(124,158,245,0.6), transparent 70%)',
              filter: 'blur(70px)',
              animation: 'float1 14s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full opacity-35"
            style={{
              width: 500, height: 500, bottom: -100, left: -100,
              background: 'radial-gradient(circle, rgba(184,168,240,0.5), transparent 70%)',
              filter: 'blur(60px)',
              animation: 'float2 18s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full opacity-25"
            style={{
              width: 350, height: 350, top: '45%', left: '35%',
              background: 'radial-gradient(circle, rgba(124,158,245,0.4), transparent 70%)',
              filter: 'blur(50px)',
              animation: 'float3 11s ease-in-out infinite',
            }}
          />

          {/* Grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(124,158,245,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(124,158,245,0.07) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
              maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            }}
          />
          {/* Particles */}
          <ParticleCanvas />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-[820px] mx-auto px-5 text-center pt-20 pb-16">

          {/* Badge */}
          <div style={animStyle(0)} className="inline-flex items-center gap-2 mb-8 bg-primary-light border border-[rgba(124,158,245,0.35)] rounded-full px-5 py-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="font-heading font-bold text-[12px] text-primary tracking-wider uppercase">AI-Driven Clinical Intelligence</span>
          </div>

          {/* H1 */}
          <h1
            style={animStyle(120)}
            className="font-heading font-black text-[clamp(36px,5.5vw,68px)] leading-[1.08] tracking-[-1.5px] mb-6"
          >
            MediCare AI:<br />
            <TypewriterText />
          </h1>

          {/* Sub */}
          <p
            style={animStyle(220)}
            className="text-muted-foreground text-[clamp(15px,1.8vw,18px)] leading-[1.8] max-w-[680px] mx-auto mb-10"
          >
            Bridging the gap between black-box predictions and clinical clarity.
            MediCare AI orchestrates a{' '}
            <span className="font-semibold text-foreground">Triple-Model ML Ensemble</span>{' '}
            (<span className="font-semibold text-primary">SVM, Random Forest, Naive Bayes</span>) with{' '}
            <span className="font-semibold text-foreground">RAG-based knowledge validation</span>{' '}
            to provide transparent, interpretable health insights powered entirely by{' '}
            <span className="font-semibold text-foreground">local, privacy-first AI</span>.
          </p>

          {/* CTAs */}
          <div style={animStyle(320)} className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center justify-center gap-2.5 font-heading font-extrabold text-[15px] text-white rounded-full px-9 py-4 border-none cursor-pointer relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(222,70%,62%), hsl(222,87%,72%), hsl(260,70%,75%))',
                backgroundSize: '200% 200%',
                animation: 'gradientFlow 4s ease infinite, glowPulse 3s ease-in-out infinite',
                transition: 'transform 0.2s, filter 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px) scale(1.02)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)'; }}
            >
              <Play className="w-4 h-4 fill-white" />
              Initialize Diagnostic Agent
            </button>

            <button
              onClick={onAbout}
              className="inline-flex items-center justify-center gap-2.5 font-heading font-bold text-[15px] text-primary rounded-full px-8 py-[14px] cursor-pointer"
              style={{
                background: 'transparent',
                border: '2px solid rgba(124,158,245,0.4)',
                transition: 'all 0.25s',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = 'rgba(124,158,245,0.08)';
                b.style.borderColor = 'rgba(124,158,245,0.7)';
                b.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = 'transparent';
                b.style.borderColor = 'rgba(124,158,245,0.4)';
                b.style.transform = 'translateY(0)';
              }}
            >
              <LayoutGrid className="w-4 h-4" />
              View System Architecture
            </button>
          </div>

          {/* Demo link */}
          {onDemo && (
            <div style={animStyle(380)} className="flex justify-center mb-10">
              <button onClick={onDemo} className="flex items-center gap-1.5 text-primary text-sm font-heading font-bold hover:underline transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
                Preview Demo (no backend needed)
              </button>
            </div>
          )}

          {/* Trust bar */}
          <div style={animStyle(440)} className="flex flex-wrap justify-center gap-x-7 gap-y-3 text-muted-foreground text-[13px]">
            {[
              { Icon: Lock,          text: 'Your data is private & encrypted' },
              { Icon: Zap,           text: 'ML-powered predictions' },
              { Icon: Stethoscope,   text: 'AI-powered analysis' },
              { Icon: AlertTriangle, text: 'Always consult a real doctor' },
            ].map(({ Icon, text }) => (
              <span key={text} className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 opacity-60" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS TICKER ── */}
      <div className="bg-card/70 backdrop-blur-lg border-y border-border py-8 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { val: '3',    label: 'ML Models in Ensemble' },
            { val: '100%', label: 'Local & Private Inference' },
            { val: 'RAG',  label: 'Knowledge Validation' },
            { val: 'XAI',  label: 'Explainable AI Output' },
          ].map(({ val, label }) => (
            <div key={label} className="py-4">
              <div
                className="font-heading font-black text-[38px] leading-none mb-2"
                style={{
                  background: 'linear-gradient(135deg, hsl(222,70%,62%), hsl(260,70%,75%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {val}
              </div>
              <div className="text-[11px] text-muted-foreground font-semibold tracking-widest uppercase">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-6xl mx-auto px-5 py-20 text-center">
        <div className="flex items-center justify-center gap-4 mb-5">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary opacity-60" />
          <span className="font-heading font-bold text-[11px] text-primary tracking-[3px] uppercase">How It Works</span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-primary opacity-60" />
        </div>
        <h2 className="font-heading font-black text-[clamp(28px,4vw,44px)] tracking-[-0.5px] leading-tight mb-5">
          Four-Stage Intelligence Pipeline
        </h2>
        <p className="text-muted-foreground text-[16.5px] leading-relaxed max-w-[580px] mx-auto mb-14">
          From raw patient input to transparent clinical insight — every step engineered for accuracy, privacy, and interpretability.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => <FeatureCard key={f.num} f={f} idx={i} />)}
        </div>
      </section>

      {/* ── TECHNICAL EDGE BADGES ── */}
      <div className="bg-card/60 backdrop-blur-lg border-y border-border py-10 px-5">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-4 justify-center">
          {BADGES.map(({ color, icon: Icon, title, sub }) => {
            const c = BADGE_COLORS[color];
            return (
              <div
                key={title}
                className="flex items-center gap-4 bg-card border border-border rounded-full px-6 py-4 flex-1 min-w-[260px] max-w-[360px] transition-all duration-300 hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(124,158,245,0.15)] hover:-translate-y-1"
              >
                <div className={`w-10 h-10 rounded-full ${c.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <div>
                  <div className="font-heading font-extrabold text-[13px] text-foreground">{title}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5 leading-tight">{sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CTA SECTION ── */}
      <section className="py-20 px-5 text-center" style={{ background: 'linear-gradient(135deg, rgba(124,158,245,0.06), rgba(184,168,240,0.04))' }}>
        <div
          className="max-w-2xl mx-auto bg-card border border-border rounded-[32px] p-14 relative overflow-hidden"
          style={{ boxShadow: '0 40px 100px rgba(124,158,245,0.14), 0 10px 30px rgba(124,158,245,0.07)' }}
        >
          {/* BG orbs inside CTA */}
          <div className="absolute top-[-80px] right-[-80px] w-56 h-56 rounded-full opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(124,158,245,0.5), transparent 70%)', filter: 'blur(40px)', animation: 'float1 10s ease-in-out infinite' }} />
          <div className="absolute bottom-[-60px] left-[-60px] w-44 h-44 rounded-full opacity-25 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(184,168,240,0.5), transparent 70%)', filter: 'blur(30px)', animation: 'float2 12s ease-in-out infinite' }} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-[rgba(255,180,80,0.1)] border border-[rgba(255,180,80,0.3)] rounded-full px-4 py-1.5 font-heading font-bold text-[12px] text-[#a86a00] mb-6">
              <AlertTriangle className="w-3.5 h-3.5" />
              For informational purposes only
            </div>

            <h2 className="font-heading font-black text-[clamp(24px,3.5vw,38px)] tracking-tight leading-tight mb-5">
              Ready to{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, hsl(222,87%,62%), hsl(222,87%,72%), hsl(260,70%,75%), hsl(222,87%,62%))',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'shimmer 3s linear infinite',
                }}
              >
                Initialize
              </span>{' '}
              Your Diagnostic Session?
            </h2>

            <p className="text-muted-foreground text-[15px] leading-[1.75] mb-9 max-w-[480px] mx-auto">
              Experience multi-agent AI orchestration, real-time ML ensemble consensus, and RAG-validated clinical intelligence — all running locally.
            </p>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 font-heading font-extrabold text-sm text-white rounded-full px-8 py-3.5 border-none cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, hsl(222,70%,62%), hsl(222,87%,72%), hsl(260,70%,75%))',
                  animation: 'glowPulse 3s ease-in-out infinite',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.02)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
              >
                <Play className="w-4 h-4 fill-white" />
                Start Health Check
              </button>
              {onDemo && (
                <button
                  onClick={onDemo}
                  className="btn-ghost text-sm py-3.5 px-7"
                >
                  Preview Demo
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="text-center py-8 px-5 border-t border-border text-muted-foreground text-xs">
        <p className="mb-1">⚠️ MediCare AI is not a substitute for professional medical advice. Always consult a licensed healthcare provider.</p>
        <p>© {new Date().getFullYear()} MediCare AI. All rights reserved. Built with privacy-first, local AI infrastructure.</p>
      </footer>
    </div>
  );
}