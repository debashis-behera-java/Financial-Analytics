import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { kpiGlow, kpiIconGlow } from '../lib/glass';

interface MetricCardProps {
  title: string;
  value: string | null;
  subtitle?: string;
  icon?: ReactNode;
  isLoading: boolean;
  valueColor?: string;
  accentColor?: string;
  /** Luminous tinted glass (reference KPI style) derived from accentColor. */
  tinted?: boolean;
  /** Small trend chart rendered along the card bottom (real data only). */
  sparkline?: ReactNode;
}

/** Luminous glass KPI card with glowing icon, tint wash and skeleton loading state. */
export function MetricCard({ title, value, subtitle, icon, isLoading, valueColor, accentColor, tinted, sparkline }: MetricCardProps) {
  const accent = accentColor ?? '#2563eb';
  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 178,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '24px',
        ...(tinted ? kpiGlow(accent) : { borderLeft: `4px solid ${accent}` }),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 18px 44px ${accent}33, inset 0 1px 0 rgba(255, 255, 255, 0.65)`,
        },
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 2.5 }, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
          {icon && (
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                ...kpiIconGlow(accent),
              }}
              aria-hidden="true"
            >
              {icon}
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              component="div"
              sx={{ fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.01em' }}
            >
              {title}
            </Typography>
            {isLoading || value === null ? (
              <Skeleton variant="text" width={140} height={44} aria-label={`${title} loading`} />
            ) : (
              <Typography
                variant="h4"
                component="div"
                sx={{
                  color: valueColor ?? 'text.primary',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  fontWeight: 700,
                  mt: 0.5,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {value}
              </Typography>
            )}
          </Box>
        </Box>
        {subtitle && !isLoading && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, ml: 7.5 }}>
            {subtitle}
          </Typography>
        )}
        {!isLoading && sparkline}
      </CardContent>
    </Card>
  );
}
