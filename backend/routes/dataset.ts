import { Router, Response } from 'express';
import { datasetService } from '../services/dataset.service.js';

const router = Router();

/**
 * GET /api/datasets/stats
 * Returns aggregate statistics across all 3 datasets
 */
router.get('/stats', (req, res) => {
  try {
    const stats = datasetService.getAllDatasetStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Dataset stats error:', error);
    res.status(500).json({ error: 'Failed to load dataset statistics' });
  }
});

/**
 * GET /api/datasets/diseases
 * Returns a list of all unique diseases found in the datasets
 * with optional filtering
 */
router.get('/diseases', (req, res) => {
  try {
    const { limit, offset, search } = req.query;
    const diseases = datasetService.getAllDatasetDiseases();

    let result = diseases;

    // Search filter
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q));
    }

    // Sort alphabetically
    result = result.sort((a, b) => a.name.localeCompare(b.name));

    // Pagination
    const start = parseInt((offset as string) || '0', 10);
    const count = parseInt((limit as string) || String(result.length), 10);
    const paginated = result.slice(start, start + count);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total: result.length,
        offset: start,
        limit: count,
        hasMore: start + count < result.length,
      },
    });
  } catch (error) {
    console.error('Dataset diseases error:', error);
    res.status(500).json({ error: 'Failed to load diseases list' });
  }
});

/**
 * GET /api/datasets/disease/:name
 * Returns detailed profile for a specific disease
 */
router.get('/disease/:name', (req, res) => {
  try {
    const { name } = req.params;
    const profile = datasetService.getDiseaseProfile(name);

    if (!profile) {
      return res.status(404).json({
        error: `Disease "${name}" not found in datasets`,
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Disease profile error:', error);
    res.status(500).json({ error: 'Failed to load disease profile' });
  }
});

/**
 * POST /api/datasets/query-symptoms
 * Finds diseases matching the provided symptoms
 * Body: { symptoms: string[] }
 */
router.post('/query-symptoms', (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        error: 'Please provide a non-empty symptoms array',
      });
    }

    const matches = datasetService.findDiseaseBySymptoms(symptoms);

    res.json({
      success: true,
      data: matches,
      query: {
        symptoms,
        matchCount: matches.length,
      },
    });
  } catch (error) {
    console.error('Query symptoms error:', error);
    res.status(500).json({ error: 'Failed to query diseases by symptoms' });
  }
});

/**
 * GET /api/datasets/heart-profile
 * Returns aggregated heart disease risk profile from heart.csv
 */
router.get('/heart-profile', (req, res) => {
  try {
    const profile = datasetService.loadHeartProfile();

    if (!profile) {
      return res.status(404).json({
        error: 'Heart dataset not loaded',
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Heart profile error:', error);
    res.status(500).json({ error: 'Failed to load heart profile' });
  }
});

/**
 * GET /api/datasets/diabetes-profile
 * Returns aggregated diabetes risk profile from diabetes.csv
 */
router.get('/diabetes-profile', (req, res) => {
  try {
    const profile = datasetService.loadDiabetesProfile();

    if (!profile) {
      return res.status(404).json({
        error: 'Diabetes dataset not loaded',
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Diabetes profile error:', error);
    res.status(500).json({ error: 'Failed to load diabetes profile' });
  }
});

/**
 * POST /api/datasets/heart-assess
 * Assess heart disease risk based on provided vitals
 * Body: { age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak }
 */
router.post('/heart-assess', (req, res) => {
  try {
    const {
      age,
      sex,
      cp,
      trestbps,
      chol,
      fbs,
      restecg,
      thalach,
      exang,
      oldpeak,
    } = req.body;

    const profile = datasetService.loadHeartProfile();
    if (!profile) {
      return res.status(404).json({ error: 'Heart dataset not loaded' });
    }

    // Determine which group this patient would belong to
    const target =
      age > profile.riskAgeMean ||
      trestbps > profile.riskTrestbpsMean ||
      chol > profile.riskCholMean ||
      oldpeak > profile.riskOldpeakMean
        ? 1
        : 0;

    const matchedStats = target === 1 ? profile.riskGroup : profile.noRiskGroup;

    // Calculate relative risk
    const relativeRisk =
      profile.totalRecords > 0
        ? parseFloat(
            (
              (target === 1 ? profile.riskCount : profile.noRiskCount) /
              profile.totalRecords
            ).toFixed(4)
          )
        : 0;

    res.json({
      success: true,
      data: {
        estimatedRisk: target === 1 ? 'high' : 'low',
        relativeRisk,
        matchedGroupStats: matchedStats,
        datasetReference: {
          riskCount: profile.riskCount,
          noRiskCount: profile.noRiskCount,
          totalRecords: profile.totalRecords,
        },
        input: {
          age,
          sex,
          cp,
          trestbps,
          chol,
          fbs,
          restecg,
          thalach,
          exang,
          oldpeak,
        },
      },
    });
  } catch (error) {
    console.error('Heart assess error:', error);
    res.status(500).json({ error: 'Failed to assess heart risk' });
  }
});

/**
 * POST /api/datasets/diabetes-assess
 * Assess diabetes risk based on provided values
 * Body: { pregnancies, glucose, bloodPressure, skinThickness, insulin, bmi, diabetesPedigreeFunction, age }
 */
router.post('/diabetes-assess', (req, res) => {
  try {
    const {
      pregnancies,
      glucose,
      bloodPressure,
      skinThickness,
      insulin,
      bmi,
      diabetesPedigreeFunction,
      age,
    } = req.body;

    const profile = datasetService.loadDiabetesProfile();
    if (!profile) {
      return res.status(404).json({ error: 'Diabetes dataset not loaded' });
    }

    // Determine estimated risk based on profile means
    const target =
      glucose > profile.riskGlucoseMean ||
      bmi > profile.riskBmiMean ||
      age > profile.riskAgeMean ||
      insulin > profile.riskInsulinMean ||
      diabetesPedigreeFunction > profile.riskPedigreeMean
        ? 1
        : 0;

    const matchedStats =
      target === 1 ? profile.diabetesGroup : profile.noDiabetesGroup;

    const relativeRisk =
      profile.totalRecords > 0
        ? parseFloat(
            (
              (target === 1 ? profile.diabetesCount : profile.noDiabetesCount) /
              profile.totalRecords
            ).toFixed(4)
          )
        : 0;

    res.json({
      success: true,
      data: {
        estimatedRisk: target === 1 ? 'high' : 'low',
        relativeRisk,
        matchedGroupStats: matchedStats,
        datasetReference: {
          diabetesCount: profile.diabetesCount,
          noDiabetesCount: profile.noDiabetesCount,
          totalRecords: profile.totalRecords,
        },
        input: {
          pregnancies,
          glucose,
          bloodPressure,
          skinThickness,
          insulin,
          bmi,
          diabetesPedigreeFunction,
          age,
        },
      },
    });
  } catch (error) {
    console.error('Diabetes assess error:', error);
    res.status(500).json({ error: 'Failed to assess diabetes risk' });
  }
});

export default router;

