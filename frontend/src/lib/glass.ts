import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Glassmorphism design system — single source of truth for translucency.
 *
 * Levels (background glow must visibly pass through shell/panel):
 * - glass-shell   sidebar + top header      rgba(255,255,255,0.38–0.45), blur 24–30px
 * - glass-panel   charts + transactions     rgba(255,255,255,0.45–0.55), blur ~25px
 * - glass-control inputs, menus, pills      rgba(255,255,255,0.60),      blur ~16px
 * - kpiGlow       luminous per-metric tint  colored gradient wash + glow shadow
 *
 * Dense content (tables, chart ink) stays on higher-opacity inner
 * surfaces so text never loses readability.
 */

export const GLASS_BLUR_SHELL = 'blur(30px) saturate(150%)';
export const GLASS_BLUR_PANEL = 'blur(24px) saturate(140%)';
export const GLASS_BLUR_CONTROL = 'blur(16px) saturate(140%)';

const FALLBACK_WHITE = {
  '@supports not (backdrop-filter: blur(1px))': { backgroundColor: '#ffffff' },
} as const;

export const glassShell: SxProps<Theme> = {
  backgroundColor: 'rgba(255, 255, 255, 0.42)',
  backdropFilter: GLASS_BLUR_SHELL,
  WebkitBackdropFilter: GLASS_BLUR_SHELL,
  border: '1px solid rgba(255, 255, 255, 0.65)',
  boxShadow: '0 20px 60px rgba(70, 90, 140, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
  ...FALLBACK_WHITE,
};

export const glassPanel: SxProps<Theme> = {
  backgroundColor: 'rgba(255, 255, 255, 0.55)',
  backdropFilter: GLASS_BLUR_PANEL,
  WebkitBackdropFilter: GLASS_BLUR_PANEL,
  border: '1px solid rgba(255, 255, 255, 0.65)',
  boxShadow: '0 20px 50px rgba(70, 90, 140, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.55)',
  borderRadius: '24px',
  ...FALLBACK_WHITE,
};

export const glassControl: SxProps<Theme> = {
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
  backdropFilter: GLASS_BLUR_CONTROL,
  WebkitBackdropFilter: GLASS_BLUR_CONTROL,
  border: '1px solid rgba(255, 255, 255, 0.65)',
  ...FALLBACK_WHITE,
};

/** Luminous KPI tint: subtle colored wash + matching glow shadow. */
export function kpiGlow(accent: string): SxProps<Theme> {
  return {
    background: `linear-gradient(135deg, ${accent}1f 0%, rgba(255, 255, 255, 0.45) 55%, rgba(255, 255, 255, 0.35) 100%)`,
    backdropFilter: GLASS_BLUR_PANEL,
    WebkitBackdropFilter: GLASS_BLUR_PANEL,
    border: `1px solid ${accent}38`,
    boxShadow: `0 15px 40px ${accent}26, inset 0 1px 0 rgba(255, 255, 255, 0.65)`,
    ...FALLBACK_WHITE,
  };
}

/** Glowing circular icon disc for KPI cards. */
export function kpiIconGlow(accent: string): SxProps<Theme> {
  return {
    background: `linear-gradient(135deg, ${accent}30 0%, rgba(255, 255, 255, 0.55) 100%)`,
    border: `1px solid ${accent}40`,
    boxShadow: `0 0 24px ${accent}4d, inset 0 1px 0 rgba(255, 255, 255, 0.6)`,
    color: accent,
  };
}
