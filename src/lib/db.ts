import { PrismaClient } from '@prisma/client';

// Singleton pattern to prevent multiple Prisma instances in development
let prisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

// Export Prisma client for direct use
export const db = getPrismaClient();
