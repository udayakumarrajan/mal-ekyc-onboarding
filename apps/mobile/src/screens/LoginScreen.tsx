import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
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

  const isLoading = status === 'logging_in';

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: themeConfig.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeConfig.colors.text }]}>
          eKYC Onboarding
        </Text>
        
        <Text style={[styles.subtitle, { color: themeConfig.colors.textSecondary }]}>
          Welcome back! Please login to continue.
        </Text>

        {error && (
          <View style={[styles.errorContainer, { backgroundColor: themeConfig.colors.error + '20' }]}>
            <Text style={[styles.errorText, { color: themeConfig.colors.error }]}>
              {error}
            </Text>
          </View>
        )}

        <TextInput
          style={[styles.input, { 
            borderColor: themeConfig.colors.border,
            color: themeConfig.colors.text,
            backgroundColor: themeConfig.colors.card,
          }]}
          placeholder="Email"
          placeholderTextColor={themeConfig.colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
        />

        <TextInput
          style={[styles.input, { 
            borderColor: themeConfig.colors.border,
            color: themeConfig.colors.text,
            backgroundColor: themeConfig.colors.card,
          }]}
          placeholder="Password"
          placeholderTextColor={themeConfig.colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[
            styles.button, 
            { backgroundColor: themeConfig.colors.primary },
            isLoading && styles.buttonDisabled
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.hint, { color: themeConfig.colors.textSecondary }]}>
          Test credentials: test@example.com / password123
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});
