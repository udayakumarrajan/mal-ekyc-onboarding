import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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

  const isValid = fullName.trim() && dateOfBirth.trim() && nationality.trim();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: themeConfig.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: themeConfig.colors.text }]}>
        Profile Information
      </Text>
      
      <Text style={[styles.description, { color: themeConfig.colors.textSecondary }]}>
        Please provide your personal details
      </Text>

      <TextInput
        style={[styles.input, { 
          borderColor: themeConfig.colors.border,
          color: themeConfig.colors.text,
          backgroundColor: themeConfig.colors.card,
        }]}
        placeholder="Full Name"
        placeholderTextColor={themeConfig.colors.textSecondary}
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={[styles.input, { 
          borderColor: themeConfig.colors.border,
          color: themeConfig.colors.text,
          backgroundColor: themeConfig.colors.card,
        }]}
        placeholder="Date of Birth (YYYY-MM-DD)"
        placeholderTextColor={themeConfig.colors.textSecondary}
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
      />

      <TextInput
        style={[styles.input, { 
          borderColor: themeConfig.colors.border,
          color: themeConfig.colors.text,
          backgroundColor: themeConfig.colors.card,
        }]}
        placeholder="Nationality (e.g., US, UK, CA)"
        placeholderTextColor={themeConfig.colors.textSecondary}
        value={nationality}
        onChangeText={setNationality}
        autoCapitalize="characters"
      />

      <TouchableOpacity
        style={[
          styles.button, 
          { backgroundColor: themeConfig.colors.primary },
          !isValid && styles.buttonDisabled
        ]}
        onPress={handleNext}
        disabled={!isValid}
      >
        <Text style={styles.buttonText}>Next →</Text>
      </TouchableOpacity>

      <Text style={[styles.stepIndicator, { color: themeConfig.colors.textSecondary }]}>
        Step 1 of 5
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 14, marginBottom: 24 },
  input: { borderWidth: 1, borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 16 },
  button: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  stepIndicator: { textAlign: 'center', fontSize: 12, marginTop: 16 },
});
