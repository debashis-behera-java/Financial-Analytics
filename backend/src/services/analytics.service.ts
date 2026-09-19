import { Transaction } from '../models/Transaction';
import { buildBaseFilter, type TxFilter } from './transaction.service';
import type { AnalyticsQuery } from '../validation/analytics.validation';

/**
 * Revenue/expense classification, discovered from the seeded dataset:
 *
 * - Categories present: exactly "Revenue" and "Expense".
 * - Statuses present: "Paid" and "Pending" (orthogonal to category).
 * - All 300 amounts are positive magnitudes (no negatives), so the sign
 *   carries no meaning; money direction comes ONLY from `category`.
 * - Rule: `category === "Revenue"` counts toward revenue,
 *   `category === "Expense"` counts toward expenses.
 * - Unknown future categories contribute to `transactionCount` but to
 *   neither money bucket (fail-closed rather than misclassified).
 * - Status is NOT part of classification; all statuses are included unless
 *   the caller narrows them with the `status` filter.
 */
export const REVENUE_CATEGORY = 'Revenue';
export const EXPENSE_CATEGORY = 'Expense';

export interface SummaryResult {
  totalRevenue: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
}

export interface RevenueExpensePoint {
  /** Calendar month as "YYYY-MM" (UTC). */
  period: string;
  revenue: number;
  expenses: number;
  count: number;
}

export interface CategoryBreakdownItem {
  category: string;
  total: number;
  count: number;
}

/** Conditional sum expression reused by every pipeline. */
function revenueSumExpr() {
  return { $sum: { $cond: [{ $eq: ['$category', REVENUE_CATEGORY] }, '$amount', 0] } };
}

function expensesSumExpr() {
  return { $sum: { $cond: [{ $eq: ['$category', EXPENSE_CATEGORY] }, '$amount', 0] } };
}

/**
 * Every analytics query runs as a MongoDB aggregation pipeline:
 * $match (shared filter builder) first so existing indexes apply,
 * then $group/$sort/$project. Nothing is ever fetched into Node.js
 * for totaling.
 */
export async function getSummary(query: AnalyticsQuery): Promise<SummaryResult> {
  const match: TxFilter = buildBaseFilter(query);

  const rows = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: revenueSumExpr(),
        totalExpenses: expensesSumExpr(),
        transactionCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
        totalExpenses: 1,
        netBalance: { $subtract: ['$totalRevenue', '$totalExpenses'] },
        transactionCount: 1,
      },
    },
  ]);

  const row = (rows[0] ?? { totalRevenue: 0, totalExpenses: 0, netBalance: 0, transactionCount: 0 }) as SummaryResult;
  return {
    totalRevenue: row.totalRevenue,
    totalExpenses: row.totalExpenses,
    netBalance: row.netBalance,
    transactionCount: row.transactionCount,
  };
}

/**
 * Monthly time series. The dataset spans a full year (2024-01 to 2024-12,
 * ~24-29 transactions per month), so month buckets are the sensible period.
 * Only months present in the (filtered) data are returned; no zero-filled
 * or invented periods.
 */
export async function getRevenueExpense(query: AnalyticsQuery): Promise<RevenueExpensePoint[]> {
  const match: TxFilter = buildBaseFilter(query);

  const rows = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
        revenue: revenueSumExpr(),
        expenses: expensesSumExpr(),
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        period: '$_id',
        revenue: 1,
        expenses: 1,
        count: 1,
      },
    },
  ]);

  return rows as RevenueExpensePoint[];
}

/** Totals per category, largest total first. */
export async function getCategoryBreakdown(query: AnalyticsQuery): Promise<CategoryBreakdownItem[]> {
  const match: TxFilter = buildBaseFilter(query);

  const rows = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    {
      $project: {
        _id: 0,
        category: '$_id',
        total: 1,
        count: 1,
      },
    },
  ]);

  return rows as CategoryBreakdownItem[];
}
