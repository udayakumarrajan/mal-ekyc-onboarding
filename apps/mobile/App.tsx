import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from './src/stores/authStore';
import { useThemeStore } from './src/stores/themeStore';
import { useOnboardingStore } from './src/stores/onboardingStore';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  const loadTheme = useThemeStore((state) => state.loadTheme);
  const loadSession = useAuthStore((state) => state.loadSession);
  const loadPersistedDraft = useOnboardingStore((state) => state.loadPersistedDraft);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // Load persisted data on app start (now using mock storage for simulator)
    loadTheme();
    loadSession();
    loadPersistedDraft();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
