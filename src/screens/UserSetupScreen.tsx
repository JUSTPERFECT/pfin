// src/screens/UserSetupScreen.tsx
// Screen for initial user setup

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Button, Card, Input } from '../components/ui';
import { useUserSetup } from '../hooks';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// ==========================================
// TYPES
// ==========================================

interface UserSetupScreenProps {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'UserSetup'>;
}

interface FormData {
  name: string;
  email: string;
  currency: string;
}

interface FormErrors {
  name?: string;
  email?: string;
}

// ==========================================
// COMPONENT
// ==========================================

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  
  // Header
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    lineHeight: 24,
    textAlign: 'center',
  },
  
  // Cards
  card: {
    marginBottom: theme.spacing.md,
  },
  
  // Inputs
  input: {
    marginBottom: theme.spacing.sm,
  },
  
  // Currency selector
  currencySelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  currencyOption: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  currencyOptionText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  
  // Action buttons
  actionButtons: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  
  // Error text
  errorText: {
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});

const UserSetupScreen: React.FC<UserSetupScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { setupUser, loading, error } = useUserSetup();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    currency: 'INR',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // ==========================================
  // FORM VALIDATION
  // ==========================================
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // HANDLERS
  // ==========================================
  
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCurrencyChange = (currency: string) => {
    handleFieldChange('currency', currency);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const success = await setupUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        currency: formData.currency,
      });

      if (success) {
        Alert.alert(
          'Welcome!',
          'Your profile has been set up successfully.',
          [{ text: 'Get Started', onPress: () => navigation?.goBack() }]
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to set up profile. Please try again.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to set up profile. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // RENDER COMPONENTS
  // ==========================================
  
  const styles = createStyles(theme);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Welcome to PFIN
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Let's set up your profile to get started with managing your finances
      </Text>
    </View>
  );

  const renderNameInput = () => (
    <Card style={styles.card}>
      <Input
        label="Full Name"
        value={formData.name}
        onChangeText={(value: string) => handleFieldChange('name', value)}
        placeholder="Enter your full name"
        error={errors.name}
        required
        style={styles.input}
      />
    </Card>
  );

  const renderEmailInput = () => (
    <Card style={styles.card}>
      <Input
        label="Email"
        value={formData.email}
        onChangeText={(value: string) => handleFieldChange('email', value)}
        placeholder="Enter your email address"
        error={errors.email}
        required
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
    </Card>
  );

  const renderCurrencySelector = () => (
    <Card style={styles.card}>
      <Text style={[styles.currencyOptionText, { color: theme.colors.text, marginBottom: theme.spacing.sm }]}>
        Preferred Currency
      </Text>
      
      <View style={styles.currencySelector}>
        {[
          { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
          { code: 'USD', symbol: '$', name: 'US Dollar' },
          { code: 'EUR', symbol: '€', name: 'Euro' },
        ].map((currency) => (
          <Button
            key={currency.code}
            variant={formData.currency === currency.code ? 'primary' : 'outline'}
            onPress={() => handleCurrencyChange(currency.code)}
            style={styles.currencyOption}
          >
            <Text style={styles.currencyOptionText}>
              {currency.symbol} {currency.code}
            </Text>
          </Button>
        ))}
      </View>
    </Card>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <Button
        variant="primary"
        onPress={handleSubmit}
        loading={submitting}
        disabled={submitting}
      >
        Complete Setup
      </Button>
    </View>
  );

  // ==========================================
  // RENDER
  // ==========================================
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderNameInput()}
        {renderEmailInput()}
        {renderCurrencySelector()}
      </ScrollView>
      
      {renderActionButtons()}
    </SafeAreaView>
  );
};

// ==========================================
// EXPORT
// ==========================================

export default UserSetupScreen; 