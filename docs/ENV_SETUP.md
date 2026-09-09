# Environment Configuration Guide

This project uses environment variables to manage configuration across different environments (development, staging, production).

## Files

- `.env.local` - Your local development environment (created automatically, not committed to git)
- `.env.example` - Template showing all available variables (commit this)
- `.env.production` - Production environment configuration

## Available Variables

### Frontend API Configuration

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Main backend API endpoint | `http://localhost:5000/api` |
| `VITE_BACKEND_URL` | Backend service URL | `http://localhost:5000` |

### ML/NLP Services

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_ML_SERVICE_URL` | Machine Learning service endpoint | `http://localhost:8000` |
| `VITE_NLP_SERVICE_URL` | Natural Language Processing service endpoint | `http://localhost:8001` |

### Database Configuration

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_DB_HOST` | Database host | `localhost` |
| `VITE_DB_PORT` | Database port | `5432` |
| `VITE_DB_NAME` | Database name | `medicare_ai` |
| `VITE_DB_USER` | Database user | `postgres` |
| `VITE_DB_PASSWORD` | Database password | `password` |

### API Keys

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_OPENAI_API_KEY` | OpenAI API key (if using GPT) | Empty |
| `VITE_ANTHROPIC_API_KEY` | Anthropic API key (if using Claude) | Empty |

### Application Settings

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_APP_ENV` | Environment name | `development` |
| `VITE_APP_DEBUG` | Enable debug mode | `true` |
| `VITE_LOG_LEVEL` | Logging level (debug, info, warn, error) | `debug` |

## Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your local development settings:**
   - Update service URLs if running on different ports
   - Add API keys if needed for local development

3. **Never commit `.env.local`** - It's in `.gitignore` by default

## Using Environment Variables in Code

### Option 1: Use the env utility (Recommended)

```typescript
import { env } from '@/api/env';

// Access variables anywhere
const apiUrl = env.apiBaseUrl;
const isProduction = env.isProduction;
const logLevel = env.logLevel;
```

### Option 2: Direct access to Vite env

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## Environment-Specific Files

Vite automatically loads files based on your environment:

- `.env` - Loaded in all environments
- `.env.local` - Loaded in all environments, local only (not committed)
- `.env.production` - Loaded only in production builds
- `.env.development` - Loaded only in development

## Backend Services (Node/Bun)

Backend now includes LLM service using local Ollama. Files:
```
backend/
├── .env.local
├── .env.example
└── server.ts
```

**Required Backend Variables (backend/.env.local):**
| Variable | Purpose | Default |
|----------|---------|---------|
| `OLLAMA_HOST` | Ollama server URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | Model name | `llama3.2` |
| `DATABASE_URL` | Prisma DB | `file:./prisma/dev.db` |
| `JWT_SECRET` | Auth tokens | `your-secret-key` |

Copy: `cp backend/.env.example backend/.env.local` (done).

## Ollama Setup
1. Download: https://ollama.com/download (Windows)
2. `ollama pull llama3.2`
3. Backend setup:
   - `cd backend && npm install`
   - `npm run dev` (Node/tsx; uses backend/.env.local + Ollama localhost:11434)
   
   **Alternative (Bun)**: Install Bun globally, `bun install`, `bun --watch server.ts`


## Running with Different Environments

- **Development:** `bun dev` (uses `.env.local`)
- **Production Build:** `bun build` (uses `.env.production`)
- **Preview Production:** `bun preview` (uses `.env.production`)
- **Custom:** `VITE_APP_ENV=staging bun dev`
