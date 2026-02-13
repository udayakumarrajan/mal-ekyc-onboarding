import { create } from 'zustand';
import { Theme } from '../types';
import { getTheme, ThemeConfig } from '../theme';
import { mockAsyncStorage } from '../utils/mockStorage';

// Use mock storage for simulator to avoid Hermes callback issues
const AsyncStorage = mockAsyncStorage;

interface ThemeState {
  theme: Theme;
  themeConfig: ThemeConfig;
  toggleTheme: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  loadTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = '@ekyc_theme';

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  themeConfig: getTheme('light'),

  toggleTheme: async () => {
    const currentTheme = get().theme;
    const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
    await get().setTheme(newTheme);
  },

  setTheme: async (theme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      set({
        theme,
        themeConfig: getTheme(theme),
      });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  },

  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        set({
          theme: savedTheme,
          themeConfig: getTheme(savedTheme),
        });
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  },
}));
