import { Router, Response } from 'express';
import { db } from '../lib/db.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();
const prisma = db;

// POST /api/chat/create-session
router.post('/create-session', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { symptoms, predictedDisease, confidence, allPredictions, explanation } = req.body;
    const userId = req.userId!;

    if (!symptoms || !predictedDisease) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create chat session
    const session = await prisma.chatSession.create({
      data: {
        userId,
        symptomsFound: symptoms,
        predictedDisease,
        confidence: confidence || 0,
        allPredictions: allPredictions || [],
        explanation: explanation || '',
      },
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// GET /api/chat/history
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      include: {
        followUpQA: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(sessions);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// GET /api/chat/:sessionId
router.get('/:sessionId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { sessionId } = req.params;

    const session = await prisma.chatSession.findUnique({
      where: { id: parseInt(sessionId) },
      include: {
        followUpQA: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check authorization
    if (session.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch chat session' });
  }
});

// POST /api/chat/:sessionId/followup
router.post('/:sessionId/followup', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { sessionId } = req.params;
    const { question, answer, questionIndex } = req.body;

    if (!question || !answer === undefined) {
      return res.status(400).json({ error: 'Question and answer required' });
    }

    // Verify session belongs to user
    const session = await prisma.chatSession.findUnique({
      where: { id: parseInt(sessionId) },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Create follow-up Q&A
    const followUp = await prisma.followUpQA.create({
      data: {
        chatId: parseInt(sessionId),
        question,
        answer,
        questionIndex: questionIndex || 0,
      },
    });

    res.status(201).json(followUp);
  } catch (error) {
    console.error('Create followup error:', error);
    res.status(500).json({ error: 'Failed to create follow-up Q&A' });
  }
});

export default router;
