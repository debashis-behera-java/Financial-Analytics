import { apiClient } from './client';
import type {
  CategoryBreakdownResponse,
  RevenueExpenseResponse,
  SummaryResponse,
} from '../types/analytics';

/**
 * Analytics API service. All aggregation happens in MongoDB on the backend;
 * these functions only transport the typed responses. The dashboard consumes
 * unfiltered snapshots; the backend endpoints additionally accept the same
 * filter parameters as the transaction list.
 */

export async function getAnalyticsSummary(): Promise<SummaryResponse> {
  const { data } = await apiClient.get<SummaryResponse>('/analytics/summary');
  return data;
}

export async function getRevenueExpense(): Promise<RevenueExpenseResponse> {
  const { data } = await apiClient.get<RevenueExpenseResponse>('/analytics/revenue-expense');
  return data;
}

export async function getCategoryBreakdown(): Promise<CategoryBreakdownResponse> {
  const { data } = await apiClient.get<CategoryBreakdownResponse>('/analytics/categories');
  return data;
}
