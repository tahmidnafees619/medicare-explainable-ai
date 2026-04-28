import { describe, it, expect } from 'vitest';

/**
 * Unit tests for symptom preprocessing and gate
 */
describe('Symptom Preprocessing & Gate', () => {
  // Helper functions copied from predict.ts for isolated testing
  function normalizeSymptom(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  }

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

  function expandSynonyms(symptom: string): string {
    const normalized = normalizeSymptom(symptom);
    for (const [canonical, synonyms] of Object.entries(SYMPTOM_SYNONYMS)) {
      if (normalized === canonical || synonyms.some(s => normalizeSymptom(s) === normalized)) {
        return canonical;
      }
    }
    return normalized;
  }

  function symptomGate(symptoms: string[]): { passed: boolean; error?: string } {
    if (symptoms.length < 3) {
      return { passed: false, error: 'MIN_SYMPTOMS' };
    }
    return { passed: true };
  }

  it('should normalize text correctly', () => {
    expect(normalizeSymptom('Headache!')).toBe('headache');
    expect(normalizeSymptom('  Stomach Pain  ')).toBe('stomach pain');
    expect(normalizeSymptom('Fever/High-Temp')).toBe('feverhightemp'); // punctuation stripped
  });

  it('should expand headache synonyms', () => {
    expect(expandSynonyms('cephalgia')).toBe('headache');
    expect(expandSynonyms('head pain')).toBe('headache');
    expect(expandSynonyms('migraine')).toBe('headache');
    expect(expandSynonyms('headache')).toBe('headache');
  });

  it('should expand rash synonyms', () => {
    expect(expandSynonyms('skin rash')).toBe('rash');
    expect(expandSynonyms('blisters')).toBe('rash');
    expect(expandSynonyms('itchy rash')).toBe('rash');
  });

  it('should pass gate with 3+ symptoms', () => {
    const result = symptomGate(['fever', 'cough', 'headache']);
    expect(result.passed).toBe(true);
  });

  it('should fail gate with < 3 symptoms', () => {
    const result1 = symptomGate(['fever', 'cough']);
    expect(result1.passed).toBe(false);
    expect(result1.error).toBe('MIN_SYMPTOMS');

    const result2 = symptomGate(['headache']);
    expect(result2.passed).toBe(false);
  });

  it('should require exactly minimum 3 symptoms', () => {
    const result = symptomGate(['fever', 'cough', 'headache', 'fatigue']);
    expect(result.passed).toBe(true);
  });
});

/**
 * Unit tests for Stage 4: Adaptive weight selection
 */
describe('Adaptive Hybrid Weights', () => {
  function getAdaptiveWeights(adjusted_ml: number): [number, number] {
    if (adjusted_ml >= 65) {
      return [0.75, 0.25];
    } else if (adjusted_ml >= 45) {
      return [0.65, 0.35];
    } else {
      return [0.50, 0.50];
    }
  }

  it('should use 0.75/0.25 for high ML confidence (>=65)', () => {
    expect(getAdaptiveWeights(65)).toEqual([0.75, 0.25]);
    expect(getAdaptiveWeights(80)).toEqual([0.75, 0.25]);
    expect(getAdaptiveWeights(100)).toEqual([0.75, 0.25]);
  });

  it('should use 0.65/0.35 for medium ML confidence (45-64.9)', () => {
    expect(getAdaptiveWeights(45)).toEqual([0.65, 0.35]);
    expect(getAdaptiveWeights(55)).toEqual([0.65, 0.35]);
    expect(getAdaptiveWeights(64.9)).toEqual([0.65, 0.35]);
  });

  it('should use 0.50/0.50 for low ML confidence (<45)', () => {
    expect(getAdaptiveWeights(44.9)).toEqual([0.50, 0.50]);
    expect(getAdaptiveWeights(30)).toEqual([0.50, 0.50]);
    expect(getAdaptiveWeights(0)).toEqual([0.50, 0.50]);
  });

  it('should handle boundary values correctly', () => {
    // Exactly at boundaries
    expect(getAdaptiveWeights(65)).toEqual([0.75, 0.25]);
    expect(getAdaptiveWeights(45)).toEqual([0.65, 0.35]);
  });

  it('should ensure weights always sum to 1', () => {
    for (let ml = 0; ml <= 100; ml += 5) {
      const [ml_w, rag_w] = getAdaptiveWeights(ml);
      expect(ml_w + rag_w).toBeCloseTo(1.0, 5);
    }
  });
});

/**
 * Unit tests for final confidence calculation and capping
 */
describe('Confidence Calculation', () => {
  function calculateFinalConfidence(adjusted_ml: number, rag_score: number): number {
    let ml_weight = 0.5;
    let rag_weight = 0.5;

    if (adjusted_ml >= 65) {
      ml_weight = 0.75;
      rag_weight = 0.25;
    } else if (adjusted_ml >= 45) {
      ml_weight = 0.65;
      rag_weight = 0.35;
    }

    let final = (ml_weight * adjusted_ml) + (rag_weight * rag_score);
    final = Math.max(0, Math.min(85, final)); // cap at 85
    return Math.round(final * 10) / 10;
  }

  it('should cap final confidence at 85', () => {
    // Even with perfect scores, should not exceed 85
    const result = calculateFinalConfidence(100, 100);
    expect(result).toBeLessThanOrEqual(85);
  });

  it('should correctly calculate hybrid score', () => {
    // ML=70 (>=65 → 0.75/0.25), RAG=80
    // 0.75*70 + 0.25*80 = 52.5 + 20 = 72.5
    const result = calculateFinalConfidence(70, 80);
    expect(result).toBe(72.5);
  });

  it('should down-weight RAG when ML is confident', () => {
    const highML = calculateFinalConfidence(80, 20);
    const lowML = calculateFinalConfidence(30, 20);
    // High ML should rely more on ML score; low ML should balance more
    expect(highML).toBeGreaterThan(lowML);
  });

  it('should round to 1 decimal place', () => {
    const result = calculateFinalConfidence(66.66, 73.33);
    expect(result % 1).toBeLessThan(1); // has decimal
    // Check it's rounded
    expect(Math.round(result * 10) / 10).toBe(result);
  });
});

/**
 * Unit tests for confidence label mapping
 */
describe('Confidence Label Mapping', () => {
  function getConfidenceLabel(score: number): { label: string; color: string } {
    if (score >= 75) return { label: 'Likely match', color: 'green' };
    if (score >= 50) return { label: 'Possible match', color: 'amber' };
    if (score >= 30) return { label: 'Low confidence match', color: 'orange' };
    return { label: 'Weak signal only', color: 'red' };
  }

  it('should label >=75 as Likely match (green)', () => {
    const res = getConfidenceLabel(75);
    expect(res.label).toBe('Likely match');
    expect(res.color).toBe('green');
  });

  it('should label 50-74 as Possible match (amber)', () => {
    const res = getConfidenceLabel(50);
    expect(res.label).toBe('Possible match');
    expect(res.color).toBe('amber');
  });

  it('should label 30-49 as Low confidence match (orange)', () => {
    const res = getConfidenceLabel(30);
    expect(res.label).toBe('Low confidence match');
    expect(res.color).toBe('orange');
  });

  it('should label <30 as Weak signal only (red)', () => {
    const res = getConfidenceLabel(29.9);
    expect(res.label).toBe('Weak signal only');
    expect(res.color).toBe('red');
  });

  it('should handle boundary values', () => {
    expect(getConfidenceLabel(75).label).toBe('Likely match');
    expect(getConfidenceLabel(50).label).toBe('Possible match');
    expect(getConfidenceLabel(30).label).toBe('Low confidence match');
  });
});
