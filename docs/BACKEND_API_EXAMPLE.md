/**
 * Example Backend API Routes
 * This demonstrates how to use Prisma and the database services
 * 
 * To use this in your backend (Express, Node.js, etc.):
 * 1. Copy and adapt these routes
 * 2. Use the service functions to interact with the database
 * 3. Replace placeholder implementations with your actual ML/NLP logic
 */

import { db } from '@/lib/db';
import * as userService from '@/services/user.service';
import * as chatService from '@/services/chat.service';
import * as reminderService from '@/services/reminder.service';

// ============ AUTH ENDPOINTS ============

// POST /api/auth/register
export async function handleRegister(req: any, res: any) {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existing = await userService.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password (use bcrypt in real app)
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await userService.createUser(email, name, passwordHash);

    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token: generateToken(user.id),
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
}

// POST /api/auth/login
export async function handleLogin(req: any, res: any) {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password (use bcrypt.compare in real app)
    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token: generateToken(user.id),
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
}

// ============ CHAT & PREDICTION ENDPOINTS ============

// POST /api/chat/extract-predict
export async function handleExtractAndPredict(req: any, res: any) {
  try {
    const { userId, symptoms: userInput } = req.body;

    // TODO: Replace with real NLP service
    const symptomsFound = extractSymptoms(userInput);
    if (!symptomsFound.length) {
      return res.json({ error: 'No symptoms identified' });
    }

    // TODO: Replace with real ML service for prediction
    const predictions = await callMLService(symptomsFound);

    res.json({
      symptoms_found: symptomsFound,
      predictions: predictions,
    });
  } catch (err) {
    res.status(500).json({ error: 'Extraction failed' });
  }
}

// POST /api/chat/followup-questions
export async function handleFollowUpQuestions(req: any, res: any) {
  try {
    const { symptoms } = req.body;

    // TODO: Replace with real NLP service
    const questions = generateFollowUpQuestions(symptoms);

    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate questions' });
  }
}

// POST /api/chat/submit-answers
export async function handleSubmitAnswers(req: any, res: any) {
  try {
    const { userId, symptoms, answers } = req.body;

    // TODO: Replace with real ML service
    const predictions = await callMLService(symptoms, answers);

    // Save to database
    const chatSession = await chatService.createChatSession(
      userId,
      symptoms,
      predictions.primary.disease,
      predictions.primary.confidence,
      predictions.all_predictions,
      predictions.explanation
    );

    // Save follow-up Q&A
    for (let i = 0; i < answers.length; i++) {
      await chatService.addFollowUpQA(
        chatSession.id,
        answers[i].question,
        answers[i].answer,
        i
      );
    }

    res.json({
      disease: predictions.primary.disease,
      confidence: predictions.primary.confidence,
      all_predictions: predictions.all_predictions,
      explanation: predictions.explanation,
    });
  } catch (err) {
    res.status(500).json({ error: 'Analysis failed' });
  }
}

// GET /api/chat/history/:userId
export async function handleGetChatHistory(req: any, res: any) {
  try {
    const { userId } = req.params;

    const history = await chatService.getUserChatHistory(parseInt(userId));

    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
}

// POST /api/chat/save
export async function handleSaveToHistory(req: any, res: any) {
  try {
    const { userId, disease, confidence, symptoms } = req.body;

    const chatSession = await chatService.createChatSession(
      userId,
      symptoms,
      disease,
      confidence,
      [{ disease, confidence }]
    );

    res.json({ success: true, id: chatSession.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save' });
  }
}

// ============ REMINDER ENDPOINTS ============

// POST /api/reminders
export async function handleCreateReminder(req: any, res: any) {
  try {
    const { userId, medicineName, dosage, frequency, startDate, reminderTime, notes } = req.body;

    const reminder = await reminderService.createReminder(
      userId,
      medicineName,
      dosage,
      frequency,
      new Date(startDate),
      reminderTime,
      notes
    );

    res.json({ reminder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create reminder' });
  }
}

// GET /api/reminders/:userId
export async function handleGetReminders(req: any, res: any) {
  try {
    const { userId } = req.params;

    const reminders = await reminderService.getUserReminders(parseInt(userId));

    res.json({ reminders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
}

// PUT /api/reminders/:id
export async function handleUpdateReminder(req: any, res: any) {
  try {
    const { id } = req.params;
    const data = req.body;

    const reminder = await reminderService.updateReminder(parseInt(id), data);

    res.json({ reminder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update reminder' });
  }
}

// POST /api/reminders/:id/done
export async function handleMarkReminderDone(req: any, res: any) {
  try {
    const { id } = req.params;

    await reminderService.markReminderDone(parseInt(id));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark reminder done' });
  }
}

// DELETE /api/reminders/:id
export async function handleDeleteReminder(req: any, res: any) {
  try {
    const { id } = req.params;

    await reminderService.deleteReminder(parseInt(id));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
}

// ============ HELPER FUNCTIONS (replace with real implementations) ============

function extractSymptoms(text: string): string[] {
  // TODO: Integrate with real NLP service
  return [];
}

async function callMLService(symptoms: string[], answers?: any[]): Promise<any> {
  // TODO: Call your ML service (Python, TensorFlow, etc.)
  return {
    primary: { disease: 'Example', confidence: 80 },
    all_predictions: [],
    explanation: '',
  };
}

function generateFollowUpQuestions(symptoms: string[]): string[] {
  // TODO: Use NLP to generate questions
  return [];
}

async function hashPassword(password: string): Promise<string> {
  // TODO: Use bcrypt
  return password;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // TODO: Use bcrypt.compare
  return password === hash;
}

function generateToken(userId: number): string {
  // TODO: Use JWT
  return 'token';
}
