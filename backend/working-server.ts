import express from 'express';
import cors from 'cors';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory database (temporarily)
const users = [];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth endpoints
app.get('/api/auth', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const passwordHash = await bcryptjs.hash(password, 10);
    
    const user = {
      id: Date.now().toString(),
      name,
      email,
      passwordHash,
      createdAt: new Date()
    };
    
    users.push(user);
    
    console.log('User registered:', { id: user.id, name: user.name, email: user.email });
    
    res.json({ 
      message: 'User registered successfully', 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    
    console.log('User logged in:', { id: user.id, name: user.name, email: user.email });
    
    res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Simple reminder endpoints (no auth for testing)
app.get('/api/reminders', (req, res) => {
  res.json([]);
});

app.post('/api/reminders/create', (req, res) => {
  const { medicineName, dosage, frequency, reminderTime } = req.body;
  
  if (!medicineName || !frequency) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const reminder = {
    id: Date.now().toString(),
    medicineName,
    dosage,
    frequency,
    reminderTime,
    createdAt: new Date(),
    isDone: false
  };
  
  console.log('Reminder created:', reminder);
  res.json({ message: 'Reminder created successfully', reminder });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n=== WORKING BACKEND RUNNING ===`);
  console.log(`Backend: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Auth: http://localhost:${PORT}/api/auth`);
  console.log(`Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`Reminders: http://localhost:${PORT}/api/reminders`);
  console.log(`=============================\n`);
});
