import { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Sparkles, AlertTriangle, CheckCircle, Save, RotateCcw, BarChart3, Book, Brain, Cpu, Check } from 'lucide-react';
import { saveToHistory } from '@/api/config';

interface Props {
  result: any;
  user: any;
  onBack: () => void;
  onNewCheck: () => void;
  onDashboard: () => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

function getConfidenceLabel(score: number) {
  if (score >= 75) return { label: 'Likely match', colorClass: 'bg-green-100 text-green-700' };
  if (score >= 50) return { label: 'Possible match', colorClass: 'bg-amber-100 text-amber-700' };
  if (score >= 30) return { label: 'Low confidence match', colorClass: 'bg-orange-100 text-orange-700' };
  return { label: 'Weak signal only', colorClass: 'bg-red-100 text-red-700' };
}

export default function ResultsScreen({ result, user, onBack, onNewCheck, onDashboard, onToast }: Props) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [barWidth, setBarWidth] = useState(0);

  if (!result || result.error) {
    return (
      <div className="screen-fade max-w-[720px] mx-auto px-5 py-10">
        <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Chat
        </button>
        <div className="text-center py-20">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-heading font-bold text-foreground mb-2">No Results Available</h2>
          <p className="text-muted-foreground mb-6">
            {result?.error || "It looks like the analysis results are not available. Please try running the diagnosis again."}
          </p>
          <button onClick={onNewCheck} className="btn-primary">Start New Diagnosis</button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (typeof result.confidence === 'number') {
      const timeoutId = setTimeout(() => setBarWidth(result.confidence), 100);
      return () => clearTimeout(timeoutId);
    }
  }, [result.confidence]);

  const confidenceValue = typeof result.confidence === 'number' ? result.confidence : 0;
  const confidenceLabel = getConfidenceLabel(confidenceValue);
  const isWeakSignal = confidenceValue < 22;

  const mlBreakdown = result.methodology?.ml_models_used ?? {};
  const mlModels = [
    { key: 'rf_prob', label: 'Random Forest', confidence: mlBreakdown.rf_prob },
    { key: 'svm_prob', label: 'SVM', confidence: mlBreakdown.svm_prob },
    { key: 'nb_prob', label: 'Naive Bayes', confidence: mlBreakdown.nb_prob },
  ].filter(m => typeof m.confidence === 'number');

  const ragScore = result.rag_validation?.rag_score ?? result.rag_validation?.score ?? 0;
  const ragMatched = result.rag_validation?.matched ?? result.rag_validation?.matchedSymptoms ?? [];
  const ragMissing = result.rag_validation?.missing ?? result.rag_validation?.missingSymptoms ?? [];

  const handleSave = async () => {
    if (!user) { onToast('Please sign in to save', 'info'); return; }
    setSaving(true);
    const res = await saveToHistory(result);
    setSaving(false);
    if (res.error) { onToast(res.error, 'error'); return; }
    setSaved(true);
    onToast('Saved to your history!', 'success');
  };

  const otherPredictions = (result.all_predictions || []).slice(1);

  return (
    <div className="screen-fade max-w-[720px] mx-auto px-5 py-10">
      <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Chat
      </button>

      {/* Header */}
      <div className="gradient-header-card rounded-3xl p-8 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center"><Activity className="w-5 h-5 text-primary" /></div>
          <span className="text-primary font-heading font-semibold text-sm">Analysis Complete</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl mb-3">Your Symptom Report</h1>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {result.symptoms_found?.map((s: string) => (
            <span key={s} className="bg-primary-light text-primary text-xs px-2.5 py-1 rounded-full font-semibold">{s}</span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{new Date().toLocaleString()}</p>
      </div>

      {/* Main prediction */}
      {!isWeakSignal ? (
        <div className="card-medicare border-2 border-primary-light p-7 mb-4">
          <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
            <h2 className="font-heading font-extrabold text-2xl">{result.disease}</h2>
            <span className="bg-primary-light text-primary font-heading font-bold text-sm px-3 py-1 rounded-full">{result.confidence}% match</span>
          </div>
          <span className={`${confidenceLabel.colorClass} text-xs px-3 py-1 rounded-full font-semibold`}>{confidenceLabel.label}</span>
          <div className="mt-5">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Confidence Level</span>
              <span className="font-heading font-bold">{result.confidence}%</span>
            </div>
            <div className="h-2.5 bg-border rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-purple confidence-bar-fill" style={{ width: `${barWidth}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="card-medicare border-2 border-red-200 bg-red-50/30 p-7 mb-4">
          <h2 className="font-heading font-extrabold text-xl text-red-700 mb-2">No strong match found. Results below are weak signals only.</h2>
          <span className={`${confidenceLabel.colorClass} text-xs px-3 py-1 rounded-full font-semibold`}>{confidenceLabel.label}</span>
        </div>
      )}

      {/* All predictions (muted when weak signal) */}
      {(otherPredictions.length > 0 || isWeakSignal) && (
        <div className="mb-4">
          <h3 className="font-heading font-bold text-base mb-3">{isWeakSignal ? 'Weak Signals' : 'Other Possibilities'}</h3>
          <div className={`space-y-2 ${isWeakSignal ? 'opacity-70' : ''}`}>
            {(isWeakSignal ? result.all_predictions || [] : otherPredictions).map((p: any, i: number) => (
              <div key={i} className="card-medicare bg-surface2 p-4 flex items-center justify-between">
                <span className="font-heading font-semibold text-sm">{p.disease}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full confidence-bar-fill" style={{ width: `${p.confidence}%`, background: i === 0 ? 'hsl(var(--accent))' : 'hsl(var(--accent2))' }} />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground w-12 text-right">{p.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prediction Methodology */}
      {result.methodology && (
        <div className="card-medicare p-7 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-accent" />
            <h3 className="font-heading font-bold text-base">How This Diagnosis Was Made</h3>
          </div>
          
          {/* Method badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {result.methodology.methods_used?.includes('rag') && (
              <span className="bg-primary-light/30 text-primary text-xs px-2.5 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
                <Book className="w-3 h-3" />
                RAG Knowledge
              </span>
            )}
            {result.methodology.methods_used?.includes('llm') && (
              <span className="bg-purple/30 text-purple-foreground text-xs px-2.5 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
                <Brain className="w-3 h-3" />
                LLM Analysis
              </span>
            )}
            {result.methodology.methods_used?.includes('ml') && (
              <span className="bg-accent/30 text-accent-foreground text-xs px-2.5 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
                <Cpu className="w-3 h-3" />
                ML Ensemble
              </span>
            )}
          </div>

          {/* Plain English explanation */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {result.methodology.explanation}
          </p>

          {/* ML model details if ML was used */}
          {mlModels.length > 0 && (
            <>
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">ML Model Breakdown:</p>
                <div className="space-y-2">
                  {mlModels.map(model => (
                    <div key={model.key} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-muted-foreground">{model.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${Math.min(model.confidence ?? 0, 100)}%` }} />
                        </div>
                        <span className="text-xs w-8 text-right font-mono">{(model.confidence ?? 0).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {result.rag_validation && (
            <div className="border-t border-border pt-3 mt-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">RAG Symptom Validation:</p>
              <p className="text-sm mb-3">Match score: <span className="font-semibold">{ragScore.toFixed(1)}%</span></p>
              <div className="grid gap-3 md:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Matching symptoms</p>
                  {ragMatched.length > 0 ? (
                    <ul className="list-disc list-inside text-muted-foreground">
                      {ragMatched.map((symptom: string) => (
                        <li key={symptom}>{symptom}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No matching symptoms found.</p>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Missing symptoms</p>
                  {ragMissing.length > 0 ? (
                    <ul className="list-disc list-inside text-muted-foreground">
                      {ragMissing.map((symptom: string) => (
                        <li key={symptom}>{symptom}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No missing disease symptoms detected.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explanation */}
      {result.disease && (
        <div className="card-medicare p-7 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold text-base">AI Explanation</h3>
            {result.explanation_pending && <span className="text-xs text-muted-foreground animate-pulse">Generating...</span>}
          </div>
          <p className="text-xs text-muted-foreground mb-3">{result.explanation_source === 'ollama' ? 'Generated by AI (llama3.2)' : 'Generated by AI analysis'} — informational purposes only</p>
          <div className="text-[15px] leading-[1.8] text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>
            {result.explanation || <span className="italic text-muted-foreground">Detailed explanation is being generated...</span>}
          </div>
        </div>
      )}

      {/* Next steps */}
      <div className="gradient-nextsteps border border-accent rounded-2xl p-7 mb-4">
        <h3 className="font-heading font-bold text-base mb-3">💡 Recommended Next Steps</h3>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>Consult a qualified doctor for proper diagnosis</li>
          <li>Avoid self-medicating based on AI predictions</li>
          <li>If symptoms worsen, go to emergency care immediately</li>
          <li>Track when symptoms started and any changes</li>
        </ol>
      </div>

      {/* Disclaimer */}
      <div className="bg-[#fff3cd] border border-[#ffc107] rounded-xl p-4 mb-6 flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 text-[#856404] shrink-0 mt-0.5" />
        <div>
          <p className="font-heading font-bold text-sm text-[#856404] mb-1">Important Medical Disclaimer</p>
          <p className="text-xs text-[#856404] leading-relaxed">This AI prediction is for informational purposes only and should not be considered medical advice. Always consult a qualified healthcare provider for diagnosis and treatment.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={handleSave} disabled={saved || saving} className={`btn-pill px-5 py-2.5 text-sm flex items-center gap-2 ${saved ? 'bg-secondary/30 text-secondary-foreground' : 'btn-primary'}`}>
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved</> : saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save to History</>}
        </button>
        <button onClick={onNewCheck} className="btn-ghost px-5 py-2.5 text-sm flex items-center gap-2"><RotateCcw className="w-4 h-4" /> New Check</button>
        <button onClick={onDashboard} className="btn-ghost px-5 py-2.5 text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4" /> View Dashboard</button>
      </div>
    </div>
  );
}
