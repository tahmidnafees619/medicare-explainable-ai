# SQLite & Prisma Setup Guide

## Overview

This project uses **SQLite** as the database and **Prisma** as the ORM (Object-Relational Mapping) tool.

### What's Included:
- Prisma schema with 4 models: User, ChatSession, FollowUpQA, Reminder
- Database service layer (`src/services/`)
- Environment configuration (`.env.local`, `.env.example`, `.env.production`)
- Prisma client utilities (`src/lib/db.ts`)

---

## Installation & Setup

### Step 1: SQLite Setup

SQLite is included by default in most operating systems. No additional installation is required for development.

### Step 2: Configure Environment

Edit `.env.local` and update the `DATABASE_URL`:

```env
# SQLite database file (will be created automatically)
DATABASE_URL="file:./dev.db"

# Backend Service
BACKEND_PORT=5000

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### Step 3: Generate Prisma Client

```bash
# Generate Prisma Client
npx prisma generate

# Create database and tables
npx prisma db push
```

### Step 4: Verify Setup

```bash
# Open Prisma Studio (visual database browser)
npx prisma studio
```

Visit `http://localhost:5555` to browse your database

---

## Database Schema

### Users Table
```
- id (Primary Key, String)
- email (Unique, String)
- name (String)
- passwordHash (String)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### ChatSessions Table
```
- id (Primary Key, String)
- userId (Foreign Key -> Users)
- symptomsFound (String)
- predictedDisease (String)
- confidence (Float)
- explanation (String)
- allPredictions (JSON)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### FollowUpQA Table
```
- id (Primary Key, String)
- chatId (Foreign Key -> ChatSessions)
- question (String)
- answer (String)
- questionIndex (Int)
- createdAt (DateTime)
```

### Reminders Table
```
- id (Primary Key, String)
- userId (Foreign Key -> Users)
- medicineName (String)
- dosage (String)
- frequency (String)
- startDate (DateTime)
- reminderTime (String)
- notes (String)
- isDone (Boolean)
- lastRemindedAt (DateTime)
- createdAt (DateTime)
- updatedAt (DateTime)
```

---

## Using the Database in Your Backend

### Option 1: Using Service Functions (Recommended)

```typescript
import { createChatSession, getUserChatHistory } from '@/services/chat.service';
import { createReminder, getUserReminders } from '@/services/reminder.service';

// Create a chat session
const chat = await createChatSession(
  userId,
  'fever, headache',
  'Flu',
  85,
  [{ disease: 'Flu', confidence: 85 }, { disease: 'Cold', confidence: 45 }],
  'Based on symptoms, likely viral infection'
);

// Get user's chat history
const history = await getUserChatHistory(userId);

// Create a reminder
const reminder = await createReminder(
  userId,
  'Aspirin',
  '500mg',
  'Twice daily',
  new Date(),
  '09:00',
  'With breakfast'
);

// Get user reminders
const reminders = await getUserReminders(userId);
```

### Option 2: Direct Prisma Access

```typescript
import { db } from '@/lib/db';

// Create
const user = await db.user.create({
  data: { email: 'john@example.com', name: 'John', passwordHash: 'hashed' }
});

// Read
const sessions = await db.chatSession.findMany({
  where: { userId: 'user_123' },
  include: { followUpQA: true }
});

// Update
await db.reminder.update({
  where: { id: 'reminder_456' },
  data: { isDone: true }
});

// Delete
await db.chatSession.delete({ where: { id: 'session_789' } });
```

---

## Useful Commands

```bash
# View/edit database in browser
npx prisma studio

# Generate Prisma Client (auto-run, but manual if needed)
npx prisma generate

# Push schema changes to database
npx prisma db push

# Reset database (deletes all data)
npx prisma db push --force-reset

# Check database status
npx prisma db status
```

---

## For Production Deployment

### Option 1: Continue with SQLite (Simple)

SQLite works great for small to medium applications:

1. Keep your `.env.production`:
```env
DATABASE_URL="file:./production.db"
```

2. Ensure the production.db file is backed up regularly

### Option 2: Upgrade to PostgreSQL (Recommended for Scale)

If you need to scale up:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
}
```

2. Update `.env.production`:
```env
DATABASE_URL="postgresql://user:password@host:5432/medicare_ai"
```

3. Run migrations: `npx prisma migrate deploy`

---

## Migration Workflow

When you update `prisma/schema.prisma`:

1. Make changes to the schema
2. Run: `npx prisma db push`
3. Test with `npx prisma studio`
4. Commit changes to git

---

## Troubleshooting

### "Database file not found"
```bash
# Create database file
npx prisma db push
```

### "Error: Client is not initiated"
```bash
# Regenerate Prisma Client
npx prisma generate
```

### "Schema has changed"
```bash
# Push changes to database
npx prisma db push
```

### Permission issues on Windows
```bash
# Run PowerShell as Administrator
# or ensure your user has write permissions to the project folder
```

---

## Next Steps

1. Configure `.env.local` with DATABASE_URL
2. Run `npx prisma generate`
3. Run `npx prisma db push`
4. Test with `npx prisma studio`
5. Start building your backend API endpoints!

---

## Quick Start Commands

```bash
# Full setup
npx prisma generate
npx prisma db push
npx prisma studio

# Then in another terminal, start your backend
npm run dev:backend
```

---

## SQLite vs PostgreSQL Comparison

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Setup | Zero-config | Requires installation |
| Performance | Excellent for single-user | Better for concurrent users |
| Scalability | Limited | Highly scalable |
| Portability | Single file | Requires database server |
| Production use | Good for small apps | Better for large apps |

**For your Medicare AI Chat project, SQLite is perfect for development and small-scale production!**
