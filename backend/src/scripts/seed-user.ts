/**
 * Demo-user seed script. Extends the existing seed mechanism (see
 * `npm run seed` for transactions) without touching it.
 *
 * Usage:
 *   npm run seed:user
 *
 * Credentials come from the environment, never from source code:
 *   DEMO_USER_EMAIL     (default: demo@example.com)
 *   DEMO_USER_PASSWORD  (required; dev default only outside production)
 *   DEMO_USER_ROLE      (default: admin)
 *
 * Safe to run multiple times: the user is upserted by email, so re-runs
 * update the password/role instead of creating duplicates.
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { connectDb, disconnectDb } from '../config/db';
import { env } from '../config/env';
import { User } from '../models/User';
import type { UserRole } from '../models/User';

const BCRYPT_ROUNDS = 12;

async function main(): Promise<void> {
  const email = env.demoUserEmail.toLowerCase().trim();
  const password = env.demoUserPassword;
  const role = (env.demoUserRole === 'admin' ? 'admin' : 'user') as UserRole;

  if (!password) {
    throw new Error('DEMO_USER_PASSWORD is required. Set it in backend/.env (see .env.example).');
  }
  if (password.length < 8) {
    throw new Error('DEMO_USER_PASSWORD must be at least 8 characters.');
  }

  console.log(`[seed:user] MongoDB: ${env.mongoUri}`);
  await connectDb();
  await User.syncIndexes();

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const result = await User.findOneAndUpdate(
    { email },
    { $set: { email, passwordHash, role } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );

  const created = result.createdAt.getTime() === result.updatedAt.getTime();
  console.log(`[seed:user] ${created ? 'Created' : 'Updated'} demo user: ${email} (role: ${role})`);
  console.log(`[seed:user] Users total: ${await User.countDocuments()}`);
  console.log('[seed:user] Done. Log in with POST /api/auth/login.');

  await disconnectDb();
}

main().catch(async (err) => {
  console.error('[seed:user] FAILED:', err instanceof Error ? err.message : err);
  try {
    await disconnectDb();
  } catch {
    // ignore disconnect errors during failure handling
  }
  process.exit(1);
});
