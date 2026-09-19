import { useState } from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SectionState } from './SectionState';
import { useRevenueExpense } from '../hooks/useAnalytics';
import { formatCompactCurrency, formatCurrency, formatPeriodLabel } from '../utils/format';

const REVENUE_COLOR = '#16a34a';
const EXPENSES_COLOR = '#ef4444';

function tooltipFormatter(value: unknown, name: unknown): [string, string] {
  const numeric = typeof value === 'number' ? value : Number(value);
  const label = name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : String(name);
  return [formatCurrency(Number.isFinite(numeric) ? numeric : 0), label];
}

/**
 * Monthly revenue vs expenses grouped bar chart.
 * Data comes verbatim from GET /api/analytics/revenue-expense —
 * the backend owns bucketing; the range selector only chooses how many
 * of the most recent real months are displayed.
 */
export function RevenueExpenseChart() {
  const { data, isLoading, isError, errorMessage, refetch } = useRevenueExpense();
  const [months, setMonths] = useState(12);
  const allPoints = data?.data ?? [];
  const points = months >= allPoints.length ? allPoints : allPoints.slice(-months);

  return (
    <SectionState
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      isEmpty={!isLoading && !isError && points.length === 0}
      loadingLabel="Loading revenue vs expenses chart"
      emptyMessage="No revenue or expense data for the selected period."
      onRetry={refetch}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <TextField
          select
          size="small"
          label="Range"
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          sx={{
            width: 160,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 10px rgba(70, 90, 140, 0.08)',
              fontSize: '0.875rem',
              fontWeight: 600,
              minHeight: 48,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(203, 213, 225, 0.9)',
              borderWidth: 1,
            },
            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(148, 163, 184, 0.9)',
            },
          }}
          aria-label="Chart month range"
        >
          <MenuItem value={6}>Last 6 months</MenuItem>
          <MenuItem value={12}>Last 12 months</MenuItem>
        </TextField>
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ minWidth: { xs: 560, sm: '100%' } }}>
          <ResponsiveContainer width="100%" height={340} aria-label="Revenue versus expenses by month">
            <BarChart data={points} margin={{ top: 8, right: 16, bottom: 12, left: 8 }} barGap={4} barCategoryGap="15%">
              <CartesianGrid stroke="rgba(100, 116, 139, 0.25)" strokeWidth={1} vertical={false} />
              <XAxis
                dataKey="period"
                tickFormatter={formatPeriodLabel}
                tick={{ fontSize: 13, fill: '#64748b', fontWeight: 400 }}
                axisLine={{ stroke: '#e6eaf0' }}
                tickLine={false}
                tickMargin={10}
                interval="preserveStartEnd"
                minTickGap={8}
              />
              <YAxis
                tickFormatter={formatCompactCurrency}
                tick={{ fontSize: 13, fill: '#64748b', fontWeight: 400 }}
                axisLine={false}
                tickLine={false}
                width={64}
              />
              <Tooltip
                formatter={tooltipFormatter}
                labelFormatter={(label) => formatPeriodLabel(String(label ?? ''))}
                cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
            contentStyle={{
              borderRadius: 14,
                  border: '1px solid rgba(230, 234, 240, 0.9)',
                  boxShadow: '0 16px 40px rgba(15, 23, 42, 0.14)',
                  fontSize: 13,
                  padding: '14px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                }}
                labelStyle={{ color: '#0f172a', fontWeight: 700, marginBottom: 6 }}
                itemStyle={{ padding: '2px 0' }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: 16, fontSize: 14, color: '#64748b' }}
              />
              <Bar dataKey="expenses" name="Expenses" fill={EXPENSES_COLOR} radius={[5, 5, 0, 0]} barSize={16} maxBarSize={18} />
              <Bar dataKey="revenue" name="Revenue" fill={REVENUE_COLOR} radius={[5, 5, 0, 0]} barSize={16} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </SectionState>
  );
}
