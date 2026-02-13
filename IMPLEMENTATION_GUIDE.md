# Quick Implementation Guide - Complete Mobile UI

This guide provides ready-to-use templates for completing the mobile app. All infrastructure (stores, API client, theme) is ready.

## Status Summary

✅ **Backend**: 100% Complete (16/16 tests passing)  
✅ **Mobile Infrastructure**: Complete (stores, API client, theme)  
🔄 **Mobile UI**: Need ~15 files for navigation + screens

## Implementation Order

### Step 1: Navigation (4 files, ~30 minutes)

#### 1.1 RootNavigator.tsx
```typescript
// apps/mobile/src/navigation/RootNavigator.tsx
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
```

#### 1.2 AuthNavigator.tsx
```typescript
// apps/mobile/src/navigation/AuthNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
```

#### 1.3 MainNavigator.tsx
```typescript
// apps/mobile/src/navigation/MainNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OnboardingNavigator from './OnboardingNavigator';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Onboarding" component={OnboardingNavigator} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
```

#### 1.4 OnboardingNavigator.tsx
```typescript
// apps/mobile/src/navigation/OnboardingNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useOnboardingStore } from '../stores/onboardingStore';
import ProfileStep from '../screens/onboarding/ProfileStep';
import DocumentStep from '../screens/onboarding/DocumentStep';
import AddressStep from '../screens/onboarding/AddressStep';
import ConsentsStep from '../screens/onboarding/ConsentsStep';
import ReviewStep from '../screens/onboarding/ReviewStep';

const Stack = createStackNavigator();

const screens = [
  { name: 'Profile', component: ProfileStep },
  { name: 'Document', component: DocumentStep },
  { name: 'Address', component: AddressStep },
  { name: 'Consents', component: ConsentsStep },
  { name: 'Review', component: ReviewStep },
];

export default function OnboardingNavigator() {
  const currentStep = useOnboardingStore((state) => state.currentStep);

  return (
    <Stack.Navigator initialRouteName={screens[currentStep].name}>
      {screens.map((screen) => (
        <Stack.Screen key={screen.name} {...screen} />
      ))}
    </Stack.Navigator>
  );
}
```

### Step 2: Core Screens (3 files, ~30 minutes)

#### 2.1 LoginScreen.tsx
```typescript
// apps/mobile/src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const { login, status, error } = useAuthStore();
  const { themeConfig } = useThemeStore();

  const handleLogin = async () => {
    await login(email, password);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeConfig.colors.background }]}>
      <Text style={[styles.title, { color: themeConfig.colors.text }]}>
        eKYC Login
      </Text>

      {error && (
        <Text style={[styles.error, { color: themeConfig.colors.error }]}>
          {error}
        </Text>
      )}

      <TextInput
        style={[styles.input, { 
          borderColor: themeConfig.colors.border,
          color: themeConfig.colors.text,
        }]}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={[styles.input, { 
          borderColor: themeConfig.colors.border,
          color: themeConfig.colors.text,
        }]}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: themeConfig.colors.primary }]}
        onPress={handleLogin}
        disabled={status === 'logging_in'}
      >
        {status === 'logging_in' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  error: { marginBottom: 16, textAlign: 'center' },
});
```

#### 2.2 HomeScreen.tsx
```typescript
// apps/mobile/src/screens/HomeScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { useVerificationStore } from '../stores/verificationStore';
import { useThemeStore } from '../stores/themeStore';

export default function HomeScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const { status, loading, fetchStatus } = useVerificationStore();
  const { themeConfig } = useThemeStore();

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: themeConfig.colors.background }]}>
      <Text style={[styles.title, { color: themeConfig.colors.text }]}>
        Welcome, {user?.fullName}!
      </Text>

      <View style={[styles.card, { backgroundColor: themeConfig.colors.card }]}>
        <Text style={[styles.label, { color: themeConfig.colors.textSecondary }]}>
          Verification Status
        </Text>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={[styles.status, { color: themeConfig.colors.text }]}>
            {status?.status || 'NOT_STARTED'}
          </Text>
        )}
      </View>

      {status?.status !== 'APPROVED' && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: themeConfig.colors.primary }]}
          onPress={() => navigation.navigate('Onboarding' as never)}
        >
          <Text style={styles.buttonText}>
            {status?.status === 'NOT_STARTED' ? 'Start Onboarding' : 'Resume Onboarding'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  card: { padding: 16, borderRadius: 8, marginBottom: 24 },
  label: { fontSize: 14, marginBottom: 8 },
  status: { fontSize: 20, fontWeight: 'bold' },
  button: { padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
```

#### 2.3 SettingsScreen.tsx
```typescript
// apps/mobile/src/screens/SettingsScreen.tsx
import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

export default function SettingsScreen() {
  const logout = useAuthStore((state) => state.logout);
  const { theme, toggleTheme, themeConfig } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: themeConfig.colors.background }]}>
      <Text style={[styles.title, { color: themeConfig.colors.text }]}>
        Settings
      </Text>

      <View style={styles.row}>
        <Text style={[styles.label, { color: themeConfig.colors.text }]}>
          Dark Mode
        </Text>
        <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: themeConfig.colors.error }]}
        onPress={logout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  label: { fontSize: 16 },
  button: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 'auto' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
```

### Step 3: Onboarding Screens (5 files, ~45 minutes)

Use this template for all 5 onboarding steps:

```typescript
// apps/mobile/src/screens/onboarding/ProfileStep.tsx (Example)
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useThemeStore } from '../../stores/themeStore';

export default function ProfileStep() {
  const navigation = useNavigation();
  const { draft, updateProfile, setCurrentStep } = useOnboardingStore();
  const { themeConfig } = useThemeStore();

  const [fullName, setFullName] = useState(draft.profile.fullName);
  const [dateOfBirth, setDateOfBirth] = useState(draft.profile.dateOfBirth);
  const [nationality, setNationality] = useState(draft.profile.nationality);

  const handleNext = () => {
    updateProfile({ fullName, dateOfBirth, nationality });
    setCurrentStep(1);
    navigation.navigate('Document' as never);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeConfig.colors.background }]}>
      <Text style={[styles.title, { color: themeConfig.colors.text }]}>
        Step 1: Profile Information
      </Text>

      <TextInput
        style={[styles.input, { borderColor: themeConfig.colors.border, color: themeConfig.colors.text }]}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={[styles.input, { borderColor: themeConfig.colors.border, color: themeConfig.colors.text }]}
        placeholder="Date of Birth (YYYY-MM-DD)"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
      />

      <TextInput
        style={[styles.input, { borderColor: themeConfig.colors.border, color: themeConfig.colors.text }]}
        placeholder="Nationality"
        value={nationality}
        onChangeText={setNationality}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: themeConfig.colors.primary }]}
        onPress={handleNext}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 24 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 'auto' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
```

**Repeat this pattern for:**
- DocumentStep.tsx (documentType, documentNumber)
- AddressStep.tsx (addressLine1, city, country)
- ConsentsStep.tsx (termsAccepted checkbox)
- ReviewStep.tsx (show all data + submit button)

## Testing After Implementation

1. Start backend: `cd apps/api && npm run dev`
2. Start mobile: `cd apps/mobile && npx expo start`
3. Test flow:
   - Login with test@example.com / password123
   - View home screen (should show user name)
   - Complete 5 onboarding steps
   - Submit
   - Verify status shows "IN_PROGRESS"
   - Toggle theme in settings
   - Restart app - theme should persist

## Success Criteria Checklist

- [ ] Login screen works
- [ ] Home shows user name and status
- [ ] Can navigate through all 5 onboarding steps
- [ ] Draft persists on app restart
- [ ] Submit creates verification status
- [ ] Theme toggle works and persists
- [ ] No crashes in happy path

## Time Estimate

- Navigation: 30 minutes
- Core screens: 30 minutes
- Onboarding screens: 45 minutes
- **Total: ~2 hours for complete mobile UI**

All infrastructure is ready - just need to implement the UI layer following these templates!
