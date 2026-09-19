import { z } from 'zod';

export const SORTABLE_FIELDS = ['id', 'date', 'amount', 'category', 'status', 'user_id'] as const;
export type SortableField = (typeof SORTABLE_FIELDS)[number];

export const SORT_ORDERS = ['asc', 'desc'] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const MAX_LIMIT = 100;

/** Empty query-string values ("?category=") are treated as absent. */
export function emptyToUndefined(value: unknown): unknown {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }
  return value;
}

export const optionalTrimmedString = (maxLen: number) =>
  z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1).max(maxLen).optional(),
  );

export const optionalDateString = z.preprocess(
  emptyToUndefined,
  z.string().trim().min(1).max(100).optional(),
);

export const optionalAmount = (field: 'minAmount' | 'maxAmount') =>
  z.preprocess(
    emptyToUndefined,
    z.coerce.number().finite(`${field} must be a finite number`).optional(),
  );

export function parseDateOrUndefined(value: string | undefined): Date | undefined {
  if (value === undefined) {
    return undefined;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed;
}

export interface DateAmountRange {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Shared refinement for filter-style schemas (transactions + analytics):
 * valid dates, startDate <= endDate, minAmount <= maxAmount.
 */
export function refineDateAmountRange(
  data: DateAmountRange,
  ctx: { addIssue: (issue: { code: 'custom'; path: Array<string | number>; message: string }) => void },
): void {
  if (data.startDate !== undefined && parseDateOrUndefined(data.startDate) === undefined) {
    ctx.addIssue({ code: 'custom', path: ['startDate'], message: 'startDate must be a valid date' });
  }
  if (data.endDate !== undefined && parseDateOrUndefined(data.endDate) === undefined) {
    ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'endDate must be a valid date' });
  }
  const start = data.startDate !== undefined ? parseDateOrUndefined(data.startDate) : undefined;
  const end = data.endDate !== undefined ? parseDateOrUndefined(data.endDate) : undefined;
  if (start && end && start.getTime() > end.getTime()) {
    ctx.addIssue({
      code: 'custom',
      path: ['endDate'],
      message: 'endDate must be greater than or equal to startDate',
    });
  }
  if (data.minAmount !== undefined && data.maxAmount !== undefined && data.minAmount > data.maxAmount) {
    ctx.addIssue({
      code: 'custom',
      path: ['maxAmount'],
      message: 'maxAmount must be greater than or equal to minAmount',
    });
  }
}

export const transactionQuerySchema = z
  .object({
    page: z.coerce.number().int('page must be an integer').min(1, 'page must be >= 1').default(1),
    limit: z.coerce
      .number()
      .int('limit must be an integer')
      .min(1, 'limit must be >= 1')
      .max(MAX_LIMIT, `limit must be <= ${MAX_LIMIT}`)
      .default(10),
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
  })
  .superRefine(refineDateAmountRange);

export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
