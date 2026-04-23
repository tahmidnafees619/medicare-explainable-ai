import { db } from '@/lib/db';

/**
 * User Service - Database operations for users
 */

export async function getUserByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}

export async function getUserById(id: string) {
  return db.user.findUnique({ where: { id } });
}

export async function createUser(email: string, name: string, passwordHash: string) {
  return db.user.create({
    data: { email, name, passwordHash },
  });
}

export async function updateUser(id: string, data: any) {
  return db.user.update({ where: { id }, data });
}
