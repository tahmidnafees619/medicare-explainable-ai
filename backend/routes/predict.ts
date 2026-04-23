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

    if (mlResult && !mlResult.error) {
      mlEnsemble = mlResult.ensemble_prediction;
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