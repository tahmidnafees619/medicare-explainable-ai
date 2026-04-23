import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { corsHeaders } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import reminderRoutes from './routes/reminder.js';
import predictRoutes from './routes/predict.js';
import historyRoutes from './routes/history.js';
import datasetRoutes from './routes/dataset.js';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Get allowed origins from environment
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'development' ? 50 : 5, // More permissive in development
  message: 'Too many authentication attempts, please try again later.',
});

app.use(limiter);

// CORS - Restrict to allowed origins
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Custom CORS headers middleware
app.use(corsHeaders);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// API Routes
console.log('Loading auth routes...');
app.use('/api/auth', authLimiter, authRoutes);
console.log('Auth routes loaded successfully');
app.use('/api/chat', chatRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/datasets', datasetRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MediCare AI Backend running on http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`⏰ Reminder endpoint: http://localhost:${PORT}/api/reminders`);
  console.log(`🧠 Predict endpoint: http://localhost:${PORT}/api/predict`);
  console.log(`📋 History endpoint: http://localhost:${PORT}/api/history`);
  console.log(`📊 Dataset endpoint: http://localhost:${PORT}/api/datasets`);
});

export default app;
