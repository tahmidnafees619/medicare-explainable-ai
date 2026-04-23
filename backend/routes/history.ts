import { Router, Response } from 'express';
import { db } from '../lib/db.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();
const prisma = db;

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { disease, confidence, symptoms, explanation, allPredictions } = req.body;

    if (!disease || !symptoms) {
      return res.status(400).json({ error: 'Disease and symptoms are required' });
    }

    const session = await prisma.chatSession.create({
      data: {
        userId,
        symptomsFound: Array.isArray(symptoms) ? symptoms.join(', ') : symptoms,
        predictedDisease: disease,
        confidence: confidence || 0,
        explanation: explanation || '',
        allPredictions: allPredictions ? JSON.stringify(allPredictions) : null,
      },
    });

    res.status(201).json({ success: true, id: session.id, message: 'Saved to history' });
  } catch (error: any) {
    console.error('Save to history error:', error);
    res.status(500).json({ error: error.message || 'Failed to save to history' });
  }
});

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
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
      take: 50,
    });

    res.json(sessions);
  } catch (error: any) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const session = await prisma.chatSession.findUnique({
      where: { id },
      include: {
        followUpQA: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(session);
  } catch (error: any) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const session = await prisma.chatSession.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.chatSession.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Session deleted' });
  } catch (error: any) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

export default router;