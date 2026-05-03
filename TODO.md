# RAG Knowledge Update & Symptom Matching Fix
Current Working Directory: h:/medicare-ai-chat-73c62a449442dda33458a16081c73f8c99b60472

## Plan Summary
- Fix DISEASE_ALIASES in rag.service.ts
- Add fuzzy matching for symptom similarity  
- Lower relevance threshold to show results even at 0% match
- Improve normalization (stemming/synonyms)
- Regenerate training data & retrain ML
- Test fixes

## Steps (0/7 complete)

### Step 1: ✅ Fix DISEASE_ALIASES mapping errors
Edit backend/services/rag.service.ts

### Step 2: ✅ Add fuzzy matching (Jaro-Winkler impl)
Pure JS, no deps needed

### Step 3: ✅ Implement fuzzy symptom matching
Update calculateSimilarity() & validateSymptomMatches()

### Step 4: ✅ Lower relevance threshold & return partial matches
r.relevance >= 0 in searchDiseases()

### Step 5: ✅ Improve text normalization
SYMPTOM_SYNONYMS map + normalizeText integration

### Step 6: ✅ Regenerate training data
Generated 38,730 rows → training_data.csv

### Step 7: [ ] Retrain ML models & test
python train_models.py + run test_rag.mjs

**Next: Step 1**
