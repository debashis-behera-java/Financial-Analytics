import { apiClient } from './client';
import { buildExportFilename } from '../types/transaction';
import type {
  ExportColumnField,
  TransactionListResponse,
  TransactionQueryParams,
} from '../types/transaction';

/** Filter/sort fields shared by the table query and the CSV export. */
export interface TransactionFilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  category?: string;
  status?: string;
  user_id?: string;
  sortBy: TransactionQueryParams['sortBy'];
  sortOrder: TransactionQueryParams['sortOrder'];
}

/** Single serializer for table + export requests — one logic, no drift. */
function serializeFilterParams(params: TransactionFilterParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  searchParams.set('sortBy', params.sortBy);
  searchParams.set('sortOrder', params.sortOrder);

  if (params.search && params.search.trim() !== '') {
    searchParams.set('search', params.search.trim());
  }
  if (params.startDate) {
    searchParams.set('startDate', params.startDate);
  }
  if (params.endDate) {
    searchParams.set('endDate', params.endDate);
  }
  if (params.minAmount !== undefined) {
    searchParams.set('minAmount', String(params.minAmount));
  }
  if (params.maxAmount !== undefined) {
    searchParams.set('maxAmount', String(params.maxAmount));
  }
  if (params.category) {
    searchParams.set('category', params.category);
  }
  if (params.status) {
    searchParams.set('status', params.status);
  }
  if (params.user_id) {
    searchParams.set('user_id', params.user_id);
  }
  return searchParams;
}

/**
 * Transaction API service. Everything (search, filter, sort, paginate) is
 * executed server-side by GET /api/transactions — this function only
 * serializes the requested params. Empty/undefined values are omitted so
 * the backend applies its defaults.
 */
export async function getTransactions(params: TransactionQueryParams): Promise<TransactionListResponse> {
  const searchParams = serializeFilterParams(params);
  searchParams.set('page', String(params.page));
  searchParams.set('limit', String(params.limit));

  const { data } = await apiClient.get<TransactionListResponse>(`/transactions?${searchParams.toString()}`);
  return data;
}

export interface ExportCsvResult {
  blob: Blob;
  filename: string;
}

function filenameFromDisposition(header: string | undefined): string | null {
  if (!header) {
    return null;
  }
  const match = /filename="([^"]+)"/.exec(header);
  return match?.[1] ?? null;
}

/**
 * Server-side CSV export of ALL records matching the current filters,
 * search, and sort (never just the visible page — no page/limit is sent).
 * The backend generates the file; this returns it for browser download.
 */
export async function exportTransactionsCsv(
  params: TransactionFilterParams,
  columns: ExportColumnField[],
): Promise<ExportCsvResult> {
  const searchParams = serializeFilterParams(params);
  searchParams.set('columns', columns.join(','));

  const response = await apiClient.get<Blob>(`/transactions/export?${searchParams.toString()}`, {
    responseType: 'blob',
  });
  const filename =
    filenameFromDisposition(response.headers['content-disposition'] as string | undefined) ??
    buildExportFilename();
  return { blob: response.data, filename };
}
