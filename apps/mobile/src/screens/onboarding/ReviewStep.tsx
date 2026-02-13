import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useThemeStore } from '../../stores/themeStore';

export default function ReviewStep() {
  const navigation = useNavigation();
  const { draft, submissionState, error, submitOnboarding, setCurrentStep } = useOnboardingStore();
  const { themeConfig } = useThemeStore();

  const handleSubmit = async () => {
    await submitOnboarding();
    
    if (submissionState === 'success') {
      Alert.alert(
        'Success!',
        'Your onboarding has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home' as never),
          },
        ]
      );
    }
  };

  const handleBack = () => {
    setCurrentStep(3);
    navigation.navigate('Consents' as never);
  };

  const isSubmitting = submissionState === 'submitting';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: themeConfig.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: themeConfig.colors.text }]}>
        Review & Submit
      </Text>
      
      <Text style={[styles.description, { color: themeConfig.colors.textSecondary }]}>
        Please review your information before submitting
      </Text>

      {error && submissionState === 'error' && (
        <View style={[styles.errorContainer, { backgroundColor: themeConfig.colors.error + '20' }]}>
          <Text style={[styles.errorText, { color: themeConfig.colors.error }]}>
            {error}
          </Text>
        </View>
      )}

      <View style={[styles.section, { backgroundColor: themeConfig.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeConfig.colors.primary }]}>
          Profile Information
        </Text>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: themeConfig.colors.textSecondary }]}>
            Full Name:
          </Text>
          <Text style={[styles.rowValue, { color: themeConfig.colors.text }]}>
            {draft.profile.fullName}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: themeConfig.colors.textSecondary }]}>
            Date of Birth:
          </Text>
          <Text style={[styles.rowValue, { color: themeConfig.colors.text }]}>
            {draft.profile.dateOfBirth}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: themeConfig.colors.textSecondary }]}>
            Nationality:
          </Text>
          <Text style={[styles.rowValue, { color: themeConfig.colors.text }]}>
            {draft.profile.nationality}
          </Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: themeConfig.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeConfig.colors.primary }]}>
          Document Information
        </Text>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: themeConfig.colors.textSecondary }]}>
            Type:
          </Text>
          <Text style={[styles.rowValue, { color: themeConfig.colors.text }]}>
            {draft.document.documentType.replace('_', ' ')}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: themeConfig.colors.textSecondary }]}>
            Number:
          </Text>
          <Text style={[styles.rowValue, { color: themeConfig.colors.text }]}>
            {draft.document.documentNumber}
          </Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: themeConfig.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeConfig.colors.primary }]}>
          Address Information
        </Text>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: themeConfig.colors.textSecondary }]}>
            Address:
          </Text>
          <Text style={[styles.rowValue, { color: themeConfig.colors.text }]}>
            {draft.address.addressLine1}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: themeConfig.colors.textSecondary }]}>
            City:
          </Text>
          <Text style={[styles.rowValue, { color: themeConfig.colors.text }]}>
            {draft.address.city}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: themeConfig.colors.textSecondary }]}>
            Country:
          </Text>
          <Text style={[styles.rowValue, { color: themeConfig.colors.text }]}>
            {draft.address.country}
          </Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: themeConfig.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeConfig.colors.primary }]}>
          Consents
        </Text>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: themeConfig.colors.textSecondary }]}>
            Terms Accepted:
          </Text>
          <Text style={[styles.rowValue, { color: draft.consents.termsAccepted ? themeConfig.colors.success : themeConfig.colors.error }]}>
            {draft.consents.termsAccepted ? 'Yes ✓' : 'No ✗'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.backButton, { 
            backgroundColor: themeConfig.colors.card,
            borderColor: themeConfig.colors.border,
          }]}
          onPress={handleBack}
          disabled={isSubmitting}
        >
          <Text style={[styles.backButtonText, { color: themeConfig.colors.text }]}>
            ← Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton, 
            { backgroundColor: themeConfig.colors.success },
            isSubmitting && styles.buttonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit 🚀</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={[styles.stepIndicator, { color: themeConfig.colors.textSecondary }]}>
        Step 5 of 5
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 14, marginBottom: 24 },
  section: { padding: 16, borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  row: { flexDirection: 'row', marginBottom: 8 },
  rowLabel: { fontSize: 14, width: 120 },
  rowValue: { flex: 1, fontSize: 14, fontWeight: '600' },
  errorContainer: { padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { fontSize: 14, textAlign: 'center' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  backButton: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  backButtonText: { fontSize: 16, fontWeight: 'bold' },
  submitButton: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  stepIndicator: { textAlign: 'center', fontSize: 12, marginTop: 16 },
});
