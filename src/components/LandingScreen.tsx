import { Stethoscope, MessageCircle, HelpCircle, Activity, Sparkles, Lock, Zap, AlertTriangle } from 'lucide-react';
import { usePointerField, useReveal, useTilt, useMagnetic, useScrolled } from '@/hooks/use-pointer-fx';
import AuroraBackdrop from '@/components/AuroraBackdrop';

interface Props {
  onGetStarted: () => void;
  onSignIn: () => void;
  onAbout: () => void;
  onDemo?: () => void;
}

const steps = [
  { num: '01', icon: MessageCircle, title: 'Describe Your Symptoms', desc: 'Type how you feel in plain language. No medical knowledge needed.' },
  { num: '02', icon: HelpCircle, title: 'AI Symptom Analysis', desc: 'Our AI uses medical knowledge (RAG) and a local language model to extract symptoms and ask targeted follow-up questions.' },
  { num: '03', icon: Activity, title: 'ML Disease Prediction', desc: 'Combines RAG (medical knowledge), local LLM reasoning, and optional ML models (Random Forest, SVM, Naive Bayes) for accurate predictions.' },
  { num: '04', icon: Sparkles, title: 'AI Explanation', desc: 'A local AI assistant (llama3.2) generates a plain-English explanation of your results.' },
];

const trustSignals = [
  { icon: Lock, label: 'Your data is private and encrypted' },
  { icon: Zap, label: 'ML-powered predictions' },
  { icon: Stethoscope, label: 'AI-powered analysis' },
  { icon: AlertTriangle, label: 'Always consult a real doctor' },
];

export default function LandingScreen({ onGetStarted, onSignIn, onAbout, onDemo }: Props) {
  const fieldRef = usePointerField<HTMLDivElement>();
  const revealRef = useReveal<HTMLDivElement>();
  const tilt = useTilt();
  const magnetic = useMagnetic();
  const scrolled = useScrolled(8);

  return (
    <div ref={fieldRef} className="screen-fade relative min-h-screen pointer-spotlight">
      {/* Layer 0 - the aurora the glass refracts. Fixed, non-interactive. */}
      <AuroraBackdrop />

      {/* Content sits above the backdrop and the spotlight. */}
      <div ref={revealRef} className="relative z-10">
        {/* Navbar */}
        <nav
          data-scrolled={scrolled}
          className="glass-nav sticky top-0 z-50 h-16 flex items-center px-6 justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex items-center justify-center w-9 h-9 rounded-full gradient-avatar shadow-soft">
              <Stethoscope className="w-[18px] h-[18px] text-white" />
            </span>
            <span className="font-heading font-bold text-lg text-primary">MediCare AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onAbout} className="btn-ghost text-sm py-2 px-4 bg-white/40 hover:bg-white/70 border-white/60">About</button>
            <button onClick={onSignIn} className="btn-ghost text-sm py-2 px-4 bg-white/40 hover:bg-white/70 border-white/60">Sign In</button>
            <button onClick={onGetStarted} className="btn-primary text-sm py-2 px-4 shadow-soft">Get Started</button>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative text-center pt-20 pb-16 px-5 max-w-3xl mx-auto">
          <div className="reveal" data-reveal style={{ ['--i' as string]: 0 }}>
            <span className="glass-pill badge-pulse relative inline-flex items-center gap-2 text-primary font-heading font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
              🏥 AI-Driven Health Insights
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-[56px] leading-[1.08] mb-5 tracking-tight">
            <span className="reveal inline-block" data-reveal style={{ ['--i' as string]: 1 }}>
              Intelligent
            </span>
            <br />
            <span className="reveal inline-block" data-reveal style={{ ['--i' as string]: 2 }}>
              <span className="gradient-text-animated">Symptom Analysis</span>{' '}
              <span className="float-slow inline-block">🩺</span>
            </span>
          </h1>

          {/* ECG motif - a quiet nod to the domain, not a centrepiece. */}
          <div className="reveal flex justify-center mb-7" data-reveal style={{ ['--i' as string]: 3 }} aria-hidden="true">
            <svg width="240" height="26" viewBox="0 0 240 26" fill="none" className="opacity-70">
              <path
                d="M0 13 H72 l6 -9 l7 18 l6 -12 l5 6 H240"
                stroke="hsl(var(--primary))"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ecg-trace"
              />
            </svg>
          </div>

          <p
            className="reveal text-muted-foreground text-[17px] max-w-[560px] mx-auto mb-8 leading-relaxed"
            data-reveal
            style={{ ['--i' as string]: 4 }}
          >
            Describe your symptoms in plain language. MediCare AI uses RAG (medical knowledge retrieval), a local LLM (llama3.2 via Ollama), and optional machine learning models to understand your symptoms, ask follow-up questions, predict conditions, and explain results in simple terms.
          </p>

          <div
            className="reveal flex flex-col sm:flex-row gap-3 justify-center mb-4"
            data-reveal
            style={{ ['--i' as string]: 5 }}
          >
            <span className="cta-glow rounded-full inline-flex">
              <button
                onClick={onGetStarted}
                {...magnetic}
                className="magnetic btn-primary text-base py-3.5 px-8 w-full sm:w-auto"
              >
                Start Health Check →
              </button>
            </span>
            <a
              href="#how-it-works"
              {...magnetic}
              className="magnetic glass-pill btn-pill text-base py-3.5 px-8 text-foreground inline-flex items-center justify-center hover:bg-white/80"
            >
              Learn How It Works
            </a>
          </div>

          {onDemo && (
            <div className="reveal flex justify-center mb-8" data-reveal style={{ ['--i' as string]: 6 }}>
              <button
                onClick={onDemo}
                className="text-primary text-sm font-heading font-semibold hover:underline underline-offset-4 transition-colors"
              >
                🔍 Preview Demo (no backend needed)
              </button>
            </div>
          )}

          <div
            className="reveal flex flex-wrap justify-center gap-2.5"
            data-reveal
            style={{ ['--i' as string]: 7 }}
          >
            {trustSignals.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="glass-pill inline-flex items-center gap-1.5 text-muted-foreground text-[13px] px-3.5 py-1.5 rounded-full"
              >
                <Icon className="w-3.5 h-3.5 text-primary" /> {label}
              </span>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="relative max-w-5xl mx-auto px-5 pb-20 scroll-mt-20">
          <h2
            className="reveal font-heading font-bold text-2xl sm:text-3xl text-center mb-3"
            data-reveal
            style={{ ['--i' as string]: 0 }}
          >
            How It Works
          </h2>
          <p
            className="reveal text-center text-muted-foreground text-sm mb-12 max-w-md mx-auto"
            data-reveal
            style={{ ['--i' as string]: 1 }}
          >
            Four steps from a plain-language description to an explained result.
          </p>

          <div className="relative">
            {/* Flow line threading the four steps - draws itself on scroll. */}
            <svg
              className="hidden lg:block absolute left-0 right-0 top-[70px] w-full h-6 pointer-events-none"
              viewBox="0 0 1000 24"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M125 12 H875"
                pathLength={1}
                stroke="url(#flowGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="1"
                className="flow-line"
                data-reveal
              />
              <defs>
                <linearGradient id="flowGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
                  <stop offset="50%" stopColor="hsl(var(--purple))" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.15" />
                </linearGradient>
              </defs>
            </svg>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {steps.map((s, i) => (
                <div
                  key={s.num}
                  className="reveal"
                  data-reveal
                  style={{ ['--i' as string]: i + 2 }}
                >
                  <article
                    {...tilt}
                    className="tilt-card glass-panel relative h-full rounded-[20px] p-7 overflow-hidden"
                  >
                    <div className="tilt-glare" aria-hidden="true" />
                    <div className="relative flex items-center justify-between mb-4">
                      <span className="relative z-10 flex items-center justify-center w-11 h-11 rounded-2xl gradient-avatar shadow-soft">
                        <s.icon className="w-5 h-5 text-white" />
                      </span>
                      <span className="font-heading font-extrabold text-3xl text-primary/15 leading-none select-none">
                        {s.num}
                      </span>
                    </div>
                    <h3 className="relative font-heading font-bold text-base mb-2">{s.title}</h3>
                    <p className="relative text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative text-center py-8 px-5 border-t border-white/50 bg-white/30 backdrop-blur-sm text-muted-foreground text-xs">
          <p className="mb-1">⚠️ MediCare AI is not a substitute for professional medical advice.</p>
          <p>© {new Date().getFullYear()} MediCare AI. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
