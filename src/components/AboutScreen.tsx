import { Stethoscope, ArrowRight, Database, Shield, Zap, Brain, BarChart3, GitBranch, ChevronDown, Sparkles, HelpCircle } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface Props {
  onBack: () => void;
  onGetStarted: () => void;
}

// SVG Diagrams as React Components
const ArchitectureDiagram = () => (
  <svg viewBox="0 0 1000 400" className="w-full h-auto">
    {/* Background gradient */}
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#7C9EF5', stopOpacity: 0.1 }} />
        <stop offset="100%" style={{ stopColor: '#C4B0F0', stopOpacity: 0.1 }} />
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2" />
      </filter>
    </defs>

    {/* Frontend Box */}
    <rect x="50" y="80" width="200" height="140" rx="12" fill="#DFE8FF" stroke="#7C9EF5" strokeWidth="2" filter="url(#shadow)" />
    <text x="150" y="110" fontSize="16" fontWeight="700" textAnchor="middle" fill="#003D99" fontFamily="Nunito">Frontend</text>
    <text x="150" y="135" fontSize="12" textAnchor="middle" fill="#4A5B8A" fontFamily="DM Sans">React + Vite</text>
    <text x="150" y="155" fontSize="12" textAnchor="middle" fill="#4A5B8A" fontFamily="DM Sans">Port: 8080</text>
    <text x="150" y="175" fontSize="11" textAnchor="middle" fill="#6B7FA3" fontFamily="DM Sans">Chat Interface</text>
    <text x="150" y="190" fontSize="11" textAnchor="middle" fill="#6B7FA3" fontFamily="DM Sans">Dashboard</text>

    {/* Backend Box */}
    <rect x="400" y="80" width="200" height="140" rx="12" fill="#F0E8FF" stroke="#C4B0F0" strokeWidth="2" filter="url(#shadow)" />
    <text x="500" y="110" fontSize="16" fontWeight="700" textAnchor="middle" fill="#6B2E96" fontFamily="Nunito">Backend API</text>
    <text x="500" y="135" fontSize="12" textAnchor="middle" fill="#5B4B7A" fontFamily="DM Sans">Express.js</text>
    <text x="500" y="155" fontSize="12" textAnchor="middle" fill="#5B4B7A" fontFamily="DM Sans">Port: 5000</text>
    <text x="500" y="175" fontSize="11" textAnchor="middle" fill="#6B7FA3" fontFamily="DM Sans">RAG + LLM</text>
    <text x="500" y="190" fontSize="11" textAnchor="middle" fill="#6B7FA3" fontFamily="DM Sans">Orchestration</text>

    {/* LLM/Ollama Box */}
    <rect x="750" y="30" width="180" height="120" rx="12" fill="#FFE8D6" stroke="#FF9D4C" strokeWidth="2" filter="url(#shadow)" />
    <text x="840" y="60" fontSize="16" fontWeight="700" textAnchor="middle" fill="#B85C0D" fontFamily="Nunito">Ollama LLM</text>
    <text x="840" y="85" fontSize="12" textAnchor="middle" fill="#8B5820" fontFamily="DM Sans">llama3.2</text>
    <text x="840" y="105" fontSize="12" textAnchor="middle" fill="#8B5820" fontFamily="DM Sans">Port: 11434</text>

    {/* ML Service Box */}
    <rect x="750" y="230" width="180" height="120" rx="12" fill="#FFE8E8" stroke="#FF6B9D" strokeWidth="2" filter="url(#shadow)" />
    <text x="840" y="260" fontSize="16" fontWeight="700" textAnchor="middle" fill="#A00D4E" fontFamily="Nunito">ML Service</text>
    <text x="840" y="285" fontSize="11" textAnchor="middle" fill="#804060" fontFamily="DM Sans">3x Models Ensemble</text>
    <text x="840" y="305" fontSize="12" textAnchor="middle" fill="#8B5820" fontFamily="DM Sans">Port: 8000</text>

    {/* Database Box */}
    <rect x="50" y="280" width="180" height="100" rx="12" fill="#E8FFE8" stroke="#22C55E" strokeWidth="2" filter="url(#shadow)" />
    <text x="140" y="310" fontSize="16" fontWeight="700" textAnchor="middle" fill="#15803D" fontFamily="Nunito">Database</text>
    <text x="140" y="335" fontSize="12" textAnchor="middle" fill="#4B5A43" fontFamily="DM Sans">SQLite + Prisma</text>
    <text x="140" y="355" fontSize="12" textAnchor="middle" fill="#4B5A43" fontFamily="DM Sans">User Data & History</text>

    {/* Arrows */}
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <polygon points="0 0, 10 3, 0 6" fill="#7C9EF5" />
      </marker>
    </defs>
    <line x1="250" y1="150" x2="400" y2="150" stroke="#7C9EF5" strokeWidth="3" markerEnd="url(#arrowhead)" />
    <text x="325" y="140" fontSize="11" fill="#7C9EF5" fontFamily="DM Sans" fontWeight="600">REST API</text>

    {/* Backend to Ollama */}
    <line x1="600" y1="100" x2="750" y2="85" stroke="#FF9D4C" strokeWidth="3" markerEnd="url(#arrowhead)" />
    <text x="665" y="85" fontSize="11" fill="#FF9D4C" fontFamily="DM Sans" fontWeight="600">LLM Calls</text>

    {/* Backend to ML Service */}
    <line x1="600" y1="180" x2="750" y2="280" stroke="#FF6B9D" strokeWidth="3" markerEnd="url(#arrowhead)" />
    <text x="665" y="240" fontSize="11" fill="#FF6B9D" fontFamily="DM Sans" fontWeight="600">Predictions</text>

    {/* Backend to Database */}
    <line x1="400" y1="220" x2="180" y2="280" stroke="#22C55E" strokeWidth="3" markerEnd="url(#arrowhead)" />
    <text x="280" y="260" fontSize="11" fill="#22C55E" fontFamily="DM Sans" fontWeight="600">Query & Store</text>
  </svg>
);

const WorkflowDiagram = () => (
  <svg viewBox="0 0 1000 300" className="w-full h-auto">
    <defs>
      <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#7C9EF5', stopOpacity: 0.15 }} />
        <stop offset="100%" style={{ stopColor: '#C4B0F0', stopOpacity: 0.15 }} />
      </linearGradient>
    </defs>

    {/* Step 1 */}
    <circle cx="100" cy="150" r="45" fill="#7C9EF5" opacity="0.2" stroke="#7C9EF5" strokeWidth="2" />
    <circle cx="100" cy="150" r="35" fill="#7C9EF5" stroke="#003D99" strokeWidth="2" />
    <text x="100" y="160" fontSize="24" fontWeight="700" textAnchor="middle" fill="white" fontFamily="Nunito">1</text>
    <text x="100" y="210" fontSize="12" textAnchor="middle" fill="#003D99" fontFamily="DM Sans" fontWeight="600">Extract</text>
    <text x="100" y="225" fontSize="11" textAnchor="middle" fill="#4A5B8A" fontFamily="DM Sans">Symptoms</text>

    {/* Arrow */}
    <line x1="145" y1="150" x2="230" y2="150" stroke="#7C9EF5" strokeWidth="2" strokeDasharray="5,5" />
    <polygon points="240,150 230,145 235,150 230,155" fill="#7C9EF5" />

    {/* Step 2 */}
    <circle cx="300" cy="150" r="35" fill="#C4B0F0" stroke="#6B2E96" strokeWidth="2" />
    <text x="300" y="160" fontSize="24" fontWeight="700" textAnchor="middle" fill="white" fontFamily="Nunito">2</text>
    <text x="300" y="210" fontSize="12" textAnchor="middle" fill="#6B2E96" fontFamily="DM Sans" fontWeight="600">Ask Follow-ups</text>
    <text x="300" y="225" fontSize="11" textAnchor="middle" fill="#5B4B7A" fontFamily="DM Sans">Y/N Questions</text>

    {/* Arrow */}
    <line x1="345" y1="150" x2="430" y2="150" stroke="#7C9EF5" strokeWidth="2" strokeDasharray="5,5" />
    <polygon points="440,150 430,145 435,150 430,155" fill="#7C9EF5" />

    {/* Step 3 */}
    <circle cx="500" cy="150" r="35" fill="#FF9D4C" stroke="#B85C0D" strokeWidth="2" />
    <text x="500" y="160" fontSize="24" fontWeight="700" textAnchor="middle" fill="white" fontFamily="Nunito">3</text>
    <text x="500" y="210" fontSize="12" textAnchor="middle" fill="#B85C0D" fontFamily="DM Sans" fontWeight="600">RAG + LLM</text>
    <text x="500" y="225" fontSize="11" textAnchor="middle" fill="#8B5820" fontFamily="DM Sans">Analysis</text>

    {/* Arrow */}
    <line x1="545" y1="150" x2="630" y2="150" stroke="#7C9EF5" strokeWidth="2" strokeDasharray="5,5" />
    <polygon points="640,150 630,145 635,150 630,155" fill="#7C9EF5" />

    {/* Step 4 */}
    <circle cx="700" cy="150" r="35" fill="#FF6B9D" stroke="#A00D4E" strokeWidth="2" />
    <text x="700" y="160" fontSize="24" fontWeight="700" textAnchor="middle" fill="white" fontFamily="Nunito">4</text>
    <text x="700" y="210" fontSize="12" textAnchor="middle" fill="#A00D4E" fontFamily="DM Sans" fontWeight="600">ML Ensemble</text>
    <text x="700" y="225" fontSize="11" textAnchor="middle" fill="#804060" fontFamily="DM Sans">Validation</text>

    {/* Arrow */}
    <line x1="745" y1="150" x2="830" y2="150" stroke="#7C9EF5" strokeWidth="2" strokeDasharray="5,5" />
    <polygon points="840,150 830,145 835,150 830,155" fill="#7C9EF5" />

    {/* Step 5 */}
    <circle cx="900" cy="150" r="35" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
    <text x="900" y="160" fontSize="24" fontWeight="700" textAnchor="middle" fill="white" fontFamily="Nunito">5</text>
    <text x="900" y="210" fontSize="12" textAnchor="middle" fill="#15803D" fontFamily="DM Sans" fontWeight="600">Results &</text>
    <text x="900" y="225" fontSize="11" textAnchor="middle" fill="#4B5A43" fontFamily="DM Sans">Explanation</text>
  </svg>
);

const MLEnsembleDiagram = () => (
  <svg viewBox="0 0 900 320" className="w-full h-auto">
    {/* Input */}
    <rect x="50" y="130" width="140" height="60" rx="8" fill="#7C9EF5" stroke="#003D99" strokeWidth="2" />
    <text x="120" y="160" fontSize="13" fontWeight="700" textAnchor="middle" fill="white" fontFamily="Nunito">Symptoms</text>
    <text x="120" y="178" fontSize="11" textAnchor="middle" fill="white" fontFamily="DM Sans">Input</text>

    {/* Arrows down to models */}
    <line x1="120" y1="190" x2="120" y2="240" stroke="#7C9EF5" strokeWidth="2" />
    <line x1="150" y1="240" x2="240" y2="240" stroke="#7C9EF5" strokeWidth="2" />
    <line x1="90" y1="240" x2="0" y2="240" stroke="#7C9EF5" strokeWidth="2" />
    <line x1="120" y1="240" x2="120" y2="290" stroke="#7C9EF5" strokeWidth="2" />

    {/* Model 1: Random Forest */}
    <rect x="240" y="210" width="160" height="60" rx="8" fill="#FFE8D6" stroke="#FF9D4C" strokeWidth="2" />
    <text x="320" y="235" fontSize="13" fontWeight="700" textAnchor="middle" fill="#B85C0D" fontFamily="Nunito">Random Forest</text>
    <text x="320" y="253" fontSize="10" textAnchor="middle" fill="#8B5820" fontFamily="DM Sans">85-92% Accuracy</text>

    {/* Model 2: SVM */}
    <rect x="50" y="250" width="160" height="60" rx="8" fill="#FFE8E8" stroke="#FF6B9D" strokeWidth="2" />
    <text x="130" y="275" fontSize="13" fontWeight="700" textAnchor="middle" fill="#A00D4E" fontFamily="Nunito">SVM</text>
    <text x="130" y="293" fontSize="10" textAnchor="middle" fill="#804060" fontFamily="DM Sans">88-94% Accuracy</text>

    {/* Model 3: Naive Bayes */}
    <rect x="230" y="250" width="160" height="60" rx="8" fill="#E8FFE8" stroke="#22C55E" strokeWidth="2" />
    <text x="310" y="275" fontSize="13" fontWeight="700" textAnchor="middle" fill="#15803D" fontFamily="Nunito">Naive Bayes</text>
    <text x="310" y="293" fontSize="10" textAnchor="middle" fill="#4B5A43" fontFamily="DM Sans">80-88% Accuracy</text>

    {/* Arrows from models to ensemble */}
    <line x1="320" y1="210" x2="580" y2="160" stroke="#FF9D4C" strokeWidth="2" />
    <line x1="130" y1="250" x2="520" y2="180" stroke="#FF6B9D" strokeWidth="2" />
    <line x1="310" y1="250" x2="580" y2="150" stroke="#22C55E" strokeWidth="2" />

    {/* Ensemble Box */}
    <rect x="500" y="80" width="200" height="100" rx="8" fill="#F0E8FF" stroke="#C4B0F0" strokeWidth="2" />
    <text x="600" y="115" fontSize="13" fontWeight="700" textAnchor="middle" fill="#6B2E96" fontFamily="Nunito">Ensemble</text>
    <text x="600" y="133" fontSize="10" textAnchor="middle" fill="#5B4B7A" fontFamily="DM Sans">Decision Logic</text>
    <text x="600" y="150" fontSize="9" textAnchor="middle" fill="#5B4B7A" fontFamily="DM Sans">Highest Confidence</text>
    <text x="600" y="163" fontSize="9" textAnchor="middle" fill="#5B4B7A" fontFamily="DM Sans">+ Consensus Check</text>

    {/* Arrow to output */}
    <line x1="600" y1="180" x2="600" y2="240" stroke="#7C9EF5" strokeWidth="2" />
    <polygon points="600,250 595,240 605,240" fill="#7C9EF5" />

    {/* Output */}
    <rect x="500" y="250" width="200" height="60" rx="8" fill="#DFE8FF" stroke="#7C9EF5" strokeWidth="2" />
    <text x="600" y="275" fontSize="13" fontWeight="700" textAnchor="middle" fill="#003D99" fontFamily="Nunito">Prediction</text>
    <text x="600" y="295" fontSize="11" textAnchor="middle" fill="#4A5B8A" fontFamily="DM Sans">Disease + Confidence %</text>
  </svg>
);

const RAGDiagram = () => (
  <svg viewBox="0 0 1000 280" className="w-full h-auto">
    {/* Query Input */}
    <rect x="50" y="110" width="150" height="60" rx="8" fill="#7C9EF5" stroke="#003D99" strokeWidth="2" />
    <text x="125" y="137" fontSize="12" fontWeight="700" textAnchor="middle" fill="white" fontFamily="Nunito">User Query</text>
    <text x="125" y="155" fontSize="10" textAnchor="middle" fill="white" fontFamily="DM Sans">Symptoms</text>

    {/* Arrow to RAG */}
    <line x1="200" y1="140" x2="280" y2="140" stroke="#7C9EF5" strokeWidth="2" />
    <polygon points="290,140 280,135 285,140 280,145" fill="#7C9EF5" />

    {/* Knowledge Sources */}
    <g>
      {/* Medical Knowledge JSON */}
      <rect x="380" y="20" width="180" height="70" rx="8" fill="#FFE8D6" stroke="#FF9D4C" strokeWidth="2" />
      <text x="470" y="45" fontSize="12" fontWeight="700" textAnchor="middle" fill="#B85C0D" fontFamily="Nunito">Medical Knowledge</text>
      <text x="470" y="62" fontSize="10" textAnchor="middle" fill="#8B5820" fontFamily="DM Sans">JSON Database</text>
      <text x="470" y="77" fontSize="9" textAnchor="middle" fill="#8B5820" fontFamily="DM Sans">200+ Diseases</text>

      {/* CSV Datasets */}
      <rect x="380" y="145" width="180" height="70" rx="8" fill="#E8FFE8" stroke="#22C55E" strokeWidth="2" />
      <text x="470" y="170" fontSize="12" fontWeight="700" textAnchor="middle" fill="#15803D" fontFamily="Nunito">Symptom Dataset</text>
      <text x="470" y="187" fontSize="10" textAnchor="middle" fill="#4B5A43" fontFamily="DM Sans">CSV Files</text>
      <text x="470" y="202" fontSize="9" textAnchor="middle" fill="#4B5A43" fontFamily="DM Sans">10,000+ Records</text>
    </g>

    {/* Retrieval Box */}
    <rect x="700" y="75" width="200" height="130" rx="8" fill="#FFE8E8" stroke="#FF6B9D" strokeWidth="2" />
    <text x="800" y="105" fontSize="12" fontWeight="700" textAnchor="middle" fill="#A00D4E" fontFamily="Nunito">Retrieval &</text>
    <text x="800" y="122" fontSize="12" fontWeight="700" textAnchor="middle" fill="#A00D4E" fontFamily="Nunito">Ranking</text>
    <text x="800" y="145" fontSize="9" textAnchor="middle" fill="#804060" fontFamily="DM Sans">Semantic similarity search</text>
    <text x="800" y="160" fontSize="9" textAnchor="middle" fill="#804060" fontFamily="DM Sans">Keyword matching</text>
    <text x="800" y="175" fontSize="9" textAnchor="middle" fill="#804060" fontFamily="DM Sans">Top-K results ranking</text>

    {/* Arrows from sources to retrieval */}
    <line x1="560" y1="55" x2="700" y2="100" stroke="#FF9D4C" strokeWidth="2" />
    <line x1="560" y1="180" x2="700" y2="160" stroke="#22C55E" strokeWidth="2" />

    {/* Arrow to LLM */}
    <line x1="800" y1="210" x2="800" y2="250" stroke="#FF9D4C" strokeWidth="2" />
    <polygon points="800,260 795,250 805,250" fill="#FF9D4C" />

    {/* LLM Process */}
    <rect x="680" y="260" width="240" height="40" rx="8" fill="#DFE8FF" stroke="#7C9EF5" strokeWidth="2" />
    <text x="800" y="277" fontSize="11" fontWeight="600" textAnchor="middle" fill="#003D99" fontFamily="DM Sans">LLM Reasoning with RAG Context</text>
  </svg>
);

const TechStackCard = ({ icon: Icon, title, items }: { icon: any; title: string; items: string[] }) => (
  <div className="card-medicare p-6 hover:shadow-card transition-all duration-300">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-primary-light rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h4 className="font-heading font-bold text-lg">{title}</h4>
    </div>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
          <span className="text-primary font-bold mt-0.5">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

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

      {/* Hero Section */}
      <section className="text-center py-20 px-5 max-w-4xl mx-auto">
        <span className="inline-block bg-primary-light text-primary font-heading font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
          📖 Learn How It Works
        </span>
        <h1 className="font-heading font-extrabold text-5xl sm:text-[56px] leading-tight mb-5">
          About <span className="gradient-text">MediCare AI</span>
        </h1>
        <p className="text-muted-foreground text-[17px] max-w-[600px] mx-auto mb-8 leading-relaxed">
          An intelligent symptom analyzer powered by advanced AI, machine learning, and medical knowledge retrieval—designed to help you understand your health better.
        </p>
        <button onClick={onGetStarted} className="btn-primary text-base py-3.5 px-8">Start Health Check →</button>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-5 pb-20">
        <Accordion type="single" collapsible className="space-y-4">
          
          {/* Architecture Section */}
          <AccordionItem value="architecture" className="card-medicare p-8 border-0">
            <AccordionTrigger className="hover:no-underline py-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-light rounded-lg">
                  <GitBranch className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-heading font-bold text-lg">System Architecture</h3>
                  <p className="text-sm text-muted-foreground">How all components work together</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 mt-6 border-t border-border">
              <div className="space-y-6">
                <div className="bg-surface2 rounded-xl p-4">
                  <ArchitectureDiagram />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card-medicare p-4 bg-primary-light/30">
                    <h4 className="font-heading font-bold text-primary mb-2">Frontend Layer</h4>
                    <p className="text-sm text-foreground">React + Vite, running on port 8080. Handles user interface, chat sessions, history, and medication reminders.</p>
                  </div>
                  <div className="card-medicare p-4 bg-purple/10">
                    <h4 className="font-heading font-bold text-purple mb-2">Backend Layer</h4>
                    <p className="text-sm text-foreground">Express.js server on port 5000. Coordinates RAG, LLM calls, ML predictions, and database operations using Prisma ORM.</p>
                  </div>
                  <div className="card-medicare p-4 bg-orange-100/50">
                    <h4 className="font-heading font-bold text-orange-600 mb-2">LLM Service</h4>
                    <p className="text-sm text-foreground">Ollama with llama3.2 model on port 11434. Provides local LLM inference without cloud APIs—privacy-first approach.</p>
                  </div>
                  <div className="card-medicare p-4 bg-red-100/50">
                    <h4 className="font-heading font-bold text-red-600 mb-2">ML Service</h4>
                    <p className="text-sm text-foreground">Python Flask service on port 8000. Runs 3-model ensemble (Random Forest, SVM, Naive Bayes) for secondary validation.</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Workflow Section */}
          <AccordionItem value="workflow" className="card-medicare p-8 border-0">
            <AccordionTrigger className="hover:no-underline py-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-light rounded-lg">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-heading font-bold text-lg">Prediction Workflow</h3>
                  <p className="text-sm text-muted-foreground">Step-by-step process from symptom input to diagnosis</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 mt-6 border-t border-border">
              <div className="space-y-6">
                <div className="bg-surface2 rounded-xl p-4">
                  <WorkflowDiagram />
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3 p-4 bg-blue-50 rounded-lg">
                    <span className="font-heading font-bold text-primary text-lg">1</span>
                    <div>
                      <h4 className="font-heading font-bold mb-1">Symptom Extraction</h4>
                      <p className="text-muted-foreground">LLM parses free-text symptoms into structured data (e.g., "fever and cough" → ["fever", "cough"])</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-purple-50 rounded-lg">
                    <span className="font-heading font-bold text-purple text-lg">2</span>
                    <div>
                      <h4 className="font-heading font-bold mb-1">Follow-Up Questions</h4>
                      <p className="text-muted-foreground">LLM generates targeted yes/no questions based on initial symptoms for better diagnosis</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-orange-50 rounded-lg">
                    <span className="font-heading font-bold text-orange-600 text-lg">3</span>
                    <div>
                      <h4 className="font-heading font-bold mb-1">RAG + LLM Analysis</h4>
                      <p className="text-muted-foreground">RAG retrieves relevant diseases; LLM analyzes with medical context to generate diagnosis + confidence</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-red-50 rounded-lg">
                    <span className="font-heading font-bold text-red-600 text-lg">4</span>
                    <div>
                      <h4 className="font-heading font-bold mb-1">ML Ensemble Validation</h4>
                        <p className="text-muted-foreground">3 ML models vote on prediction. If confidence &gt;85%, can override LLM; if 70-85%, boosts confidence</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-green-50 rounded-lg">
                    <span className="font-heading font-bold text-green-600 text-lg">5</span>
                    <div>
                      <h4 className="font-heading font-bold mb-1">Results & Explanation</h4>
                      <p className="text-muted-foreground">LLM generates plain-English explanation of results with disclaimer and recommended next steps</p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Technology Stack */}
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
                <TechStackCard
                  icon={Zap}
                  title="Frontend"
                  items={["React 19", "Vite 5.4", "TypeScript", "Tailwind CSS", "React Router", "React Query (TanStack)"]}
                />
                <TechStackCard
                  icon={GitBranch}
                  title="Backend"
                  items={["Node.js 18+", "Express.js 5", "TypeScript", "Prisma ORM", "JWT Auth", "Rate Limiting"]}
                />
                <TechStackCard
                  icon={Database}
                  title="Database"
                  items={["SQLite", "Prisma Client", "BetterSqlite3", "Data Encryption", "Cascade Relations"]}
                />
                <TechStackCard
                  icon={Brain}
                  title="AI/ML"
                  items={["Ollama (LLM)", "llama3.2", "scikit-learn", "Random Forest", "SVM", "Naive Bayes"]}
                />
                <TechStackCard
                  icon={BarChart3}
                  title="Data & RAG"
                  items={["Medical Knowledge JSON", "CSV Datasets", "TF-IDF Vectorizer", "Semantic Search", "Keyword Matching"]}
                />
                <TechStackCard
                  icon={Shield}
                  title="Security"
                  items={["bcryptjs (pwd hashing)", "JWT Tokens", "CORS Protection", "Rate Limiting", "Input Validation"]}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Machine Learning Logic */}
          <AccordionItem value="ml-logic" className="card-medicare p-8 border-0">
            <AccordionTrigger className="hover:no-underline py-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-light rounded-lg">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-heading font-bold text-lg">Machine Learning Ensemble</h3>
                  <p className="text-sm text-muted-foreground">How 3 ML models work together for accurate predictions</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 mt-6 border-t border-border">
              <div className="space-y-6">
                <div className="bg-surface2 rounded-xl p-4">
                  <MLEnsembleDiagram />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="card-medicare p-4 border-2 border-orange-200 bg-orange-50/50">
                    <h4 className="font-heading font-bold text-orange-600 mb-2">🌳 Random Forest</h4>
                    <p className="text-sm text-foreground mb-3">Ensemble of decision trees voting on disease prediction.</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p><strong>Accuracy:</strong> 85-92%</p>
                      <p><strong>Strength:</strong> Handles non-linear patterns</p>
                    </div>
                  </div>
                  <div className="card-medicare p-4 border-2 border-red-200 bg-red-50/50">
                    <h4 className="font-heading font-bold text-red-600 mb-2">⚙️ Support Vector Machine (SVM)</h4>
                    <p className="text-sm text-foreground mb-3">Finds optimal boundaries between disease classes.</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p><strong>Accuracy:</strong> 88-94%</p>
                      <p><strong>Strength:</strong> High-dimensional data</p>
                    </div>
                  </div>
                  <div className="card-medicare p-4 border-2 border-green-200 bg-green-50/50">
                    <h4 className="font-heading font-bold text-green-600 mb-2">📊 Naive Bayes</h4>
                    <p className="text-sm text-foreground mb-3">Probabilistic model based on symptom likelihood.</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p><strong>Accuracy:</strong> 80-88%</p>
                      <p><strong>Strength:</strong> Fast inference</p>
                    </div>
                  </div>
                </div>
                <div className="card-medicare p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                  <h4 className="font-heading font-bold mb-4">Ensemble Decision Logic</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <span className="text-purple font-bold">→</span>
                      <div>
                        <strong className="text-foreground">ML Confidence &gt; 85%:</strong>
                        <p className="text-muted-foreground">ML prediction overrides LLM (highest confidence)</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-purple font-bold">→</span>
                      <div>
                        <strong className="text-foreground">ML Confidence 70-85%:</strong>
                        <p className="text-muted-foreground">Uses LLM prediction but boosts confidence by +5%</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-purple font-bold">→</span>
                      <div>
                        <strong className="text-foreground">ML Confidence &lt; 70% or rare disease:</strong>
                        <p className="text-muted-foreground">Relies on LLM + RAG for prediction</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-medicare p-4 border-l-4 border-primary">
                  <h4 className="font-heading font-bold mb-2">📚 Training Data</h4>
                  <p className="text-sm text-muted-foreground">Trained on <strong>10,000+ symptom-disease pairs</strong> from medical datasets. Models continuously improve with anonymized user feedback.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* RAG System */}
          <AccordionItem value="rag-system" className="card-medicare p-8 border-0">
            <AccordionTrigger className="hover:no-underline py-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-light rounded-lg">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-heading font-bold text-lg">RAG (Retrieval-Augmented Generation)</h3>
                  <p className="text-sm text-muted-foreground">How medical knowledge is retrieved and used</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 mt-6 border-t border-border">
              <div className="space-y-6">
                <div className="bg-surface2 rounded-xl p-4">
                  <RAGDiagram />
                </div>
                <div className="space-y-4">
                  <div className="card-medicare p-4 bg-orange-50/50 border-l-4 border-orange-400">
                    <h4 className="font-heading font-bold text-orange-600 mb-2">📋 Medical Knowledge JSON</h4>
                    <p className="text-sm text-foreground">Contains 200+ diseases with:</p>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground ml-4">
                      <li>• Detailed symptoms for each disease</li>
                      <li>• Medical descriptions & severity levels</li>
                      <li>• Treatment recommendations</li>
                    </ul>
                  </div>
                  <div className="card-medicare p-4 bg-green-50/50 border-l-4 border-green-400">
                    <h4 className="font-heading font-bold text-green-600 mb-2">📊 CSV Datasets</h4>
                    <p className="text-sm text-foreground">Real-world medical data including:</p>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground ml-4">
                      <li>• Diabetes, Heart Disease, Flu datasets</li>
                      <li>• Augmented dataset with 10,000+ records</li>
                      <li>• Symptom frequency & prevalence data</li>
                    </ul>
                  </div>
                  <div className="card-medicare p-4 bg-purple-50/50 border-l-4 border-purple-400">
                    <h4 className="font-heading font-bold text-purple mb-2">🔍 Retrieval Process</h4>
                    <div className="mt-3 space-y-2 text-sm text-foreground">
                      <div className="flex gap-2"><span className="text-purple font-bold">1.</span> <span><strong>Symptom Matching:</strong> Find diseases with matching symptoms</span></div>
                      <div className="flex gap-2"><span className="text-purple font-bold">2.</span> <span><strong>Similarity Scoring:</strong> Rank by relevance using TF-IDF vectorization</span></div>
                      <div className="flex gap-2"><span className="text-purple font-bold">3.</span> <span><strong>Top-K Selection:</strong> Return top 10 most relevant diseases</span></div>
                      <div className="flex gap-2"><span className="text-purple font-bold">4.</span> <span><strong>Context Injection:</strong> Pass to LLM as RAG context for reasoning</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Security */}
          <AccordionItem value="security" className="card-medicare p-8 border-0">
            <AccordionTrigger className="hover:no-underline py-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-light rounded-lg">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-heading font-bold text-lg">Security & Privacy</h3>
                  <p className="text-sm text-muted-foreground">How your data is protected</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 mt-6 border-t border-border">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card-medicare p-4 border-2 border-green-200 bg-green-50/50">
                    <h4 className="font-heading font-bold text-green-600 mb-2">✅ Password Hashing</h4>
                    <p className="text-sm text-foreground">bcryptjs with 10 salt rounds—passwords never stored in plaintext</p>
                  </div>
                  <div className="card-medicare p-4 border-2 border-green-200 bg-green-50/50">
                    <h4 className="font-heading font-bold text-green-600 mb-2">✅ JWT Authentication</h4>
                    <p className="text-sm text-foreground">7-day token expiration with secure bearer token validation</p>
                  </div>
                  <div className="card-medicare p-4 border-2 border-green-200 bg-green-50/50">
                    <h4 className="font-heading font-bold text-green-600 mb-2">✅ Rate Limiting</h4>
                    <p className="text-sm text-foreground">Max 5 auth attempts per 15 min; 100 general requests per 15 min</p>
                  </div>
                  <div className="card-medicare p-4 border-2 border-green-200 bg-green-50/50">
                    <h4 className="font-heading font-bold text-green-600 mb-2">✅ CORS Protection</h4>
                    <p className="text-sm text-foreground">Whitelist only allowed origins; prevents unauthorized access</p>
                  </div>
                  <div className="card-medicare p-4 border-2 border-green-200 bg-green-50/50">
                    <h4 className="font-heading font-bold text-green-600 mb-2">✅ Input Validation</h4>
                    <p className="text-sm text-foreground">Email format, password length, name constraints enforced</p>
                  </div>
                  <div className="card-medicare p-4 border-2 border-green-200 bg-green-50/50">
                    <h4 className="font-heading font-bold text-green-600 mb-2">✅ Local Processing</h4>
                    <p className="text-sm text-foreground">Ollama LLM runs locally—no data sent to external APIs</p>
                  </div>
                </div>
                <div className="card-medicare p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400">
                  <h4 className="font-heading font-bold text-orange-600 mb-3">⚠️ Production Security Notes</h4>
                  <ul className="space-y-2 text-sm text-foreground">
                    <li className="flex gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span><strong>JWT Secret:</strong> Change from default value in production</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span><strong>HTTPS:</strong> Use SSL/TLS certificates in production</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span><strong>Database:</strong> Use managed databases with encryption at rest</span>
                    </li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Why You Need MediCare AI */}
          <AccordionItem value="benefits" className="card-medicare p-8 border-0">
            <AccordionTrigger className="hover:no-underline py-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-light rounded-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-heading font-bold text-lg">Why MediCare AI?</h3>
                  <p className="text-sm text-muted-foreground">How it helps and why it matters</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 mt-6 border-t border-border">
              <div className="space-y-4">
                <div className="card-medicare p-4 bg-blue-50 border-l-4 border-blue-400">
                  <h4 className="font-heading font-bold text-blue-600 mb-2">🏥 Problem It Solves</h4>
                  <p className="text-sm text-foreground">Many people delay doctor visits due to cost, time, or embarrassment. MediCare AI provides instant symptom analysis to help you understand what might be wrong before seeing a healthcare professional.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card-medicare p-4 bg-gradient-to-br from-green-50 to-emerald-50">
                    <h4 className="font-heading font-bold text-green-600 mb-3">✨ Key Benefits</h4>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li className="flex gap-2">
                        <span className="text-green-600 font-bold">→</span>
                        <span><strong>24/7 Availability:</strong> Get answers anytime</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600 font-bold">→</span>
                        <span><strong>No Medical Knowledge Needed:</strong> Plain language input</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600 font-bold">→</span>
                        <span><strong>Privacy-First:</strong> Local processing, no cloud upload</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600 font-bold">→</span>
                        <span><strong>Multi-AI Approach:</strong> LLM + RAG + ML ensemble</span>
                      </li>
                    </ul>
                  </div>

                  <div className="card-medicare p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                    <h4 className="font-heading font-bold text-purple mb-3">🎯 Use Cases</h4>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li className="flex gap-2">
                        <span className="text-purple font-bold">→</span>
                        <span><strong>Quick Health Check:</strong> Assess new symptoms</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple font-bold">→</span>
                        <span><strong>Education:</strong> Learn about health conditions</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple font-bold">→</span>
                        <span><strong>Medication Tracking:</strong> Manage reminders</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple font-bold">→</span>
                        <span><strong>Health History:</strong> Track past diagnoses</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="card-medicare p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200">
                  <h4 className="font-heading font-bold text-red-600 mb-2">⚠️ Important Disclaimer</h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    <strong>MediCare AI is NOT a substitute for professional medical advice, diagnosis, or treatment.</strong> Always consult with a qualified healthcare professional for any health concerns. This tool is for informational purposes only and should not be used for self-diagnosis or self-treatment of serious medical conditions. In case of emergency, call emergency services immediately.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* FAQ Section */}
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
                <div className="card-medicare p-4">
                  <h4 className="font-heading font-bold text-foreground mb-2">Q: Is my data secure?</h4>
                  <p className="text-sm text-muted-foreground">Yes. All data is encrypted, passwords are hashed with bcryptjs, and LLM processing happens locally on Ollama—not sent to cloud services. Your privacy is our priority.</p>
                </div>

                <div className="card-medicare p-4">
                  <h4 className="font-heading font-bold text-foreground mb-2">Q: How accurate are the predictions?</h4>
                  <p className="text-sm text-muted-foreground">Our ensemble ML models achieve 85-94% accuracy on training data. However, accuracy depends on symptom details you provide. Always confirm diagnoses with a doctor—this is a tool to help you understand your health, not a replacement for medical expertise.</p>
                </div>

                <div className="card-medicare p-4">
                  <h4 className="font-heading font-bold text-foreground mb-2">Q: Does it work without internet?</h4>
                  <p className="text-sm text-muted-foreground">Once set up, the Ollama LLM runs locally and doesn't require internet. However, initial setup and updates require internet. The frontend and backend communicate locally over localhost.</p>
                </div>

                <div className="card-medicare p-4">
                  <h4 className="font-heading font-bold text-foreground mb-2">Q: What data do you collect?</h4>
                  <p className="text-sm text-muted-foreground">We store: user accounts, chat history, symptoms described, predictions, and reminder schedules. All data is stored in SQLite locally. We do NOT share data with third parties or use it for marketing.</p>
                </div>

                <div className="card-medicare p-4">
                  <h4 className="font-heading font-bold text-foreground mb-2">Q: Can I export my health history?</h4>
                  <p className="text-sm text-muted-foreground">Yes, you can view your complete chat history and all past predictions in the Dashboard. We plan to add CSV export functionality in future updates.</p>
                </div>

                <div className="card-medicare p-4">
                  <h4 className="font-heading font-bold text-foreground mb-2">Q: How often are the ML models updated?</h4>
                  <p className="text-sm text-muted-foreground">Models are retrained whenever new medical datasets are available or user feedback reveals areas for improvement. You can manually retrain via the API endpoint: <code className="text-xs bg-muted px-2 py-1 rounded">/api/datasets/train</code></p>
                </div>

                <div className="card-medicare p-4">
                  <h4 className="font-heading font-bold text-foreground mb-2">Q: What if I get an error?</h4>
                  <p className="text-sm text-muted-foreground">Check that Ollama is running on port 11434 and the backend is on port 5000. If the ML service fails, LLM+RAG still provides predictions. Check backend logs at <code className="text-xs bg-muted px-2 py-1 rounded">backend/backend-error.txt</code></p>
                </div>

                <div className="card-medicare p-4">
                  <h4 className="font-heading font-bold text-foreground mb-2">Q: Is this app HIPAA compliant?</h4>
                  <p className="text-sm text-muted-foreground">Currently, MediCare AI is designed for educational purposes. For healthcare facility use, HIPAA compliance features (audit logs, encryption at rest, BAA agreements) would need to be added. Contact us for enterprise requirements.</p>
                </div>

                <div className="card-medicare p-4">
                  <h4 className="font-heading font-bold text-foreground mb-2">Q: Can I install this on my hospital network?</h4>
                  <p className="text-sm text-muted-foreground">Yes! MediCare AI is open-source and can be deployed on private networks. Ensure you implement security best practices, configure firewalls properly, and use strong JWT secrets for production.</p>
                </div>

                <div className="card-medicare p-4">
                  <h4 className="font-heading font-bold text-foreground mb-2">Q: How do I report a bug or suggest a feature?</h4>
                  <p className="text-sm text-muted-foreground">We actively welcome feedback! Report bugs via GitHub issues or contact the development team. Your suggestions help us improve MediCare AI for everyone.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Developer Section */}
      <section className="max-w-5xl mx-auto px-5 py-20 text-center border-t border-border">
        <h2 className="font-heading font-bold text-2xl mb-4">👨‍💻 Developer</h2>
        <div className="card-medicare p-8 max-w-xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-avatar flex items-center justify-center text-white font-heading font-bold text-2xl">MT</div>
          <h3 className="font-heading font-bold text-xl mb-2">Md. Tahmidur Rahman Nafees</h3>
          <p className="text-muted-foreground mb-4">Full-Stack Developer | ML Enthusiast | Open Source Contributor</p>
          <p className="text-sm text-muted-foreground">Developed MediCare AI as an educational project combining LLM, RAG, and ML ensemble techniques for intelligent symptom analysis.</p>
          {/* Placeholder for links - user can add later */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">GitHub • Email • Portfolio (links to be added)</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 px-5 border-t border-border text-muted-foreground text-xs">
        <p className="mb-1">⚠️ MediCare AI is not a substitute for professional medical advice.</p>
        <p>© {new Date().getFullYear()} MediCare AI. Built with React, Express, Ollama, and ❤️</p>
      </footer>
    </div>
  );
}
