import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../stores/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator();

export function RootNavigator() {
  const status = useAuthStore((state) => state.status);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {status === 'logged_in' ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
