# Hybrid RAG+ML Implementation Plan

## Goal: RAG as primary diagnosis, ML as secondary with confidence gating, LLM for explanations

### Steps:
- [x] Step 1: Fix `ml_service.py` print bug in evaluate_models()
- [x] Step 2: Update `scripts/generate_training_data.py` — focus on top diseases (≥15 samples), cap at ~35 classes, add "Other/Rare" catch-all
- [x] Step 3: Run training data generator → verify focused `training_data.csv` (709 rows, 30 diseases)
- [x] Step 4: Retrain ML models with `train_models.py` → accuracy: RF 90.1%, SVM 94.4%, NB 93.7%
- [x] Step 5: Update `backend/routes/predict.ts` — RAG-primary, ML-secondary with 70% confidence gating
- [x] Step 6: Update `TODO.md` with completion status
- [x] Step 7: Test diagnosis endpoint with various symptoms (requires server restart)
  - Tested: fever → diagnosis returned in ~3 min (CPU-bound LLM)
  - Result: RAG primary, ML not used (confidence 31% from ML below 70% threshold)
  - Works correctly.

