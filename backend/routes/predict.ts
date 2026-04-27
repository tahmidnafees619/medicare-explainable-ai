import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import * as llmService from '../services/llm.service.js';
import * as ragService from '../services/rag.service.js';

const router = Router();

// ML Service configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

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

    // ── STEP 1: ML Prediction (fast, deterministic) ──────────────
    const mlResult = await callMLService(symptoms);

    let mlEnsemble: { disease: string; confidence: number } | null = null;
    let mlModelPredictions: any = null;

    if (mlResult && !mlResult.error) {
      mlEnsemble = mlResult.ensemble_prediction;
      mlModelPredictions = mlResult.model_predictions;
    }

    // ── STEP 2: RAG Symptom Validation ────────────────────────────
    const ragResults = ragService.searchDiseases(symptoms);
    const ragSymptomMatches = mlEnsemble
      ? ragService.validateSymptomMatches(symptoms, mlEnsemble.disease)
      : 0;

    // ── STEP 3: Decision Gate ─────────────────────────────────────
    // Use ML if: confidence >= 70%, not "Other / Rare Disease", and RAG validates symptom matches
    let useML = false;
    if (mlEnsemble) {
      const mlDisease = mlEnsemble.disease;
      const mlConfidence = mlEnsemble.confidence;

      if (mlConfidence >= 70 && mlDisease !== 'Other / Rare Disease' && ragSymptomMatches > 0) {
        useML = true;
        console.log(`ML primary check: ${mlDisease} @ ${mlConfidence.toFixed(1)}% confidence, ${ragSymptomMatches} symptom matches — ACCEPTED`);
      } else {
        console.log(`ML primary check: ${mlDisease} @ ${mlConfidence.toFixed(1)}% confidence, ${ragSymptomMatches} symptom matches — REJECTED (fallback to LLM)`);
      }
    }

    // ── STEP 4: Get Prediction & Explanation ──────────────────────
    let finalDisease: string;
    let finalConfidence: number;
    let predictionSource: string;
    let llmPrediction: { disease: string; confidence: number; allPredictions: any[]; explanation: string } | null = null;
    let explanation: string;

    if (useML && mlEnsemble) {
      // FAST PATH: ML primary, LLM explanation only
      finalDisease = mlEnsemble.disease;
      finalConfidence = mlEnsemble.confidence;
      predictionSource = 'ml_primary';

      // Boost confidence if ML is very confident
      if (mlEnsemble.confidence > 85) {
        finalConfidence = Math.min(95, mlEnsemble.confidence + 5);
        predictionSource = 'ml_primary_high_confidence';
      }

      // Always generate explanation via LLM
      explanation = await llmService.generateExplanation(finalDisease, symptoms);
    } else {
      // FALLBACK PATH: LLM prediction + explanation (for unseen patterns / edge cases)
      const llmResult = await llmService.generatePrediction(symptoms, followUpAnswers);
      llmPrediction = {
        disease: llmResult.disease,
        confidence: llmResult.confidence,
        allPredictions: llmResult.allPredictions,
        explanation: llmResult.explanation,
      };

      finalDisease = llmResult.disease;
      finalConfidence = llmResult.confidence;
      predictionSource = 'llm_fallback_unseen_pattern';

      explanation = await llmService.generateExplanation(finalDisease, symptoms);
    }

    // ── STEP 5: Build All Predictions List ────────────────────────
    const allPredictions: any[] = [];

    if (useML && mlEnsemble) {
      allPredictions.push({
        disease: mlEnsemble.disease,
        confidence: mlEnsemble.confidence,
        source: 'ml_ensemble',
        used_in_final: true,
      });
    }

    if (llmPrediction) {
      allPredictions.push(...llmPrediction.allPredictions.map((p: any) => ({
        ...p,
        source: 'llm_fallback',
        used_in_final: true,
      })));
    }

    if (mlEnsemble && !useML) {
      allPredictions.push({
        disease: mlEnsemble.disease,
        confidence: mlEnsemble.confidence,
        source: 'ml_ensemble',
        used_in_final: false,
      });
    }

    // ── STEP 6: Build Methodology Explanation ─────────────────────
    const methodsUsed: Array<'rag' | 'llm' | 'ml'> = [];
    let primaryMethod: 'rag' | 'llm' | 'ml' | 'ensemble';
    let methodologyExplanation = '';

    if (useML && mlEnsemble) {
      methodsUsed.push('ml', 'rag', 'llm');
      primaryMethod = mlEnsemble.confidence > 85 ? 'ml' : 'ensemble';
      methodologyExplanation = `Diagnosis generated primarily through ML ensemble analysis (${mlEnsemble.confidence.toFixed(1)}% confidence). The ML prediction was validated against the medical knowledge base, which confirmed ${ragSymptomMatches} matching symptom(s) for ${mlEnsemble.disease}. A patient-friendly explanation was generated by the LLM.`;
    } else {
      methodsUsed.push('llm', 'rag');
      if (mlEnsemble) methodsUsed.push('ml');
      primaryMethod = 'llm';
      methodologyExplanation = mlEnsemble
        ? `The ML ensemble predicted "${mlEnsemble.disease}" with ${mlEnsemble.confidence.toFixed(1)}% confidence, but this was rejected due to insufficient symptom validation (${ragSymptomMatches} match(es)) or low confidence. The diagnosis was instead generated by LLM clinical reasoning for this less common or unseen symptom pattern.`
        : `Diagnosis generated by LLM clinical reasoning. The ML service was unavailable, so the system relied on AI analysis of the symptom pattern.`;
    }

    // Build ML model breakdown
    let mlModelsBreakdown: any = null;
    if (mlModelPredictions) {
      mlModelsBreakdown = {
        random_forest: {
          disease: mlModelPredictions.random_forest.disease,
          confidence: mlModelPredictions.random_forest.confidence,
          used: useML && mlModelPredictions.random_forest.disease === finalDisease,
        },
        svm: {
          disease: mlModelPredictions.svm.disease,
          confidence: mlModelPredictions.svm.confidence,
          used: useML && mlModelPredictions.svm.disease === finalDisease,
        },
        naive_bayes: {
          disease: mlModelPredictions.naive_bayes.disease,
          confidence: mlModelPredictions.naive_bayes.confidence,
          used: useML && mlModelPredictions.naive_bayes.disease === finalDisease,
        },
      };
    }

    // Build decision path
    const decisionPath: string[] = [];
    if (mlEnsemble) {
      decisionPath.push(`ML ensemble predicted "${mlEnsemble.disease}" with ${mlEnsemble.confidence.toFixed(1)}% confidence`);
      decisionPath.push(`RAG validation found ${ragSymptomMatches} symptom match(es) for "${mlEnsemble.disease}" in medical knowledge base`);
    } else {
      decisionPath.push('ML service unavailable');
    }

    if (useML && mlEnsemble) {
      decisionPath.push(`ML prediction ACCEPTED — fast path used (1 LLM call for explanation only)`);
      if (mlEnsemble.confidence > 85) {
        decisionPath.push('High-confidence ML result — confidence boosted');
      }
    } else {
      decisionPath.push(`ML prediction REJECTED — falling back to LLM prediction + explanation (2 LLM calls)`);
      if (llmPrediction) {
        decisionPath.push(`LLM reasoning identified "${llmPrediction.disease}" with ${llmPrediction.confidence}% confidence`);
      }
    }

    const finalPrediction = {
      disease: finalDisease,
      confidence: finalConfidence,
      all_predictions: allPredictions,
      explanation: explanation || (llmPrediction?.explanation ?? 'No explanation available.'),
      symptoms_found: symptoms,
      prediction_source: predictionSource,
      ml_available: !!mlEnsemble,
      ml_confidence: mlEnsemble?.confidence ?? null,
      ml_disease: mlEnsemble?.disease ?? null,
      ml_used: useML,
      llm_prediction: llmPrediction
        ? { disease: llmPrediction.disease, confidence: llmPrediction.confidence }
        : null,
      rag_context_preview: ragResults.length > 0
        ? `Matched ${ragResults.length} diseases. Top: ${ragResults.slice(0, 3).map(r => r.disease).join(', ')}`
        : 'No RAG matches found',
      methodology: {
        primary_method: primaryMethod,
        methods_used: methodsUsed,
        ml_models_used: mlModelsBreakdown,
        explanation: methodologyExplanation,
        decision_path: decisionPath,
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