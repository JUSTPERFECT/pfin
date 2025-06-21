// src/screens/onboarding/SetupBudgetScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ FIXED: Use proper navigation types and validation
import { useOnboardingNavigation } from '../../types/navigation';
import { useFormValidation, createBudgetValidator } from '../../utils/validation';
import { useAppState } from '../../context/AppStateProvider';

export default function SetupBudgetScreen() {
  const [saving, setSaving] = useState(false);
  const navigation = useOnboardingNavigation();
  const { setHasOnboarded } = useAppState();

  const currencies = [
    { code: '₹', name: 'Indian Rupee' },
    { code: '$', name: 'US Dollar' },
    { code: '€', name: 'Euro' },
    { code: '£', name: 'British Pound' },
  ];

  // ✅ FIXED: Use proper validation
  const {
    formData,
    updateField,
    validateForm,
    getFieldError,
    hasFieldError,
  } = useFormValidation(createBudgetValidator(), {
    monthlyBudget: '',
    currency: '₹',
  });

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      // Save settings
      await AsyncStorage.setItem('userSettings', JSON.stringify({
        monthlyBudget: parseFloat(formData.monthlyBudget),
        currency: formData.currency,
      }));
      
      // Navigate to completion
      navigation.navigate('Done');
      
    } catch (err) {
      Alert.alert('Error', 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Set your monthly budget</Text>

        {/* Currency Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Currency</Text>
          <View style={styles.currencySelector}>
            {currencies.map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.currencyOption,
                  formData.currency === curr.code && styles.selectedCurrency
                ]}
                onPress={() => updateField('currency', curr.code)}
              >
                <Text style={[
                  styles.currencyCode,
                  formData.currency === curr.code && styles.selectedCurrencyText
                ]}>
                  {curr.code}
                </Text>
                <Text style={[
                  styles.currencyName,
                  formData.currency === curr.code && styles.selectedCurrencyText
                ]}>
                  {curr.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {hasFieldError('currency') && (
            <Text style={styles.errorText}>{getFieldError('currency')}</Text>
          )}
        </View>

        {/* Budget Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Monthly Budget</Text>
          <TextInput
            style={[styles.input, hasFieldError('monthlyBudget') && styles.inputError]}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={formData.monthlyBudget}
            onChangeText={(text) => updateField('monthlyBudget', text)}
            autoFocus
          />
          {hasFieldError('monthlyBudget') && (
            <Text style={styles.errorText}>{getFieldError('monthlyBudget')}</Text>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.button, saving && styles.buttonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Saving...' : 'Complete Setup'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3FFF7',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D61',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  currencySelector: {
    gap: 8,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedCurrency: {
    borderColor: '#2E7D61',
    backgroundColor: '#F0FFF4',
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginRight: 12,
    minWidth: 24,
  },
  currencyName: {
    fontSize: 16,
    color: '#666',
  },
  selectedCurrencyText: {
    color: '#2E7D61',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#2E7D61',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 32,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});