import { z } from 'zod';
import { EXPORTABLE_COLUMNS } from '../services/transaction.service';
import {
  SORTABLE_FIELDS,
  SORT_ORDERS,
  emptyToUndefined,
  optionalAmount,
  optionalDateString,
  optionalTrimmedString,
  refineDateAmountRange,
} from './transaction.validation';

/**
 * Query schema for GET /api/transactions/export.
 * Same filter/sort semantics as the list endpoint (no page/limit — the
 * export always covers ALL matching records), plus a whitelisted `columns`
 * parameter, e.g. `?columns=id,date,amount`.
 */
function parseColumns(value: unknown): unknown {
  if (typeof value === 'string') {
    const parts = value
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    // De-duplicate while preserving the requested order.
    return [...new Set(parts)];
  }
  return value;
}

export const exportQuerySchema = z
  .object({
    search: optionalTrimmedString(100),
    startDate: optionalDateString,
    endDate: optionalDateString,
    minAmount: optionalAmount('minAmount'),
    maxAmount: optionalAmount('maxAmount'),
    category: optionalTrimmedString(100),
    status: optionalTrimmedString(100),
    user_id: optionalTrimmedString(100),
    sortBy: z.preprocess(emptyToUndefined, z.enum(SORTABLE_FIELDS).default('date')),
    sortOrder: z.preprocess(emptyToUndefined, z.enum(SORT_ORDERS).default('desc')),
    columns: z.preprocess(parseColumns, z.array(z.enum(EXPORTABLE_COLUMNS)).min(1, 'Select at least one column to export').max(EXPORTABLE_COLUMNS.length)),
  })
  .superRefine(refineDateAmountRange);

export type ExportQuery = z.infer<typeof exportQuerySchema>;
