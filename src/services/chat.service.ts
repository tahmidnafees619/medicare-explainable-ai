import { db } from '@/lib/db';

/**
 * Chat Service - Database operations for chat sessions and predictions
 */

export async function createChatSession(userId: string, symptomsFound: string[], predictedDisease: string, confidence: number, allPredictions: any, explanation?: string) {
  return db.chatSession.create({
    data: {
      userId,
      symptomsFound,
      predictedDisease,
      confidence,
      allPredictions,
      explanation,
    },
  });
}

export async function getChatSession(id: string) {
  return db.chatSession.findUnique({
    where: { id },
    include: { followUpQA: true },
  });
}

export async function getUserChatHistory(userId: string, limit: number = 20) {
  return db.chatSession.findMany({
    where: { userId },
    include: { followUpQA: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function deleteChatSession(id: string) {
  return db.chatSession.delete({ where: { id } });
}

export async function addFollowUpQA(chatId: string, question: string, answer: string, questionIndex: number) {
  return db.followUpQA.create({
    data: { chatId, question, answer, questionIndex },
  });
}

export async function getFollowUpQA(chatId: string) {
  return db.followUpQA.findMany({
    where: { chatId },
    orderBy: { questionIndex: 'asc' },
  });
}
