/**
 * Environment Variables Configuration
 * All environment variables are loaded from .env.local, .env.production, etc.
 */

export const env = {
  // Frontend API
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000',

  // ML/NLP Services
  mlServiceUrl: import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8000',
  nlpServiceUrl: import.meta.env.VITE_NLP_SERVICE_URL || 'http://localhost:8001',

  // Database (informational only on frontend)
  dbHost: import.meta.env.VITE_DB_HOST || 'localhost',
  dbPort: import.meta.env.VITE_DB_PORT || '5432',
  dbName: import.meta.env.VITE_DB_NAME || 'medicare_ai',

  // API Keys
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  anthropicApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',

  // Application Settings
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  appDebug: import.meta.env.VITE_APP_DEBUG === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'debug',

  // Utility checks
  isDevelopment: (import.meta.env.VITE_APP_ENV || 'development') === 'development',
  isProduction: import.meta.env.VITE_APP_ENV === 'production',
};

export default env;
