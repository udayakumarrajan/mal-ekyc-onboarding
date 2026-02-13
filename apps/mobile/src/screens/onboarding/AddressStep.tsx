import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useThemeStore } from '../../stores/themeStore';

export default function AddressStep() {
  const navigation = useNavigation();
  const { draft, updateAddress, setCurrentStep } = useOnboardingStore();
  const { themeConfig } = useThemeStore();

  const [addressLine1, setAddressLine1] = useState(draft.address.addressLine1);
  const [city, setCity] = useState(draft.address.city);
  const [country, setCountry] = useState(draft.address.country);

  const handleNext = () => {
    updateAddress({ addressLine1, city, country });
    setCurrentStep(3);
    navigation.navigate('Consents' as never);
  };

  const handleBack = () => {
    updateAddress({ addressLine1, city, country });
    setCurrentStep(1);
    navigation.navigate('Document' as never);
  };

  const isValid = addressLine1.trim() && city.trim() && country.trim();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: themeConfig.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: themeConfig.colors.text }]}>
        Address Information
      </Text>
      
      <Text style={[styles.description, { color: themeConfig.colors.textSecondary }]}>
        Where do you currently reside?
      </Text>

      <TextInput
        style={[styles.input, { 
          borderColor: themeConfig.colors.border,
          color: themeConfig.colors.text,
          backgroundColor: themeConfig.colors.card,
        }]}
        placeholder="Address Line 1"
        placeholderTextColor={themeConfig.colors.textSecondary}
        value={addressLine1}
        onChangeText={setAddressLine1}
      />

      <TextInput
        style={[styles.input, { 
          borderColor: themeConfig.colors.border,
          color: themeConfig.colors.text,
          backgroundColor: themeConfig.colors.card,
        }]}
        placeholder="City"
        placeholderTextColor={themeConfig.colors.textSecondary}
        value={city}
        onChangeText={setCity}
      />

      <TextInput
        style={[styles.input, { 
          borderColor: themeConfig.colors.border,
          color: themeConfig.colors.text,
          backgroundColor: themeConfig.colors.card,
        }]}
        placeholder="Country (e.g., US, UK, CA)"
        placeholderTextColor={themeConfig.colors.textSecondary}
        value={country}
        onChangeText={setCountry}
        autoCapitalize="characters"
      />

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
        Step 3 of 5
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
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  backButton: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  backButtonText: { fontSize: 16, fontWeight: 'bold' },
  nextButton: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  stepIndicator: { textAlign: 'center', fontSize: 12, marginTop: 16 },
});
