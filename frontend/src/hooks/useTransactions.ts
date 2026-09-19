import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { getTransactions } from '../api/transactions';
import { toApiErrorMessage } from '../api/client';
import type { TransactionListResponse, TransactionQueryParams } from '../types/transaction';

/**
 * Server-driven transaction list. The query key contains EVERY request
 * parameter, so any change (page, limit, search, filter, sort) triggers a
 * fresh backend request. `placeholderData: keepPreviousData` keeps the
 * previous page visible while the next one loads (no layout jump, and a
 * clear `isFetching` flag for a subtle progress indicator).
 * A 401 flows through the shared client interceptor (token cleared →
 * session-expired event → login redirect); only a message surfaces here.
 */

export interface TransactionsQueryState {
  data: TransactionListResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => void;
}

function toState(query: UseQueryResult<TransactionListResponse>): TransactionsQueryState {
  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    errorMessage: query.isError ? toApiErrorMessage(query.error, 'Could not load transactions.') : null,
    refetch: () => {
      void query.refetch();
    },
  };
}

export function useTransactions(params: TransactionQueryParams): TransactionsQueryState {
  const query = useQuery({
    queryKey: [
      'transactions',
      params.page,
      params.limit,
      params.search ?? '',
      params.startDate ?? '',
      params.endDate ?? '',
      params.minAmount ?? null,
      params.maxAmount ?? null,
      params.category ?? '',
      params.status ?? '',
      params.user_id ?? '',
      params.sortBy,
      params.sortOrder,
    ],
    queryFn: () => getTransactions(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 1,
  });
  return toState(query);
}
