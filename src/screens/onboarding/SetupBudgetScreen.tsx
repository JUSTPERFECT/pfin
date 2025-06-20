// File: src/screens/onboarding/SetupBudgetScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SetupBudgetScreen() {
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('₹');
  const navigation = useNavigation();

  const handleSave = async () => {
    const budgetValue = parseFloat(budget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid amount.');
      return;
    }

    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify({
        monthlyBudget: budgetValue,
        currency,
      }));
      navigation.navigate('Done');
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set your monthly budget</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Budget</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          keyboardType="numeric"
          value={budget}
          onChangeText={setBudget}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Currency</Text>
        <TextInput
          style={styles.input}
          placeholder="₹ / $ / €"
          value={currency}
          onChangeText={setCurrency}
          maxLength={2}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F3FFF7',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#2E7D61',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#2E7D61',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});