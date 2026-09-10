import { useState, useRef, useEffect } from 'react';
import { Send, HelpCircle, CheckCircle, AlertCircle, Stethoscope, Sparkles, ArrowRight } from 'lucide-react';
import { extractAndPredict, getFollowUpQuestions, submitFollowUpAnswers, saveToHistory } from '@/api/config';
import { useMagnetic } from '@/hooks/use-pointer-fx';

export interface ChatMessage {
  id: number;
  role: 'ai' | 'user';
  type: 'text' | 'followup' | 'result_ready' | 'error';
  content: string;
  timestamp: Date;
  questionIndex?: number;
  answered?: string;
  symptoms?: string[];
}

interface Props {
  onViewResults: () => void;
  predictionResult: any;
  setPredictionResult: (r: any) => void;
}

const quickChips = [
  '🤒 Fever', '🤕 Headache', '😮‍💨 Shortness of breath', '🤢 Nausea',
  '😴 Fatigue', '💔 Chest Pain', '🦴 Joint Pain', '😵 Dizziness', '🤧 Runny Nose', '🥵 Chills'
];

export default function ChatScreen({ onViewResults, predictionResult, setPredictionResult }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [chatPhase, setChatPhase] = useState<'input' | 'followup' | 'done'>('input');
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [currentSymptoms, setCurrentSymptoms] = useState<string[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [followUpAnswers, setFollowUpAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [composerFocused, setComposerFocused] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const magnetic = useMagnetic(0.3);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const addMsg = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, { ...msg, id: Date.now() + Math.random(), timestamp: new Date() }]);
  };

  const handleSend = async () => {
    if (!input.trim() || chatPhase !== 'input') return;
    const text = input.trim();
    setInput('');
    addMsg({ role: 'user', type: 'text', content: text });

    setIsTyping(true); setTypingText('Reading your symptoms...');
    const res = await extractAndPredict(text);
    setIsTyping(false);

    if (res.error) { addMsg({ role: 'ai', type: 'error', content: res.error }); return; }
    if (!res.symptoms_found?.length) {
      addMsg({ role: 'ai', type: 'text', content: "I couldn't identify specific symptoms from your description. Try being more specific, for example: 'I have had a fever of 38°C, headache, and body aches for 2 days.'" });
      return;
    }
    if (res.symptoms_found.length < 3) {
      addMsg({ role: 'ai', type: 'text', content: `I found these symptoms: ${res.symptoms_found.join(', ')}. Please add at least 3 symptoms for a more reliable result.`, symptoms: res.symptoms_found });
      return;
    }

    setCurrentSymptoms(res.symptoms_found);
    addMsg({ role: 'ai', type: 'text', content: `Thanks for sharing. I found these symptoms: ${res.symptoms_found.join(', ')}. Let me ask a few follow-up questions to better understand.`, symptoms: res.symptoms_found });
    setChatPhase('followup');

    setIsTyping(true); setTypingText('Preparing follow-up questions...');
    const fRes = await getFollowUpQuestions(res.symptoms_found);
    setIsTyping(false);

    if (fRes.error) { addMsg({ role: 'ai', type: 'error', content: fRes.error }); return; }
    setFollowUpQuestions(fRes.questions);
    setCurrentQIndex(0);
    addMsg({ role: 'ai', type: 'followup', content: fRes.questions[0], questionIndex: 0 });
  };

  const handleFollowUpAnswer = async (answer: 'yes' | 'no') => {
    const question = followUpQuestions[currentQIndex];
    const newAnswers = [...followUpAnswers, { question, answer }];
    setFollowUpAnswers(newAnswers);

    // Mark answered
    setMessages(prev => prev.map(m =>
      m.type === 'followup' && m.questionIndex === currentQIndex ? { ...m, answered: answer } : m
    ));

    const nextIdx = currentQIndex + 1;
    if (nextIdx < followUpQuestions.length) {
      setCurrentQIndex(nextIdx);
      setTimeout(() => addMsg({ role: 'ai', type: 'followup', content: followUpQuestions[nextIdx], questionIndex: nextIdx }), 500);
    } else {
      addMsg({ role: 'ai', type: 'text', content: "Got it! I have all the information I need. Let me analyze everything now..." });
      setChatPhase('done');
      setIsTyping(true); setTypingText('Analyzing with ML model...');
      const res = await submitFollowUpAnswers(currentSymptoms, newAnswers);
      setIsTyping(false);
      if (res.error) { addMsg({ role: 'ai', type: 'error', content: res.error }); return; }

      setPredictionResult(res);

      // Save to history
      const saveRes = await saveToHistory({
        disease: res.disease,
        confidence: res.confidence,
        symptoms_found: currentSymptoms,
        explanation: res.explanation,
        allPredictions: res.all_predictions,
      });
      if (saveRes.error) {
        console.warn('Save history failed:', saveRes.error);
      } else {
        addMsg({ role: 'ai', type: 'text', content: `Analysis saved to your history! (${res.confidence}% match for ${res.disease})` });
      }

      addMsg({ role: 'ai', type: 'result_ready', content: 'Your results are ready. Click below to view your full report.' });
    }
  };

  const autoResize = () => {
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'; }
  };

  // Keep the textarea height in sync when the value changes from a chip click
  // as well as from typing.
  useEffect(autoResize, [input]);

  /** Symptoms currently staged in the composer, as normalised segments. */
  const inputParts = input.split(',').map(s => s.trim()).filter(Boolean);
  const chipLabel = (chip: string) => chip.slice(2).trim();
  const isChipSelected = (chip: string) =>
    inputParts.some(p => p.toLowerCase() === chipLabel(chip).toLowerCase());

  /** Chips toggle rather than blindly append, so tapping twice cannot duplicate. */
  const toggleChip = (chip: string) => {
    const label = chipLabel(chip);
    const idx = inputParts.findIndex(p => p.toLowerCase() === label.toLowerCase());
    const next = idx >= 0 ? inputParts.filter((_, i) => i !== idx) : [...inputParts, label];
    setInput(next.join(', '));
    textareaRef.current?.focus();
  };

  const phase = {
    input: { label: 'Ready to help', dot: 'bg-secondary' },
    followup: { label: 'Gathering details...', dot: 'bg-accent2' },
    done: { label: 'Analysis complete', dot: 'bg-primary' },
  }[chatPhase];

  const answeredCount = followUpAnswers.length;
  const totalQuestions = followUpQuestions.length;
  const progress = totalQuestions > 0 ? answeredCount / totalQuestions : 0;

  return (
    <div className="relative flex flex-col h-full min-h-0">
      {/* Chat header */}
      <div className="glass-shell border-b border-white/50 px-5 py-3 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-9 h-9 rounded-full gradient-avatar flex items-center justify-center ${isTyping ? 'pulse-ring' : ''}`}>
              <Stethoscope className="w-[18px] h-[18px] text-white" />
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${phase.dot} border-2 border-white`} />
          </div>
          <div className="min-w-0">
            <div className="font-heading font-bold text-sm">MediCare AI</div>
            <span className="text-xs text-muted-foreground">{phase.label}</span>
          </div>

          {/* Follow-up progress lives in the header so it never scrolls away. */}
          {chatPhase === 'followup' && totalQuestions > 0 && (
            <div className="ml-auto w-32 sm:w-44">
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                <span>Question {Math.min(answeredCount + 1, totalQuestions)} of {totalQuestions}</span>
              </div>
              <div className="progress-rail">
                <div className="progress-fill" style={{ transform: `scaleX(${progress})` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto scroll-fade-y px-5 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center pt-10 sm:pt-14">
            <div className="float-slow text-5xl mb-4 inline-block" aria-hidden="true">🩺</div>
            <h2 className="font-heading font-bold text-2xl mb-2">
              Hi, I'm <span className="gradient-text-animated">MediCare AI</span>
            </h2>
            <p className="text-muted-foreground text-sm mb-7 max-w-sm mx-auto leading-relaxed">
              Describe your symptoms and I'll help analyze them using AI.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {quickChips.map((c, i) => (
                <button
                  key={c}
                  onClick={() => toggleChip(c)}
                  data-selected={isChipSelected(c)}
                  aria-pressed={isChipSelected(c)}
                  className="chip-glass tag-pop rounded-full px-3.5 py-2 text-xs font-medium"
                  style={{ ['--i' as string]: i }}
                >
                  {c}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-5">
              Add at least 3 symptoms for a reliable result
            </p>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end msg-in-right' : 'justify-start msg-in-left'}`}>
            {m.role === 'ai' && (
              <div className="w-8 h-8 rounded-full gradient-avatar flex items-center justify-center shrink-0 mr-2 mt-1 shadow-soft">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] sm:max-w-[75%] ${m.role === 'user'
              ? 'bubble-user text-white rounded-[18px_18px_4px_18px] px-4 py-3'
              : m.type === 'followup'
                ? 'bubble-panel rounded-2xl p-5'
                : m.type === 'result_ready'
                  ? 'bubble-panel result-sheen rounded-2xl p-5'
                  : m.type === 'error'
                    ? 'bg-destructive/10 border border-destructive/25 rounded-2xl p-4 backdrop-blur-sm'
                    : 'bubble-ai rounded-[18px_18px_18px_4px] px-4 py-3'
              }`}>
              {m.type === 'followup' ? (
                <>
                  <div className="flex items-center gap-1.5 text-primary font-heading font-bold text-sm mb-2">
                    <HelpCircle className="w-4 h-4" /> Follow-up Question
                  </div>
                  <p className="text-[15px] mb-3.5 leading-relaxed">{m.content}</p>
                  {m.answered ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${m.answered === 'yes' ? 'bg-secondary/40 text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {m.answered === 'yes' ? '✓ Yes' : '✗ No'}
                    </span>
                  ) : (
                    <div className="flex gap-2.5">
                      <button onClick={() => handleFollowUpAnswer('yes')} className="answer-btn answer-yes btn-pill px-7 py-2 text-sm font-heading font-bold">✓ Yes</button>
                      <button onClick={() => handleFollowUpAnswer('no')} className="answer-btn answer-no btn-pill px-7 py-2 text-sm font-heading font-bold">✗ No</button>
                    </div>
                  )}
                </>
              ) : m.type === 'result_ready' ? (
                <>
                  <div className="flex items-center gap-2 font-heading font-bold text-base mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/40">
                      <CheckCircle className="w-[18px] h-[18px] text-secondary-foreground" />
                    </span>
                    <span className="gradient-text">Analysis Complete!</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{m.content}</p>
                  <span className="cta-glow rounded-full block">
                    <button onClick={onViewResults} className="btn-primary w-full py-2.5 text-sm inline-flex items-center justify-center gap-1.5">
                      View Full Report <ArrowRight className="w-4 h-4" />
                    </button>
                  </span>
                </>
              ) : m.type === 'error' ? (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <span className="text-destructive text-sm">{m.content}</span>
                </div>
              ) : (
                <>
                  <p className="text-[15px] leading-relaxed">{m.content}</p>
                  {m.symptoms && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {m.symptoms.map((s, i) => (
                        <span
                          key={s}
                          className="tag-pop bg-primary-light text-primary text-xs px-2.5 py-1 rounded-full font-semibold"
                          style={{ ['--i' as string]: i }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
              <div className={`text-[11px] mt-1.5 ${m.role === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-2 msg-in-left">
            <div className="w-8 h-8 rounded-full gradient-avatar flex items-center justify-center shrink-0 pulse-ring">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <div className="bubble-ai rounded-[18px_18px_18px_4px] px-4 py-3">
              <div className="flex gap-1 mb-1">
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </div>
              <span className="text-xs font-semibold typing-shimmer">{typingText}</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      {chatPhase === 'input' && (
        <div className="glass-shell border-t border-white/50 px-5 py-4 shrink-0 z-20">
          <div className="composer-shell flex items-end gap-3 px-4 py-3" data-focused={composerFocused}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onFocus={() => setComposerFocused(true)}
              onBlur={() => setComposerFocused(false)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Describe your symptoms... (e.g. I have had fever and headache for 2 days)"
              rows={1}
              className="composer-input flex-1 py-1.5"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              {...magnetic}
              aria-label="Send message"
              className="magnetic btn-primary p-3 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Staged symptom count - quiet reinforcement of the 3-symptom gate. */}
          <div className="flex items-center justify-center gap-2 mt-2.5">
            {inputParts.length > 0 && (
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${inputParts.length >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                <Sparkles className="w-3 h-3" />
                {inputParts.length} symptom{inputParts.length === 1 ? '' : 's'} staged
                {inputParts.length < 3 && ` — add ${3 - inputParts.length} more`}
              </span>
            )}
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-1.5">⚠️ Not a medical diagnosis — always consult a doctor</p>
        </div>
      )}
    </div>
  );
}
