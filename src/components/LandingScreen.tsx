import { Stethoscope, MessageCircle, HelpCircle, Activity, Sparkles, Lock, Zap, AlertTriangle } from 'lucide-react';

interface Props {
  onGetStarted: () => void;
  onSignIn: () => void;
  onDemo?: () => void;
}

const steps = [
  { num: '01', icon: MessageCircle, title: 'Describe Your Symptoms', desc: 'Type how you feel in plain language. No medical knowledge needed.' },
  { num: '02', icon: HelpCircle, title: 'AI Symptom Analysis', desc: 'Our AI uses medical knowledge (RAG) and a local language model to extract symptoms and ask targeted follow-up questions.' },
  { num: '03', icon: Activity, title: 'ML Disease Prediction', desc: 'Combines RAG (medical knowledge), local LLM reasoning, and optional ML models (Random Forest, SVM, Naive Bayes) for accurate predictions.' },
  { num: '04', icon: Sparkles, title: 'AI Explanation', desc: 'A local AI assistant (llama3.2) generates a plain-English explanation of your results.' },
];

export default function LandingScreen({ onGetStarted, onSignIn, onDemo }: Props) {
  return (
    <div className="screen-fade min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-card border-b border-border h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-primary" />
          <span className="font-heading font-bold text-lg text-primary">MediCare AI</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onSignIn} className="btn-ghost text-sm py-2 px-4">Sign In</button>
          <button onClick={onGetStarted} className="btn-primary text-sm py-2 px-4">Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-20 px-5 max-w-2xl mx-auto">
        <span className="inline-block bg-primary-light text-primary font-heading font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
          🏥 AI-Driven Health Insights
        </span>
        <h1 className="font-heading font-extrabold text-4xl sm:text-[52px] leading-tight mb-5">
          Intelligent<br />
          <span className="gradient-text">Symptom Analysis</span> 🩺
        </h1>
        <p className="text-muted-foreground text-[17px] max-w-[500px] mx-auto mb-8 leading-relaxed">
          Describe your symptoms in plain language. MediCare AI uses RAG (medical knowledge retrieval), a local LLM (llama3.2 via Ollama), and optional machine learning models to understand your symptoms, ask follow-up questions, predict conditions, and explain results in simple terms.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <button onClick={onGetStarted} className="btn-primary text-base py-3.5 px-8">Start Health Check →</button>
          <a href="#how-it-works" className="btn-ghost text-base py-3.5 px-8">Learn How It Works</a>
        </div>
        {onDemo && (
          <div className="flex justify-center mb-8">
            <button onClick={onDemo} className="text-primary text-sm font-heading font-semibold hover:underline transition-colors">
              🔍 Preview Demo (no backend needed)
            </button>
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-muted-foreground text-sm">
          <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> Your data is private and encrypted</span>
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> ML-powered predictions</span>
          <span className="flex items-center gap-1.5"><Stethoscope className="w-4 h-4" /> AI-powered analysis</span>
          <span className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Always consult a real doctor</span>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-5 pb-20">
        <h2 className="font-heading font-bold text-2xl text-center mb-10">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s) => (
            <div key={s.num} className="card-medicare p-7">
              <span className="text-primary font-heading font-bold text-sm">{s.num}</span>
              <s.icon className="w-8 h-8 text-primary mt-3 mb-3" />
              <h3 className="font-heading font-bold text-base mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 px-5 border-t border-border text-muted-foreground text-xs">
        <p className="mb-1">⚠️ MediCare AI is not a substitute for professional medical advice.</p>
        <p>© {new Date().getFullYear()} MediCare AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
