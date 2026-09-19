/**
 * Seed script for the transactions collection.
 *
 * Usage:
 *   npm run seed -- [path-to-transactions.json]
 *
 * The JSON path defaults to ./data/transactions.json (relative to backend/).
 * MONGODB_URI is read from the environment (backend/.env supported).
 *
 * Duplicate-safe: uses unordered bulk upserts keyed on the unique `id`
 * field, so re-running the script never creates duplicates.
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { connectDb, disconnectDb } from '../config/db';
import { env } from '../config/env';
import { Transaction } from '../models/Transaction';

const transactionRecordSchema = z.object({
  id: z.number().int(),
  date: z.string().datetime({ offset: true }).or(z.string().date()),
  amount: z.number().finite(),
  category: z.string().min(1),
  status: z.string().min(1),
  user_id: z.string().min(1),
  user_profile: z.string().min(1),
});

type TransactionRecord = z.infer<typeof transactionRecordSchema>;

function resolveJsonPath(): string {
  const argPath = process.argv[2];
  if (argPath) {
    return path.resolve(process.cwd(), argPath);
  }
  if (process.env.SEED_PATH) {
    return path.resolve(process.cwd(), process.env.SEED_PATH);
  }
  return path.resolve(process.cwd(), 'data', 'transactions.json');
}

function loadRecords(filePath: string): unknown[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Transactions JSON not found at: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected a JSON array in ${filePath}`);
  }
  return parsed;
}

async function main(): Promise<void> {
  const filePath = resolveJsonPath();
  console.log(`[seed] Source: ${filePath}`);
  console.log(`[seed] MongoDB: ${env.mongoUri}`);

  const rawRecords = loadRecords(filePath);
  console.log(`[seed] Records in file: ${rawRecords.length}`);

  const valid: TransactionRecord[] = [];
  const failed: Array<{ index: number; reason: string }> = [];

  rawRecords.forEach((item, index) => {
    const result = transactionRecordSchema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      failed.push({ index, reason: result.error.issues.map((i) => i.message).join('; ') });
    }
  });

  await connectDb();
  await Transaction.syncIndexes();

  let inserted = 0;
  let skippedDuplicate = 0;

  if (valid.length > 0) {
    const ops = valid.map((r) => ({
      updateOne: {
        filter: { id: r.id },
        update: {
          $setOnInsert: {
            id: r.id,
            date: new Date(r.date),
            amount: r.amount,
            category: r.category,
            status: r.status,
            user_id: r.user_id,
            user_profile: r.user_profile,
          },
        },
        upsert: true,
      },
    }));

    const bulkResult = await Transaction.bulkWrite(ops, { ordered: false });
    inserted = bulkResult.upsertedCount ?? 0;
    skippedDuplicate = valid.length - inserted;
  }

  const total = await Transaction.countDocuments();

  console.log('----- Seed result -----');
  console.log(`File records:      ${rawRecords.length}`);
  console.log(`Valid:             ${valid.length}`);
  console.log(`Inserted:          ${inserted}`);
  console.log(`Skipped (exists):  ${skippedDuplicate}`);
  console.log(`Failed validation: ${failed.length}`);
  if (failed.length > 0) {
    console.log('Failed records (index: reason):');
    failed.slice(0, 20).forEach((f) => console.log(`  [${f.index}]: ${f.reason}`));
    if (failed.length > 20) {
      console.log(`  ... and ${failed.length - 20} more`);
    }
  }
  console.log(`Collection total:  ${total}`);
  console.log('[seed] Done.');

  await disconnectDb();
}

main().catch(async (err) => {
  console.error('[seed] FAILED:', err instanceof Error ? err.message : err);
  try {
    await disconnectDb();
  } catch {
    // ignore disconnect errors during failure handling
  }
  process.exit(1);
});
