import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface SectionStateProps {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isEmpty: boolean;
  loadingLabel: string;
  emptyMessage: string;
  onRetry: () => void;
  children: ReactNode;
}

/**
 * Shared loading / error (with retry) / empty handling for dashboard
 * sections. Keeps every analytics panel consistent without duplicating
 * state branches.
 */
export function SectionState({
  isLoading,
  isError,
  errorMessage,
  isEmpty,
  loadingLabel,
  emptyMessage,
  onRetry,
  children,
}: SectionStateProps) {
  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}
        aria-busy="true"
      >
        <CircularProgress aria-label={loadingLabel} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        sx={{ mt: 1 }}
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        }
      >
        {errorMessage ?? 'Something went wrong while loading this section.'}
      </Alert>
    );
  }

  if (isEmpty) {
    return (
      <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
