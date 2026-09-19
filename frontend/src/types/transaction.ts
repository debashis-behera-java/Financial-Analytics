/**
 * Mirrors the backend transaction API contract exactly.
 * See backend/src/services/transaction.service.ts and
 * backend/src/validation/transaction.validation.ts.
 */

export interface Transaction {
  id: number;
  date: string;
  amount: number;
  category: string;
  status: string;
  user_id: string;
  user_profile: string;
}

export interface TransactionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** GET /api/transactions response contract. */
export interface TransactionListResponse {
  data: Transaction[];
  pagination: TransactionPagination;
}

/** Sortable fields per the backend whitelist (same order as backend). */
export const SORTABLE_FIELDS = ['id', 'date', 'amount', 'category', 'status', 'user_id'] as const;
export type SortableField = (typeof SORTABLE_FIELDS)[number];

export const SORT_ORDERS = ['asc', 'desc'] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

/** Page sizes offered by the UI. Backend allows up to 100. */
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

/**
 * Distinct values verified against the real dataset
 * (mongosh distinct over all 300 records):
 * categories ["Expense","Revenue"], statuses ["Paid","Pending"].
 */
export const KNOWN_CATEGORIES = ['Expense', 'Revenue'] as const;
export const KNOWN_STATUSES = ['Paid', 'Pending'] as const;

/** Every server-side query parameter the table can send. */
export interface TransactionQueryParams {
  page: number;
  limit: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  category?: string;
  status?: string;
  user_id?: string;
  sortBy: SortableField;
  sortOrder: SortOrder;
}

export const DEFAULT_QUERY_PARAMS: TransactionQueryParams = {
  page: 1,
  limit: 10,
  sortBy: 'date',
  sortOrder: 'desc',
};

/** Draft (not yet applied) values for the Apply-gated range filters. */
export interface RangeDraft {
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  userId: string;
}

export const EMPTY_RANGE_DRAFT: RangeDraft = {
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  userId: '',
};

export interface RangeErrors {
  date?: string;
  amount?: string;
}

/** True when any search/filter differs from the unfiltered default. */
export function hasActiveFilters(params: TransactionQueryParams): boolean {
  return (
    (params.search ?? '') !== '' ||
    (params.startDate ?? '') !== '' ||
    (params.endDate ?? '') !== '' ||
    params.minAmount !== undefined ||
    params.maxAmount !== undefined ||
    (params.category ?? '') !== '' ||
    (params.status ?? '') !== '' ||
    (params.user_id ?? '') !== ''
  );
}

/**
 * Columns the user may select for CSV export. `field` values are the real
 * backend field names (also used as the CSV header row); keep in sync with
 * the backend EXPORTABLE_COLUMNS whitelist.
 */
export const EXPORTABLE_COLUMNS = [
  { field: 'id', label: 'Transaction ID' },
  { field: 'date', label: 'Date' },
  { field: 'amount', label: 'Amount' },
  { field: 'category', label: 'Category' },
  { field: 'status', label: 'Status' },
  { field: 'user_id', label: 'User ID' },
  { field: 'user_profile', label: 'User Profile' },
] as const;

export type ExportColumnField = (typeof EXPORTABLE_COLUMNS)[number]['field'];

/** Client-side fallback filename; the server's Content-Disposition wins. */
export function buildExportFilename(now: Date = new Date()): string {
  const stamp = now.toISOString().slice(0, 10);
  return `financial-transactions-${stamp}.csv`;
}
