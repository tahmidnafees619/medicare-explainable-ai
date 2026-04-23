import { useState, useRef, useEffect } from 'react';
import { Send, HelpCircle, CheckCircle, AlertCircle, Stethoscope } from 'lucide-react';
import { extractAndPredict, getFollowUpQuestions, submitFollowUpAnswers, saveToHistory } from '@/api/config';

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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-card border-b border-border px-5 py-3 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="font-heading font-bold text-sm flex items-center gap-2">
            MediCare AI <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
          </div>
          <span className="text-xs text-muted-foreground">
            {chatPhase === 'input' ? 'Ready to help' : chatPhase === 'followup' ? 'Gathering details...' : 'Analysis complete'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center pt-12">
            <div className="text-5xl mb-3">🩺</div>
            <h2 className="font-heading font-bold text-xl mb-2">Hi, I'm MediCare AI</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">Describe your symptoms and I'll help analyze them using AI.</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              {quickChips.map(c => (
                <button key={c} onClick={() => setInput(prev => prev ? prev + ', ' + c.slice(2).trim() : c.slice(2).trim())}
                  className="bg-card border border-border rounded-full px-3.5 py-1.5 text-xs hover:border-primary hover:bg-primary-light hover:text-primary transition-all">
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`chat-bubble-enter flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center shrink-0 mr-2 mt-1">
                <Stethoscope className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[75%] ${m.role === 'user'
              ? 'gradient-user-bubble text-white rounded-[18px_18px_4px_18px] px-4 py-3'
              : m.type === 'followup'
                ? 'bg-card border-2 border-primary-light rounded-2xl p-5'
                : m.type === 'result_ready'
                  ? 'bg-card border-2 border-secondary rounded-2xl p-5'
                  : m.type === 'error'
                    ? 'bg-destructive/10 rounded-2xl p-4'
                    : 'bg-card border border-border rounded-[18px_18px_18px_4px] px-4 py-3'
              }`}>
              {m.type === 'followup' ? (
                <>
                  <div className="flex items-center gap-1.5 text-primary font-heading font-bold text-sm mb-2">
                    <HelpCircle className="w-4 h-4" /> Follow-up Question
                  </div>
                  <p className="text-[15px] mb-3">{m.content}</p>
                  {m.answered ? (
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${m.answered === 'yes' ? 'bg-secondary/30 text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {m.answered === 'yes' ? '✓ Yes' : '✗ No'}
                    </span>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => handleFollowUpAnswer('yes')} className="btn-pill bg-secondary/30 text-secondary-foreground px-7 py-2 text-sm hover:bg-secondary/50">✓ Yes</button>
                      <button onClick={() => handleFollowUpAnswer('no')} className="btn-pill bg-surface2 text-muted-foreground px-7 py-2 text-sm hover:bg-muted">✗ No</button>
                    </div>
                  )}
                </>
              ) : m.type === 'result_ready' ? (
                <>
                  <div className="flex items-center gap-1.5 text-secondary font-heading font-bold text-base mb-2">
                    <CheckCircle className="w-5 h-5" /> Analysis Complete!
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{m.content}</p>
                  <button onClick={onViewResults} className="btn-primary w-full py-2.5 text-sm">View Full Report →</button>
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
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.symptoms.map(s => (
                        <span key={s} className="bg-primary-light text-primary text-xs px-2.5 py-1 rounded-full font-semibold">{s}</span>
                      ))}
                    </div>
                  )}
                </>
              )}
              <div className="text-[11px] text-muted-foreground mt-1.5">
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-2 chat-bubble-enter">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-card border border-border rounded-[18px_18px_18px_4px] px-4 py-3">
              <div className="flex gap-1 mb-1">
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </div>
              <span className="text-xs text-muted-foreground">{typingText}</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      {chatPhase === 'input' && (
        <div className="border-t border-border bg-card px-5 py-4 shrink-0">
          <div className="flex items-end gap-3">
            <textarea ref={textareaRef} value={input} onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Describe your symptoms... (e.g. I have had fever and headache for 2 days)"
              rows={1} className="input-medicare pl-4 resize-none flex-1" />
            <button onClick={handleSend} disabled={!input.trim()}
              className="btn-primary p-3 disabled:opacity-50">
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-2">⚠️ Not a medical diagnosis — always consult a doctor</p>
        </div>
      )}
    </div>
  );
}
