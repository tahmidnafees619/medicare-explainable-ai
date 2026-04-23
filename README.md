# MediCare AI Chat 🩺🤖

AI-powered symptom checker and health assistant using **local Ollama LLM** + RAG + optional ML ensemble. No cloud APIs needed.

## 🎯 Features
- **Symptom Analysis** → Extract symptoms → Y/N follow-ups → Disease prediction w/ confidence
- **Local LLM** (ollama llama3.2) + **RAG** (medical-knowledge.json keyword search + CSV dataset analysis)
- **ML Ensemble** (Random Forest, SVM, Naive Bayes) - optional secondary validation
- **User History** & stats (Prisma SQLite)
- **Medication Reminders**
- **Fullstack**: Vite/React frontend + Express/TS backend

## 🗄️ Database
**SQLite** (`backend/dev.db`) w/ BetterSqlite3 adapter:
- Users (auth)
- ChatSessions (symptoms, predictions, confidence)
- FollowUpQA (Y/N answers)
- Reminders (meds, schedule)

**Note**: Database file resides in `backend/dev.db`. Prisma schema at root `prisma/schema.prisma` (symlinked to `backend/prisma/schema.prisma`).

## 🏗️ Architecture

```
Frontend (localhost:8080) ←→ Backend (localhost:5000) ←→ Ollama (11434)
   React/Vite/TSX              Express/TS/Prisma          LLM inference
      ↓                              ↓
Dashboard/Chat               /api/predict/*
   History calls                 ↓
                          ├─ rag.service.ts (JSON + CSV knowledge base)
                          ├─ llm.service.ts (Ollama calls)
                          └─ ml_service.py (optional ensemble on :8000)
```

**Prediction Flow (`/api/predict/diagnose`):**
```
1. RAG retrieval → medical-knowledge.json + datasets/ CSV analysis
2. LLM (Ollama) → primary diagnosis + explanation using RAG context
3. ML Service (optional) → ensemble prediction if available & confident
4. Decision logic:
   - ML confidence >85% → ML overrides LLM
   - ML confidence 70–85% → boosts LLM confidence (+5%)
   - ML <70% or "Other/Rare" → LLM prediction only
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (with npm)
- **Ollama** (download from https://ollama.com/download)
- **Python 3.9+** (optional, for ML service): `pip install -r requirements.txt`

### Terminal 1: Ollama (Local LLM - **REQUIRED**)
```bash
ollama serve                    # Start server (localhost:11434)
ollama pull llama3.2            # Download model (~2GB)
```

### Terminal 2: Backend API + Database
```bash
# From project root:
npm install                     # Install root dependencies
npm run backend                 # Starts on http://localhost:5000
```

**First-time DB setup:**
```bash
npm run db:generate             # Generate Prisma client
npm run db:push                 # Apply schema to backend/dev.db
```

### Terminal 3: Frontend
```bash
npm run dev                     # Starts on http://localhost:8080
```

### Optional: ML Service (improves accuracy)
```bash
python ml_service.py           # Auto-loads pre-trained models from ./models/
```

## 🔌 Ports
| Service | Port | Required? |
|---------|------|-----------|
| Frontend (Vite) | 8080 | ✅ |
| Backend (Express) | 5000 | ✅ |
| Ollama LLM | 11434 | ✅ |
| ML Service (Flask) | 8000 | ⚠️ Optional |

## 📁 Key Files
- `backend/services/llm.service.ts` — Ollama integration (symptom extraction, followup, diagnosis, explanations)
- `backend/services/rag.service.ts` — Medical knowledge retrieval from JSON + CSV datasets
- `backend/routes/predict.ts` — Orchestrates RAG → LLM → ML prediction pipeline
- `ml_service.py` — Python ensemble ML service (RF, SVM, NB)
- `backend/data/medical-knowledge.json` — RAG knowledge base
- `datasets/Final_Augmented_dataset_Diseases_and_Symptoms.csv` — Training + RAG dataset
- `models/` — Pre-trained ML model files (.pkl)

## 🧠 AI Stack: RAG + LLM (Primary) + ML (Secondary)

**RAG** (Retrieval-Augmented Generation):
- Searches `medical-knowledge.json` disease database
- Analyzes `datasets/*.csv` for symptom-disease prevalence
- Injects relevant medical context into LLM prompts

**LLM** (Ollama):
- `extractSymptoms()` — Parses free-text symptoms into structured list
- `generateFollowUpQuestions()` — Creates Y/N follow-up questions
- `generatePrediction()` — Analyzes symptoms + RAG context → disease + confidence
- `generateExplanation()` — Patient-friendly explanation with disclaimer

**ML Ensemble** (optional):
- 3 models: Random Forest, SVM, Naive Bayes
- Trained on `Final_Augmented_dataset_Diseases_and_Symptoms.csv`
- Used as secondary validator: only accepted if confidence ≥70%
- Can override LLM if ML confidence >85%

## 🧪 Testing
```bash
# Health checks
curl http://localhost:11434/api/tags                      # Ollama
curl http://localhost:5000/health                         # Backend
curl http://localhost:5000/api/predict/health             # Backend + Ollama status

# API calls (replace <TOKEN>)
curl -X POST http://localhost:5000/api/predict/extract \
  -H "Content-Type: application/json" \
  -d '{"symptoms":"fever and cough"}'
```

## 🚨 Troubleshooting

### DB history/reminders not showing
**Cause**: Backend was reading wrong file (`./dev.db` vs `./backend/dev.db`).  
**Fixed**: `backend/lib/db.ts` now uses absolute path to `backend/dev.db`. Copy data if needed:
```bash
cp dev.db backend/dev.db
```

### Ollama not connecting
- Run `ollama serve`
- Check `.env.local` has `OLLAMA_HOST=http://localhost:11434`
- Test: `curl localhost:11434/api/tags`

### ML service down
Not required — LLM+RAG still works. Start for better accuracy: `python ml_service.py`

## 📊 Data
- **RAG knowledge**: `backend/data/medical-knowledge.json`
- **Dataset**: `datasets/Final_Augmented_dataset_Diseases_and_Symptoms.csv`
- **Models**: `models/*.pkl` (pre-trained; retrain via `/api/datasets/train`)
- **Database**: `backend/dev.db` (SQLite, git-ignored)

## 🛠️ Scripts
```bash
npm run dev          # Frontend (port 8080)
npm run backend      # Backend (port 5000)
npm run db:generate  # Prisma client
npm run db:push      # Apply schema
npm run db:studio    # DB viewer
```

## 🤝 Contributing
1. `npm install`
2. `npm run db:push` after schema changes
3. Test with Ollama running
4. PR

## 📄 License
MIT

