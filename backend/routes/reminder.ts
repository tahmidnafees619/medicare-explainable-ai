import { Router, Response } from 'express';
import { db } from '../lib/db.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();
const prisma = db;

// POST /api/reminders/create
router.post('/create', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { medicineName, dosage, frequency, startDate, reminderTime, notes } = req.body;
    const userId = req.userId!;

    if (!medicineName || !frequency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId,
        medicineName,
        dosage: dosage || '',
        frequency,
        reminderTime: reminderTime || '09:00',
        startDate: startDate ? new Date(startDate) : new Date(),
        notes: notes || null,
      },
    });

    res.status(201).json(reminder);
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// GET /api/reminders
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const reminders = await prisma.reminder.findMany({
      where: { userId },
      orderBy: { reminderTime: 'asc' },
    });

    res.json(reminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// GET /api/reminders/active
router.get('/active', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const now = new Date();

    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        isDone: false,
        startDate: { lte: now },
      },
      orderBy: { reminderTime: 'asc' },
    });

    res.json(reminders);
  } catch (error) {
    console.error('Get active reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch active reminders' });
  }
});

// PUT /api/reminders/:id/mark-done
// PUT /api/reminders/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const idParam = req.params.id;
    const id = parseInt(idParam as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid reminder id' });

    const { medicineName, dosage, frequency, startDate, reminderTime, notes } = req.body;

    const reminder = await prisma.reminder.findUnique({
      where: { id },
    });

    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    if (reminder.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

    const dataToUpdate: any = {};
    if (medicineName !== undefined) dataToUpdate.medicineName = medicineName;
    if (dosage !== undefined) dataToUpdate.dosage = dosage;
    if (frequency !== undefined) dataToUpdate.frequency = frequency;
    if (reminderTime !== undefined) dataToUpdate.reminderTime = reminderTime;
    if (notes !== undefined) dataToUpdate.notes = notes;
    if (startDate !== undefined) dataToUpdate.startDate = startDate ? new Date(startDate) : null;

    const updated = await prisma.reminder.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json(updated);
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});
router.put('/:id/mark-done', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const reminder = await prisma.reminder.findUnique({
      where: { id },
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    if (reminder.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.reminder.update({
      where: { id },
      data: { isDone: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Mark done error:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// DELETE /api/reminders/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const reminder = await prisma.reminder.findUnique({
      where: { id },
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    if (reminder.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.reminder.delete({
      where: { id },
    });

    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

export default router;
