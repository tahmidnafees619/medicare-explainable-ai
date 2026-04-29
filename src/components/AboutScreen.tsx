import { Stethoscope, ArrowRight, Database, Shield, Zap, Brain, BarChart3, GitBranch, Sparkles, HelpCircle, Cpu, Network } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface Props {
  onBack: () => void;
  onGetStarted: () => void;
}

/* ─────────────────────────────────────────────
   ARCHITECTURE DIAGRAM  –  live glowing SVG
   ───────────────────────────────────────────── */
const ArchitectureDiagram = () => (
  <svg viewBox="0 0 1060 460" className="w-full h-auto" style={{ fontFamily: 'inherit' }}>
    <defs>
      {/* Glow filters */}
      <filter id="glow-blue" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="glow-purple" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="7" result="blur" />
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="glow-orange" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="glow-pink" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="glow-green" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="soft-shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.18" />
      </filter>
      {/* Gradients */}
      <linearGradient id="box-blue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#1e40af" stopOpacity="0.95" />
      </linearGradient>
      <linearGradient id="box-purple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.95" />
      </linearGradient>
      <linearGradient id="box-orange" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#92400e" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#b45309" stopOpacity="0.95" />
      </linearGradient>
      <linearGradient id="box-pink" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#831843" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#be185d" stopOpacity="0.95" />
      </linearGradient>
      <linearGradient id="box-green" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14532d" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#166534" stopOpacity="0.95" />
      </linearGradient>
      <linearGradient id="line-blue-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.2" />
        <stop offset="50%" stopColor="#60a5fa" stopOpacity="1" />
        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.2" />
      </linearGradient>
      {/* Animated pulse dot */}
      <radialGradient id="pulse-dot">
        <stop offset="0%" stopColor="white" stopOpacity="1" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>

      {/* Background */}
      <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </linearGradient>
    </defs>

    {/* BG */}
    <rect width="1060" height="460" rx="16" fill="url(#bg-grad)" />
    {/* Subtle grid */}
<pattern id="grid-arch" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
    </pattern>
    <rect width="1060" height="460" rx="16" fill="url(#grid)" />

    {/* ── FRONTEND BOX ── */}
    <rect x="30" y="140" width="185" height="175" rx="14" fill="url(#box-blue)" filter="url(#soft-shadow)" />
    <rect x="30" y="140" width="185" height="175" rx="14" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeOpacity="0.7" filter="url(#glow-blue)" />
    <rect x="30" y="140" width="185" height="3" rx="2" fill="#60a5fa" opacity="0.9" />
    <text x="122" y="175" fontSize="15" fontWeight="800" textAnchor="middle" fill="#bfdbfe" letterSpacing="0.5">FRONTEND</text>
    <text x="122" y="196" fontSize="11" textAnchor="middle" fill="#93c5fd" opacity="0.8">React 19 + Vite</text>
    <text x="122" y="215" fontSize="10" textAnchor="middle" fill="#64748b">Port 8080</text>
    <rect x="55" y="228" width="130" height="22" rx="5" fill="#1d4ed8" fillOpacity="0.4" />
    <text x="120" y="243" fontSize="10" textAnchor="middle" fill="#93c5fd">Chat Interface</text>
    <rect x="55" y="256" width="130" height="22" rx="5" fill="#1d4ed8" fillOpacity="0.4" />
    <text x="120" y="271" fontSize="10" textAnchor="middle" fill="#93c5fd">Dashboard</text>
    <rect x="55" y="284" width="130" height="22" rx="5" fill="#1d4ed8" fillOpacity="0.4" />
    <text x="120" y="299" fontSize="10" textAnchor="middle" fill="#93c5fd">Medication Reminders</text>

    {/* ── BACKEND BOX ── */}
    <rect x="418" y="140" width="205" height="175" rx="14" fill="url(#box-purple)" filter="url(#soft-shadow)" />
    <rect x="418" y="140" width="205" height="175" rx="14" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeOpacity="0.7" filter="url(#glow-purple)" />
    <rect x="418" y="140" width="205" height="3" rx="2" fill="#a78bfa" opacity="0.9" />
    <text x="520" y="175" fontSize="15" fontWeight="800" textAnchor="middle" fill="#ede9fe" letterSpacing="0.5">BACKEND API</text>
    <text x="520" y="196" fontSize="11" textAnchor="middle" fill="#c4b5fd" opacity="0.8">Express.js + TypeScript</text>
    <text x="520" y="215" fontSize="10" textAnchor="middle" fill="#64748b">Port 5000</text>
    <rect x="445" y="228" width="150" height="22" rx="5" fill="#5b21b6" fillOpacity="0.5" />
    <text x="520" y="243" fontSize="10" textAnchor="middle" fill="#c4b5fd">RAG Orchestration</text>
    <rect x="445" y="256" width="150" height="22" rx="5" fill="#5b21b6" fillOpacity="0.5" />
    <text x="520" y="271" fontSize="10" textAnchor="middle" fill="#c4b5fd">Dynamic ML Weighting</text>
    <rect x="445" y="284" width="150" height="22" rx="5" fill="#5b21b6" fillOpacity="0.5" />
    <text x="520" y="299" fontSize="10" textAnchor="middle" fill="#c4b5fd">LLM Fallback Logic</text>

    {/* ── LLM/OLLAMA BOX ── */}
    <rect x="820" y="40" width="200" height="145" rx="14" fill="url(#box-orange)" filter="url(#soft-shadow)" />
    <rect x="820" y="40" width="200" height="145" rx="14" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.7" filter="url(#glow-orange)" />
    <rect x="820" y="40" width="200" height="3" rx="2" fill="#fbbf24" opacity="0.9" />
    <text x="920" y="75" fontSize="15" fontWeight="800" textAnchor="middle" fill="#fef3c7" letterSpacing="0.5">OLLAMA LLM</text>
    <text x="920" y="96" fontSize="11" textAnchor="middle" fill="#fde68a" opacity="0.8">llama3.2 — local inference</text>
    <text x="920" y="114" fontSize="10" textAnchor="middle" fill="#64748b">Port 11434</text>
    <rect x="848" y="125" width="144" height="22" rx="5" fill="#78350f" fillOpacity="0.6" />
    <text x="920" y="140" fontSize="10" textAnchor="middle" fill="#fde68a">Fallback + Explanation</text>
    <rect x="848" y="152" width="144" height="22" rx="5" fill="#78350f" fillOpacity="0.6" />
    <text x="920" y="167" fontSize="10" textAnchor="middle" fill="#fde68a">RAG Context Reasoning</text>

    {/* ── ML SERVICE BOX ── (highlighted as primary) */}
    <rect x="820" y="260" width="200" height="160" rx="14" fill="url(#box-pink)" filter="url(#soft-shadow)" />
    <rect x="820" y="260" width="200" height="160" rx="14" fill="none" stroke="#f472b6" strokeWidth="2" strokeOpacity="0.9" filter="url(#glow-pink)" />
    <rect x="820" y="260" width="200" height="3" rx="2" fill="#f472b6" opacity="1" />
    {/* PRIMARY badge */}
    <rect x="870" y="272" width="100" height="18" rx="9" fill="#be185d" />
    <text x="920" y="285" fontSize="9" fontWeight="700" textAnchor="middle" fill="white" letterSpacing="1">★ PRIMARY</text>
    <text x="920" y="314" fontSize="15" fontWeight="800" textAnchor="middle" fill="#fce7f3" letterSpacing="0.5">ML SERVICE</text>
    <text x="920" y="333" fontSize="11" textAnchor="middle" fill="#f9a8d4" opacity="0.8">3× Ensemble + softmax</text>
    <text x="920" y="351" fontSize="10" textAnchor="middle" fill="#64748b">Port 8000</text>
    <rect x="848" y="362" width="144" height="22" rx="5" fill="#831843" fillOpacity="0.6" />
    <text x="920" y="377" fontSize="10" textAnchor="middle" fill="#f9a8d4">Dynamic Weight System</text>
    <rect x="848" y="390" width="144" height="22" rx="5" fill="#831843" fillOpacity="0.6" />
    <text x="920" y="405" fontSize="10" textAnchor="middle" fill="#f9a8d4">adjusted_ml ≥ 30 → Primary</text>

    {/* ── DATABASE BOX ── */}
    <rect x="30" y="350" width="185" height="85" rx="14" fill="url(#box-green)" filter="url(#soft-shadow)" />
    <rect x="30" y="350" width="185" height="85" rx="14" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeOpacity="0.6" filter="url(#glow-green)" />
    <rect x="30" y="350" width="185" height="3" rx="2" fill="#4ade80" opacity="0.9" />
    <text x="122" y="382" fontSize="14" fontWeight="800" textAnchor="middle" fill="#dcfce7" letterSpacing="0.5">DATABASE</text>
    <text x="122" y="400" fontSize="10" textAnchor="middle" fill="#86efac" opacity="0.8">SQLite + Prisma ORM</text>
    <text x="122" y="416" fontSize="10" textAnchor="middle" fill="#64748b">User Data & History</text>

    {/* ────────── ANIMATED CONNECTION LINES ────────── */}
    {/* Frontend → Backend */}
    <line x1="215" y1="228" x2="418" y2="228" stroke="#60a5fa" strokeWidth="2" strokeOpacity="0.5" />
    <line x1="215" y1="228" x2="418" y2="228" stroke="url(#line-blue-grad)" strokeWidth="2">
      <animate attributeName="stroke-dashoffset" from="0" to="-30" dur="1.2s" repeatCount="indefinite" />
    </line>
    {/* animated dot */}
    <circle cx="215" cy="228" r="5" fill="#60a5fa" opacity="0.9">
      <animate attributeName="cx" from="215" to="418" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
    </circle>
    <text x="316" y="218" fontSize="10" textAnchor="middle" fill="#60a5fa" fontWeight="700" letterSpacing="0.5">REST API</text>

    {/* Backend → ML Service (PRIMARY — thicker, brighter) */}
    <line x1="623" y1="280" x2="820" y2="340" stroke="#f472b6" strokeWidth="3" strokeOpacity="0.4" />
    <circle cx="623" cy="280" r="5" fill="#f472b6" opacity="0.9">
      <animate attributeName="cx" from="623" to="820" dur="1.3s" repeatCount="indefinite" />
      <animate attributeName="cy" from="280" to="340" dur="1.3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;1;0" dur="1.3s" repeatCount="indefinite" />
    </circle>
    <text x="730" y="295" fontSize="10" textAnchor="middle" fill="#f472b6" fontWeight="700">ML Primary</text>

    {/* Backend → Ollama (secondary / fallback) */}
    <line x1="623" y1="190" x2="820" y2="130" stroke="#fbbf24" strokeWidth="2" strokeOpacity="0.4" strokeDasharray="6,4" />
    <circle cx="623" cy="190" r="4" fill="#fbbf24" opacity="0.9">
      <animate attributeName="cx" from="623" to="820" dur="1.8s" repeatCount="indefinite" />
      <animate attributeName="cy" from="190" to="130" dur="1.8s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" />
    </circle>
    <text x="730" y="148" fontSize="10" textAnchor="middle" fill="#fbbf24" fontWeight="700">LLM Fallback</text>

    {/* Backend → Database */}
    <line x1="418" y1="280" x2="215" y2="360" stroke="#4ade80" strokeWidth="2" strokeOpacity="0.4" />
    <circle cx="418" cy="280" r="4" fill="#4ade80" opacity="0.9">
      <animate attributeName="cx" from="418" to="215" dur="1.6s" repeatCount="indefinite" />
      <animate attributeName="cy" from="280" to="360" dur="1.6s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;1;0" dur="1.6s" repeatCount="indefinite" />
    </circle>
    <text x="302" y="338" fontSize="10" textAnchor="middle" fill="#4ade80" fontWeight="700">Query & Store</text>

    {/* RAG validation annotation */}
    <rect x="620" y="360" width="170" height="50" rx="10" fill="#1e293b" stroke="#a78bfa" strokeWidth="1" strokeOpacity="0.6" />
    <text x="705" y="381" fontSize="9" fontWeight="700" textAnchor="middle" fill="#c4b5fd">RAG: validateTopDiseases()</text>
    <text x="705" y="397" fontSize="9" textAnchor="middle" fill="#94a3b8">Symptom match validation</text>
    <line x1="705" y1="360" x2="705" y2="315" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="4,3" strokeOpacity="0.7" />
    <circle cx="705" cy="337" r="3" fill="#a78bfa">
      <animate attributeName="cy" from="360" to="315" dur="1.4s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;1;0" dur="1.4s" repeatCount="indefinite" />
    </circle>
  </svg>
);

/* ─────────────────────────────────────────────
   WORKFLOW DIAGRAM  –  conditional decision flow
   ───────────────────────────────────────────── */
const WorkflowDiagram = () => (
  <svg viewBox="0 0 1060 520" className="w-full h-auto">
    <defs>
      <filter id="wf-glow-blue"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="wf-glow-pink"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="wf-glow-orange"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="wf-glow-green"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="wf-glow-purple"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <linearGradient id="wf-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" /><stop offset="100%" stopColor="#1e1b4b" />
      </linearGradient>
      <marker id="wf-arrow-pink" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#f472b6" />
      </marker>
      <marker id="wf-arrow-orange" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#fbbf24" />
      </marker>
      <marker id="wf-arrow-purple" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#a78bfa" />
      </marker>
      <marker id="wf-arrow-blue" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#60a5fa" />
      </marker>
      <marker id="wf-arrow-green" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#4ade80" />
      </marker>
    </defs>

    <rect width="1060" height="520" rx="16" fill="url(#wf-bg)" />
    <rect width="1060" height="520" rx="16" fill="url(#grid)" />

    {/* ── STEP 1: Symptom Extraction ── */}
    <rect x="30" y="200" width="160" height="80" rx="12" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" filter="url(#wf-glow-blue)" />
    <rect x="30" y="200" width="160" height="4" rx="2" fill="#60a5fa" />
    <text x="110" y="232" fontSize="12" fontWeight="800" textAnchor="middle" fill="#bfdbfe">SYMPTOM</text>
    <text x="110" y="249" fontSize="12" fontWeight="800" textAnchor="middle" fill="#bfdbfe">EXTRACTION</text>
    <text x="110" y="266" fontSize="9" textAnchor="middle" fill="#64748b">Free-text → structured</text>

    {/* Arrow 1→2 */}
    <line x1="190" y1="240" x2="238" y2="240" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#wf-arrow-blue)" />
    <circle cx="214" cy="240" r="4" fill="#60a5fa">
      <animate attributeName="cx" from="190" to="238" dur="1s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
    </circle>

    {/* ── STEP 2: Follow-up Qs ── */}
    <rect x="240" y="200" width="160" height="80" rx="12" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1.5" filter="url(#wf-glow-purple)" />
    <rect x="240" y="200" width="160" height="4" rx="2" fill="#a78bfa" />
    <text x="320" y="232" fontSize="12" fontWeight="800" textAnchor="middle" fill="#ede9fe">FOLLOW-UP</text>
    <text x="320" y="249" fontSize="12" fontWeight="800" textAnchor="middle" fill="#ede9fe">QUESTIONS</text>
    <text x="320" y="266" fontSize="9" textAnchor="middle" fill="#64748b">LLM Y/N generation</text>

    {/* Arrow 2→decision */}
    <line x1="400" y1="240" x2="448" y2="240" stroke="#a78bfa" strokeWidth="2" markerEnd="url(#wf-arrow-purple)" />
    <circle cx="424" cy="240" r="4" fill="#a78bfa">
      <animate attributeName="cx" from="400" to="448" dur="1s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
    </circle>

    {/* ── DECISION DIAMOND ── */}
    <polygon points="530,190 620,240 530,290 440,240" fill="#1e293b" stroke="#facc15" strokeWidth="2" filter="url(#wf-glow-orange)" />
    <text x="530" y="230" fontSize="9" fontWeight="800" textAnchor="middle" fill="#fef9c3">adjusted</text>
    <text x="530" y="244" fontSize="9" fontWeight="800" textAnchor="middle" fill="#fef9c3">_ml ≥ 30?</text>
    <text x="530" y="257" fontSize="9" textAnchor="middle" fill="#fbbf24">rag_score≥40?</text>

    {/* ── BRANCH 1: ML Primary (top) ── */}
    {/* Arrow from diamond up-right */}
    <line x1="600" y1="210" x2="680" y2="120" stroke="#f472b6" strokeWidth="2.5" markerEnd="url(#wf-arrow-pink)" />
    <text x="660" y="162" fontSize="9" fill="#f472b6" fontWeight="700">YES: adj≥30</text>

    <rect x="680" y="60" width="175" height="110" rx="12" fill="#831843" stroke="#f472b6" strokeWidth="2" filter="url(#wf-glow-pink)" />
    <rect x="680" y="60" width="175" height="4" rx="2" fill="#f472b6" />
    <text x="767" y="90" fontSize="10" fontWeight="800" textAnchor="middle" fill="#fce7f3">★ ML PRIMARY</text>
    <text x="767" y="107" fontSize="9" textAnchor="middle" fill="#f9a8d4">softmax(confs/25)</text>
    <text x="767" y="122" fontSize="9" textAnchor="middle" fill="#f9a8d4">weighted_ml_raw − std×0.25</text>
    <text x="767" y="138" fontSize="9" textAnchor="middle" fill="#f9a8d4">= adjusted_ml</text>
    {/* RAG validate */}
    <line x1="767" y1="170" x2="767" y2="205" stroke="#f472b6" strokeWidth="2" markerEnd="url(#wf-arrow-pink)" />
    <rect x="695" y="205" width="145" height="50" rx="10" fill="#312e81" stroke="#a78bfa" strokeWidth="1.5" />
    <text x="767" y="226" fontSize="9" fontWeight="700" textAnchor="middle" fill="#c4b5fd">RAG validate</text>
    <text x="767" y="241" fontSize="9" textAnchor="middle" fill="#94a3b8">TopDiseases() match</text>

    {/* ── BRANCH 2: RAG Primary (middle) ── */}
    <line x1="620" y1="240" x2="700" y2="240" stroke="#fbbf24" strokeWidth="2.5" markerEnd="url(#wf-arrow-orange)" />
    <text x="660" y="232" fontSize="9" fill="#fbbf24" fontWeight="700">NO → rag≥40</text>

    <rect x="700" y="200" width="155" height="80" rx="12" fill="#78350f" stroke="#fbbf24" strokeWidth="2" filter="url(#wf-glow-orange)" />
    <rect x="700" y="200" width="155" height="4" rx="2" fill="#fbbf24" />
    <text x="777" y="228" fontSize="10" fontWeight="800" textAnchor="middle" fill="#fef9c3">RAG PRIMARY</text>
    <text x="777" y="244" fontSize="9" textAnchor="middle" fill="#fde68a">rag_score ≥ 40</text>
    <text x="777" y="260" fontSize="9" textAnchor="middle" fill="#fde68a">Hybrid scoring</text>

    {/* ── BRANCH 3: LLM Fallback (bottom) ── */}
    <line x1="600" y1="270" x2="680" y2="340" stroke="#a78bfa" strokeWidth="2" markerEnd="url(#wf-arrow-purple)" strokeDasharray="6,3" />
    <text x="655" y="322" fontSize="9" fill="#a78bfa" fontWeight="700">ELSE fallback</text>

    <rect x="680" y="340" width="155" height="80" rx="12" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
    <rect x="680" y="340" width="155" height="4" rx="2" fill="#818cf8" />
    <text x="757" y="368" fontSize="10" fontWeight="800" textAnchor="middle" fill="#e0e7ff">LLM FALLBACK</text>
    <text x="757" y="384" fontSize="9" textAnchor="middle" fill="#a5b4fc">llama3.2 + RAG ctx</text>
    <text x="757" y="400" fontSize="9" textAnchor="middle" fill="#a5b4fc">Full reasoning</text>

    {/* ── All branches → FINAL RESULTS ── */}
    {/* From ML+RAG validate */}
    <line x1="840" y1="230" x2="900" y2="260" stroke="#f472b6" strokeWidth="2" markerEnd="url(#wf-arrow-green)" />
    {/* From RAG primary */}
    <line x1="855" y1="250" x2="900" y2="270" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#wf-arrow-green)" />
    {/* From LLM fallback */}
    <line x1="835" y1="385" x2="900" y2="340" stroke="#818cf8" strokeWidth="2" markerEnd="url(#wf-arrow-green)" />

    {/* FINAL RESULTS BOX */}
    <rect x="900" y="220" width="140" height="140" rx="14" fill="#14532d" stroke="#4ade80" strokeWidth="2" filter="url(#wf-glow-green)" />
    <rect x="900" y="220" width="140" height="4" rx="2" fill="#4ade80" />
    <text x="970" y="255" fontSize="11" fontWeight="800" textAnchor="middle" fill="#dcfce7">RESULTS &</text>
    <text x="970" y="271" fontSize="11" fontWeight="800" textAnchor="middle" fill="#dcfce7">EXPLANATION</text>
    <text x="970" y="292" fontSize="9" textAnchor="middle" fill="#86efac">Disease + Confidence</text>
    <text x="970" y="308" fontSize="9" textAnchor="middle" fill="#86efac">Hybrid scoring</text>
    <text x="970" y="324" fontSize="9" textAnchor="middle" fill="#64748b">ml×wt + rag×wt</text>
    <text x="970" y="343" fontSize="9" textAnchor="middle" fill="#64748b">Plain-English LLM</text>

    {/* Hybrid score legend bottom */}
    <rect x="30" y="420" width="590" height="72" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="1" />
    <text x="46" y="442" fontSize="10" fontWeight="800" fill="#94a3b8" letterSpacing="0.5">HYBRID SCORING TIERS</text>
    <rect x="46" y="450" width="8" height="8" rx="2" fill="#f472b6" />
    <text x="60" y="459" fontSize="9" fill="#f9a8d4">ML Primary: ml_wt=0.75, rag_wt=0.25</text>
    <rect x="230" y="450" width="8" height="8" rx="2" fill="#fbbf24" />
    <text x="244" y="459" fontSize="9" fill="#fde68a">RAG Primary: ml_wt=0.35, rag_wt=0.65</text>
    <rect x="430" y="450" width="8" height="8" rx="2" fill="#818cf8" />
    <text x="444" y="459" fontSize="9" fill="#a5b4fc">LLM Fallback: ml_wt=0.25, rag_wt=0.25</text>
    <text x="46" y="480" fontSize="9" fill="#64748b">final_confidence = ml_weight × adjusted_ml + rag_weight × rag_score</text>
  </svg>
);

/* ─────────────────────────────────────────────
   ML ENSEMBLE DIAGRAM  –  softmax + dynamic weights
   ───────────────────────────────────────────── */
const MLEnsembleDiagram = () => (
  <svg viewBox="0 0 1060 440" className="w-full h-auto">
    <defs>
      <filter id="ml-glow-pink"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="ml-glow-orange"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="ml-glow-green"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="ml-glow-blue"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <linearGradient id="ml-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#020c24" /><stop offset="100%" stopColor="#1a0a2e" />
      </linearGradient>
      <marker id="ml-arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
      </marker>
      <marker id="ml-arrow-pink" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#f472b6" />
      </marker>
      <marker id="ml-arrow-yellow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#facc15" />
      </marker>
    </defs>

    <rect width="1060" height="440" rx="16" fill="url(#ml-bg)" />
    <rect width="1060" height="440" rx="16" fill="url(#grid)" />

    {/* INPUT */}
    <rect x="30" y="165" width="140" height="80" rx="12" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" filter="url(#ml-glow-blue)" />
    <rect x="30" y="165" width="140" height="4" rx="2" fill="#60a5fa" />
    <text x="100" y="197" fontSize="12" fontWeight="800" textAnchor="middle" fill="#bfdbfe">SYMPTOM</text>
    <text x="100" y="213" fontSize="12" fontWeight="800" textAnchor="middle" fill="#bfdbfe">INPUT</text>
    <text x="100" y="232" fontSize="9" textAnchor="middle" fill="#64748b">Structured vector</text>

    {/* fan out to 3 models */}
    <line x1="170" y1="190" x2="260" y2="110" stroke="#60a5fa" strokeWidth="1.5" strokeOpacity="0.5" markerEnd="url(#ml-arrowhead)" />
    <line x1="170" y1="205" x2="260" y2="205" stroke="#60a5fa" strokeWidth="1.5" strokeOpacity="0.5" markerEnd="url(#ml-arrowhead)" />
    <line x1="170" y1="220" x2="260" y2="310" stroke="#60a5fa" strokeWidth="1.5" strokeOpacity="0.5" markerEnd="url(#ml-arrowhead)" />

    {/* animated dots fan-out */}
    {[110, 205, 310].map((y, i) => (
      <circle key={i} cx="170" cy={i === 0 ? 190 : i === 1 ? 205 : 220} r="3" fill="#60a5fa">
        <animate attributeName="cx" from="170" to="260" dur={`${1.2 + i * 0.2}s`} repeatCount="indefinite" />
        <animate attributeName="cy" from={i === 0 ? 190 : i === 1 ? 205 : 220} to={y} dur={`${1.2 + i * 0.2}s`} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;1;0" dur={`${1.2 + i * 0.2}s`} repeatCount="indefinite" />
      </circle>
    ))}

    {/* MODEL 1: Random Forest */}
    <rect x="260" y="60" width="185" height="100" rx="12" fill="#78350f" stroke="#fb923c" strokeWidth="2" filter="url(#ml-glow-orange)" />
    <rect x="260" y="60" width="185" height="4" rx="2" fill="#fb923c" />
    <text x="352" y="90" fontSize="11" fontWeight="800" textAnchor="middle" fill="#ffedd5">🌳 RANDOM FOREST</text>
    <text x="352" y="108" fontSize="9" textAnchor="middle" fill="#fed7aa">Decision-tree ensemble</text>
    <text x="352" y="124" fontSize="9" textAnchor="middle" fill="#fed7aa">Accuracy: 85–92%</text>
    <text x="352" y="140" fontSize="9" textAnchor="middle" fill="#64748b">conf₁ → softmax input</text>

    {/* MODEL 2: SVM */}
    <rect x="260" y="165" width="185" height="100" rx="12" fill="#831843" stroke="#f472b6" strokeWidth="2" filter="url(#ml-glow-pink)" />
    <rect x="260" y="165" width="185" height="4" rx="2" fill="#f472b6" />
    <text x="352" y="195" fontSize="11" fontWeight="800" textAnchor="middle" fill="#fce7f3">⚙️ SVM</text>
    <text x="352" y="213" fontSize="9" textAnchor="middle" fill="#f9a8d4">Support Vector Machine</text>
    <text x="352" y="229" fontSize="9" textAnchor="middle" fill="#f9a8d4">Accuracy: 88–94%</text>
    <text x="352" y="245" fontSize="9" textAnchor="middle" fill="#64748b">conf₂ → softmax input</text>

    {/* MODEL 3: Naive Bayes */}
    <rect x="260" y="270" width="185" height="100" rx="12" fill="#14532d" stroke="#4ade80" strokeWidth="2" filter="url(#ml-glow-green)" />
    <rect x="260" y="270" width="185" height="4" rx="2" fill="#4ade80" />
    <text x="352" y="300" fontSize="11" fontWeight="800" textAnchor="middle" fill="#dcfce7">📊 NAIVE BAYES</text>
    <text x="352" y="318" fontSize="9" textAnchor="middle" fill="#86efac">Probabilistic model</text>
    <text x="352" y="334" fontSize="9" textAnchor="middle" fill="#86efac">Accuracy: 80–88%</text>
    <text x="352" y="350" fontSize="9" textAnchor="middle" fill="#64748b">conf₃ → softmax input</text>

    {/* arrows to softmax */}
    {[[352,160,530,200],[352,265,530,200],[352,370,530,220]].map(([x1,y1,x2,y2],i)=>(
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="1.5" strokeOpacity="0.4" markerEnd="url(#ml-arrowhead)" />
    ))}

    {/* SOFTMAX BOX */}
    <rect x="530" y="150" width="180" height="100" rx="12" fill="#0e085c" stroke="#787ca3" strokeWidth="2" />
    <rect x="530" y="150" width="180" height="4" rx="2" fill="#818cf8" />
    <text x="620" y="180" fontSize="11" fontWeight="800" textAnchor="middle" fill="#e0e7ff">SOFTMAX</text>
    <text x="620" y="197" fontSize="10" fontWeight="700" textAnchor="middle" fill="#a5b4fc">confs / 25</text>
    <text x="620" y="213" fontSize="9" textAnchor="middle" fill="#818cf8">dynamic_weights = </text>
    <text x="620" y="228" fontSize="9" textAnchor="middle" fill="#818cf8">softmax([c₁,c₂,c₃] / 25)</text>
    <circle cx="620" cy="200" r="40" fill="none" stroke="#818cf8" strokeWidth="1" strokeDasharray="4,4" strokeOpacity="0.3" />

    {/* softmax → adjust */}
    <line x1="710" y1="200" x2="760" y2="200" stroke="#facc15" strokeWidth="2" markerEnd="url(#ml-arrow-yellow)" />

    {/* ADJUSTMENT BOX */}
    <rect x="760" y="150" width="185" height="100" rx="12" fill="#1c1917" stroke="#facc15" strokeWidth="2" />
    <rect x="760" y="150" width="185" height="4" rx="2" fill="#facc15" />
    <text x="852" y="178" fontSize="11" fontWeight="800" textAnchor="middle" fill="#fef9c3">ADJUSTMENT</text>
    <text x="852" y="196" fontSize="9" textAnchor="middle" fill="#fde68a">weighted_ml_raw</text>
    <text x="852" y="212" fontSize="9" textAnchor="middle" fill="#fde68a">− (std_dev × 0.25)</text>
    <text x="852" y="230" fontSize="9" fontWeight="700" textAnchor="middle" fill="#facc15">= adjusted_ml</text>

    {/* adjust → decision */}
    <line x1="945" y1="200" x2="985" y2="200" stroke="#f472b6" strokeWidth="2.5" markerEnd="url(#ml-arrow-pink)" />

    {/* DECISION BOX */}
    <rect x="985" y="155" width="55" height="90" rx="8" fill="#831843" stroke="#f472b6" strokeWidth="2" filter="url(#ml-glow-pink)" />
    <text x="1012" y="192" fontSize="9" fontWeight="800" textAnchor="middle" fill="#fce7f3">adj</text>
    <text x="1012" y="205" fontSize="9" fontWeight="800" textAnchor="middle" fill="#fce7f3">≥30?</text>
    <text x="1012" y="220" fontSize="7" textAnchor="middle" fill="#68274a">→ ML Primary</text>

    {/* Formula strip at bottom */}
    <rect x="30" y="390" width="1000" height="36" rx="8" fill="#0e3f1a" stroke="#17335a" strokeWidth="1" />
    <text x="50" y="411" fontSize="10" fontWeight="700" fill="#64748b">FORMULA: </text>
    <text x="130" y="411" fontSize="10" fill="#fde68a">dynamic_weights = softmax(model_confs / 25)</text>
    <text x="460" y="411" fontSize="10" fill="#94a3b8">  →  </text>
    <text x="480" y="411" fontSize="10" fill="#f9a8d4">adjusted_ml = weighted_ml_raw − (std_dev × 0.25)</text>
    <text x="780" y="411" fontSize="10" fill="#94a3b8">  →  </text>
    <text x="800" y="411" fontSize="10" fill="#4ade80">if adjusted_ml ≥ 30: ML Primary</text>
  </svg>
);

/* ─────────────────────────────────────────────
   RAG DIAGRAM
   ───────────────────────────────────────────── */
const RAGDiagram = () => (
  <svg viewBox="0 0 1060 320" className="w-full h-auto">
    <defs>
      <filter id="rag-glow-blue"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="rag-glow-purple"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <linearGradient id="rag-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" /><stop offset="100%" stopColor="#0c1a2e" />
      </linearGradient>
      <marker id="rag-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#a78bfa" />
      </marker>
      <marker id="rag-arrow-orange" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#fb923c" />
      </marker>
      <marker id="rag-arrow-green" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#4ade80" />
      </marker>
    </defs>
    <rect width="1060" height="320" rx="16" fill="url(#rag-bg)" />
    <rect width="1060" height="320" rx="16" fill="url(#grid)" />

    {/* Query */}
    <rect x="30" y="120" width="140" height="80" rx="12" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" filter="url(#rag-glow-blue)" />
    <rect x="30" y="120" width="140" height="4" rx="2" fill="#60a5fa" />
    <text x="100" y="152" fontSize="11" fontWeight="800" textAnchor="middle" fill="#bfdbfe">USER QUERY</text>
    <text x="100" y="170" fontSize="9" textAnchor="middle" fill="#93c5fd">Symptoms + answers</text>
    <line x1="170" y1="160" x2="240" y2="160" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#rag-arrow)" />

    {/* Knowledge sources stacked */}
    <rect x="240" y="40" width="185" height="80" rx="12" fill="#78350f" stroke="#fb923c" strokeWidth="1.5" />
    <rect x="240" y="40" width="185" height="4" rx="2" fill="#fb923c" />
    <text x="332" y="68" fontSize="10" fontWeight="800" textAnchor="middle" fill="#ffedd5">MEDICAL KNOWLEDGE</text>
    <text x="332" y="84" fontSize="9" textAnchor="middle" fill="#fed7aa">JSON — 200+ diseases</text>
    <text x="332" y="100" fontSize="9" textAnchor="middle" fill="#64748b">symptoms, severity, treatment</text>

    <rect x="240" y="200" width="185" height="80" rx="12" fill="#14532d" stroke="#4ade80" strokeWidth="1.5" />
    <rect x="240" y="200" width="185" height="4" rx="2" fill="#4ade80" />
    <text x="332" y="228" fontSize="10" fontWeight="800" textAnchor="middle" fill="#dcfce7">SYMPTOM DATASETS</text>
    <text x="332" y="244" fontSize="9" textAnchor="middle" fill="#86efac">CSV — 10,000+ records</text>
    <text x="332" y="260" fontSize="9" textAnchor="middle" fill="#64748b">prevalence & frequency data</text>

    {/* arrows from query to sources */}
    <line x1="170" y1="145" x2="240" y2="100" stroke="#fb923c" strokeWidth="1.5" strokeOpacity="0.5" markerEnd="url(#rag-arrow-orange)" />
    <line x1="170" y1="175" x2="240" y2="240" stroke="#4ade80" strokeWidth="1.5" strokeOpacity="0.5" markerEnd="url(#rag-arrow-green)" />

    {/* Retrieval box */}
    <rect x="480" y="90" width="185" height="140" rx="12" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" filter="url(#rag-glow-purple)" />
    <rect x="480" y="90" width="185" height="4" rx="2" fill="#818cf8" />
    <text x="572" y="120" fontSize="11" fontWeight="800" textAnchor="middle" fill="#e0e7ff">RETRIEVAL &</text>
    <text x="572" y="136" fontSize="11" fontWeight="800" textAnchor="middle" fill="#e0e7ff">RANKING</text>
    <text x="572" y="156" fontSize="9" textAnchor="middle" fill="#a5b4fc">TF-IDF vectorization</text>
    <text x="572" y="172" fontSize="9" textAnchor="middle" fill="#a5b4fc">Semantic similarity</text>
    <text x="572" y="188" fontSize="9" textAnchor="middle" fill="#a5b4fc">Keyword matching</text>
    <text x="572" y="204" fontSize="9" textAnchor="middle" fill="#64748b">Top-K = 10 diseases</text>

    {/* sources → retrieval */}
    <line x1="425" y1="80" x2="480" y2="130" stroke="#fb923c" strokeWidth="1.5" strokeOpacity="0.5" markerEnd="url(#rag-arrow)" />
    <line x1="425" y1="240" x2="480" y2="200" stroke="#4ade80" strokeWidth="1.5" strokeOpacity="0.5" markerEnd="url(#rag-arrow)" />

    {/* retrieval → validate */}
    <line x1="665" y1="160" x2="730" y2="160" stroke="#a78bfa" strokeWidth="2" markerEnd="url(#rag-arrow)" />
    <circle cx="697" cy="160" r="4" fill="#a78bfa">
      <animate attributeName="cx" from="665" to="730" dur="1.2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" />
    </circle>

    {/* validateTopDiseases */}
    <rect x="730" y="110" width="190" height="100" rx="12" fill="#312e81" stroke="#a78bfa" strokeWidth="2" filter="url(#rag-glow-purple)" />
    <rect x="730" y="110" width="190" height="4" rx="2" fill="#a78bfa" />
    <text x="825" y="138" fontSize="10" fontWeight="800" textAnchor="middle" fill="#ede9fe">validateTopDiseases()</text>
    <text x="825" y="155" fontSize="9" textAnchor="middle" fill="#c4b5fd">Symptom match scoring</text>
    <text x="825" y="170" fontSize="9" textAnchor="middle" fill="#c4b5fd">rag_score calculation</text>
    <text x="825" y="186" fontSize="9" textAnchor="middle" fill="#c4b5fd">→ rag_score ≥ 40 check</text>
    <text x="825" y="200" fontSize="9" textAnchor="middle" fill="#64748b">RAG validation role</text>

    {/* validate → LLM context */}
    <line x1="920" y1="160" x2="960" y2="160" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#rag-arrow-orange)" />
    <rect x="960" y="130" width="80" height="60" rx="8" fill="#451a03" stroke="#fbbf24" strokeWidth="1.5" />
    <text x="1000" y="157" fontSize="9" fontWeight="800" textAnchor="middle" fill="#fef9c3">LLM CTX</text>
    <text x="1000" y="172" fontSize="8" textAnchor="middle" fill="#fde68a">RAG context</text>
  </svg>
);

/* ─────────────────────────────────────────────
   TECH STACK CARD
   ───────────────────────────────────────────── */
const TechStackCard = ({ icon: Icon, title, items, color }: { icon: any; title: string; items: string[]; color: string }) => (
  <div className="card-medicare p-6 hover:shadow-card transition-all duration-300 group">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ background: `${color}22` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <h4 className="font-heading font-bold text-lg">{title}</h4>
    </div>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
          <span className="font-bold mt-0.5" style={{ color }}>•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
export default function AboutScreen({ onBack, onGetStarted }: Props) {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-card border-b border-border h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-primary" />
          <span className="font-heading font-bold text-lg text-primary">MediCare AI</span>
        </div>
        <button onClick={onBack} className="btn-ghost text-sm py-2 px-4">← Back</button>
      </nav>

      {/* Hero */}
      <section className="text-center py-20 px-5 max-w-4xl mx-auto">
        <span className="inline-block bg-primary-light text-primary font-heading font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
          📖 Learn How It Works
        </span>
        <h1 className="font-heading font-extrabold text-5xl sm:text-[56px] leading-tight mb-5">
          About <span className="gradient-text">MediCare AI</span>
        </h1>
        <p className="text-muted-foreground text-[17px] max-w-[600px] mx-auto mb-8 leading-relaxed">
          An intelligent symptom analyzer powered by a dynamic ML-primary ensemble, RAG validation, and LLM reasoning — designed to understand your health with unprecedented accuracy.
        </p>
        <button onClick={onGetStarted} className="btn-primary text-base py-3.5 px-8">Start Health Check →</button>
      </section>

      {/* Main Accordion Content */}
      <section className="max-w-5xl mx-auto px-5 pb-20">
        <Accordion type="single" collapsible className="space-y-4">

          {/* ── ARCHITECTURE ── */}
          <AccordionItem value="architecture" className="card-medicare p-8 border-0">
            <AccordionTrigger className="hover:no-underline py-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-light rounded-lg">
                  <GitBranch className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-heading font-bold text-lg">System Architecture</h3>
                  <p className="text-sm text-muted-foreground">Live data-flow through all components</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 mt-6 border-t border-border">
              <div className="space-y-6">
                <div className="rounded-2xl overflow-hidden ring-1 ring-white/5 shadow-2xl">
                  <ArchitectureDiagram />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card-medicare p-4 bg-primary-light/30">
                    <h4 className="font-heading font-bold text-primary mb-2">Frontend Layer</h4>
                    <p className="text-sm text-foreground">React 19 + Vite on port 8080. Handles chat sessions, health history, dashboard, and medication reminders.</p>
                  </div>
                  <div className="card-medicare p-4 bg-purple/10">
                    <h4 className="font-heading font-bold text-purple mb-2">Backend Layer</h4>
                    <p className="text-sm text-foreground">Express.js on port 5000. Coordinates dynamic ML weighting, RAG validation, LLM fallback, and Prisma ORM database ops.</p>
                  </div>
                  <div className="card-medicare p-4 border-2 border-pink-200/30 bg-pink-50/10">
                    <h4 className="font-heading font-bold text-pink-500 mb-2 flex items-center gap-2">★ ML Service <span className="text-xs font-normal bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full">Primary</span></h4>
                    <p className="text-sm text-foreground">Python Flask on port 8000. Runs 3-model ensemble with softmax dynamic weighting. When adjusted_ml ≥ 30, becomes the primary prediction source.</p>
                  </div>
                  <div className="card-medicare p-4 bg-orange-100/10 border border-orange-400/20">
                    <h4 className="font-heading font-bold text-orange-400 mb-2">LLM Service <span className="text-xs font-normal opacity-60">(Fallback + Explanation)</span></h4>
                    <p className="text-sm text-foreground">Ollama llama3.2 on port 11434. Used for symptom extraction, follow-up generation, explanation output, and as fallback when ML confidence is low.</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── WORKFLOW ── */}
          <AccordionItem value="workflow" className="card-medicare p-8 border-0">
            <AccordionTrigger className="hover:no-underline py-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-light rounded-lg">
                  <Network className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-heading font-bold text-lg">Prediction Workflow</h3>
                  <p className="text-sm text-muted-foreground">Conditional decision flow from symptoms to diagnosis</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 mt-6 border-t border-border">
              <div className="space-y-6">
                <div className="rounded-2xl overflow-hidden ring-1 ring-white/5 shadow-2xl">
                  <WorkflowDiagram />
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200/30">
                    <span className="font-heading font-bold text-primary text-lg">1</span>
                    <div>
                      <h4 className="font-heading font-bold mb-1">Symptom Extraction</h4>
                      <p className="text-muted-foreground">LLM parses free-text into structured data, then generates targeted Y/N follow-up questions.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/10 rounded-xl border border-yellow-200/30">
                    <span className="font-heading font-bold text-yellow-600 text-lg">⬦</span>
                    <div>
                      <h4 className="font-heading font-bold mb-1">Decision Point: adjusted_ml ≥ 30?</h4>
                      <p className="text-muted-foreground">After ML softmax weighting and std_dev adjustment, the system routes to the highest-confidence pathway.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-pink-50 dark:bg-pink-950/20 rounded-xl border-2 border-pink-200/40">
                    <span className="font-heading font-bold text-pink-500 text-lg">★</span>
                    <div>
                      <h4 className="font-heading font-bold mb-1 flex items-center gap-2">ML Primary Path <span className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-600 px-2 py-0.5 rounded-full">adjusted_ml ≥ 30</span></h4>
                      <p className="text-muted-foreground">3-model ensemble with dynamic softmax weights routes as primary. RAG <code className="text-xs bg-muted px-1.5 py-0.5 rounded">validateTopDiseases()</code> runs in parallel for symptom-match validation. Hybrid score: ml_wt=0.75, rag_wt=0.25.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-orange-50 dark:bg-orange-950/10 rounded-xl border border-orange-200/30">
                    <span className="font-heading font-bold text-orange-500 text-lg">2</span>
                    <div>
                      <h4 className="font-heading font-bold mb-1 flex items-center gap-2">RAG Primary Path <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-2 py-0.5 rounded-full">rag_score ≥ 40</span></h4>
                      <p className="text-muted-foreground">When ML confidence is lower but RAG finds strong symptom-disease matches. Hybrid score: ml_wt=0.35, rag_wt=0.65.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-indigo-50 dark:bg-indigo-950/10 rounded-xl border border-indigo-200/30">
                    <span className="font-heading font-bold text-indigo-500 text-lg">3</span>
                    <div>
                      <h4 className="font-heading font-bold mb-1">LLM Fallback Path</h4>
                      <p className="text-muted-foreground">When both ML and RAG confidence are below thresholds. llama3.2 reasons using full RAG context. ml_wt=0.25, rag_wt=0.25.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200/30">
                    <span className="font-heading font-bold text-green-600 text-lg">✓</span>
                    <div>
                      <h4 className="font-heading font-bold mb-1">Results & Explanation</h4>
                      <p className="text-muted-foreground">All paths converge here. LLM generates a plain-English explanation. <code className="text-xs bg-muted px-1.5 py-0.5 rounded">final_confidence = ml_weight × adjusted_ml + rag_weight × rag_score</code></p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── TECH STACK ── */}
          <AccordionItem value="tech-stack" className="card-medicare p-8 border-0">
            <AccordionTrigger className="hover:no-underline py-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-light rounded-lg">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-heading font-bold text-lg">Technology Stack</h3>
                  <p className="text-sm text-muted-foreground">All the modern tools powering MediCare AI</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 mt-6 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TechStackCard icon={Zap} title="Frontend" color="#60a5fa" items={["React 19", "Vite 5.4", "TypeScript", "Tailwind CSS", "React Router", "React Query (TanStack)"]} />
                <TechStackCard icon={GitBranch} title="Backend" color="#a78bfa" items={["Node.js 18+", "Express.js 5", "TypeScript", "Prisma ORM", "JWT Auth", "Rate Limiting"]} />
                <TechStackCard icon={Database} title="Database" color="#4ade80" items={["SQLite", "Prisma Client", "BetterSqlite3", "Data Encryption", "Cascade Relations"]} />
                <TechStackCard icon={Brain} title="AI/ML" color="#f472b6" items={["Ollama llama3.2 (local)", "scikit-learn", "Random Forest", "SVM", "Naive Bayes", "softmax dynamic weighting"]} />
                <TechStackCard icon={BarChart3} title="Data & RAG" color="#fb923c" items={["Medical Knowledge JSON (200+ diseases)", "CSV Datasets (10,000+ records)", "TF-IDF Vectorizer", "validateTopDiseases()", "Top-K semantic ranking"]} />
                <TechStackCard icon={Shield} title="Security" color="#34d399" items={["bcryptjs (10 salt rounds)", "JWT Tokens (7-day)", "CORS Protection", "Rate Limiting (5/15min auth)", "Input Validation"]} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── ML ENSEMBLE ── */}
          <AccordionItem value="ml-logic" className="card-medicare p-8 border-0">
            <AccordionTrigger className="hover:no-underline py-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-light rounded-lg">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-heading font-bold text-lg">Machine Learning Ensemble</h3>
                  <p className="text-sm text-muted-foreground">Dynamic softmax weighting — 3 models, one adaptive system</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 mt-6 border-t border-border">
              <div className="space-y-6">
                <div className="rounded-2xl overflow-hidden ring-1 ring-white/5 shadow-2xl">
                  <MLEnsembleDiagram />
                </div>

                {/* 3 Models */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="card-medicare p-4 border-2 border-orange-200/40 bg-orange-50/5">
                    <h4 className="font-heading font-bold text-orange-400 mb-2">🌳 Random Forest</h4>
                    <p className="text-sm text-foreground mb-3">Ensemble of decision trees voting on disease prediction. Handles non-linear symptom patterns robustly.</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p><strong>Accuracy:</strong> 85–92%</p>
                      <p><strong>Confidence:</strong> conf₁ → softmax input</p>
                    </div>
                  </div>
                  <div className="card-medicare p-4 border-2 border-pink-200/40 bg-pink-50/5">
                    <h4 className="font-heading font-bold text-pink-400 mb-2">⚙️ SVM</h4>
                    <p className="text-sm text-foreground mb-3">Support Vector Machine finds optimal hyperplane boundaries between disease classes.</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p><strong>Accuracy:</strong> 88–94%</p>
                      <p><strong>Confidence:</strong> conf₂ → softmax input</p>
                    </div>
                  </div>
                  <div className="card-medicare p-4 border-2 border-green-200/40 bg-green-50/5">
                    <h4 className="font-heading font-bold text-green-400 mb-2">📊 Naive Bayes</h4>
                    <p className="text-sm text-foreground mb-3">Probabilistic model estimating disease likelihood from symptom co-occurrence patterns.</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p><strong>Accuracy:</strong> 80–88%</p>
                      <p><strong>Confidence:</strong> conf₃ → softmax input</p>
                    </div>
                  </div>
                </div>

                {/* Dynamic weighting formula box */}
<div className="card-medicare p-6 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
  <h4 className="font-heading font-bold mb-5 flex items-center gap-2 text-white">
    <Cpu className="w-4 h-4 text-cyan-400" />
    Dynamic Softmax Weighting System
  </h4>
  
  <div className="space-y-4">
    {/* Formula cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Step 1: Softmax */}
      <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm border border-cyan-500/40">
        <p className="text-cyan-400 mb-2 font-sans text-xs font-bold uppercase tracking-widest">Step 1: Softmax Normalization</p>
        <p className="text-white font-bold">dynamic_weights =</p>
        <p className="text-cyan-300 pl-4 font-bold italic">softmax(model_confs / 25)</p>
        <p className="text-slate-300 text-xs mt-3 font-sans leading-relaxed">Dividing by 25 scales confidence into a temperature range for normalization, preventing scale-based dominance.</p>
      </div>

      {/* Step 2: Adjustment */}
      <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm border border-rose-500/40">
        <p className="text-rose-400 mb-2 font-sans text-xs font-bold uppercase tracking-widest">Step 2: Adjustment</p>
        <p className="text-white font-bold">adjusted_ml =</p>
        <p className="text-rose-200 pl-4 italic">weighted_ml_raw</p>
        <p className="text-rose-300 pl-4 font-bold italic">− (std_dev × 0.25)</p>
        <p className="text-slate-300 text-xs mt-3 font-sans leading-relaxed">Penalizes high disagreement. If models vary significantly (high std_dev), confidence is automatically reduced.</p>
      </div>
    </div>

    {/* Decision logic */}
    <div className="space-y-3 text-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Primary Decision Logic</p>
      
      {/* ML Primary */}
      <div className="flex gap-4 bg-slate-950 border border-rose-500/30 rounded-xl p-4">
        <span className="text-rose-500 font-bold text-xl">★</span>
        <div>
          <strong className="text-rose-300 text-base">if (adjusted_ml ≥ 30)</strong>
          <code className="block text-xs text-rose-100 bg-rose-950/40 border border-rose-500/20 rounded px-2 py-1 mt-1 font-bold">predictionSource = 'ml_primary'</code>
          <p className="text-slate-300 text-xs mt-2 italic">ML ensemble leads. RAG cross-validation ensures symptom-match accuracy.</p>
        </div>
      </div>

      {/* RAG Primary */}
      <div className="flex gap-4 bg-slate-950 border border-amber-500/30 rounded-xl p-4">
        <span className="text-amber-500 font-bold text-xl">→</span>
        <div>
          <strong className="text-amber-300 text-base">else if (rag_score ≥ 40)</strong>
          <code className="block text-xs text-amber-100 bg-amber-950/40 border border-amber-500/20 rounded px-2 py-1 mt-1 font-bold">predictionSource = 'rag_primary'</code>
          <p className="text-slate-300 text-xs mt-2 italic">RAG retrieval takes lead based on strong vector disease-symptom matches.</p>
        </div>
      </div>

      {/* LLM Fallback */}
      <div className="flex gap-4 bg-slate-950 border border-cyan-500/30 rounded-xl p-4">
        <span className="text-cyan-500 font-bold text-xl">→</span>
        <div>
          <strong className="text-cyan-300 text-base">else</strong>
          <code className="block text-xs text-cyan-100 bg-cyan-950/40 border border-cyan-500/20 rounded px-2 py-1 mt-1 font-bold">predictionSource = 'llm_fallback'</code>
          <p className="text-slate-300 text-xs mt-2 italic">LLM reasons using full context when confidence scores are below thresholds.</p>
        </div>
      </div>
    </div>

    {/* Hybrid scoring */}
    <div className="bg-slate-950 rounded-xl p-5 border border-emerald-500/30">
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">Hybrid Confidence Scoring</p>
      <code className="block text-sm text-emerald-300 mb-4 font-bold bg-emerald-950/20 p-2 rounded border border-emerald-500/10">
        final_confidence = (ml_weight × adjusted_ml) + (rag_weight × rag_score)
      </code>
      <div className="grid grid-cols-3 gap-3 text-xs">
        {[
          { tier: 'ML Primary', ml: '0.75', rag: '0.25', color: 'rose', border: 'rose-500/40' },
          { tier: 'RAG Primary', ml: '0.35', rag: '0.65', color: 'amber', border: 'amber-500/40' },
          { tier: 'LLM Fallback', ml: '0.25', rag: '0.25', color: 'cyan', border: 'cyan-500/40' },
        ].map(t => (
          <div key={t.tier} className={`bg-slate-900 border border-${t.border} rounded-lg p-3 text-center`}>
            <p className={`font-bold text-${t.color}-400 mb-2 uppercase tracking-tighter`}>{t.tier}</p>
            <p className="text-slate-400 font-mono">ML: <span className="text-white font-bold">{t.ml}</span></p>
            <p className="text-slate-400 font-mono">RAG: <span className="text-white font-bold">{t.rag}</span></p>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

                <div className="card-medicare p-4 border-l-4 border-primary">
                  <h4 className="font-heading font-bold mb-2">📚 Training Data</h4>
                  <p className="text-sm text-muted-foreground">Trained on <strong>10,000+ symptom-disease pairs</strong> from medical datasets. The std_dev penalty naturally punishes scenarios where models disagree, making the ensemble self-correcting.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── RAG SYSTEM ── */}
          <AccordionItem value="rag-system" className="card-medicare p-8 border-0">
            <AccordionTrigger className="hover:no-underline py-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-light rounded-lg">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-heading font-bold text-lg">RAG — Retrieval-Augmented Generation</h3>
                  <p className="text-sm text-muted-foreground">Medical knowledge retrieval, validation, and LLM context injection</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 mt-6 border-t border-border">
              <div className="space-y-6">
                <div className="rounded-2xl overflow-hidden ring-1 ring-white/5 shadow-2xl">
                  <RAGDiagram />
                </div>
                <div className="space-y-4">
                  <div className="card-medicare p-4 bg-orange-50/10 border-l-4 border-orange-400">
                    <h4 className="font-heading font-bold text-orange-400 mb-2">📋 Medical Knowledge JSON</h4>
                    <p className="text-sm text-foreground">Contains 200+ diseases with detailed symptom profiles, medical descriptions, severity levels, and treatment recommendations.</p>
                  </div>
                  <div className="card-medicare p-4 bg-green-50/10 border-l-4 border-green-400">
                    <h4 className="font-heading font-bold text-green-400 mb-2">📊 CSV Datasets</h4>
                    <p className="text-sm text-foreground">Real-world medical datasets (Diabetes, Heart Disease, Flu). Augmented to 10,000+ records with symptom frequency and prevalence data.</p>
                  </div>
                  <div className="card-medicare p-4 bg-purple-50/10 border-l-4 border-purple-400">
                    <h4 className="font-heading font-bold text-purple mb-2">🔍 Retrieval & Validation Process</h4>
                    <div className="mt-3 space-y-2 text-sm text-foreground">
                      {[
                        ['Symptom Matching', 'Find diseases sharing input symptoms across both knowledge sources'],
                        ['Similarity Scoring', 'TF-IDF vectorization ranks results by semantic + keyword relevance'],
                        ['Top-K Selection', 'Return top 10 most relevant diseases for consideration'],
                        ['validateTopDiseases()', 'Cross-validate ML-predicted diseases against RAG symptom matches — outputs rag_score'],
                        ['Context Injection', 'Pass ranked diseases as RAG context to LLM for final reasoning or explanation'],
                      ].map(([title, desc], i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-purple font-bold">{i + 1}.</span>
                          <span><strong>{title}:</strong> {desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── SECURITY ── */}
          <AccordionItem value="security" className="card-medicare p-8 border-0">
            <AccordionTrigger className="hover:no-underline py-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-light rounded-lg">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-heading font-bold text-lg">Security & Privacy</h3>
                  <p className="text-sm text-muted-foreground">How your data is protected at every layer</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 mt-6 border-t border-border">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ['✅ Password Hashing', 'bcryptjs with 10 salt rounds — passwords never stored in plaintext'],
                    ['✅ JWT Authentication', '7-day token expiration with secure bearer token validation'],
                    ['✅ Rate Limiting', 'Max 5 auth attempts per 15 min; 100 general requests per 15 min'],
                    ['✅ CORS Protection', 'Whitelist-only allowed origins; prevents unauthorized access'],
                    ['✅ Input Validation', 'Email format, password length, name constraints enforced'],
                    ['✅ Local LLM Processing', 'Ollama runs entirely locally — no symptom data sent to cloud APIs'],
                  ].map(([title, desc]) => (
                    <div key={title} className="card-medicare p-4 border-2 border-green-200/30 bg-green-50/5">
                      <h4 className="font-heading font-bold text-green-400 mb-2 text-sm">{title}</h4>
                      <p className="text-sm text-foreground">{desc}</p>
                    </div>
                  ))}
                </div>
                <div className="card-medicare p-6 bg-gradient-to-r from-orange-950/20 to-yellow-950/10 border-l-4 border-orange-400">
                  <h4 className="font-heading font-bold text-orange-400 mb-3">⚠️ Production Security Notes</h4>
                  <ul className="space-y-2 text-sm text-foreground">
                    {[
                      ['JWT Secret', 'Change from default value in production'],
                      ['HTTPS', 'Use SSL/TLS certificates in production'],
                      ['Database', 'Use managed databases with encryption at rest for production'],
                    ].map(([k, v]) => (
                      <li key={k} className="flex gap-2"><span className="text-orange-400 font-bold">•</span><span><strong>{k}:</strong> {v}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── WHY MEDICARE AI ── */}
          <AccordionItem value="benefits" className="card-medicare p-8 border-0">
            <AccordionTrigger className="hover:no-underline py-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-light rounded-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-heading font-bold text-lg">Why MediCare AI?</h3>
                  <p className="text-sm text-muted-foreground">Purpose, benefits, and use cases</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 mt-6 border-t border-border">
              <div className="space-y-4">
                <div className="card-medicare p-4 bg-blue-50/10 border-l-4 border-blue-400">
                  <h4 className="font-heading font-bold text-blue-400 mb-2">🏥 Problem It Solves</h4>
                  <p className="text-sm text-foreground">Many people delay doctor visits due to cost, time, or uncertainty. MediCare AI delivers instant, multi-AI-validated symptom analysis to help you understand what might be wrong before seeing a professional.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card-medicare p-4 bg-gradient-to-br from-green-50/10 to-emerald-50/5">
                    <h4 className="font-heading font-bold text-green-400 mb-3">✨ Key Benefits</h4>
                    <ul className="space-y-2 text-sm text-foreground">
                      {[
                        ['24/7 Availability', 'Get answers anytime, instantly'],
                        ['ML-Primary Accuracy', 'Softmax ensemble as primary source, not just validation'],
                        ['Privacy-First', 'Local LLM — no cloud upload of your health data'],
                        ['Multi-AI Approach', 'Dynamic ML + RAG + LLM with adaptive weighting'],
                      ].map(([k, v]) => (
                        <li key={k} className="flex gap-2"><span className="text-green-400 font-bold">→</span><span><strong>{k}:</strong> {v}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div className="card-medicare p-4 bg-gradient-to-br from-purple-50/10 to-pink-50/5">
                    <h4 className="font-heading font-bold text-purple mb-3">🎯 Use Cases</h4>
                    <ul className="space-y-2 text-sm text-foreground">
                      {[
                        ['Quick Health Check', 'Assess new or unusual symptoms'],
                        ['Health Education', 'Learn about conditions and what causes them'],
                        ['Medication Tracking', 'Manage and track medication reminders'],
                        ['Health History', 'Review and export past diagnoses'],
                      ].map(([k, v]) => (
                        <li key={k} className="flex gap-2"><span className="text-purple font-bold">→</span><span><strong>{k}:</strong> {v}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="card-medicare p-6 bg-gradient-to-r from-red-950/20 to-pink-950/10 border-2 border-red-400/30">
                  <h4 className="font-heading font-bold text-red-400 mb-2">⚠️ Important Disclaimer</h4>
                  <p className="text-sm text-foreground leading-relaxed"><strong>MediCare AI is NOT a substitute for professional medical advice, diagnosis, or treatment.</strong> Always consult with a qualified healthcare professional for any health concerns. This tool is for informational purposes only. In case of emergency, call emergency services immediately.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── FAQ ── */}
          <AccordionItem value="faq" className="card-medicare p-8 border-0">
            <AccordionTrigger className="hover:no-underline py-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-light rounded-lg">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-heading font-bold text-lg">Frequently Asked Questions</h3>
                  <p className="text-sm text-muted-foreground">Common questions about MediCare AI</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 mt-6 border-t border-border">
              <div className="space-y-3">
                {[
                  {
                    q: 'Is my data secure?',
                    a: 'Yes. Passwords are hashed with bcryptjs (10 salt rounds), JWT handles authentication, and critically — the LLM (Ollama llama3.2) runs entirely locally. Your symptom data never leaves your machine.',
                  },
                  {
                    q: 'How accurate are the predictions?',
                    a: 'The ensemble models achieve 80–94% accuracy on training data. The dynamic softmax weighting system automatically favors the most confident model for each prediction, and the std_dev penalty reduces confidence when models disagree — giving you more reliable signals.',
                  },
                  {
                    q: 'How does the ML-primary approach work?',
                    a: 'The 3 ML models (Random Forest, SVM, Naive Bayes) each produce a confidence score. These are normalized via softmax(confs/25), then weighted and combined. If adjusted_ml ≥ 30, the ML ensemble is the primary predictor. This is more reliable than fixed overrides because weights dynamically adapt to per-prediction confidence.',
                  },
                  {
                    q: 'What is RAG\'s role in predictions?',
                    a: 'RAG serves two roles: (1) As a fallback primary when rag_score ≥ 40 and ML confidence is low. (2) As a validator via validateTopDiseases() — checking whether ML-predicted diseases actually match input symptoms. It also provides context to the LLM for explanation generation.',
                  },
                  {
                    q: 'Does it work without internet?',
                    a: 'Once set up, Ollama runs locally with no internet required. The frontend and backend communicate over localhost. Initial setup and model downloads require internet.',
                  },
                  {
                    q: 'What data do you collect?',
                    a: 'We store user accounts, chat history, symptoms, predictions, and reminders — all in SQLite locally. We do NOT share data with third parties or cloud services.',
                  },
                  {
                    q: 'How often are the ML models updated?',
                    a: 'Models are retrained when new datasets are available. You can manually trigger retraining via POST /api/datasets/train. The softmax weighting automatically adjusts to model confidence characteristics after retraining.',
                  },
                  {
                    q: 'What if I get an error?',
                    a: 'Check that Ollama is on port 11434 and backend is on port 5000. If the ML service on port 8000 is down, the system automatically falls back to RAG primary or LLM fallback — predictions continue without interruption.',
                  },
                  {
                    q: 'Is this HIPAA compliant?',
                    a: 'Currently designed for educational purposes. For healthcare facility use, HIPAA compliance (audit logs, encryption at rest, BAA agreements) would need to be added.',
                  },
                  {
                    q: 'Can I deploy this on a private network?',
                    a: 'Yes! MediCare AI is open-source and built for private deployment. Ensure strong JWT secrets, proper firewall rules, and HTTPS in production.',
                  },
                ].map(({ q, a }) => (
                  <div key={q} className="card-medicare p-4 hover:border-primary/30 transition-all">
                    <h4 className="font-heading font-bold text-foreground mb-2">Q: {q}</h4>
                    <p className="text-sm text-muted-foreground">{a}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Developer Section */}
      <section className="max-w-5xl mx-auto px-5 py-20 text-center border-t border-border">
        <h2 className="font-heading font-bold text-2xl mb-4">👨‍💻 Developer</h2>
        <div className="card-medicare p-8 max-w-xl mx-auto relative overflow-hidden">
          {/* decorative glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7C9EF5, transparent)' }} />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #C4B0F0, transparent)' }} />
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-avatar flex items-center justify-center text-white font-heading font-bold text-2xl ring-4 ring-primary/20">MT</div>
          <h3 className="font-heading font-bold text-xl mb-1">Md. Tahmidur Rahman Nafees</h3>
          <p className="text-primary font-semibold text-sm mb-1">Skilled Full-Stack Software Engineer | AI/ML Specialist | Innovative Problem Solver</p>
          <p className="text-muted-foreground text-sm mb-4">Electrical and Computer Engineering · North South University</p>
          <p className="text-sm text-muted-foreground">Developed MediCare AI as a showcase of production-grade full-stack engineering — combining dynamic ML ensemble systems, RAG validation, and local LLM inference into a unified intelligent health analysis platform.</p>
          <div className="mt-6 pt-6 border-t border-border flex flex-wrap justify-center gap-3">
            {['GitHub', 'Email', 'Portfolio'].map(link => (
              <span key={link} className="text-xs bg-primary-light text-primary px-3 py-1.5 rounded-full font-semibold cursor-pointer hover:bg-primary/20 transition-colors">{link}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 px-5 border-t border-border text-muted-foreground text-xs">
        <p className="mb-1">⚠️ MediCare AI is not a substitute for professional medical advice.</p>
        <p>© {new Date().getFullYear()} MediCare AI · Built with React, Express, Ollama, scikit-learn and ❤️</p>
      </footer>
    </div>
  );
}