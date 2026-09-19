import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import DownloadIcon from '@mui/icons-material/Download';
import ViewListIcon from '@mui/icons-material/ViewList';
import { TransactionFilters } from './TransactionFilters';
import { TransactionTable } from './TransactionTable';
import { ExportCsvDialog } from './ExportCsvDialog';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useTransactions } from '../hooks/useTransactions';
import { exportTransactionsCsv } from '../api/transactions';
import { toApiErrorMessage } from '../api/client';
import { downloadBlob } from '../utils/download';
import { formatCount } from '../utils/format';
import { GLOBAL_SEARCH_EVENT } from '../utils/globalSearch';
import { DEFAULT_QUERY_PARAMS, EMPTY_RANGE_DRAFT, PAGE_SIZE_OPTIONS, hasActiveFilters } from '../types/transaction';
import type { ExportColumnField, RangeDraft, RangeErrors, SortableField, TransactionQueryParams } from '../types/transaction';

const SEARCH_DEBOUNCE_MS = 400;

interface AppliedRange {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  user_id?: string;
}

function validateDraft(draft: RangeDraft): { errors: RangeErrors; applied: AppliedRange | null } {
  const errors: RangeErrors = {};

  const startRaw = draft.startDate.trim();
  const endRaw = draft.endDate.trim();
  let start: Date | null = null;
  let end: Date | null = null;
  if (startRaw !== '') {
    start = new Date(`${startRaw}T00:00:00Z`);
    if (Number.isNaN(start.getTime())) {
      errors.date = 'Start date is not a valid date.';
    }
  }
  if (endRaw !== '') {
    end = new Date(`${endRaw}T00:00:00Z`);
    if (Number.isNaN(end.getTime())) {
      errors.date = 'End date is not a valid date.';
    }
  }
  if (!errors.date && start && end && start.getTime() > end.getTime()) {
    errors.date = 'End date must be on or after the start date.';
  }

  const minRaw = draft.minAmount.trim();
  const maxRaw = draft.maxAmount.trim();
  let min: number | undefined;
  let max: number | undefined;
  if (minRaw !== '') {
    min = Number(minRaw);
    if (!Number.isFinite(min)) {
      errors.amount = 'Minimum amount must be a number.';
    }
  }
  if (maxRaw !== '') {
    max = Number(maxRaw);
    if (!Number.isFinite(max)) {
      errors.amount = 'Maximum amount must be a number.';
    }
  }
  if (!errors.amount && min !== undefined && max !== undefined && min > max) {
    errors.amount = 'Maximum amount must be greater than or equal to the minimum.';
  }

  if (errors.date !== undefined || errors.amount !== undefined) {
    return { errors, applied: null };
  }
  return {
    errors,
    applied: {
      startDate: startRaw === '' ? undefined : startRaw,
      endDate: endRaw === '' ? undefined : endRaw,
      minAmount: min,
      maxAmount: max,
      user_id: draft.userId.trim() === '' ? undefined : draft.userId.trim(),
    },
  };
}

/**
 * Transaction management section. Owns ALL table state (page, page size,
 * debounced search, applied filters, sort) and issues exactly one
 * server-side request per state change via useTransactions. Nothing is
 * ever filtered, sorted, or paginated in React — rows render verbatim.
 */
export function TransactionSection() {
  const [page, setPage] = useState(DEFAULT_QUERY_PARAMS.page);
  const [limit, setLimit] = useState<number>(DEFAULT_QUERY_PARAMS.limit);
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [appliedRange, setAppliedRange] = useState<AppliedRange>({});
  const [draft, setDraft] = useState<RangeDraft>(EMPTY_RANGE_DRAFT);
  const [errors, setErrors] = useState<RangeErrors>({});
  const [sortBy, setSortBy] = useState<SortableField>(DEFAULT_QUERY_PARAMS.sortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(DEFAULT_QUERY_PARAMS.sortOrder);
  const [exportOpen, setExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  // Header global search feeds the REAL debounced server-side search here.
  useEffect(() => {
    function onGlobalSearch(e: Event): void {
      const query = (e as CustomEvent<string>).detail ?? '';
      setSearchInput(query);
      setPage(1);
      requestAnimationFrame(() => {
        document.getElementById('transactions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.getElementById('tx-search')?.focus({ preventScroll: true });
      });
    }
    window.addEventListener(GLOBAL_SEARCH_EVENT, onGlobalSearch);
    return () => window.removeEventListener(GLOBAL_SEARCH_EVENT, onGlobalSearch);
  }, []);

  const params: TransactionQueryParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch.trim() === '' ? undefined : debouncedSearch.trim(),
      startDate: appliedRange.startDate,
      endDate: appliedRange.endDate,
      minAmount: appliedRange.minAmount,
      maxAmount: appliedRange.maxAmount,
      category: category === '' ? undefined : category,
      status: status === '' ? undefined : status,
      user_id: appliedRange.user_id,
      sortBy,
      sortOrder,
    }),
    [page, limit, debouncedSearch, appliedRange, category, status, sortBy, sortOrder],
  );

  const { data, isLoading, isFetching, isError, errorMessage, refetch } = useTransactions(params);
  const filtersActive = hasActiveFilters(params);
  const rows = data?.data ?? [];
  const total = data?.pagination.total ?? 0;

  function handleSearchChange(value: string): void {
    setSearchInput(value);
    setPage(1);
  }

  function handleCategoryChange(value: string): void {
    setCategory(value);
    setPage(1);
  }

  function handleStatusChange(value: string): void {
    setStatus(value);
    setPage(1);
  }

  function handleDraftChange(patch: Partial<RangeDraft>): void {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function handleApplyRange(): void {
    const { errors: nextErrors, applied } = validateDraft(draft);
    setErrors(nextErrors);
    if (!applied) {
      return;
    }
    setAppliedRange(applied);
    setPage(1);
  }

  function handleReset(): void {
    setSearchInput('');
    setCategory('');
    setStatus('');
    setDraft(EMPTY_RANGE_DRAFT);
    setErrors({});
    setAppliedRange({});
    setPage(1);
  }

  function handleSortChange(field: SortableField): void {
    if (field === sortBy) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder(field === 'date' ? 'desc' : 'asc');
    }
    setPage(1);
  }

  function handleLimitChange(newLimit: number): void {
    setLimit(newLimit);
    setPage(1);
  }

  function showSnackbar(message: string, severity: 'success' | 'error'): void {
    setSnackbar({ open: true, message, severity });
  }

  function handleCloseSnackbar(_event?: unknown, reason?: string): void {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  }

  /**
   * Export ALL records matching the current search/filters/sort — page and
   * page size are deliberately omitted so the file never represents just
   * the visible page.
   */
  async function handleExport(columns: ExportColumnField[]): Promise<void> {
    if (isExporting) {
      return;
    }
    setIsExporting(true);
    setExportError(null);
    try {
      const { blob, filename } = await exportTransactionsCsv(
        {
          search: params.search,
          startDate: params.startDate,
          endDate: params.endDate,
          minAmount: params.minAmount,
          maxAmount: params.maxAmount,
          category: params.category,
          status: params.status,
          user_id: params.user_id,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        },
        columns,
      );
      downloadBlob(blob, filename);
      setExportOpen(false);
      showSnackbar(`CSV export completed. ${formatCount(total)} ${total === 1 ? 'record' : 'records'} exported.`, 'success');
    } catch (error) {
      const message = toApiErrorMessage(error, 'CSV export failed. Please try again.');
      setExportError(message);
      showSnackbar(message, 'error');
    } finally {
      setIsExporting(false);
    }
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(page * limit, total);

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ color: 'primary.main', display: 'flex' }} aria-hidden="true">
              <ViewListIcon />
            </Box>
            Transactions
          </Box>
        }
        subheader="Browse, search, filter, and sort all recorded transactions"
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => {
              setExportError(null);
              setExportOpen(true);
            }}
            disabled={isLoading || total === 0}
            aria-label="Export filtered transactions as CSV"
            sx={{
              background: 'linear-gradient(135deg, #2e63f0 0%, #7c3aed 100%)',
              boxShadow: '0 4px 14px rgba(46, 99, 240, 0.35)',
            }}
          >
            Export CSV
          </Button>
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 1 }}>
        <TransactionFilters
          searchInput={searchInput}
          onSearchChange={handleSearchChange}
          category={category}
          onCategoryChange={handleCategoryChange}
          status={status}
          onStatusChange={handleStatusChange}
          draft={draft}
          onDraftChange={handleDraftChange}
          errors={errors}
          onApply={handleApplyRange}
          onReset={handleReset}
          hasActiveFilters={filtersActive || draft.startDate !== '' || draft.endDate !== '' || draft.minAmount !== '' || draft.maxAmount !== '' || draft.userId !== ''}
        />

        {(isFetching && !isLoading) && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress aria-label="Refreshing transactions" />
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          {isLoading ? (
            <Box aria-busy="true" aria-label="Loading transactions">
              {Array.from({ length: limit }).map((_, i) => (
                <Skeleton key={`tx-skeleton-${i}`} variant="rounded" height={48} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : isError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={refetch}>
                  Retry
                </Button>
              }
            >
              {errorMessage ?? 'Could not load transactions.'}
            </Alert>
          ) : rows.length === 0 ? (
            <Box sx={{ py: 7, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: '#f8fafc' }}>
              <Typography variant="h6" component="div" gutterBottom>
                No transactions found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {filtersActive
                  ? 'Try adjusting your search or filters.'
                  : 'There are no transactions to display.'}
              </Typography>
              {filtersActive && (
                <Button variant="outlined" onClick={handleReset} aria-label="Clear search and filters">
                  Clear search and filters
                </Button>
              )}
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25, fontWeight: 500 }} aria-live="polite">
                Showing {formatCount(rangeStart)}–{formatCount(rangeEnd)} of {formatCount(total)} transactions
                {filtersActive ? ' (filtered)' : ''}
              </Typography>
              <TransactionTable rows={rows} sortBy={sortBy} sortOrder={sortOrder} onSortChange={handleSortChange} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
              <TablePagination
                component="div"
                count={total}
                page={page - 1}
                rowsPerPage={limit}
                rowsPerPageOptions={[...PAGE_SIZE_OPTIONS]}
                onPageChange={(_, newPage) => setPage(newPage + 1)}
                onRowsPerPageChange={(e) => handleLimitChange(Number(e.target.value))}
                labelRowsPerPage="Rows per page"
              />
              </Box>
            </>
          )}
        </Box>
      </CardContent>
      <ExportCsvDialog
        open={exportOpen}
        totalCount={total}
        isExporting={isExporting}
        exportError={exportError}
        onClose={() => {
          if (!isExporting) {
            setExportOpen(false);
          }
        }}
        onExport={handleExport}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => handleCloseSnackbar()} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
}
