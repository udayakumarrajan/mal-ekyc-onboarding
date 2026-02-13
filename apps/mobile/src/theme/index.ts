import { Theme } from '../types';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeConfig {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borderRadius: number;
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
}

const lightColors: ThemeColors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#FFFFFF',
  card: '#F2F2F7',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  info: '#5AC8FA',
};

const darkColors: ThemeColors = {
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  background: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  error: '#FF453A',
  success: '#32D74B',
  warning: '#FF9F0A',
  info: '#64D2FF',
};

const spacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const getTheme = (theme: Theme): ThemeConfig => ({
  colors: theme === 'dark' ? darkColors : lightColors,
  spacing,
  borderRadius: 8,
  fontSize,
});
