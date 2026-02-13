import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useThemeStore } from '../../stores/themeStore';
import { Picker } from '@react-native-picker/picker';

export default function DocumentStep() {
  const navigation = useNavigation();
  const { draft, updateDocument, setCurrentStep } = useOnboardingStore();
  const { themeConfig } = useThemeStore();

  const [documentType, setDocumentType] = useState(draft.document.documentType || 'PASSPORT');
  const [documentNumber, setDocumentNumber] = useState(draft.document.documentNumber);

  const handleNext = () => {
    updateDocument({ documentType: documentType as any, documentNumber });
    setCurrentStep(2);
    navigation.navigate('Address' as never);
  };

  const handleBack = () => {
    updateDocument({ documentType: documentType as any, documentNumber });
    setCurrentStep(0);
    navigation.navigate('Profile' as never);
  };

  const isValid = documentType && documentNumber.trim();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: themeConfig.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: themeConfig.colors.text }]}>
        Document Information
      </Text>
      
      <Text style={[styles.description, { color: themeConfig.colors.textSecondary }]}>
        Provide your identity document details
      </Text>

      <Text style={[styles.label, { color: themeConfig.colors.text }]}>
        Document Type
      </Text>
      <View style={[styles.pickerContainer, { 
        borderColor: themeConfig.colors.border,
        backgroundColor: themeConfig.colors.card,
      }]}>
        <Picker
          selectedValue={documentType}
          onValueChange={setDocumentType}
          style={{ color: themeConfig.colors.text }}
        >
          <Picker.Item label="Passport" value="PASSPORT" />
          <Picker.Item label="Driver's License" value="DRIVERS_LICENSE" />
          <Picker.Item label="National ID" value="NATIONAL_ID" />
        </Picker>
      </View>

      <TextInput
        style={[styles.input, { 
          borderColor: themeConfig.colors.border,
          color: themeConfig.colors.text,
          backgroundColor: themeConfig.colors.card,
        }]}
        placeholder="Document Number"
        placeholderTextColor={themeConfig.colors.textSecondary}
        value={documentNumber}
        onChangeText={setDocumentNumber}
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
        Step 2 of 5
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 14, marginBottom: 24 },
  label: { fontSize: 14, marginBottom: 8, fontWeight: '600' },
  pickerContainer: { borderWidth: 1, borderRadius: 8, marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 16 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  backButton: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  backButtonText: { fontSize: 16, fontWeight: 'bold' },
  nextButton: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  stepIndicator: { textAlign: 'center', fontSize: 12, marginTop: 16 },
});
