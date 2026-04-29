import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import * as llmService from '../services/llm.service.js';
import * as ragService from '../services/rag.service.js';

const router = Router();

// ML Service configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

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
const SYMPTOM_SYNONYMS: Record<string, string[]> = {
  headache: ['cephalgia', 'head pain', 'head hurts', 'migraine'],
  rash: ['skin rash', 'eruption', 'itchy rash', 'blisters'],
  fever: ['temperature', 'hot body', 'high temperature'],
  'runny nose': ['stuffy nose', 'blocked nose', 'nasal congestion'],
  'sore throat': ['throat pain'],
  cough: ['coughing'],
  nausea: ['nauseous'],
  vomiting: ['vomit', 'throwing up'],
  diarrhea: ['loose stool'],
  'abdominal pain': ['stomach pain', 'stomach ache', 'abdomen pain'],
  'shortness of breath': ['breathing trouble', 'difficulty breathing', 'breathless'],
  'chest pain': ['chest tightness'],
  'body aches': ['body pain', 'muscle pain', 'muscle ache'],
  fatigue: ['tired', 'weakness', 'weak', 'extreme fatigue'],
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

// ── Helper: Call ML Service ───────────────────────────────────────────────

async function callMLService(symptoms: string[]): Promise<any> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms }),
    });

    if (!response.ok) {
      console.warn(`ML service unavailable: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn('ML service call failed:', error);
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

    // Get top 3 diseases from ML for RAG validation
    const top3Diseases: string[] = mlEnsemble
      ? [mlEnsemble.disease]
      : [];

    // Also include other model predictions if they differ
    if (mlModelPredictions) {
      const otherDiseases = Object.values(mlModelPredictions)
        .map((m: any) => m.disease)
        .filter((d: string) => d !== top3Diseases[0] && !top3Diseases.includes(d));
      top3Diseases.push(...otherDiseases.slice(0, 2));
    }

    // ── Stage 3: RAG Symptom Validation (top 3) ────────────────────────────
    const ragCandidates = ragService.validateTopDiseases(processedSymptoms, top3Diseases);
    const ragValidation = ragCandidates.length > 0 ? ragCandidates[0] : null;

    const ragScore = ragValidation?.rag_score ?? 0;

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

    const { label: confidence_label, color: confidence_color } = getConfidenceLabel(final_confidence);

    // ── Determine final disease & prediction source ─────────────────────────
    let finalDisease: string;
    let predictionSource: 'ml_primary' | 'llm_fallback' | 'rag_primary';
    let llmPrediction: any = null;
    let explanation: string = '';

    if (mlEnsemble && adjusted_ml >= 30) {
      // ML primary path
      finalDisease = mlEnsemble.disease;
      predictionSource = 'ml_primary';

      try {
        explanation = await llmService.generateExplanation(finalDisease, processedSymptoms);
      } catch (err) {
        console.error('Error generating explanation:', err);
        explanation = `${finalDisease} is a possible diagnosis based on your symptoms.`;
      }
     } else if (ragValidation && ragScore >= 40) {
       // RAG primary path (ML uncertain but RAG has strong match)
       finalDisease = ragValidation.disease;
       predictionSource = 'rag_primary';
       final_confidence = Math.min(final_confidence, ragScore);

      try {
        explanation = await llmService.generateExplanation(finalDisease, processedSymptoms);
      } catch (err) {
        console.error('Error generating explanation:', err);
        explanation = `${finalDisease} is a possible diagnosis based on your symptoms.`;
      }
    } else {
      // LLM fallback
      const llmResult = await llmService.generatePrediction(processedSymptoms, followUpAnswers);
      llmPrediction = {
        disease: llmResult.disease,
        confidence: llmResult.confidence,
        allPredictions: llmResult.allPredictions,
        explanation: llmResult.explanation,
      };
      finalDisease = llmResult.disease;
      final_confidence = Math.min(final_confidence, llmResult.confidence);
      predictionSource = 'llm_fallback';
      explanation = llmResult.explanation;
    }

    // ── Build all predictions list ──────────────────────────────────────────
    const allPredictions: any[] = [];

    if (mlEnsemble && adjusted_ml >= 30) {
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
    let methodsUsed: string[] = ['llm'];
    let primaryMethod = 'llm';
    let methodologyExplanation = '';

    if (predictionSource === 'ml_primary') {
      methodsUsed.push('ml', 'rag');
      primaryMethod = 'ml';
      methodologyExplanation = `Diagnosis generated primarily through ML ensemble analysis (${adjusted_ml.toFixed(1)}% confidence) and validated by symptom matching (${ragScore.toFixed(1)}%). Final hybrid confidence: ${final_confidence.toFixed(1)}%.`;
    } else if (predictionSource === 'rag_primary') {
      methodsUsed.push('rag');
      primaryMethod = 'rag';
      methodologyExplanation = `Diagnosis based on strong symptom-to-disease matching (${ragScore.toFixed(1)}%) when ML confidence was low. Final hybrid confidence: ${final_confidence.toFixed(1)}%.`;
    } else {
      methodsUsed = ['llm', 'rag'];
      primaryMethod = 'llm';
      methodologyExplanation = mlEnsemble
        ? `ML predicted "${mlEnsemble.disease}" with ${adjusted_ml.toFixed(1)}% confidence but was deprioritized. Diagnosis from LLM clinical reasoning.`
        : `ML service unavailable. Diagnosis from LLM clinical reasoning.`;
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
      },
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
    const { name } = req.params;
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