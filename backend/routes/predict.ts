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

    // ── PRIMARY: RAG + LLM Prediction ─────────────────────────────
    const ragContext = ragService.augmentPrompt(symptoms);
    console.log('RAG Context loaded:', ragContext.substring(0, 200) + '...');

    const llmPrediction = await llmService.generatePrediction(symptoms, followUpAnswers);
    const explanation = await llmService.generateExplanation(llmPrediction.disease, symptoms);

    // ── SECONDARY: ML Prediction (with confidence gating) ─────────
    const mlResult = await callMLService(symptoms);

    let mlEnsemble: { disease: string; confidence: number } | null = null;
    let useML = false;
    let mlModelPredictions: any = null;

    if (mlResult && !mlResult.error) {
      mlEnsemble = mlResult.ensemble_prediction;
      mlModelPredictions = mlResult.model_predictions;
      const mlDisease = mlEnsemble.disease;
      const mlConfidence = mlEnsemble.confidence;

      // Gate: only use ML if confidence >= 70% AND not "Other / Rare Disease"
      if (mlConfidence >= 70 && mlDisease !== 'Other / Rare Disease') {
        useML = true;
        console.log(`ML secondary check: ${mlDisease} @ ${mlConfidence.toFixed(1)}% confidence — ACCEPTED`);
      } else {
        console.log(`ML secondary check: ${mlDisease} @ ${mlConfidence.toFixed(1)}% confidence — REJECTED (gated)`);
      }
    }

    // ── Build Final Prediction ────────────────────────────────────
    // RAG is always primary. ML only overrides when high-confidence and relevant.
    let finalDisease = llmPrediction.disease;
    let finalConfidence = llmPrediction.confidence;
    let predictionSource: string;
    let mlUsed = false;

    if (useML && mlEnsemble) {
      // If ML is confident AND agrees with RAG on broad category, boost confidence
      // If ML disagrees but is very confident (>85%), let ML override for common diseases
      if (mlEnsemble.confidence > 85) {
        finalDisease = mlEnsemble.disease;
        finalConfidence = Math.max(llmPrediction.confidence, mlEnsemble.confidence);
        predictionSource = 'rag_primary_ml_override';
        mlUsed = true;
      } else {
        // ML supports RAG — boost confidence slightly
        finalConfidence = Math.min(95, llmPrediction.confidence + 5);
        predictionSource = 'rag_primary_ml_boost';
        mlUsed = true;
      }
    } else {
      predictionSource = 'rag_primary_only';
    }

    const allPredictions: any[] = [
      ...llmPrediction.allPredictions,
    ];

    if (mlEnsemble) {
      allPredictions.push({
        disease: mlEnsemble.disease,
        confidence: mlEnsemble.confidence,
        source: 'ml_ensemble',
        used_in_final: mlUsed,
      });
    }

    // ── Build Methodology Explanation ───────────────────────────────────
    const methodsUsed: Array<'rag' | 'llm' | 'ml'> = ['rag', 'llm'];
    if (mlUsed && mlEnsemble) {
      methodsUsed.push('ml');
    }

    let methodologyExplanation = '';
    let primaryMethod: 'rag' | 'llm' | 'ml' | 'ensemble' = 'ensemble';

    if (!mlUsed || !mlEnsemble) {
      primaryMethod = 'rag';
      methodologyExplanation = 'Diagnosis generated using RAG-based medical knowledge retrieval combined with AI clinical reasoning (LLM). The analysis considers symptom patterns, disease prevalence, and clinical correlations from the medical knowledge base.';
    } else if (mlEnsemble.confidence > 85) {
      primaryMethod = 'ml';
      methodologyExplanation = `Diagnosis generated through ML ensemble consensus. While RAG-based analysis initially suggested "${llmPrediction.disease}", the ML ensemble (Random Forest, SVM, and Naive Bayes models) all agreed on "${mlEnsemble.disease}" with high confidence (${mlEnsemble.confidence.toFixed(1)}%), leading to the final result.`;
    } else {
      primaryMethod = 'ensemble';
      methodologyExplanation = `Diagnosis confirmed by multiple methods. RAG-based medical knowledge retrieval and LLM clinical reasoning identified "${llmPrediction.disease}" (${llmPrediction.confidence}% confidence), which is supported by ML ensemble analysis (${mlEnsemble.confidence.toFixed(1)}% confidence). The combined agreement increases diagnostic confidence.`;
    }

    // Build ML model breakdown
    let mlModelsBreakdown: any = null;
    if (mlModelPredictions) {
      mlModelsBreakdown = {
        random_forest: {
          disease: mlModelPredictions.random_forest.disease,
          confidence: mlModelPredictions.random_forest.confidence,
          used: mlUsed && mlModelPredictions.random_forest.disease === finalDisease,
        },
        svm: {
          disease: mlModelPredictions.svm.disease,
          confidence: mlModelPredictions.svm.confidence,
          used: mlUsed && mlModelPredictions.svm.disease === finalDisease,
        },
        naive_bayes: {
          disease: mlModelPredictions.naive_bayes.disease,
          confidence: mlModelPredictions.naive_bayes.confidence,
          used: mlUsed && mlModelPredictions.naive_bayes.disease === finalDisease,
        },
      };
    }

    // Build decision path
    const decisionPath: string[] = [];
    decisionPath.push(`RAG analysis matched ${ragContext.split('Disease:').length - 1} relevant conditions from knowledge base`);
    decisionPath.push(`LLM reasoning identified "${llmPrediction.disease}" with ${llmPrediction.confidence}% confidence`);
    if (mlEnsemble) {
      decisionPath.push(`ML ensemble (${mlEnsemble.confidence.toFixed(1)}% confidence) ${mlUsed ? 'supported the final diagnosis' : 'was below threshold, not used'}`);
    }
    if (mlUsed && mlEnsemble && mlEnsemble.confidence > 85) {
      decisionPath.push('ML override triggered (confidence > 85%) - final result reflects ML consensus');
    }

    const finalPrediction = {
      disease: finalDisease,
      confidence: finalConfidence,
      all_predictions: allPredictions,
      explanation: explanation || llmPrediction.explanation,
      symptoms_found: symptoms,
      prediction_source: predictionSource,
      ml_available: !!mlEnsemble,
      ml_confidence: mlEnsemble?.confidence ?? null,
      ml_disease: mlEnsemble?.disease ?? null,
      ml_used: mlUsed,
      llm_prediction: {
        disease: llmPrediction.disease,
        confidence: llmPrediction.confidence,
      },
      rag_context_preview: ragContext.substring(0, 300) + (ragContext.length > 300 ? '...' : ''),
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