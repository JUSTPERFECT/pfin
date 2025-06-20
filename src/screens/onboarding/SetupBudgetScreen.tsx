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
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppState } from '../../context/AppStateProvider';

export default function SetupBudgetScreen() {
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const navigation = useNavigation();
  const { setHasOnboarded } = useAppState();

  const currencies = [
    { code: '₹', name: 'Indian Rupee' },
    { code: '$', name: 'US Dollar' },
    { code: '€', name: 'Euro' },
    { code: '£', name: 'British Pound' },
  ];

  const handleSave = async () => {
    // Quick validation
    const budgetValue = parseFloat(budget);
    if (!budget || isNaN(budgetValue) || budgetValue <= 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    setSaving(true);

    try {
      // Save settings
      await AsyncStorage.setItem('userSettings', JSON.stringify({
        monthlyBudget: budgetValue,
        currency,
      }));
      
      // Navigate immediately - no delay
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Monthly Budget</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={budget}
            onChangeText={(text) => {
              setBudget(text);
              if (error) setError(''); // Clear error on input
            }}
            autoFocus
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Currency</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {currencies.map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.currencyButton,
                  currency === curr.code && styles.selectedCurrency
                ]}
                onPress={() => setCurrency(curr.code)}
              >
                <Text style={[
                  styles.currencyText,
                  currency === curr.code && styles.selectedText
                ]}>
                  {curr.code}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[styles.button, (!budget || saving) && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={!budget || saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Saving...' : 'Continue'}
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
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D61',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    marginTop: 6,
  },
  currencyButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCurrency: {
    backgroundColor: '#2E7D61',
    borderColor: '#2E7D61',
  },
  currencyText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2E7D61',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});