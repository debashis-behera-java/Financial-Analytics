import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import { KNOWN_CATEGORIES, KNOWN_STATUSES } from '../types/transaction';
import type { RangeDraft, RangeErrors } from '../types/transaction';

interface TransactionFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  draft: RangeDraft;
  onDraftChange: (patch: Partial<RangeDraft>) => void;
  errors: RangeErrors;
  onApply: () => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

/**
 * Server-side filter controls. Search, category, and status apply
 * immediately (search is debounced upstream); the date/amount/user range
 * applies explicitly via Apply so partial input never fires requests.
 */
export function TransactionFilters({
  searchInput,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  draft,
  onDraftChange,
  errors,
  onApply,
  onReset,
  hasActiveFilters,
}: TransactionFiltersProps) {
  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          id="tx-search"
          label="Search transactions"
          placeholder="Search transactions..."
          fullWidth
          size="small"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 2 }}>
        <TextField
          id="tx-category"
          label="Category"
          select
          fullWidth
          size="small"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <MenuItem value="">All Categories</MenuItem>
          {KNOWN_CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 6, md: 2 }}>
        <TextField
          id="tx-status"
          label="Status"
          select
          fullWidth
          size="small"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <MenuItem value="">All Status</MenuItem>
          {KNOWN_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 6, md: 2 }}>
        <TextField
          id="tx-start-date"
          label="Start date"
          type="date"
          fullWidth
          size="small"
          value={draft.startDate}
          onChange={(e) => onDraftChange({ startDate: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
          error={errors.date !== undefined}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 2 }}>
        <TextField
          id="tx-end-date"
          label="End date"
          type="date"
          fullWidth
          size="small"
          value={draft.endDate}
          onChange={(e) => onDraftChange({ endDate: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
          error={errors.date !== undefined}
          helperText={errors.date}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 2 }}>
        <TextField
          id="tx-min-amount"
          label="Min amount"
          type="number"
          fullWidth
          size="small"
          value={draft.minAmount}
          onChange={(e) => onDraftChange({ minAmount: e.target.value })}
          error={errors.amount !== undefined}
          slotProps={{
            htmlInput: { min: 0, step: 'any' },
            input: {
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 2 }}>
        <TextField
          id="tx-max-amount"
          label="Max amount"
          type="number"
          fullWidth
          size="small"
          value={draft.maxAmount}
          onChange={(e) => onDraftChange({ maxAmount: e.target.value })}
          error={errors.amount !== undefined}
          helperText={errors.amount}
          slotProps={{
            htmlInput: { min: 0, step: 'any' },
            input: {
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          id="tx-user"
          label="User ID"
          placeholder="Enter user ID"
          fullWidth
          size="small"
          value={draft.userId}
          onChange={(e) => onDraftChange({ userId: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onApply();
            }
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Button
          variant="contained"
          startIcon={<FilterAltIcon fontSize="small" />}
          onClick={onApply}
          aria-label="Apply filters"
        >
          Apply Filters
        </Button>
        <Button
          variant="outlined"
          startIcon={<RestartAltIcon fontSize="small" />}
          onClick={onReset}
          disabled={!hasActiveFilters}
          aria-label="Clear all filters"
        >
          Reset
        </Button>
      </Grid>
    </Grid>
  );
}
