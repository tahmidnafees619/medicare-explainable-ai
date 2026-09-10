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

  // Ranked shortlist from the backend. Measured top-1 accuracy is ~45% while
  // top-5 is ~64%, so the list is the honest unit to show - a single headline
  // disease overstates what this model can support.
  const differential: any[] = Array.isArray(result.differential) ? result.differential : [];

  const strengthClass = (strength: string) => {
    switch (strength) {
      case 'Strong': return 'bg-green-100 text-green-700';
      case 'Moderate': return 'bg-amber-100 text-amber-700';
      case 'Weak': return 'bg-orange-100 text-orange-700';
      default: return 'bg-red-100 text-red-700';
    }
  };

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

      {/* Ranked shortlist - the differential, not a verdict */}
      {differential.length > 0 ? (
        <div className="mb-4">
          {result.prediction_source === 'fallback' && (
            <div className="card-medicare border-2 border-red-200 bg-red-50/40 p-5 mb-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-heading font-extrabold text-lg text-red-700 mb-1">
                    No usable match found
                  </h2>
                  <p className="text-sm text-red-700/90">
                    Nothing matched your symptoms strongly enough to suggest a condition. The items
                    below are the nearest patterns found, but all are weak — please read them as
                    "nothing conclusive", not as possibilities worth acting on.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="card-medicare border-2 border-primary-light p-5 mb-3">
            <h2 className="font-heading font-extrabold text-xl mb-1">Closest symptom matches</h2>
            <p className="text-sm text-muted-foreground">
              These conditions have symptom patterns similar to what you described, strongest first.
              This is a similarity ranking, <span className="font-semibold">not a diagnosis</span> — the
              correct condition is often further down the list, and may not be listed at all.
            </p>
          </div>

          <div className="space-y-3">
            {differential.map((c: any) => (
              <div
                key={c.rank}
                className={`card-medicare p-5 ${c.rank === 1 ? 'border-2 border-primary-light' : 'bg-surface2'}`}
              >
                <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                  <h3 className={`font-heading font-bold ${c.rank === 1 ? 'text-xl' : 'text-base'}`}>
                    <span className="text-muted-foreground mr-2">{c.rank}.</span>{c.disease}
                  </h3>
                  <span className={`${strengthClass(c.strength)} text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap`}>
                    {c.strength} match
                  </span>
                </div>

                {c.missing_defining_evidence && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">
                      You reported <span className="font-semibold">none</span> of this condition's
                      defining symptoms. It ranks here on general symptoms only, which makes it
                      considerably less likely than its position suggests.
                    </p>
                  </div>
                )}

                {c.matched_symptoms?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">What points to it</p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.matched_symptoms.map((s: string) => (
                        <span key={s} className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {c.missing_core_symptoms?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                      What argues against it — usually present, but you did not report:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.missing_core_symptoms.map((s: string) => (
                        <span key={s} className="bg-surface2 border border-border text-muted-foreground text-xs px-2.5 py-1 rounded-full font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : isWeakSignal ? (
        <div className="card-medicare border-2 border-red-200 bg-red-50/30 p-7 mb-4">
          <h2 className="font-heading font-extrabold text-xl text-red-700 mb-2">No strong match found. Results below are weak signals only.</h2>
          <span className={`${confidenceLabel.colorClass} text-xs px-3 py-1 rounded-full font-semibold`}>{confidenceLabel.label}</span>
        </div>
      ) : (
        <div className="card-medicare border-2 border-primary-light p-7 mb-4">
          <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
            <h2 className="font-heading font-extrabold text-2xl">{result.disease}</h2>
            <span className={`${strengthClass(result.top_result?.strength)} font-heading font-bold text-sm px-3 py-1 rounded-full`}>
              {result.top_result?.strength || confidenceLabel.label}
            </span>
          </div>
          <div className="mt-5">
            <div className="h-2.5 bg-border rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-purple confidence-bar-fill" style={{ width: `${barWidth}%` }} />
            </div>
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
            <h3 className="font-heading font-bold text-base">
              {differential.length > 0 ? 'Comparing these possibilities' : 'AI Explanation'}
            </h3>
            {result.explanation_pending && <span className="text-xs text-muted-foreground animate-pulse">Generating...</span>}
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Written by a local AI (llama3.2) from the match data above. It can be confidently wrong —
            it is describing a statistical pattern match, not examining you.
          </p>
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
