import { createTheme } from '@mui/material/styles';

const FONT_STACK =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/** Shared glassmorphic page background (soft blue + lavender + white). */
export const GLASS_PAGE_BACKGROUND =
  'radial-gradient(circle at 10% 8%, rgba(74, 144, 255, 0.22) 0%, transparent 38%),' +
  'radial-gradient(circle at 90% 12%, rgba(125, 92, 255, 0.2) 0%, transparent 36%),' +
  'radial-gradient(circle at 50% 55%, rgba(83, 160, 255, 0.1) 0%, transparent 45%),' +
  'linear-gradient(135deg, #eef6ff 0%, #eef2ff 45%, #f4efff 100%)';

/** Reusable glass-surface tokens (legacy alias — prefer `lib/glass`). */
export const GLASS_SURFACE = {
  backgroundColor: 'rgba(255, 255, 255, 0.55)',
  backdropFilter: 'blur(24px) saturate(140%)',
  WebkitBackdropFilter: 'blur(24px) saturate(140%)',
  border: '1px solid rgba(255, 255, 255, 0.65)',
  boxShadow: '0 20px 50px rgba(70, 90, 140, 0.12)',
  borderRadius: '24px',
} as const;

/** Subtle premium lift used on KPI/chart cards (180–250ms ease). */
export const GLASS_HOVER_TRANSITION = 'transform 200ms ease, box-shadow 200ms ease';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb', dark: '#1d4ed8', light: '#dbeafe', contrastText: '#ffffff' },
    secondary: { main: '#475569', light: '#e2e8f0' },
    success: { main: '#16a34a', dark: '#15803d', light: '#dcfce7', contrastText: '#ffffff' },
    error: { main: '#dc2626', dark: '#b91c1c', light: '#fee2e2', contrastText: '#ffffff' },
    warning: { main: '#d97706', dark: '#b45309', light: '#fef3c7', contrastText: '#ffffff' },
    info: { main: '#2563eb', light: '#dbeafe' },
    text: { primary: '#0f172a', secondary: '#64748b' },
    background: { default: '#edf2fb', paper: '#ffffff' },
    divider: '#e6eaf0',
  },
  typography: {
    fontFamily: FONT_STACK,
    h4: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.25, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, fontSize: '1.375rem', lineHeight: 1.3, letterSpacing: '-0.01em' },
    h6: { fontWeight: 650, fontSize: '1.125rem', lineHeight: 1.4, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.55 },
    body2: { fontSize: '0.875rem', lineHeight: 1.55 },
    overline: { fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 2px rgba(15, 23, 42, 0.05)',
    '0 1px 3px rgba(15, 23, 42, 0.07), 0 1px 2px rgba(15, 23, 42, 0.05)',
    '0 4px 12px rgba(15, 23, 42, 0.06)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--glass-bg': 'rgba(255, 255, 255, 0.5)',
          '--glass-border': 'rgba(255, 255, 255, 0.65)',
          '--glass-shadow': '0 20px 50px rgba(70, 90, 140, 0.12)',
          '--primary-blue': '#2563eb',
          '--primary-purple': '#7c3aed',
          '--revenue-green': '#16a34a',
          '--expense-red': '#dc2626',
          '--page-background': 'linear-gradient(135deg, #eef6ff 0%, #eef2ff 45%, #f4efff 100%)',
        },
        body: { backgroundColor: '#eef2ff', color: '#0f172a' },
        '::selection': { backgroundColor: '#dbeafe' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0f172a',
          boxShadow: 'none',
          borderBottom: '1px solid #e6eaf0',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: { minHeight: 64 },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: { paddingLeft: 24, paddingRight: 24 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(255, 255, 255, 0.65)',
          outline: '1px solid rgba(230, 234, 240, 0.7)',
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          boxShadow: '0 20px 50px rgba(70, 90, 140, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.55)',
          borderRadius: 24,
          transition: 'transform 200ms ease, box-shadow 200ms ease',
          '@supports not (backdrop-filter: blur(1px))': {
            backgroundColor: '#ffffff',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: { padding: '24px 28px 0 28px' },
        title: { fontSize: '1.0625rem', fontWeight: 650, letterSpacing: '-0.01em' },
        subheader: { fontSize: '0.8375rem', color: '#64748b', marginTop: 4 },
        action: { marginTop: 0, marginRight: 0, alignSelf: 'center' },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px 28px 28px 28px',
          '&:last-child': { paddingBottom: 28 },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 9, transition: 'filter 180ms ease, background-color 180ms ease' },
        contained: {
          boxShadow: '0 1px 2px rgba(37, 99, 235, 0.25)',
          '&.MuiButton-containedPrimary:hover': { filter: 'brightness(1.06)' },
        },
        sizeMedium: { minHeight: 38, paddingLeft: 16, paddingRight: 16 },
        sizeSmall: { minHeight: 32 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          minHeight: 40,
          transition: 'box-shadow 180ms ease, border-color 180ms ease',
          '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563eb', borderWidth: 2 },
        },
        input: { padding: '9px 12px' },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: '0.875rem' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 999 },
        sizeSmall: { height: 24, fontSize: '0.75rem' },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: 'rgba(239, 246, 255, 0.8)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: '#64748b',
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            borderBottom: '1px solid #e6eaf0',
            paddingTop: 10,
            paddingBottom: 10,
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root:last-child .MuiTableCell-body': { borderBottom: 'none' },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: '1px solid #eef1f6', padding: '12px 16px', fontSize: '0.875rem' },
        body: { color: '#0f172a' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover': { backgroundColor: '#f8fafc' },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: { color: '#64748b', fontSize: '0.8125rem' },
        toolbar: { paddingLeft: 8, paddingRight: 8 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
  },
});
