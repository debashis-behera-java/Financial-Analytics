import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { MetricCard } from './MetricCard';
import { useAnalyticsSummary, useRevenueExpense } from '../hooks/useAnalytics';
import { formatCount, formatCurrency, formatSignedCurrency } from '../utils/format';

/** Tiny trend sparkline built from real monthly backend buckets. */
function Sparkline({ id, values, color, label }: { id: string; values: number[]; color: string; label: string }) {
  if (values.length === 0) {
    return null;
  }
  const points = values.map((v, i) => ({ i, v }));
  return (
    <Box sx={{ height: 48, mt: 1.5 }} role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 3, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            fill={`url(#${id})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

/** Four summary metrics from GET /api/analytics/summary. */
export function SummaryCards() {
  const { data, isLoading, isError, errorMessage, refetch } = useAnalyticsSummary();
  const { data: trendData } = useRevenueExpense();
  const buckets = trendData?.data ?? [];

  if (isLoading) {
    return <SummaryCardsSkeleton />;
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={refetch}>
            Retry
          </Button>
        }
      >
        {errorMessage ?? 'Could not load the financial summary.'}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No summary data available.
        </Typography>
      </Box>
    );
  }

  const netPositive = data.netBalance >= 0;
  const netColor = netPositive ? 'success.main' : 'error.main';
  const netAccent = netPositive ? '#16a34a' : '#dc2626';

  return (
    <Grid container spacing={3} aria-label="Financial summary">
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          subtitle="All revenue transactions"
          isLoading={false}
          valueColor="success.main"
          accentColor="#16a34a"
          tinted
          icon={<TrendingUpIcon />}
          sparkline={
            <Sparkline id="spark-revenue" values={buckets.map((b) => b.revenue)} color="#16a34a" label="Monthly revenue trend" />
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(data.totalExpenses)}
          subtitle="All expense transactions"
          isLoading={false}
          valueColor="error.main"
          accentColor="#dc2626"
          tinted
          icon={<TrendingDownIcon />}
          sparkline={
            <Sparkline id="spark-expenses" values={buckets.map((b) => b.expenses)} color="#dc2626" label="Monthly expenses trend" />
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title="Net Balance"
          value={formatSignedCurrency(data.netBalance)}
          subtitle="Revenue minus expenses"
          isLoading={false}
          valueColor={netColor}
          accentColor={netAccent}
          tinted
          icon={<AccountBalanceWalletIcon />}
          sparkline={
            <Sparkline
              id="spark-net"
              values={buckets.map((b) => b.revenue - b.expenses)}
              color={netAccent}
              label="Monthly net balance trend"
            />
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title="Transactions"
          value={formatCount(data.transactionCount)}
          subtitle="Total records analyzed"
          isLoading={false}
          valueColor="#6d28d9"
          accentColor="#7c3aed"
          tinted
          icon={<ReceiptLongIcon />}
          sparkline={
            <Sparkline id="spark-transactions" values={buckets.map((b) => b.count)} color="#7c3aed" label="Monthly transaction trend" />
          }
        />
      </Grid>
    </Grid>
  );
}

/** Skeleton grid shown while the summary loads (keeps layout stable). */
export function SummaryCardsSkeleton() {
  return (
    <Grid container spacing={3} aria-label="Financial summary loading">
      {['Total Revenue', 'Total Expenses', 'Net Balance', 'Transactions'].map((title) => (
        <Grid key={title} size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard title={title} value={null} isLoading />
        </Grid>
      ))}
    </Grid>
  );
}

/** Card shell used by chart sections for a consistent look. */
export function SectionCard({
  title,
  subtitle,
  children,
  icon,
  elevated,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  icon?: ReactNode;
  /**
   * Premium solid-light surface for the Revenue vs Expenses card only.
   * When omitted the shared glass look applies (Category card unchanged).
   */
  elevated?: boolean;
}) {
  const baseSx: SxProps<Theme> = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    backdropFilter: 'blur(24px) saturate(140%)',
    WebkitBackdropFilter: 'blur(24px) saturate(140%)',
    border: '1px solid rgba(255, 255, 255, 0.65)',
    outline: '1px solid rgba(230, 234, 240, 0.6)',
    boxShadow: '0 20px 50px rgba(70, 90, 140, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.55)',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 32px rgba(70, 90, 140, 0.14)',
    },
  };
  const elevatedSx: SxProps<Theme> = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.9)',
    outline: '1px solid rgba(226, 232, 240, 0.5)',
    boxShadow: '0 12px 35px rgba(50, 80, 160, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 16px 40px rgba(50, 80, 160, 0.12)',
    },
  };
  return (
    <Card sx={elevated ? elevatedSx : baseSx}>
      <CardHeader
        sx={
          elevated
            ? {
                '& .MuiCardHeader-subheader': {
                  fontSize: '0.9375rem',
                  color: '#64748b',
                  marginTop: '8px',
                },
              }
            : undefined
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon && (
              <Box sx={{ color: 'primary.main', display: 'flex' }} aria-hidden="true">
                {icon}
              </Box>
            )}
            {title}
          </Box>
        }
        subheader={subtitle}
        titleTypographyProps={
          elevated
            ? { variant: 'h5', sx: { fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em' } }
            : { variant: 'h6' }
        }
      />
      <CardContent sx={elevated ? { flex: 1, pt: 2, px: 4, pb: 3 } : { flex: 1, pt: 2, px: 3.5, pb: 3.5 }}>
        {children}
      </CardContent>
    </Card>
  );
}
