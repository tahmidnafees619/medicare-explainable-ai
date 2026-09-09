import { describe, it, expect } from 'vitest';
import { jaroWinklerSimilarity, validateSymptomMatches } from '../../backend/services/rag.service';

/**
 * Regression tests for the Jaro-Winkler implementation used by RAG symptom
 * matching.
 *
 * The transposition loop previously advanced `i` with an unbounded
 * `while (!matches2[i]) i++;`. Once `i` passed the end of `matches2` every read
 * returned `undefined`, so the loop never terminated. Real symptom pairs hit
 * this (e.g. "sharp abdominal pain" vs "cough"), which is why RAG validation
 * had been commented out of the diagnosis route to "avoid hanging".
 *
 * Each test below is bounded by vitest's timeout, so a regression fails the
 * suite instead of hanging the run forever.
 */
describe('jaroWinklerSimilarity', () => {
  // These exact pairs hung the previous implementation.
  const previouslyHanging: Array<[string, string]> = [
    ['wxyzahijklm', 'abcd'],
    ['sharp abdominal pain', 'cough'],
    ['pain during pregnancy', 'fever'],
    ['difficulty in swallowing', 'acne'],
  ];

  it.each(previouslyHanging)('terminates for %s vs %s', (a, b) => {
    const score = jaroWinklerSimilarity(a, b);
    expect(Number.isFinite(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  }, 5000);

  it('returns 1 for identical strings', () => {
    expect(jaroWinklerSimilarity('fever', 'fever')).toBeCloseTo(1, 5);
  });

  it('returns 0 when there is no overlap at all', () => {
    expect(jaroWinklerSimilarity('abc', 'xyz')).toBe(0);
  });

  it('handles empty input', () => {
    expect(jaroWinklerSimilarity('', '')).toBe(1);
    expect(jaroWinklerSimilarity('fever', '')).toBe(0);
  });

  it('counts transpositions rather than ignoring them', () => {
    // "martha"/"marhta" is the canonical Jaro-Winkler example: one
    // transposition gives 0.961. The old code always used transCount = 0,
    // which inflated this to 0.9778.
    expect(jaroWinklerSimilarity('martha', 'marhta')).toBeCloseTo(0.961, 3);
  });

  it('scores near-identical symptom wording above the 0.7 match threshold', () => {
    expect(jaroWinklerSimilarity('headache', 'head ache')).toBeGreaterThan(0.7);
  });
});

describe('validateSymptomMatches', () => {
  it('completes and scores a known disease without hanging', () => {
    const result = validateSymptomMatches(
      ['headache', 'fever', 'stiff neck'],
      'Meningitis'
    );
    expect(result.disease).toBeTruthy();
    expect(result.rag_score).toBeGreaterThanOrEqual(0);
    expect(result.rag_score).toBeLessThanOrEqual(100);
  }, 10000);

  it('returns a zero score for a disease that is not in the knowledge base', () => {
    const result = validateSymptomMatches(['fever'], 'Definitely Not A Real Disease XYZ');
    expect(result.rag_score).toBe(0);
  }, 10000);
});
