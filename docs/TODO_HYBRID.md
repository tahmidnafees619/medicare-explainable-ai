# Hybrid Architecture Implementation TODO

## Architecture: ML Primary + LLM Fallback + LLM Explanation

### Tasks

- [x] Step 0: Analyze current codebase (predict.ts, llm.service.ts, rag.service.ts, ml_service.py)
- [x] Step 1: Create implementation plan
- [x] Step 2: Add `validateSymptomMatches()` to `rag.service.ts`
- [x] Step 3: Refactor `predict.ts` /diagnose endpoint — ML first, LLM prediction fallback, LLM explanation always
- [x] Step 4: Update methodology/decisionPath text to reflect new architecture
- [x] Step 5: Test and verify compilation

## Logic Flow (New /diagnose)

```
1. Call ML service (fast, deterministic)
2. Call RAG searchDiseases() to get symptom matches for ML-predicted disease
3. Compute symptom match count via validateSymptomMatches()
4. DECISION GATE:
   useML = mlConfidence >= 70
           && mlDisease !== 'Other / Rare Disease'
           && ragSymptomMatches > 0
5. If useML (common case ~80%+):
   - finalDisease = mlDisease
   - finalConfidence = mlConfidence (or boosted if >85%)
   - Call LLM generateExplanation() ONLY (1 LLM call)
6. If !useML (edge case / unseen pattern):
   - Call LLM generatePrediction() + generateExplanation() (2 LLM calls)
   - finalDisease = llmPrediction.disease
   - finalConfidence = llmPrediction.confidence
7. Build response with updated methodology, primary_method, decisionPath
```

## Expected Performance
- Common case: LLM calls 2 → 1 (~40-50% latency reduction)
- Edge cases: Same quality (LLM fallback preserves coverage)
- RAG grounding: ML result validated against medical knowledge base

## Test Results

### Test 1: ML Primary Path (acute bronchitis symptoms)
- ML predicted: "acute bronchitis" @ 74.7% confidence
- RAG validation: 3 symptom matches
- Result: ML ACCEPTED → `prediction_source: "ml_primary"`, `ml_used: true`
- LLM calls: 1 (explanation only) ✅
- `llm_prediction: null` ✅

### Test 2: LLM Fallback Path — RAG mismatch (cystitis symptoms)
- ML predicted: "cystitis" @ 70.0% confidence
- RAG validation: 0 symptom matches (disease not in KB)
- Result: ML REJECTED → `prediction_source: "llm_fallback_unseen_pattern"`
- LLM calls: 2 (prediction + explanation) ✅

### Test 3: LLM Fallback Path — low confidence (common cold symptoms)
- ML predicted: "nose disorder" @ 23.3% confidence
- Result: ML REJECTED (below 70% threshold)
- LLM calls: 2 (prediction + explanation) ✅

### Test 4: LLM Fallback Path — low confidence (heart disease symptoms)
- ML predicted: "Heart Disease" @ 25.2% confidence
- RAG validation: 4 symptom matches (would have passed)
- Result: ML REJECTED (confidence below threshold)
- LLM calls: 2 (prediction + explanation) ✅

## Issues Found

1. **Disease name mismatch**: Only 1 disease truly overlaps between ML training data and medical knowledge base ("Heart Disease"). ML diseases like "acute bronchitis" partially match KB "Bronchitis" via substring, but most ML diseases (cystitis, bursitis, etc.) have no KB entry. This limits how often ML primary path triggers.

2. **Low ML confidence**: The trained ML model produces low ensemble confidence for most inputs (< 70%), even for diseases it was trained on. Individual models often disagree (e.g., RF→pneumonia, SVM→esophagitis, NB→Heart Disease), dragging down ensemble averages.

## Recommendations

- Add disease name aliases mapping in `rag.service.ts` to bridge ML↔KB naming gaps
- Consider retraining ML model with more representative symptom text or adjusting the ensemble weighting
- The architecture itself is sound — all paths work correctly


