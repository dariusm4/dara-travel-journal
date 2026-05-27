/**
 * Central design system for Dara.
 *
 * Everything visual references these tokens so the UI stays consistent
 * (criterion 10). Components must not hardcode colors, spacing, or font
 * sizes — import from here instead.
 */

const palette = {
  ink: '#1F2421',
  inkMuted: '#5B6660',
  paper: '#FBF7F0',
  paperRaised: '#FFFFFF',
  teal: '#1B6B6B',
  tealDark: '#0F4F4F',
  sunset: '#E8833A',
  sunsetSoft: '#F6C28B',
  sand: '#EFE6D5',
  sky: '#5AA9C9',
  danger: '#C0463B',
  success: '#3E8E5A',
  white: '#FFFFFF',
  black: '#0B0E0D',
};

export const lightColors = {
  background: palette.paper,
  surface: palette.paperRaised,
  surfaceAlt: palette.sand,
  text: palette.ink,
  textMuted: palette.inkMuted,
  primary: palette.teal,
  primaryDark: palette.tealDark,
  accent: palette.sunset,
  accentSoft: palette.sunsetSoft,
  border: '#E4DCCB',
  danger: palette.danger,
  success: palette.success,
  onPrimary: palette.white,
  tabIconDefault: '#A99F8C',
  tabIconSelected: palette.teal,
};

export const darkColors: typeof lightColors = {
  background: '#15201E',
  surface: '#1E2B28',
  surfaceAlt: '#26332F',
  text: '#F1EDE4',
  textMuted: '#A7B0AB',
  primary: '#4FB5B0',
  primaryDark: '#2F8E89',
  accent: palette.sunset,
  accentSoft: '#B9743E',
  border: '#33433E',
  danger: '#E06A5E',
  success: '#5BB179',
  onPrimary: '#0B1413',
  tabIconDefault: '#6F7C77',
  tabIconSelected: '#4FB5B0',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const fontSize = {
  caption: 12,
  body: 15,
  subtitle: 17,
  title: 22,
  heading: 28,
  display: 34,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
} as const;

export type ColorScheme = typeof lightColors;
