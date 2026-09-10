import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import * as llmService from '../services/llm.service.js';
import * as ragService from '../services/rag.service.js';

const router = Router();

// ML Service configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

type PredictionSource = 'ml_primary' | 'rag_primary' | 'llm_fallback' | 'fallback';

/**
 * Minimum calibrated ML confidence to treat the ensemble as the primary answer.
 * The ML service scores against ~776 disease classes, where a correct top-1 pick
 * carries a raw probability of only a few percent. It therefore reports a
 * calibrated confidence (lift over chance + dominance over the runner-ups)
 * rather than the raw probability, and this threshold is set against that
 * calibrated scale: nonsense input lands near 20, real symptom sets near 40-55.
 */
const ML_PRIMARY_THRESHOLD = 35;

/** Minimum RAG symptom-match score to lead with the knowledge-base match. */
const RAG_PRIMARY_THRESHOLD = 40;

/**
 * Local Ollama generation takes ~25s warm and longer on a cold model load, so
 * these are generous. If the model does not answer in time the caller falls
 * back to a templated explanation rather than failing the request.
 */
const EXPLANATION_TIMEOUT_MS = 60000;
const PREDICTION_TIMEOUT_MS = 60000;

// ── Stage 1: Symptom Preprocessing ────────────────────────────────────────

/**
 * Normalize symptom text: lowercase, strip punctuation/non-alphanumeric
 */
function normalizeSymptom(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

/**
 * Synonym expansion map – maps common user terms to standardized KB forms
 */
/**
 * Maps everyday wording AND clinical jargon onto the vocabulary the models were
 * actually trained on.
 *
 * Two rules, both learned the hard way:
 *  1. The KEY must be a term that exists in the training data. Mapping
 *     "nasal congestion" (a real dataset column) onto "runny nose" (which is
 *     not one) actively destroyed signal.
 *  2. The LLM extractor frequently returns jargon - "polyuria", "polydipsia",
 *     "hyperhidrosis" - none of which are in the dataset vocabulary. Left
 *     unmapped, a textbook diabetes description was predicted as Primary
 *     Thrombocythemia.
 */
const SYMPTOM_SYNONYMS: Record<string, string[]> = {
  headache: ['cephalgia', 'head pain', 'head hurts', 'migraine'],
  'skin rash': ['rash', 'eruption', 'itchy rash', 'blisters', 'exanthem'],
  'itching of skin': ['pruritus', 'itchy skin', 'itching'],
  fever: ['temperature', 'hot body', 'high temperature', 'pyrexia', 'febrile'],
  chills: ['shivering', 'rigors'],
  'nasal congestion': ['runny nose', 'stuffy nose', 'blocked nose', 'rhinitis', 'rhinorrhea', 'coryza'],
  sneezing: ['sneeze'],
  'sore throat': ['throat pain', 'pharyngitis', 'painful throat'],
  cough: ['coughing'],
  nausea: ['nauseous', 'queasy'],
  vomiting: ['vomit', 'throwing up', 'emesis'],
  diarrhea: ['loose stool', 'loose stools', 'watery stool'],
  'sharp abdominal pain': ['abdominal pain', 'stomach pain', 'stomach ache', 'abdomen pain', 'belly pain'],
  'shortness of breath': ['breathing trouble', 'difficulty breathing', 'breathless', 'dyspnea', 'dyspnoea'],
  'sharp chest pain': ['chest pain', 'chest tightness', 'angina'],
  'difficulty breathing': ['laboured breathing', 'labored breathing'],
  wheezing: ['wheeze', 'whistling breath'],
  sweating: ['hyperhidrosis', 'diaphoresis', 'excessive sweating', 'sweats', 'night sweats'],
  thirst: ['polydipsia', 'excessive thirst', 'increased thirst', 'very thirsty'],
  'frequent urination': ['polyuria', 'urinary frequency', 'urinating frequently', 'peeing a lot'],
  'excessive urination at night': ['nocturia'],
  'painful urination': ['dysuria', 'burning urination', 'burning when urinating', 'burns when i urinate'],
  'recent weight loss': ['weight loss', 'losing weight', 'unintentional weight loss'],
  'diminished vision': ['blurry vision', 'blurred vision', 'vision problems'],
  dizziness: ['vertigo', 'lightheadedness', 'light headed', 'dizzy'],
  'neck stiffness or tightness': ['stiff neck', 'neck stiffness', 'nuchal rigidity'],
  'joint pain': ['arthralgia', 'painful joints'],
  'muscle pain': ['myalgia', 'body aches', 'body pain', 'muscle ache'],
  'back pain': ['backache', 'back ache'],
  palpitations: ['heart racing', 'racing heart', 'increased heart rate'],
  'loss of appetite': ['anorexia', 'no appetite', 'poor appetite'],
  'difficulty in swallowing': ['dysphagia', 'trouble swallowing'],
  jaundice: ['yellow skin', 'yellowing of the skin', 'yellow eyes'],
  fatigue: ['tired', 'weakness', 'weak', 'extreme fatigue', 'lethargy', 'malaise', 'exhausted'],
  insomnia: ['cannot sleep', 'trouble sleeping', 'sleeplessness'],
  depression: ['depressed', 'feeling low', 'low mood'],
  'anxiety and nervousness': ['anxiety', 'anxious', 'nervous'],
};

/**
 * Expand synonyms – maps any synonym to its canonical form
 */
function expandSynonyms(symptom: string): string {
  const normalized = normalizeSymptom(symptom);
  for (const [canonical, synonyms] of Object.entries(SYMPTOM_SYNONYMS)) {
    if (normalized === canonical || synonyms.some(s => normalizeSymptom(s) === normalized)) {
      return canonical;
    }
  }
  return normalized;
}

/**
 * Gate: minimum 3 symptoms required for reliable prediction
 */
function symptomGate(symptoms: string[]): { passed: boolean; error?: string } {
  if (symptoms.length < 3) {
    return {
      passed: false,
      error: 'MIN_SYMPTOMS',
    };
  }
  return { passed: true };
}

/**
 * Full preprocessing pipeline – returns normalized + expanded symptoms
 */
function preprocessSymptoms(rawSymptoms: string[]): { symptoms: string[]; gate: { passed: boolean; error?: string } } {
  const normalized = rawSymptoms.map(normalizeSymptom);
  const expanded = normalized.map(expandSynonyms);
  const unique = Array.from(new Set(expanded)).filter(s => s.length > 0);
  const gate = symptomGate(unique);
  return { symptoms: unique, gate };
}

// ── Stage 4: Confidence Label Mapping ─────────────────────────────────────

function getConfidenceLabel(score: number): { label: string; color: string } {
  if (score >= 75) return { label: 'Likely match', color: 'green' };
  if (score >= 50) return { label: 'Possible match', color: 'amber' };
  if (score >= 30) return { label: 'Low confidence match', color: 'orange' };
  return { label: 'Weak signal only', color: 'red' };
}

/**
 * Coarse strength band for a candidate.
 *
 * Measured top-1 accuracy on a fixed case battery is ~45%, so a figure like
 * "40.7%" implies a calibrated probability this system does not have. Bands
 * communicate the ordering without inventing precision.
 */
function getStrengthBand(score: number): string {
  if (score >= 55) return 'Strong';
  if (score >= 40) return 'Moderate';
  if (score >= 28) return 'Weak';
  return 'Very weak';
}

// ── Helper: Call ML Service ───────────────────────────────────────────────

async function callMLService(symptoms: string[]): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`ML service unavailable: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log('ML service response received successfully');
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('ML service call timed out after 8 seconds');
    } else {
      console.warn('ML service call failed:', error.message);
    }
    return null;
  }
}

router.post('/extract', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || typeof symptoms !== 'string') {
      return res.status(400).json({ error: 'Symptoms text is required' });
    }

    const result = await llmService.extractSymptoms(symptoms);

    res.json({
      symptoms_found: result.symptoms,
      severity: result.severity,
      duration: result.duration,
    });
  } catch (error: any) {
    console.error('Extract symptoms error:', error);
    res.status(500).json({ error: error.message || 'Failed to extract symptoms' });
  }
});

router.post('/followup', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: 'Symptoms array is required' });
    }

    const questions = await llmService.generateFollowUpQuestions(symptoms);

    res.json({ questions });
  } catch (error: any) {
    console.error('Generate follow-up error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate follow-up questions' });
  }
});

router.post('/diagnose', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { symptoms, answers } = req.body;

    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: 'Symptoms array is required' });
    }

    const followUpAnswers = answers || [];

    // ── Stage 1: Symptom Preprocessing & Gate ─────────────────────────────
    const { symptoms: processedSymptoms, gate } = preprocessSymptoms(symptoms);

    if (!gate.passed) {
      return res.status(400).json({
        error: gate.error,
        message: 'Please add at least 3 symptoms for a reliable result.',
        symptom_count: processedSymptoms.length,
        gate_passed: false,
      });
    }

    // ── Stage 2: ML Prediction ─────────────────────────────────────────────
    const mlResult = await callMLService(processedSymptoms);

    let mlEnsemble: any = null;
    let mlModelPredictions: any = null;

    if (mlResult && !mlResult.error) {
      mlEnsemble = mlResult.ensemble_prediction;
      mlModelPredictions = mlResult.model_predictions;
    }

    // Get top candidate diseases from ML for RAG validation. Prefer the
    // ensemble's ranked top_k; fall back to the individual model picks.
    const top3Diseases: string[] = [];

    if (Array.isArray(mlResult?.top_k)) {
      for (const entry of mlResult.top_k) {
        if (entry?.disease && !top3Diseases.includes(entry.disease)) {
          top3Diseases.push(entry.disease);
        }
      }
    } else if (mlEnsemble) {
      top3Diseases.push(mlEnsemble.disease);
    }

    if (mlModelPredictions) {
      const otherDiseases = Object.values(mlModelPredictions)
        .map((m: any) => m.disease)
        .filter((d: string) => d && !top3Diseases.includes(d));
      top3Diseases.push(...otherDiseases);
    }

    // ── Stage 3: RAG Symptom Validation (top 3) ────────────────────────────
    const ragCandidates = ragService.validateTopDiseases(processedSymptoms, top3Diseases);
    const ragValidation = ragCandidates.length > 0 ? ragCandidates[0] : null;
    const ragScore = ragValidation ? ragValidation.rag_score : 0;

    // ── Stage 3B: Gather per-candidate evidence for the top 3 ───────────────
    // The ML ordering is preserved deliberately. Re-ranking these candidates by
    // RAG score was measured to REDUCE top-1 accuracy, because the ML models
    // were trained from the same knowledge base that RAG validates against -
    // the two signals are correlated, so RAG cannot act as an independent
    // corrective. RAG is therefore used to annotate evidence, not to re-order.
    const topK: any[] = Array.isArray(mlResult?.top_k) ? mlResult.top_k.slice(0, 3) : [];
    const candidateEvidence = topK.map((entry: any) => ({
      entry,
      validation: ragService.validateSymptomMatches(processedSymptoms, entry.disease),
    }));

    // ── Stage 2C & 4: Build ML breakdown with dynamic ensemble ──────────────
    let ml_breakdown: any = null;
    let adjusted_ml = 0;
    let model_agreement_level = 'unknown';
    let top_model = 'none';
    let disagreement_penalty_val = 0;
    let dynamic_weights: number[] = [];
    let weighted_ml_raw = 0;

    if (mlEnsemble && mlResult) {
      // Use new ML service response structure
      adjusted_ml = mlResult.adjusted_ml ?? mlResult.weighted_ml_raw ?? mlEnsemble.confidence;
      weighted_ml_raw = mlResult.weighted_ml_raw ?? mlEnsemble.confidence;
      dynamic_weights = mlResult.dynamic_weights ?? [];
      disagreement_penalty_val = mlResult.disagreement_penalty ?? 0;
      model_agreement_level = mlResult.model_agreement_level ?? 'unknown';
      top_model = mlResult.top_model ?? 'unknown';

      ml_breakdown = {
        rf_prob: mlModelPredictions?.random_forest?.confidence ?? 0,
        svm_prob: mlModelPredictions?.svm?.confidence ?? 0,
        nb_prob: mlModelPredictions?.naive_bayes?.confidence ?? 0,
        dynamic_weights: dynamic_weights,
        weighted_ml_raw: Math.round(weighted_ml_raw * 10) / 10,
        disagreement_penalty: Math.round(disagreement_penalty_val * 10) / 10,
        adjusted_ml: Math.round(adjusted_ml * 10) / 10,
        model_agreement_level,
        top_model,
      };
    }

    // ── Stage 4: Adaptive Hybrid Score ─────────────────────────────────────
    let ml_weight = 0.5;
    let rag_weight = 0.5;

    if (adjusted_ml >= 65) {
      ml_weight = 0.75;
      rag_weight = 0.25;
    } else if (adjusted_ml >= 45) {
      ml_weight = 0.65;
      rag_weight = 0.35;
    } else {
      ml_weight = 0.50;
      rag_weight = 0.50;
    }

    let final_confidence = (ml_weight * adjusted_ml) + (rag_weight * ragScore);
    final_confidence = Math.max(0, Math.min(85, final_confidence)); // cap at 85
    final_confidence = Math.round(final_confidence * 10) / 10;

    // ── Stage 4B: Build the ranked differential ─────────────────────────────
    // Measured top-1 accuracy is ~45% but top-5 is ~64%, so the shortlist
    // carries substantially more of the truth than any single answer. Each
    // candidate keeps its ML rank and is scored on the same ML/RAG blend as the
    // headline result, scaled by its standing relative to the top candidate.
    const topProbability = candidateEvidence[0]?.entry?.probability || 0;

    const differential = candidateEvidence.map(({ entry, validation }, index) => {
      const relative = topProbability > 0 ? (entry.probability || 0) / topProbability : 0;
      const candidateMl = adjusted_ml * relative;
      const candidateScore = Math.max(
        0,
        Math.min(85, (ml_weight * candidateMl) + (rag_weight * validation.rag_score))
      );

      return {
        rank: index + 1,
        disease: validation.disease || entry.disease,
        strength: getStrengthBand(candidateScore),
        match_score: Math.round(candidateScore * 10) / 10,
        ml_probability: entry.probability,
        rag_score: validation.rag_score,
        matched_symptoms: validation.matchedSymptoms.slice(0, 8),
        matched_core_symptoms: validation.matchedCoreSymptoms.slice(0, 8),
        missing_core_symptoms: validation.missingCoreSymptoms.slice(0, 8),
        // The signature failure mode of this model: a highly ranked condition
        // whose defining symptoms the patient never reported.
        missing_defining_evidence:
          validation.missingCoreSymptoms.length > 0 &&
          validation.matchedCoreSymptoms.length === 0,
      };
    });

    // ── Determine final disease & prediction source ─────────────────────────
    let finalDisease: string;
    let predictionSource: PredictionSource;
    let llmPrediction: any = null;
    let explanation: string = '';

    if (mlEnsemble && adjusted_ml >= ML_PRIMARY_THRESHOLD) {
      // ML primary path. The explanation covers the whole shortlist rather than
      // defending the top pick, which previously produced a confident clinical
      // narrative for a condition whose defining symptoms were absent.
      finalDisease = mlEnsemble.disease;
      predictionSource = 'ml_primary';
      explanation = await llmService.generateDifferentialExplanation(
        differential.map(c => ({
          disease: c.disease,
          strength: c.strength,
          matched: c.matched_symptoms,
          missingCore: c.missing_core_symptoms,
        })),
        processedSymptoms,
        EXPLANATION_TIMEOUT_MS
      );
    } else if (ragValidation && ragScore >= RAG_PRIMARY_THRESHOLD) {
      // RAG primary path (ML uncertain but RAG has strong symptom match)
      finalDisease = ragValidation.disease;
      predictionSource = 'rag_primary';
      final_confidence = Math.min(final_confidence, ragScore);
      explanation = await llmService.generateExplanation(
        finalDisease,
        processedSymptoms,
        EXPLANATION_TIMEOUT_MS
      );
    } else {
      // LLM fallback: neither ML nor RAG is confident, so ask the model to
      // reason over the symptoms directly rather than giving up outright.
      llmPrediction = await llmService.generatePrediction(
        processedSymptoms,
        followUpAnswers,
        PREDICTION_TIMEOUT_MS
      );

      if (llmPrediction && llmPrediction.confidence > 0 && llmPrediction.disease !== 'Unable to determine') {
        finalDisease = llmPrediction.disease;
        predictionSource = 'llm_fallback';
        // The LLM is the weakest of the three signals; keep its confidence
        // below the band where ML/RAG results live.
        final_confidence = Math.round(Math.min(llmPrediction.confidence, 45) * 10) / 10;
        explanation = llmPrediction.explanation;
      } else {
        finalDisease = 'Unknown Condition';
        final_confidence = 20;
        predictionSource = 'fallback';
        explanation = `Unable to make a confident diagnosis from the provided symptoms. Please consult a healthcare provider for proper evaluation.

Symptoms reported: ${processedSymptoms.join(', ')}

Common causes of these symptoms can vary widely, and professional medical evaluation is necessary.`;
      }
    }

    const { label: confidence_label, color: confidence_color } = getConfidenceLabel(final_confidence);

    // ── Build all predictions list ──────────────────────────────────────────
    const allPredictions: any[] = [];

    if (mlEnsemble && adjusted_ml >= ML_PRIMARY_THRESHOLD) {
      allPredictions.push({
        disease: mlEnsemble.disease,
        confidence: Math.round(adjusted_ml * 10) / 10,
        source: 'ml_ensemble',
        used_in_final: mlEnsemble.disease === finalDisease,
      });
    }

    if (llmPrediction) {
      allPredictions.push(...llmPrediction.allPredictions.map((p: any) => ({
        disease: p.disease,
        confidence: p.confidence,
        source: 'llm_fallback',
        used_in_final: p.disease === finalDisease,
      })));
    }

    // Add RAG candidates as predictions
    for (const cand of ragCandidates) {
      if (!allPredictions.some(p => p.disease === cand.disease)) {
        allPredictions.push({
          disease: cand.disease,
          confidence: Math.round(cand.rag_score * 10) / 10,
          source: 'rag_validation',
          used_in_final: cand.disease === finalDisease,
        });
      }
    }

    // ── Build RAG breakdown ─────────────────────────────────────────────────
    const rag_breakdown = ragValidation
      ? {
          rag_score: ragScore,
          score: ragScore,
          matched: ragValidation.matched,
          missing: ragValidation.missing,
          matchedSymptoms: ragValidation.matched,
          missingSymptoms: ragValidation.missing,
          red_flags_present: ragValidation.red_flags_present,
          red_flags_missing: ragValidation.red_flags_missing,
        }
      : null;

    // ── Build ML breakdown additions ───────────────────────────────────────
    if (!ml_breakdown) {
      ml_breakdown = {
        rf_prob: 0, svm_prob: 0, nb_prob: 0,
        dynamic_weights: [],
        weighted_ml_raw: 0,
        disagreement_penalty: 0,
        adjusted_ml: 0,
        model_agreement_level: 'unavailable',
        top_model: 'none',
      };
    }

    // ── Build Methodology Explanation ───────────────────────────────────────
    // These strings are reported to the client, so they must describe what
    // actually ran rather than what the pipeline is capable of running.
    let methodsUsed: string[];
    let primaryMethod: string;
    let methodologyExplanation: string;

    if (predictionSource === 'ml_primary') {
      methodsUsed = ['ml', 'rag', 'llm'];
      primaryMethod = 'ml';
      methodologyExplanation = `Diagnosis generated primarily through ML ensemble analysis (${adjusted_ml.toFixed(1)}% calibrated confidence) and validated by symptom matching (${ragScore.toFixed(1)}%). Final hybrid confidence: ${final_confidence.toFixed(1)}%.`;
    } else if (predictionSource === 'rag_primary') {
      methodsUsed = ['rag', 'llm'];
      primaryMethod = 'rag';
      methodologyExplanation = `Diagnosis based on strong symptom-to-disease matching (${ragScore.toFixed(1)}%) when ML confidence was low (${adjusted_ml.toFixed(1)}%). Final hybrid confidence: ${final_confidence.toFixed(1)}%.`;
    } else if (predictionSource === 'llm_fallback') {
      methodsUsed = ['llm', 'rag'];
      primaryMethod = 'llm';
      methodologyExplanation = mlEnsemble
        ? `ML predicted "${mlEnsemble.disease}" at ${adjusted_ml.toFixed(1)}% and symptom matching reached ${ragScore.toFixed(1)}%, both below the confidence thresholds. Diagnosis from LLM clinical reasoning.`
        : `ML service unavailable. Diagnosis from LLM clinical reasoning.`;
    } else {
      methodsUsed = ['llm', 'rag'];
      primaryMethod = 'none';
      methodologyExplanation = mlEnsemble
        ? `No method reached a usable confidence level (ML ${adjusted_ml.toFixed(1)}%, symptom match ${ragScore.toFixed(1)}%, LLM reasoning inconclusive). No diagnosis was made.`
        : `ML service unavailable and LLM reasoning was inconclusive. No diagnosis was made.`;
    }

    // ── Safety ───────────────────────────────────────────────────────────────
    const safety = {
      disclaimer: 'This is not a medical diagnosis. Consult a doctor.',
      recommend_doctor: final_confidence < 70,
      symptom_count: processedSymptoms.length,
      gate_passed: true,
    };

    // ── Final Response ───────────────────────────────────────────────────────
    const finalPrediction = {
      top_result: {
        disease: finalDisease,
        final_confidence,
        confidence_label,
        confidence_color,
        strength: getStrengthBand(final_confidence),
        missing_defining_evidence: differential[0]?.missing_defining_evidence ?? false,
        missing_core_symptoms: differential[0]?.missing_core_symptoms ?? [],
      },
      // Ranked shortlist. Top-1 accuracy is ~45% but top-5 is ~64%, so clients
      // should present this list rather than the single top_result.
      differential,
      ml_breakdown,
      rag_breakdown,
      hybrid_weights_used: { ml_weight, rag_weight },
      safety,
      candidates: ragCandidates.map(c => ({
        disease: c.disease,
        rag_score: c.rag_score,
        matched: c.matched,
        missing: c.missing,
      })),
      // Backwards-compatible legacy fields
      disease: finalDisease,
      confidence: final_confidence,
      all_predictions: allPredictions,
      explanation,
      explanation_pending: false,
      symptoms_found: processedSymptoms,
      prediction_source: predictionSource,
      ml_available: !!mlEnsemble,
      ml_confidence: Math.round(adjusted_ml * 10) / 10,
      ml_disease: mlEnsemble?.disease ?? null,
      ml_used: predictionSource === 'ml_primary',
      symptom_match_score: ragScore,
      rag_validation: ragValidation,
      rag_context_preview: ragCandidates.length > 0
        ? `Matched ${ragCandidates.length} diseases.`
        : 'No RAG matches found',
      methodology: {
        primary_method: primaryMethod,
        methods_used: methodsUsed,
        ml_models_used: ml_breakdown,
        explanation: methodologyExplanation,
        decision_path: [],
      },
    };

    res.json(finalPrediction);
  } catch (error: any) {
    console.error('Diagnosis error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate diagnosis' });
  }
});

router.get('/diseases', async (req: AuthRequest, res: Response) => {
  try {
    const diseases = ragService.getAllDiseases();
    res.json({ diseases });
  } catch (error: any) {
    console.error('Get diseases error:', error);
    res.status(500).json({ error: 'Failed to fetch diseases' });
  }
});

router.get('/disease/:name', async (req: AuthRequest, res: Response) => {
  try {
    const name = String(req.params.name);
    const info = ragService.getDiseaseInfo(name);
    
    if (!info) {
      return res.status(404).json({ error: 'Disease not found' });
    }
    
    res.json(info);
  } catch (error: any) {
    console.error('Get disease info error:', error);
    res.status(500).json({ error: 'Failed to fetch disease info' });
  }
});

router.get('/health', async (req: AuthRequest, res: Response) => {
  try {
    const ollamaHealth = await llmService.healthCheck();
    res.json({
      status: 'ok',
      ollama: ollamaHealth ? 'connected' : 'disconnected',
    });
  } catch (error: any) {
    res.json({
      status: 'ok',
      ollama: 'disconnected',
    });
  }
});

export default router;