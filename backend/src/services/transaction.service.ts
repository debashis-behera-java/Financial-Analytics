import mongoose from 'mongoose';
import { Transaction, type TransactionDoc } from '../models/Transaction';
import type { TransactionQuery } from '../validation/transaction.validation';

export type TxFilter = Record<string, unknown>;

/**
 * Shared filter fields used by both the transaction list API and analytics.
 * Analytics reuses this exact builder so filter semantics never drift.
 */
export interface TransactionFilterInput {
  category?: string;
  status?: string;
  user_id?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Whitelist for CSV export columns. These are real transaction document
 * paths — never Mongo internals (`_id`, `__v`) and never arbitrary
 * client-supplied field names.
 */
export const EXPORTABLE_COLUMNS = [
  'id',
  'date',
  'amount',
  'category',
  'status',
  'user_id',
  'user_profile',
] as const;

export type ExportColumn = (typeof EXPORTABLE_COLUMNS)[number];

/** Numeric export columns bypass formula-sanitizing (plain magnitudes). */
const NUMERIC_EXPORT_COLUMNS: ReadonlySet<string> = new Set(['id', 'amount']);

/** Filter + search fields consumed by the shared filter builder. */
export interface TransactionFilterQuery extends TransactionFilterInput {
  search?: string;
}

/** Shared sort mapping for the list endpoint and the CSV export. */
export function buildSort(input: { sortBy: string; sortOrder: 'asc' | 'desc' }): Record<string, 1 | -1> {
  return { [input.sortBy]: input.sortOrder === 'asc' ? 1 : -1 };
}

export interface ListTransactionsResult {
  data: Array<Omit<TransactionDoc, '_id' | '__v'>>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Escape regex metacharacters so search input cannot inject a hostile pattern. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * True only for bare "YYYY-MM-DD" strings. Those are treated as inclusive
 * whole calendar days (start: 00:00:00.000 UTC, end: 23:59:59.999 UTC) so a
 * filter like `?startDate=2024-01-01&endDate=2024-01-31` covers the full days
 * regardless of the client's timezone. Full datetimes are used exactly as
 * given (MongoDB stores real Dates in UTC).
 */
function isDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

function buildDateFilter(startDate?: string, endDate?: string): { $gte?: Date; $lte?: Date } | undefined {
  if (!startDate && !endDate) {
    return undefined;
  }
  const range: { $gte?: Date; $lte?: Date } = {};
  if (startDate) {
    const start = new Date(startDate);
    // `new Date('YYYY-MM-DD')` already parses as UTC midnight; keep as-is.
    range.$gte = start;
  }
  if (endDate) {
    const end = new Date(endDate);
    if (isDateOnly(endDate)) {
      // Inclusive end-of-day in UTC.
      end.setUTCHours(23, 59, 59, 999);
    }
    range.$lte = end;
  }
  return range;
}

export function buildBaseFilter(input: TransactionFilterInput): TxFilter {
  const filter: TxFilter = {};

  // Exact-match filters.
  if (input.category !== undefined) {
    filter.category = input.category;
  }
  if (input.status !== undefined) {
    filter.status = input.status;
  }
  if (input.user_id !== undefined) {
    filter.user_id = input.user_id;
  }

  // Date range on the real Date field.
  const dateRange = buildDateFilter(input.startDate, input.endDate);
  if (dateRange) {
    filter.date = dateRange;
  }

  // Amount range.
  if (input.minAmount !== undefined || input.maxAmount !== undefined) {
    filter.amount = {};
    if (input.minAmount !== undefined) {
      (filter.amount as { $gte?: number }).$gte = input.minAmount;
    }
    if (input.maxAmount !== undefined) {
      (filter.amount as { $lte?: number }).$lte = input.maxAmount;
    }
  }

  return filter;
}

export function buildTransactionFilter(query: TransactionFilterQuery): TxFilter {
  const filter = buildBaseFilter(query);

  // Case-insensitive search across a fixed whitelist of fields only.
  // Numeric input additionally matches the numeric business `id`.
  if (query.search !== undefined && query.search !== '') {
    const raw = query.search.trim();
    const pattern = new RegExp(escapeRegExp(raw), 'i');
    const or: TxFilter[] = [
      { category: pattern },
      { status: pattern },
      { user_id: pattern },
      { user_profile: pattern },
    ];
    if (/^-?\d+$/.test(raw)) {
      const numericId = Number(raw);
      if (Number.isSafeInteger(numericId)) {
        or.push({ id: numericId });
      }
    }
    // Combine with other filters via $and so search never discards them.
    const base = { ...filter };
    return { $and: [base, { $or: or }] };
  }

  return filter;
}

/**
 * All filtering, sorting, and pagination run inside MongoDB
 * (find + countDocuments with skip/limit/sort). No in-memory filtering.
 */
export async function listTransactions(query: TransactionQuery): Promise<ListTransactionsResult> {
  const filter = buildTransactionFilter(query);
  const sort = buildSort(query);
  const skip = (query.page - 1) * query.limit;

  const [docs, total] = await Promise.all([
    Transaction.find(filter).select('-_id').sort(sort).skip(skip).limit(query.limit).lean(),
    Transaction.countDocuments(filter),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);

  return {
    data: docs,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
    },
  };
}

/**
 * Lookup uses the numeric business `id` (1..300) created by the seed.
 * A valid Mongo ObjectId is also accepted (queries `_id`) for robustness.
 * Returns null when nothing matches; throws never for missing docs.
 */
export async function getTransactionById(
  rawId: string,
): Promise<Omit<TransactionDoc, '_id' | '__v'> | null> {
  const trimmed = rawId.trim();

  if (/^-?\d+$/.test(trimmed)) {
    const numericId = Number(trimmed);
    if (!Number.isSafeInteger(numericId)) {
      return null;
    }
    return Transaction.findOne({ id: numericId }).select('-_id').lean();
  }

  if (mongoose.isValidObjectId(trimmed)) {
    return Transaction.findById(trimmed).select('-_id').lean();
  }

  return null;
}

/** True when the value can identify a transaction (integer id or ObjectId). */
export function isValidTransactionId(rawId: string): boolean {
  const trimmed = rawId.trim();
  if (/^-?\d+$/.test(trimmed)) {
    return Number.isSafeInteger(Number(trimmed));
  }
  return mongoose.isValidObjectId(trimmed);
}

export interface ExportDocumentsQuery extends TransactionFilterInput {
  search?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

/**
 * All documents matching the caller's filters/search/sort — every page,
 * never paginated. The export endpoint is the only caller. Reuses the exact
 * filter builder, search semantics, and sort mapping as the list endpoint.
 */
export async function getExportDocuments(
  columns: readonly ExportColumn[],
  query: ExportDocumentsQuery,
): Promise<Array<Record<string, unknown>>> {
  const filter = buildTransactionFilter(query);
  const sort = buildSort(query);
  const projection = `${columns.join(' ')} -_id`;
  const docs = await Transaction.find(filter).select(projection).sort(sort).lean();
  return docs as unknown as Array<Record<string, unknown>>;
}

/** Numeric export columns (id, amount) for CSV cell formatting. */
export function getNumericExportColumns(): ReadonlySet<string> {
  return NUMERIC_EXPORT_COLUMNS;
}
