// Theme System with Dark Mode Support
export const lightTheme = {
  background: {
    primary: '#FAFBFC',
    secondary: '#FFFFFF',
    tertiary: '#F5F7FA',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#0F1419',
    secondary: '#536471',
    tertiary: '#8B98A5',
    inverse: '#FFFFFF',
  },
  accent: {
    primary: '#1D9BF0',
    secondary: '#7856FF',
    success: '#00BA88',
    warning: '#FFB020',
    danger: '#F4212E',
  },
  border: {
    primary: '#E7ECF0',
    secondary: '#CFD9DE',
    focus: '#1D9BF0',
  },
  shadow: {
    sm: 'rgba(0, 0, 0, 0.05)',
    md: 'rgba(0, 0, 0, 0.08)',
    lg: 'rgba(0, 0, 0, 0.12)',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.7)',
    border: 'rgba(255, 255, 255, 0.3)',
  },
};

export const darkTheme = {
  background: {
    primary: '#000000',
    secondary: '#16181C',
    tertiary: '#1C1F26',
    elevated: '#202327',
  },
  text: {
    primary: '#E7E9EA',
    secondary: '#8B98A5',
    tertiary: '#5B6875',
    inverse: '#0F1419',
  },
  accent: {
    primary: '#1D9BF0',
    secondary: '#A78BFA',
    success: '#00D9A5',
    warning: '#FFD166',
    danger: '#FF6B6B',
  },
  border: {
    primary: '#2F3336',
    secondary: '#3E4347',
    focus: '#1D9BF0',
  },
  shadow: {
    sm: 'rgba(255, 255, 255, 0.05)',
    md: 'rgba(255, 255, 255, 0.08)',
    lg: 'rgba(255, 255, 255, 0.12)',
  },
  glass: {
    background: 'rgba(22, 24, 28, 0.7)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
};

export type Theme = typeof lightTheme;

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Typography system
export const typography = {
  // Display
  display: {
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 56,
    letterSpacing: -1.5,
  },
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  // Body
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  // Utility
  caption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
};

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Animations
export const animations = {
  timing: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    smooth: [0.25, 0.1, 0.25, 1],
    spring: [0.68, -0.55, 0.265, 1.55],
  },
};