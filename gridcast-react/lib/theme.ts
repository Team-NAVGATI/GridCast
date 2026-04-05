/**
 * Theme constants for GridCast
 * Maps to Tailwind CSS custom properties
 */

export const Colors = {
  // Base colors
  bg: '#ffffff',
  bg2: '#f8faff',
  bg3: '#f0f4ff',

  // Brand colors
  cyan: '#0F9E90',
  cyan2: '#0C7F74',
  amber: '#ffab00',
  green: '#00e676',
  red: '#ff1744',

  // Text colors
  text: '#003d99',
  textMuted: '#4a5a7a',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',

  // Border
  border: '#e2e8f0',
  borderStrong: '#cfd8e3',

  // Card background
  card: 'rgba(240,244,255,0.6)',

  // Model-specific colors
  xgboost: {
    primary: '#4c79b8',
    light: '#f0f4fb',
    muted: '#6b91c7',
  },
  lstm: {
    primary: '#7C3AED',
    light: '#f5f3ff',
    muted: '#9d6ef7',
  },

  // Status colors
  success: '#059669',
  successBg: 'rgba(5,150,105,0.12)',
  warning: '#d97706',
  warningBg: 'rgba(217,119,6,0.12)',
  error: '#dc2626',
  errorBg: 'rgba(220,38,38,0.12)',
};

export const Spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
};

export const Shadows = {
  sm: '0 1px 3px rgba(15,23,42,.06), 0 6px 20px rgba(15,23,42,.06)',
  md: '0 4px 12px rgba(15,158,144,.25)',
  lg: '0 6px 16px rgba(15,158,144,.3)',
  xl: '0 8px 24px rgba(15,23,42,.12)',
};

export const BorderRadius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '10px',
  round: '9999px',
};

export const FontSizes = {
  xs: '11px',
  sm: '12px',
  base: '13px',
  lg: '14px',
  xl: '17px',
  '2xl': '20px',
  '3xl': '24px',
  '4xl': '32px',
};

export const FontWeights = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

export const FontFamilies = {
  syne: "'Syne', sans-serif",
  redHat: "'Red Hat Display', sans-serif",
  spaceMono: "'Space Mono', monospace",
  dmSans: "'DM Sans', sans-serif",
  dmMono: "'DM Mono', monospace",
};

/**
 * Get model-specific theme
 */
export function getModelTheme(model: 'xgboost' | 'lstm') {
  return model === 'xgboost' ? Colors.xgboost : Colors.lstm;
}

/**
 * Get status color based on metric value
 */
export function getStatusColor(
  value: number,
  metric: 'mape' | 'mae' | 'rmse'
): 'good' | 'warn' | 'bad' {
  if (metric === 'mape') {
    if (value < 2.0) return 'good';
    if (value < 3.5) return 'warn';
    return 'bad';
  }

  if (metric === 'mae') {
    if (value < 50) return 'good';
    if (value < 100) return 'warn';
    return 'bad';
  }

  if (metric === 'rmse') {
    if (value < 100) return 'good';
    if (value < 200) return 'warn';
    return 'bad';
  }

  return 'neutral' as any;
}

/**
 * Get CSS variable name for theme color
 */
export function getCSSVar(colorPath: string): string {
  return `var(--${colorPath.replace(/\./g, '-')})`;
}
