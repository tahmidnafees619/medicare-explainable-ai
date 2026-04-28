# Confidence Label & Safety Gate Fixes

## Steps
- [x] 1. Edit `src/components/ResultsScreen.tsx`
  - Add `getConfidenceLabel(score)` helper with tiered labels/colors
  - Replace static "Most Likely Condition" badge with dynamic label
  - Implement low-confidence lock (< 22%): hide primary card, show "No strong match found"
- [x] 2. Edit `src/components/ChatScreen.tsx`
  - Add minimum symptom gate after `extractAndPredict`
  - If `< 3` symptoms, show inline warning and stay in input phase
- [x] 3. Verify build (TypeScript / no errors)

