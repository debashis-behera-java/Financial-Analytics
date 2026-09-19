/**
 * Mirrors the backend analytics response contracts exactly.
 * See backend/src/services/analytics.service.ts.
 */

/** GET /api/analytics/summary — flat object, not wrapped. */
export interface SummaryResponse {
  totalRevenue: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
}

/** One monthly bucket from GET /api/analytics/revenue-expense. */
export interface RevenueExpensePoint {
  /** Calendar month as "YYYY-MM" (UTC). */
  period: string;
  revenue: number;
  expenses: number;
  count: number;
}

/** GET /api/analytics/revenue-expense response contract. */
export interface RevenueExpenseResponse {
  data: RevenueExpensePoint[];
}

/** One row from GET /api/analytics/categories. */
export interface CategoryBreakdownItem {
  category: string;
  total: number;
  count: number;
}

/** GET /api/analytics/categories response contract. */
export interface CategoryBreakdownResponse {
  data: CategoryBreakdownItem[];
}
