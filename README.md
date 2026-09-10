# MediCare AI Chat 🩺🤖

AI-powered symptom checker and health assistant using an **ML ensemble** + **RAG** symptom validation + a **local Ollama LLM**. No cloud APIs needed.

> ⚠️ This is an educational project. It does not provide medical diagnosis and must not be used for real clinical decisions.

## 🎯 Features
- **Symptom Analysis** → Extract symptoms → Y/N follow-ups → Disease prediction w/ confidence
- **ML Ensemble** (Random Forest, SVM, Naive Bayes) over ~776 disease classes
- **RAG** symptom validation against `medical-knowledge.json` + CSV dataset analysis
- **Local LLM** (Ollama `llama3.2`) for patient-friendly explanations and fallback reasoning
- **User History** & stats (Prisma SQLite)
- **Medication Reminders**
- **Fullstack**: Vite/React frontend + Express/TS backend + Flask ML service

## 🏗️ Architecture

```
Frontend (localhost:5173) ←→ Backend (localhost:5000) ←→ Ollama (11434)
   React/Vite/TSX              Express/TS/Prisma          LLM inference
      ↓                              ↓
Dashboard/Chat               /api/predict/*
   History calls                 ↓
                          ├─ ml_service.py   (ensemble on :8000)
                          ├─ rag.service.ts  (JSON + CSV knowledge base)
                          └─ llm.service.ts  (Ollama calls)
```

### Prediction flow (`/api/predict/diagnose`)

```
1. Preprocess  → normalize + expand synonyms; require >= 3 symptoms (gate)
2. ML ensemble → weighted average of RF/SVM/NB probability vectors -> top_k
3. RAG         → validate the ML candidates against the knowledge base
4. Decide:
   - ML calibrated confidence >= 35  -> ml_primary   (LLM writes the explanation)
   - else RAG score >= 40            -> rag_primary  (LLM writes the explanation)
   - else                            -> llm_fallback (LLM reasons directly)
   - else                            -> "Unknown Condition" at 20%
5. Final confidence = adaptive weighted blend of ML + RAG, capped at 85
```

### A note on ML confidence

The ensemble scores against **~776 disease classes**, so a *correct* top-1 pick
carries a raw probability of only 3–6%. Comparing that raw number against a
threshold designed for a handful of classes rejects every correct answer.

The ML service therefore reports a **calibrated confidence** built from two
signals: *lift* (how far above the 1/776 chance baseline the top pick sits,
log-scaled so a perfect classifier maps to 100) and *dominance* (how much of the
top-5 probability mass it holds). On this scale nonsense input lands near 20 and
real symptom sets near 40–55, which is what `ML_PRIMARY_THRESHOLD = 35` gates on.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (with npm)
- **Ollama** (https://ollama.com/download)
- **Python 3.9+** for the ML service: `pip install -r requirements.txt`

### Terminal 1: Ollama (required)
```bash
ollama serve                    # localhost:11434
ollama pull llama3.2            # ~2GB
```

### Terminal 2: Backend API + database
```bash
npm install
npm run db:generate             # generate Prisma client (first run)
npm run db:push                 # apply schema
npm run backend                 # http://localhost:5000
```

### Terminal 3: Frontend
```bash
npm run dev                     # http://localhost:5173
```

### Terminal 4: ML service (strongly recommended)
```bash
npm run ml                      # http://localhost:8000
```
Without it the backend falls back to LLM-only reasoning and confidence drops
sharply. Models load from `models/*.pkl`; retrain with `npm run ml:train`.

On Windows you can start everything with `start.bat` (installs deps, sets up the
database, trains models if missing, then launches all three services).

## 🔌 Ports
| Service | Port | Required? |
|---------|------|-----------|
| Frontend (Vite) | 5173 | ✅ |
| Backend (Express) | 5000 | ✅ |
| Ollama LLM | 11434 | ✅ |
| ML Service (Flask) | 8000 | ⚠️ Strongly recommended |

## 📁 Project layout

```
src/                    React frontend (components, api client, hooks)
  api/config.ts         HTTP client - the only path the UI uses to reach the API
backend/                Express + TypeScript API
  routes/predict.ts     Orchestrates the ML -> RAG -> LLM pipeline
  services/rag.service.ts   Knowledge-base retrieval + symptom validation
  services/llm.service.ts   Ollama integration
  data/medical-knowledge.json   RAG knowledge base
  dev.db                Live SQLite database
prisma/schema.prisma    Single source of truth for the DB schema
ml_service.py           Flask ML ensemble service (:8000)
train_models.py         Offline training pipeline -> models/*.pkl
datasets/               CSV data (the 182MB training set is not committed)
models/                 Model pickles (large ones not committed - see docs/MODELS.md)
docs/                   Setup guides, security notes, TODO backlog
tools/diagnostics/      Ad-hoc probe scripts (not part of the test suite)
```

## 🧪 Verifying it works
```bash
npm test            # vitest suite
npm run typecheck   # frontend + backend type safety
npm run build       # production build

# Health checks
curl http://localhost:11434/api/tags            # Ollama
curl http://localhost:5000/health               # Backend
curl http://localhost:8000/health               # ML service
curl http://localhost:5000/api/predict/health   # Backend + Ollama status
```

## 🚨 Troubleshooting

### ML service exits immediately on Windows
Fixed: `ml_service.py` forces UTF-8 on stdout/stderr at startup. A legacy
console code page (cp1252) previously made the emoji in its log output raise
`UnicodeEncodeError` before the server ever bound to :8000.

### Env vars appear to be ignored
`.env` files must be saved as **UTF-8**, not UTF-16. dotenv silently parses zero
keys from a UTF-16 file, so every value falls back to its built-in default
(including `JWT_SECRET`). Check with `npx dotenv -e .env.local -- node -e "0"`
or simply confirm the file is UTF-8.

### DB history/reminders not showing
`backend/lib/db.ts` uses an absolute path to `backend/dev.db` and deliberately
ignores `DATABASE_URL`, because the `DATABASE_URL` entries in the various `.env`
files point at other, stale sqlite files. Consolidate them before making the
path configurable.

### Ollama not connecting
- Run `ollama serve`
- Check `.env.local` has `OLLAMA_HOST=http://localhost:11434`
- Test: `curl localhost:11434/api/tags`
- Generation takes ~25s warm; the API allows 60s before falling back to a
  templated explanation.

## 🛠️ Scripts
```bash
npm run dev          # Frontend (5173)
npm run backend      # Backend (5000)
npm run dev:backend  # Backend in watch mode
npm run ml           # ML service (8000)
npm run ml:train     # Retrain models -> models/*.pkl
npm test             # Tests
npm run typecheck    # Frontend + backend typecheck
npm run db:generate  # Prisma client
npm run db:push      # Apply schema
npm run db:studio    # DB viewer
```

## 🤝 Contributing
1. `npm install`
2. `npm run db:push` after schema changes
3. `npm test && npm run typecheck` before pushing
4. Test with Ollama running

## 📄 License
MIT
