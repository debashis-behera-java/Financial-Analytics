import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import MovieIcon from '@mui/icons-material/Movie';
import PieChartIcon from '@mui/icons-material/PieChart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { SectionState } from './SectionState';
import { useCategoryAnalytics } from '../hooks/useAnalytics';
import { formatCount, formatCurrency } from '../utils/format';

/** Premium fintech palette fallback, cycled by index for unknown categories. */
const FALLBACK_COLORS = ['#3182F6', '#22C55E', '#FBBF24', '#F43F5E', '#8B5CF6', '#6366F1', '#94A3B8'];

/** Category color: keyword match first (live data is Revenue/Expense), index fallback. */
function colorForCategory(category: string, index: number): string {
  const key = category.toLowerCase();
  if (key.includes('revenue')) return '#22C55E';
  if (key.includes('expense')) return '#F43F5E';
  if (key.includes('food') || key.includes('din')) return '#3182F6';
  if (key.includes('transport') || key.includes('travel') || key.includes('car')) return '#22C55E';
  if (key.includes('shop')) return '#FBBF24';
  if (key.includes('bill') || key.includes('utilit')) return '#F43F5E';
  if (key.includes('health') || key.includes('medical')) return '#8B5CF6';
  if (key.includes('entertain') || key.includes('game') || key.includes('movie')) return '#6366F1';
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length] as string;
}

/** Category icon: keyword match first, generic dots fallback. Reuses MUI icons only. */
function iconForCategory(category: string): typeof MoreHorizIcon {
  const key = category.toLowerCase();
  if (key.includes('revenue')) return TrendingUpIcon;
  if (key.includes('expense')) return ReceiptIcon;
  if (key.includes('food') || key.includes('din')) return RestaurantIcon;
  if (key.includes('transport') || key.includes('travel') || key.includes('car')) return DirectionsCarIcon;
  if (key.includes('shop')) return ShoppingBagIcon;
  if (key.includes('bill') || key.includes('utilit')) return ReceiptLongIcon;
  if (key.includes('health') || key.includes('medical')) return FavoriteIcon;
  if (key.includes('entertain') || key.includes('game') || key.includes('movie')) return MovieIcon;
  return MoreHorizIcon;
}

function tooltipFormatter(value: unknown, name: unknown, metric: 'total' | 'count'): [string, string] {
  const numeric = typeof value === 'number' ? value : Number(value);
  const safe = Number.isFinite(numeric) ? numeric : 0;
  return [metric === 'total' ? formatCurrency(safe) : `${formatCount(safe)} transactions`, String(name)];
}

/**
 * Category share donut with a premium glass category list.
 * Totals come verbatim from GET /api/analytics/categories; the metric
 * toggle switches between the two real backend measures (total amount
 * vs transaction count). No values are hardcoded — rows, shares, colors
 * and icons all derive from the live response.
 */
export function CategoryChart() {
  const { data, isLoading, isError, errorMessage, refetch } = useCategoryAnalytics();
  const [metric, setMetric] = useState<'total' | 'count'>('total');
  const items = data?.data ?? [];
  const grandTotal = items.reduce((sum, item) => sum + (metric === 'total' ? item.total : item.count), 0);
  const totalCount = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '26px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.72), rgba(241,244,255,0.55))',
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        border: '1px solid rgba(255,255,255,0.85)',
        boxShadow:
          '0 18px 50px rgba(80,100,180,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
        p: 3.5,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -90,
          right: -70,
          width: 230,
          height: 230,
          background: 'radial-gradient(circle, rgba(96,165,250,0.20), transparent 70%)',
          filter: 'blur(28px)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -100,
          left: -60,
          width: 220,
          height: 220,
          background: 'radial-gradient(circle, rgba(139,92,246,0.16), transparent 70%)',
          filter: 'blur(28px)',
          pointerEvents: 'none',
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 22px 55px rgba(80,100,180,0.14), inset 0 1px 0 rgba(255,255,255,0.9)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          flexWrap: 'wrap',
          mb: 2.75,
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '17px',
            background: 'linear-gradient(135deg, #4F7CFF, #7C4DFF)',
            boxShadow: '0 8px 20px rgba(79,124,255,0.25)',
            color: 'common.white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <PieChartIcon />
        </Box>
        <Box sx={{ flex: '1 1 160px', minWidth: 0 }}>
          <Typography
            component="h2"
            sx={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#0f172a', lineHeight: 1.25 }}
          >
            Category Breakdown
          </Typography>
          <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', mt: 0.5, lineHeight: 1.45 }}>
            Distribution of transactions by category
          </Typography>
        </Box>
        <TextField
          select
          size="small"
          label="Metric"
          value={metric}
          onChange={(e) => setMetric(e.target.value as 'total' | 'count')}
          sx={{
            width: { xs: '100%', sm: 180 },
            flexShrink: 0,
            '& .MuiOutlinedInput-root': {
              minHeight: 56,
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 10px rgba(67, 87, 160, 0.07)',
              fontSize: '0.875rem',
              fontWeight: 600,
            },
          }}
          aria-label="Category share metric"
        >
          <MenuItem value="total">By total</MenuItem>
          <MenuItem value="count">By count</MenuItem>
        </TextField>
      </Box>

      <SectionState
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        isEmpty={!isLoading && !isError && items.length === 0}
        loadingLabel="Loading category breakdown chart"
        emptyMessage="No category data for the selected period."
        onRetry={refetch}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ position: 'relative', maxWidth: 330, mx: 'auto', width: '100%' }}>
            <ResponsiveContainer width="100%" height={260} aria-label="Spending and revenue share by category">
              <PieChart>
                <Tooltip
                  formatter={(value, name) => tooltipFormatter(value, name, metric)}
                  contentStyle={{
                    borderRadius: 14,
                    border: '1px solid rgba(230, 234, 240, 0.9)',
                    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                    fontSize: 13,
                    padding: '10px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  }}
                />
                <Pie
                  data={items}
                  dataKey={metric}
                  nameKey="category"
                  innerRadius="62%"
                  outerRadius="88%"
                  paddingAngle={3}
                  cornerRadius={6}
                  stroke="#ffffff"
                  strokeWidth={3}
                >
                  {items.map((item, index) => (
                    <Cell key={item.category} fill={colorForCategory(item.category, index)} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            >
              <Typography sx={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1, color: '#0f172a' }}>
                {formatCount(totalCount)}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: '#64748b' }}>Transactions</Typography>
            </Box>
          </Box>

          <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 2.5, p: 0 }} aria-label="Category totals">
            {items.map((item, index) => {
              const color = colorForCategory(item.category, index);
              const Icon = iconForCategory(item.category);
              const value = metric === 'total' ? item.total : item.count;
              const share = grandTotal > 0 ? (value / grandTotal) * 100 : 0;
              const detail =
                metric === 'total'
                  ? `${formatCurrency(item.total)} (${formatCount(item.count)} transactions)`
                  : `${formatCount(item.count)} transactions (${formatCurrency(item.total)})`;
              return (
                <Box
                  component="li"
                  key={item.category}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    backgroundColor: 'rgba(255, 255, 255, 0.38)',
                    border: '1px solid rgba(255, 255, 255, 0.55)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderRadius: '15px',
                    padding: '10px 14px',
                    mb: 1.25,
                    transition: 'all 180ms cubic-bezier(0.4,0,0.2,1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.55)',
                      transform: 'translateX(2px)',
                      boxShadow: '0 6px 18px rgba(80, 100, 180, 0.10)',
                    },
                    '&:last-child': { mb: 0 },
                  }}
                  title={`${item.category}: ${detail}`}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      backgroundColor: `${color}1A`,
                      border: `1px solid ${color}33`,
                      color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    <Icon fontSize="small" />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: 600,
                      color: '#0f172a',
                    }}
                  >
                    {item.category}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: '#172554', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {share.toFixed(1)}%
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              mt: 2.5,
              px: 2,
              py: 1.5,
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
            aria-label="Transaction summary"
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
              Total Transactions
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
              {formatCount(totalCount)} · {items.length} {items.length === 1 ? 'category' : 'categories'}
            </Typography>
          </Box>
        </Box>
      </SectionState>
    </Card>
  );
}
