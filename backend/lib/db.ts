import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

// NOTE: this path is deliberately hardcoded and does NOT read DATABASE_URL.
// backend/dev.db is the live database; the DATABASE_URL values in the various
// .env files point at other (stale) sqlite files, so honouring them here would
// silently switch the app to an empty database. Consolidate the env files onto
// this path before making this configurable.
const dbPath = path.join(process.cwd(), 'backend', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

export { prisma as db };
export default prisma;
