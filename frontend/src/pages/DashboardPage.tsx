import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { CategoryChart } from '../components/CategoryChart';
import { RevenueExpenseChart } from '../components/RevenueExpenseChart';
import { SectionCard, SummaryCards } from '../components/SummaryCards';
import { TransactionSection } from '../components/TransactionSection';
import { useRevenueExpense } from '../hooks/useAnalytics';
import { formatPeriodLabel } from '../utils/format';

/**
 * Financial Analytics Dashboard: summary metrics, backend-driven charts,
 * and the server-side transaction table (search, filters, sorting,
 * pagination all execute in MongoDB via GET /api/transactions).
 */
export function DashboardPage() {
  const { data: trendData } = useRevenueExpense();
  const periods = (trendData?.data ?? []).map((p) => p.period).sort();
  const periodLabel =
    periods.length > 0
      ? `${formatPeriodLabel(periods[0] as string)} – ${formatPeriodLabel(periods[periods.length - 1] as string)}`
      : null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning!' : hour < 17 ? 'Good afternoon!' : 'Good evening!';

  const BAR_HEIGHTS = [24, 32, 28, 40, 50, 46, 60, 72, 84];

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '24px',
          mb: 2.5,
          px: { xs: 3, md: '40px' },
          py: { xs: 2.5, md: '36px' },
          minHeight: { xs: 220, lg: 260 },
          background:
            'radial-gradient(circle at 30% 40%, rgba(59,130,246,0.35), transparent 50%),' +
            'radial-gradient(circle at 80% 20%, rgba(139,92,246,0.30), transparent 45%),' +
            'radial-gradient(circle at 55% 100%, rgba(34,211,238,0.12), transparent 50%),' +
            'linear-gradient(110deg, #071A4A 0%, #123AAB 48%, #6537E8 100%)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow:
            '0 20px 50px rgba(7, 26, 74, 0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 1200 140"
          preserveAspectRatio="none"
          aria-hidden="true"
          sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 120, opacity: 0.9, zIndex: 1, pointerEvents: 'none' }}
        >
          <path
            d="M0,78 C180,60 320,96 520,80 C720,64 880,100 1040,82 C1110,74 1160,78 1200,70"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.5"
          />
          <path
            d="M0,96 C200,80 360,112 560,96 C760,80 920,114 1080,96 C1140,89 1175,92 1200,86"
            fill="none"
            stroke="rgba(147,197,253,0.28)"
            strokeWidth="1.5"
          />
          <path
            d="M0,60 C220,44 420,76 640,58 C860,40 1020,70 1200,52"
            fill="none"
            stroke="rgba(196,181,253,0.20)"
            strokeWidth="1"
          />
        </Box>
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            bottom: 18,
            right: { xs: 12, md: 28 },
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'flex-end',
            gap: '7px',
            opacity: 0.55,
            zIndex: 1,
            pointerEvents: 'none',
            '@keyframes heroBarPulse': {
              '0%, 100%': { opacity: 0.55 },
              '50%': { opacity: 0.85 },
            },
          }}
        >
          {BAR_HEIGHTS.map((h, i) => (
            <Box
              key={i}
              sx={{
                width: 9,
                height: h,
                borderRadius: '4px',
                background:
                  i % 2 === 0 ? 'rgba(255,255,255,0.50)' : 'rgba(147,197,253,0.45)',
                boxShadow: '0 0 14px rgba(147,197,253,0.45)',
                filter: i % 3 === 0 ? 'blur(1px)' : 'none',
                animation: 'heroBarPulse 8s ease-in-out infinite',
                animationDelay: `${i * 0.7}s`,
              }}
            />
          ))}
        </Box>
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) auto' },
            gap: { xs: 2, md: 2.5 },
            alignItems: 'center',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ fontWeight: 600, fontSize: '1rem', color: 'rgba(255,255,255,0.88)', whiteSpace: 'nowrap', mb: 0.75 }}
            >
              {greeting} <span aria-hidden="true">☀️</span>
            </Typography>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 800,
                letterSpacing: '-2px',
                lineHeight: 1,
                fontSize: 'clamp(2.25rem, 1.25rem + 3vw, 3.5rem)',
                whiteSpace: { xs: 'normal', sm: 'nowrap' },
                color: '#ffffff',
              }}
            >
              Financial{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(90deg, #60A5FA 0%, #A78BFA 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Overview
              </Box>
            </Typography>
            <Typography
              sx={{
                mt: 1.25,
                fontSize: '1.0625rem',
                whiteSpace: { xs: 'normal', xl: 'nowrap' },
                color: 'rgba(255,255,255,0.82)',
                maxWidth: { xs: 560, xl: 650 },
                lineHeight: 1.6,
              }}
            >
              Track your financial performance with real-time insights and detailed analytics.
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'flex-start', lg: 'flex-end' },
              gap: 1.25,
              maxWidth: 280,
              minWidth: 0,
            }}
          >
            {periodLabel && (
              <Chip
                icon={<CalendarMonthIcon fontSize="small" sx={{ color: '#BFDBFE' }} />}
                label={periodLabel}
                variant="outlined"
                sx={{
                  height: 'auto',
                  minHeight: 38,
                  borderRadius: '999px',
                  px: 1,
                  py: '10px',
                  fontSize: '0.875rem',
                  bgcolor: 'rgba(255,255,255,0.14)',
                  borderColor: 'rgba(255,255,255,0.30)',
                  color: '#ffffff',
                  fontWeight: 600,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
                aria-label={`Recorded period ${periodLabel}`}
              />
            )}
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.9375rem',
                fontStyle: 'italic',
                textAlign: { xs: 'left', lg: 'right' },
                color: 'rgba(255,255,255,0.80)',
                lineHeight: 1.65,
                textShadow: '0 1px 12px rgba(7,26,61,0.5)',
              }}
            >
              “Better financial decisions lead to a brighter tomorrow.”
            </Typography>
          </Box>
        </Box>
      </Box>

      <SummaryCards />

      {/* Lower chart row: spacious two-column glass grid.
          24px gap on desktop (20px tablet, 16-20px stacked mobile),
          Revenue (1.65fr) wider than Category (1fr), equal top/bottom baseline. */}
      <Box
        sx={{
          mt: 3,
          display: 'grid',
          gap: { xs: 2, sm: 2.5, lg: 3 },
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.5fr) minmax(0, 1fr)' },
          alignItems: 'stretch',
        }}
        id="analytics"
      >
        <SectionCard
          title="Revenue vs Expenses"
          subtitle="Monthly comparison of revenue and expenses"
          icon={<BarChartIcon />}
          elevated
        >
          <RevenueExpenseChart />
        </SectionCard>
        <CategoryChart />
      </Box>

      <Box sx={{ mt: 3 }} id="transactions">
        <TransactionSection />
      </Box>
    </Box>
  );
}
