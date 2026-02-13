import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useThemeStore } from '../../stores/themeStore';

export default function ConsentsStep() {
  const navigation = useNavigation();
  const { draft, updateConsents, setCurrentStep } = useOnboardingStore();
  const { themeConfig } = useThemeStore();

  const [termsAccepted, setTermsAccepted] = useState(draft.consents.termsAccepted);

  const handleNext = () => {
    updateConsents({ termsAccepted });
    setCurrentStep(4);
    navigation.navigate('Review' as never);
  };

  const handleBack = () => {
    updateConsents({ termsAccepted });
    setCurrentStep(2);
    navigation.navigate('Address' as never);
  };

  const isValid = termsAccepted;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: themeConfig.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: themeConfig.colors.text }]}>
        Terms & Consents
      </Text>
      
      <Text style={[styles.description, { color: themeConfig.colors.textSecondary }]}>
        Please review and accept the terms
      </Text>

      <View style={[styles.card, { backgroundColor: themeConfig.colors.card }]}>
        <Text style={[styles.termsTitle, { color: themeConfig.colors.text }]}>
          Terms of Service
        </Text>
        <Text style={[styles.termsText, { color: themeConfig.colors.textSecondary }]}>
          By proceeding with the onboarding process, you agree to:
        </Text>
        <Text style={[styles.termsBullet, { color: themeConfig.colors.text }]}>
          • Allow us to verify your identity information
        </Text>
        <Text style={[styles.termsBullet, { color: themeConfig.colors.text }]}>
          • Store and process your personal data securely
        </Text>
        <Text style={[styles.termsBullet, { color: themeConfig.colors.text }]}>
          • Use your information for KYC compliance
        </Text>
        <Text style={[styles.termsBullet, { color: themeConfig.colors.text }]}>
          • Share data with regulatory authorities if required
        </Text>
      </View>

      <View style={styles.consentRow}>
        <View style={styles.consentContent}>
          <Text style={[styles.consentLabel, { color: themeConfig.colors.text }]}>
            I accept the Terms of Service
          </Text>
          <Text style={[styles.consentDescription, { color: themeConfig.colors.textSecondary }]}>
            Required to proceed
          </Text>
        </View>
        <Switch 
          value={termsAccepted} 
          onValueChange={setTermsAccepted}
          trackColor={{ false: themeConfig.colors.border, true: themeConfig.colors.success }}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.backButton, { 
            backgroundColor: themeConfig.colors.card,
            borderColor: themeConfig.colors.border,
          }]}
          onPress={handleBack}
        >
          <Text style={[styles.backButtonText, { color: themeConfig.colors.text }]}>
            ← Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton, 
            { backgroundColor: themeConfig.colors.primary },
            !isValid && styles.buttonDisabled
          ]}
          onPress={handleNext}
          disabled={!isValid}
        >
          <Text style={styles.buttonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.stepIndicator, { color: themeConfig.colors.textSecondary }]}>
        Step 4 of 5
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 14, marginBottom: 24 },
  card: { padding: 16, borderRadius: 12, marginBottom: 24 },
  termsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  termsText: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  termsBullet: { fontSize: 14, marginBottom: 8, lineHeight: 20 },
  consentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  consentContent: { flex: 1 },
  consentLabel: { fontSize: 16, marginBottom: 4, fontWeight: '600' },
  consentDescription: { fontSize: 12 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  backButton: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  backButtonText: { fontSize: 16, fontWeight: 'bold' },
  nextButton: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  stepIndicator: { textAlign: 'center', fontSize: 12, marginTop: 16 },
});
