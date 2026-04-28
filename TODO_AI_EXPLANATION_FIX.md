# AI Explanation Fix Plan

## Problem
The AI explanation is generated asynchronously (fire-and-forget) in `backend/routes/predict.ts`, so the API response returns immediately with an empty explanation and `explanation_pending: true`. The frontend shows "Generating..." forever because there's no polling mechanism.

## Solution
1. Change explanation generation from async fire-and-forget to synchronous `await` in `predict.ts`
2. Add a timeout/fallback in `llm.service.ts` so Ollama calls don't hang indefinitely

## Files to Edit
- [x] `backend/routes/predict.ts` — make explanation generation synchronous with await
- [x] `backend/services/llm.service.ts` — add timeout to Ollama calls

## Status
✅ Completed
