import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OnboardingNavigator from './OnboardingNavigator';
import { useThemeStore } from '../stores/themeStore';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { themeConfig } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: themeConfig.colors.primary,
        tabBarInactiveTintColor: themeConfig.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: themeConfig.colors.card,
          borderTopColor: themeConfig.colors.border,
        },
        headerStyle: {
          backgroundColor: themeConfig.colors.card,
        },
        headerTintColor: themeConfig.colors.text,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Onboarding" component={OnboardingNavigator} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
