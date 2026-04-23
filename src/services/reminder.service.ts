import { db } from '@/lib/db';

/**
 * Reminder Service - Database operations for medicine reminders
 */

export async function createReminder(userId: string, medicineName: string, dosage: string, frequency: string, startDate: Date, reminderTime: string, notes?: string) {
  return db.reminder.create({
    data: {
      userId,
      medicineName,
      dosage,
      frequency,
      startDate,
      reminderTime,
      notes,
    },
  });
}

export async function getUserReminders(userId: string) {
  return db.reminder.findMany({
    where: { userId },
    orderBy: { startDate: 'asc' },
  });
}

export async function getReminder(id: string) {
  return db.reminder.findUnique({ where: { id } });
}

export async function updateReminder(id: string, data: any) {
  return db.reminder.update({ where: { id }, data });
}

export async function deleteReminder(id: string) {
  return db.reminder.delete({ where: { id } });
}

export async function markReminderDone(id: string) {
  return db.reminder.update({
    where: { id },
    data: { isDone: true, lastRemindedAt: new Date() },
  });
}

export async function getActiveReminders(userId: string) {
  return db.reminder.findMany({
    where: { userId, isDone: false },
    orderBy: { reminderTime: 'asc' },
  });
}
