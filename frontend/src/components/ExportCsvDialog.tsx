import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import { EXPORTABLE_COLUMNS } from '../types/transaction';
import type { ExportColumnField } from '../types/transaction';

const ALL_FIELDS: ExportColumnField[] = EXPORTABLE_COLUMNS.map((c) => c.field);

interface ExportCsvDialogProps {
  open: boolean;
  /** Filtered record total — the export covers ALL of these, every page. */
  totalCount: number;
  isExporting: boolean;
  exportError: string | null;
  onClose: () => void;
  onExport: (columns: ExportColumnField[]) => void;
}

/**
 * Export configuration dialog: column selection (all selected by default),
 * explicit "filtered results across all pages" scope, and validation that
 * forbids exporting with zero columns.
 */
export function ExportCsvDialog({
  open,
  totalCount,
  isExporting,
  exportError,
  onClose,
  onExport,
}: ExportCsvDialogProps) {
  const [selected, setSelected] = useState<ExportColumnField[]>([...ALL_FIELDS]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);

  // Reset selection each time the dialog opens (render-time adjustment,
  // the React-endorsed alternative to syncing state inside an effect).
  if (open && !wasOpen) {
    setWasOpen(true);
    setSelected([...ALL_FIELDS]);
    setValidationError(null);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  function toggle(field: ExportColumnField): void {
    setSelected((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]));
    setValidationError(null);
  }

  function handleExport(): void {
    if (selected.length === 0) {
      setValidationError('Select at least one column to export.');
      return;
    }
    // Preserve the dialog's column order.
    onExport(ALL_FIELDS.filter((f) => selected.includes(f)));
  }

  return (
    <Dialog open={open} onClose={isExporting ? undefined : onClose} aria-labelledby="export-csv-title" fullWidth maxWidth="xs">
      <DialogTitle id="export-csv-title">Export transactions as CSV</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Exports all {totalCount} matching {totalCount === 1 ? 'record' : 'records'} across all pages using your
          current search, filters, and sorting — not just the visible page.
        </Typography>
        <Button size="small" onClick={() => setSelected([...ALL_FIELDS])} disabled={isExporting} aria-label="Select all columns">
          Select all
        </Button>
        <Button
          size="small"
          onClick={() => {
            setSelected([]);
            setValidationError(null);
          }}
          disabled={isExporting}
          aria-label="Clear all columns"
        >
          Clear all
        </Button>
        <FormGroup sx={{ mt: 1 }}>
          {EXPORTABLE_COLUMNS.map((col) => (
            <FormControlLabel
              key={col.field}
              control={
                <Checkbox
                  checked={selected.includes(col.field)}
                  onChange={() => toggle(col.field)}
                  disabled={isExporting}
                  slotProps={{ input: { 'aria-label': `Include ${col.label}` } }}
                />
              }
              label={`${col.label} (${col.field})`}
            />
          ))}
        </FormGroup>
        {validationError && (
          <Alert severity="warning" sx={{ mt: 1 }} role="alert">
            {validationError}
          </Alert>
        )}
        {exportError && (
          <Alert severity="error" sx={{ mt: 1 }} role="alert">
            {exportError}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleExport} disabled={isExporting} aria-label="Download CSV">
          {isExporting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} aria-label="Exporting CSV" />
              Exporting…
            </>
          ) : (
            'Export CSV'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
