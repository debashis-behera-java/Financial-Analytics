import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { getAnalyticsSummary, getCategoryBreakdown, getRevenueExpense } from '../api/analytics';
import { toApiErrorMessage } from '../api/client';
import type {
  CategoryBreakdownResponse,
  RevenueExpenseResponse,
  SummaryResponse,
} from '../types/analytics';

/**
 * Analytics data hooks. Presentation components consume these — never raw
 * Axios calls. Queries are read-only snapshots of server aggregations:
 * no refetch-on-focus storms, but a manual `refetch` is exposed for the
 * error-state retry buttons. A 401 flows through the shared client
 * interceptor (token cleared → session-expired event → login redirect),
 * so hooks only surface a friendly message.
 */

const STALE_TIME_MS = 60_000;

export interface AnalyticsQueryState<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => void;
}

function toState<T>(query: UseQueryResult<T>, fallback: string): AnalyticsQueryState<T> {
  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.isError ? toApiErrorMessage(query.error, fallback) : null,
    refetch: () => {
      void query.refetch();
    },
  };
}

export function useAnalyticsSummary(): AnalyticsQueryState<SummaryResponse> {
  const query = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: getAnalyticsSummary,
    staleTime: STALE_TIME_MS,
    retry: 1,
  });
  return toState(query, 'Could not load the financial summary.');
}

export function useRevenueExpense(): AnalyticsQueryState<RevenueExpenseResponse> {
  const query = useQuery({
    queryKey: ['analytics', 'revenue-expense'],
    queryFn: getRevenueExpense,
    staleTime: STALE_TIME_MS,
    retry: 1,
  });
  return toState(query, 'Could not load the revenue vs expenses data.');
}

export function useCategoryAnalytics(): AnalyticsQueryState<CategoryBreakdownResponse> {
  const query = useQuery({
    queryKey: ['analytics', 'categories'],
    queryFn: getCategoryBreakdown,
    staleTime: STALE_TIME_MS,
    retry: 1,
  });
  return toState(query, 'Could not load the category breakdown.');
}
