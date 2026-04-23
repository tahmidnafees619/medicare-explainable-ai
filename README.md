# MediCare AI Chat 🩺🤖

AI-powered symptom checker and health assistant using **local Ollama LLM** + RAG. No cloud APIs needed.

## 🎯 Features
- **Symptom Analysis** → Extract symptoms → Y/N follow-ups → Disease prediction w/ confidence
- **Local LLM** (llama3.2) + RAG (medical-knowledge.json keyword search)
- **User History** & stats (Prisma SQLite)
- **Medication Reminders**
- **Fullstack**: Vite/React frontend + Express/TS backend

## 🗄️ Database
**SQLite** (prisma/dev.db) w/ BetterSqlite3 adapter for speed:
- Users (auth)
- ChatSessions (symptoms, predictions, confidence)
- FollowUpQA (Y/N answers)
- Reminders (meds, schedule)

## 🏗️ Architecture
```
Frontend (localhost:5173) ←→ Backend (localhost:5000) ←→ Ollama (11434) ←→ dev.db
  React/Vite/TSX              Express/TS/Prisma          LLM inference      SQLite
     ↓                              ↓
Dashboard/Chat ← api/config.ts  /api/predict/* ← llm.service.ts (ENV OLLAMA_HOST)
  History calls /history           ↓
                               rag.service.ts (JSON knowledge base)
```

**Flow:**
1. User describes symptoms (ChatScreen.tsx)
2. `/predict/extract` → llm.extractSymptoms (Ollama/local fallback)
3. `/predict/followup` → llm.generateFollowUpQuestions (Y/N JSON)
4. `/predict/diagnose` → rag.augmentPrompt + llm.generatePrediction
5. saveToHistory → ChatSession DB
6. Dashboard → /history → stats

## 🚀 Quick Start - Full App Run

### Terminal 1: Ollama (Local LLM)
```bash
# Download/install Ollama from https://ollama.com/download
ollama serve  # Start server (localhost:11434)
ollama pull llama3.2  # Download model (~2GB)
```

### Terminal 2: Backend API + DB
```bash
cd backend
npm install
npm run db:generate  # Prisma client
npm run dev  # http://localhost:5000
```

### Terminal 3: Frontend
```bash
npm install  # Root deps (if needed)
npm run dev  # http://localhost:5173
```

### Test Full Flow
1. Open http://localhost:5173
2. Register/Login
3. ChatScreen: Symptoms → Y/N → Diagnosis saved
4. Dashboard: History/stats/reminders
5. Backend logs: Ollama calls, RAG context, DB saves

**One-liner scripts in root package.json (future):**
```
npm run dev:all  # Parallel: backend + frontend
```

Ports: Backend 5000, Frontend 5173, Ollama 11434

## 📁 Structure
```
.
├── backend/           # Express API
│   ├── server.ts      # Port 5000, /api/*
│   ├── services/      # llm.service.ts (Ollama), rag.service.ts
│   ├── routes/        # predict.ts, history.ts, auth.ts
│   ├── lib/db.ts      # Prisma SQLite adapter
│   └── .env.local     # OLLAMA_HOST=localhost:11434
├── prisma/            # Schema: User/ChatSession/FollowUpQA/Reminder
├── src/               # React/Vite frontend
│   ├── components/    # ChatScreen/DashboardScreen
│   ├── api/config.ts  # API calls w/ auth token
│   └── services/      # chat.service.ts (unused DB wrappers)
└── public/data/       # medical-knowledge.json (RAG base)
```

## 🔧 ENV & Config
See [ENV_SETUP.md](ENV_SETUP.md)
- backend/.env.local: `OLLAMA_HOST`, `OLLAMA_MODEL`
- Frontend Vite: `VITE_BACKEND_URL=http://localhost:5000`

## 🧪 Testing
- Ollama: `curl localhost:11434/api/tags`
- Backend: `curl localhost:5000/api/predict/health`
- History: Login → check → Dashboard

## 🤖 How LLM/RAG Works
- **LLM:** Ollama llama3.2 JSON prompts (fallback rule-based)
- **RAG:** Keyword similarity medical-knowledge.json → context for prediction
- **Y/N Follow-ups:** Strict prompt, UI buttons

## 📊 Stats
Dashboard computes locally from history (most common disease, count).

## 🚀 Deploy
1. Dockerize (Ollama + backend + SQLite)
2. PM2 backend, Nginx frontend static

## Contributing
1. `npm install` root/backend
2. `npm run db:push` backend
3. Test Ollama connection

## License
MIT
