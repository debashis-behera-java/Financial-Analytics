import { z } from 'zod';
import {
  optionalAmount,
  optionalDateString,
  optionalTrimmedString,
  refineDateAmountRange,
} from './transaction.validation';

/**
 * Filters shared with the transaction list API (same names, same semantics).
 * Search/pagination/sorting are list concerns and intentionally not supported.
 */
export const analyticsQuerySchema = z
  .object({
    startDate: optionalDateString,
    endDate: optionalDateString,
    minAmount: optionalAmount('minAmount'),
    maxAmount: optionalAmount('maxAmount'),
    category: optionalTrimmedString(100),
    status: optionalTrimmedString(100),
    user_id: optionalTrimmedString(100),
  })
  .superRefine(refineDateAmountRange);

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
