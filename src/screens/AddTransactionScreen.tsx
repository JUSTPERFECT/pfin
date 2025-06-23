import type { TransactionType, CreateTransaction } from '../types';
// src/screens/AddTransactionScreen.tsx
// Screen for adding new income or expense transactions

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Button, Card, Input } from '../components/ui';
import { useTransactions, useSettings } from '../hooks';
import { 
  formatCurrency, 
  getValidationError, 
  isValidAmount,
  isRequired
} from '../utils';
import { 
  EXPENSE_CATEGORIES, 
  INCOME_CATEGORIES, 
  TRANSACTION_TYPES,
  SUCCESS_MESSAGES,
  type CurrencyCode 
} from '../constants';
import { NavigationHelpers } from '../navigation/NavigationHelpers';

// ==========================================
// TYPES
// ==========================================

interface AddTransactionScreenProps {
  navigation: any; // Temporary - will use React Navigation's navigation prop
  route?: {
    params?: {
      editId?: string;
      initialType?: TransactionType;
    };
  };
}

interface FormData {
  amount: string;
  description: string;
  category: string;
  date: string;
  type: TransactionType;
}

interface FormErrors {
  amount?: string;
  description?: string;
  category?: string;
}

// ==========================================
// COMPONENT
// ==========================================

const AddTransactionScreen: React.FC<AddTransactionScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { theme } = useTheme();
  const { currency } = useSettings();
  const { addTransaction, updateTransaction, loading } = useTransactions();
  
  // Get initial values from route params
  const editId = route?.params?.editId;
  const initialType = route?.params?.initialType || 'expense';
  const isEditing = Boolean(editId);
  
  // ==========================================
  // STATE
  // ==========================================
  
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString(),
    type: initialType,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  // Safe currency casting
  const safeCurrency = (currency as CurrencyCode) || 'INR';
  
  // Get categories based on transaction type
  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  
  // Get transaction type config
  const transactionConfig = TRANSACTION_TYPES.find(t => t.key === formData.type);

  // ==========================================
  // FORM VALIDATION
  // ==========================================
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate amount
    if (!isRequired(formData.amount)) {
      newErrors.amount = 'Amount is required';
    } else if (!isValidAmount(formData.amount)) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    // Validate description
    if (!isRequired(formData.description)) {
      newErrors.description = 'Description is required';
    }
    
    // Validate category
    if (!isRequired(formData.category)) {
      newErrors.category = 'Category is required';
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

  const handleTypeChange = (type: TransactionType) => {
    setFormData(prev => ({ 
      ...prev, 
      type,
      category: '', // Reset category when type changes
    }));
    
    // Clear category error
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: undefined }));
    }
  };

  const handleCategorySelect = (category: string) => {
    handleFieldChange('category', category);
    setShowCategoryPicker(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const transactionData: CreateTransaction = {
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        category: formData.category,
        date: formData.date,
        type: formData.type,
      };

      if (isEditing && editId) {
        const success = await updateTransaction(editId, transactionData);
        if (success) {
          Alert.alert(
            'Success', 
            'Transaction updated successfully!',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      } else {
        const newTransaction = await addTransaction(transactionData);
        if (newTransaction) {
          Alert.alert(
            'Success', 
            SUCCESS_MESSAGES.TRANSACTION_ADDED,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to save transaction. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  // ==========================================
  // RENDER COMPONENTS
  // ==========================================
  
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {isEditing ? 'Edit Transaction' : 'Add Transaction'}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {isEditing ? 'Update your transaction details' : 'Record your income or expense'}
      </Text>
    </View>
  );

  const renderTypeSelector = () => (
    <Card style={styles.typeSelectorCard}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Transaction Type
      </Text>
      
      <View style={styles.typeSelector}>
        {TRANSACTION_TYPES.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.typeOption,
              {
                backgroundColor: formData.type === type.key 
                  ? type.color + '20' 
                  : theme.colors.surface,
                borderColor: formData.type === type.key 
                  ? type.color 
                  : theme.colors.border,
              }
            ]}
            onPress={() => handleTypeChange(type.key as TransactionType)}
          >
            <Text style={[
              styles.typeOptionText,
              { 
                color: formData.type === type.key 
                  ? type.color 
                  : theme.colors.text 
              }
            ]}>
              {type.prefix} {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );

  const renderAmountInput = () => (
    <Card style={styles.inputCard}>
      <Input
        label="Amount"
        type="currency"
        value={formData.amount}
        onChangeText={(value) => handleFieldChange('amount', value)}
        placeholder="0.00"
        currencySymbol={safeCurrency === 'INR' ? '₹' : '$'}
        error={errors.amount}
        required
        style={styles.input}
      />
      
      {formData.amount && isValidAmount(formData.amount) && (
        <Text style={[styles.amountPreview, { color: transactionConfig?.color }]}>
          {transactionConfig?.prefix}{formatCurrency(parseFloat(formData.amount), safeCurrency)}
        </Text>
      )}
    </Card>
  );

  const renderDescriptionInput = () => (
    <Card style={styles.inputCard}>
      <Input
        label="Description"
        value={formData.description}
        onChangeText={(value) => handleFieldChange('description', value)}
        placeholder="What did you spend on?"
        error={errors.description}
        required
        maxLength={100}
        style={styles.input}
      />
    </Card>
  );

  const renderCategorySelector = () => (
    <Card style={styles.inputCard}>
      <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
        Category <Text style={{ color: theme.colors.error }}>*</Text>
      </Text>
      
      <TouchableOpacity
        style={[
          styles.categorySelector,
          {
            borderColor: errors.category ? theme.colors.error : theme.colors.border,
            backgroundColor: theme.colors.surface,
          }
        ]}
        onPress={() => setShowCategoryPicker(true)}
      >
        <Text style={[
          styles.categorySelectorText,
          { 
            color: formData.category 
              ? theme.colors.text 
              : theme.colors.placeholder 
          }
        ]}>
          {formData.category || 'Select category'}
        </Text>
        <Text style={[styles.categorySelectorArrow, { color: theme.colors.textSecondary }]}>
          ▼
        </Text>
      </TouchableOpacity>
      
      {errors.category && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {errors.category}
        </Text>
      )}
    </Card>
  );

  const renderCategoryPicker = () => (
    <Modal
      visible={showCategoryPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCategoryPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Select Category
            </Text>
            <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
              <Text style={[styles.modalClose, { color: theme.colors.primary }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={categories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryOption,
                  { borderBottomColor: theme.colors.border }
                ]}
                onPress={() => handleCategorySelect(item)}
              >
                <Text style={[
                  styles.categoryOptionText,
                  { 
                    color: formData.category === item 
                      ? theme.colors.primary 
                      : theme.colors.text 
                  }
                ]}>
                  {item}
                </Text>
                {formData.category === item && (
                  <Text style={[styles.checkmark, { color: theme.colors.primary }]}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            )}
            style={styles.categoryList}
          />
        </View>
      </View>
    </Modal>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <Button
        variant="outline"
        onPress={handleCancel}
        style={styles.cancelButton}
        disabled={submitting}
      >
        Cancel
      </Button>
      
      <Button
        variant="primary"
        onPress={handleSubmit}
        style={styles.submitButton}
        loading={submitting}
        disabled={submitting}
      >
        {isEditing ? 'Update' : 'Add'} Transaction
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
        {renderTypeSelector()}
        {renderAmountInput()}
        {renderDescriptionInput()}
        {renderCategorySelector()}
      </ScrollView>
      
      {renderActionButtons()}
      {renderCategoryPicker()}
    </SafeAreaView>
  );
};

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Space for action buttons
  },
  
  // Header
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Cards
  typeSelectorCard: {
    marginBottom: 16,
  },
  inputCard: {
    marginBottom: 16,
  },
  
  // Section titles
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  
  // Type selector
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  typeOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Inputs
  input: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  
  // Amount preview
  amountPreview: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  
  // Category selector
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
  },
  categorySelectorText: {
    fontSize: 16,
    flex: 1,
  },
  categorySelectorArrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  
  // Error text
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  
  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'transparent',
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalClose: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  categoryOptionText: {
    fontSize: 16,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

// ==========================================
// EXPORT
// ==========================================

export default AddTransactionScreen;