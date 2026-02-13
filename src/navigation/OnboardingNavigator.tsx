import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useThemeStore } from '../stores/themeStore';
import ProfileStep from '../screens/onboarding/ProfileStep';
import DocumentStep from '../screens/onboarding/DocumentStep';
import AddressStep from '../screens/onboarding/AddressStep';
import ConsentsStep from '../screens/onboarding/ConsentsStep';
import ReviewStep from '../screens/onboarding/ReviewStep';

const Stack = createStackNavigator();

const screens = [
  { name: 'Profile', component: ProfileStep, title: 'Step 1: Profile' },
  { name: 'Document', component: DocumentStep, title: 'Step 2: Document' },
  { name: 'Address', component: AddressStep, title: 'Step 3: Address' },
  { name: 'Consents', component: ConsentsStep, title: 'Step 4: Consents' },
  { name: 'Review', component: ReviewStep, title: 'Step 5: Review' },
];

export default function OnboardingNavigator() {
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const { themeConfig } = useThemeStore();

  return (
    <Stack.Navigator 
      initialRouteName={screens[currentStep].name}
      screenOptions={{
        headerStyle: {
          backgroundColor: themeConfig.colors.card,
        },
        headerTintColor: themeConfig.colors.text,
      }}
    >
      {screens.map((screen) => (
        <Stack.Screen 
          key={screen.name} 
          name={screen.name}
          component={screen.component}
          options={{ title: screen.title }}
        />
      ))}
    </Stack.Navigator>
  );
}
