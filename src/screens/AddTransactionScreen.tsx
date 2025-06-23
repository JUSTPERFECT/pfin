import type { TransactionType, CreateTransaction } from '../types';
// src/screens/AddTransactionScreen.tsx
// Screen for adding new income or expense transactions

import React, { useState } from 'react';
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
import { useTransactions, useSettings, useUser } from '../hooks';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// ==========================================
// TYPES
// ==========================================

interface AddTransactionScreenProps {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'AddTransaction'>;
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

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 100, // Space for action buttons
  },
  
  // Header
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  
  // Cards
  typeSelectorCard: {
    marginBottom: theme.spacing.md,
  },
  inputCard: {
    marginBottom: theme.spacing.md,
  },
  
  // Section titles
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  
  // Type selector
  typeSelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeOption: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  typeOptionText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  
  // Inputs
  input: {
    marginBottom: theme.spacing.sm,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
  },
  
  // Amount preview
  amountPreview: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  
  // Category selector
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    minHeight: 44,
  },
  categorySelectorText: {
    fontSize: theme.fontSize.md,
    flex: 1,
  },
  categorySelectorArrow: {
    fontSize: theme.fontSize.xs,
    marginLeft: theme.spacing.sm,
  },
  
  // Error text
  errorText: {
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  
  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
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
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  modalClose: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
  },
  categoryOptionText: {
    fontSize: theme.fontSize.md,
  },
  checkmark: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 44,
  },
  dateSelectorText: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  dateSelectorArrow: {
    fontSize: theme.fontSize.sm,
  },
  dateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
  },
  dateOptionText: {
    fontSize: theme.fontSize.md,
  },
  todayLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
  },
  dateList: {
    maxHeight: 300,
  },
});

const AddTransactionScreen: React.FC<AddTransactionScreenProps> = ({ navigation, route }) => {
  const { theme, isDarkMode } = useTheme();
  const { currency } = useSettings();
  const { addTransaction, updateTransaction, loading } = useTransactions();
  const { user } = useUser();
  
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
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  
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
  
  const handleFieldChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev: FormData) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev: FormErrors) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTypeChange = (type: TransactionType) => {
    setFormData((prev: FormData) => ({ 
      ...prev, 
      type,
      category: '', // Reset category when type changes
    }));
    
    // Clear category error
    if (errors.category) {
      setErrors((prev: FormErrors) => ({ ...prev, category: undefined }));
    }
  };

  const handleCategorySelect = (category: string) => {
    handleFieldChange('category', category);
    setShowCategoryPicker(false);
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    console.log('Form data:', formData);
    console.log('Errors:', errors);
    console.log('User:', user);
    
    // Check if user exists
    if (!user) {
      navigation?.navigate('UserSetup');
      return;
    }
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Setting submitting to true');

      const transactionData: CreateTransaction = {
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        category: formData.category,
        date: formData.date,
        type: formData.type,
      };

      console.log('Transaction data to save:', transactionData);

      if (isEditing && editId) {
        console.log('Updating existing transaction');
        const success = await updateTransaction(editId, transactionData);
        console.log('Update result:', success);
        if (success) {
          Alert.alert(
            'Success', 
            'Transaction updated successfully!',
            [{ text: 'OK', onPress: () => navigation?.goBack() }]
          );
        }
      } else {
        console.log('Adding new transaction');
        const newTransaction = await addTransaction(transactionData);
        console.log('Add result:', newTransaction);
        if (newTransaction) {
          Alert.alert(
            'Success', 
            SUCCESS_MESSAGES.TRANSACTION_ADDED,
            [{ text: 'OK', onPress: () => navigation?.goBack() }]
          );
        } else {
          console.log('addTransaction returned null');
          Alert.alert(
            'Error',
            'Failed to save transaction. Please try again.'
          );
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Alert.alert(
        'Error',
        'Failed to save transaction. Please try again.'
      );
    } finally {
      setSubmitting(false);
      console.log('Setting submitting to false');
    }
  };

  const handleCancel = () => {
    navigation?.goBack();
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date: Date) => {
    handleFieldChange('date', date.toISOString());
    hideDatePicker();
  };

  // ==========================================
  // RENDER COMPONENTS
  // ==========================================
  
  const styles = createStyles(theme);

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
        onChangeText={(value: string) => handleFieldChange('amount', value)}
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
        onChangeText={(value: string) => handleFieldChange('description', value)}
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

  const renderDateSelector = () => (
    <Card style={styles.inputCard}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Date</Text>
      <TouchableOpacity onPress={showDatePicker} style={styles.dateSelector}>
        <Text style={[styles.dateSelectorText, { color: theme.colors.text }]}>
          {new Date(formData.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <Text style={[styles.dateSelectorArrow, { color: theme.colors.gray }]}>▼</Text>
      </TouchableOpacity>
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
              <Text style={[styles.modalClose, { color: theme.colors.mint }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={categories}
            keyExtractor={(item: string) => item}
            renderItem={({ item }: { item: string }) => (
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
                      ? theme.colors.mint 
                      : theme.colors.text 
                  }
                ]}>
                  {item}
                </Text>
                {formData.category === item && (
                  <Text style={[styles.checkmark, { color: theme.colors.mint }]}>
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

  const renderDateTimePicker = () => {
    // Generate dates for the last 30 days and next 7 days
    const generateDateOptions = () => {
      const options = [];
      const today = new Date();
      
      // Add last 30 days
      for (let i = 30; i >= 1; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        options.push(date);
      }
      
      // Add today
      options.push(today);
      
      // Add next 7 days
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        options.push(date);
      }
      
      return options;
    };

    const dateOptions = generateDateOptions();
    const selectedDateObj = new Date(formData.date);

    return (
      <Modal
        visible={isDatePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={hideDatePicker}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Select Date
              </Text>
              <TouchableOpacity onPress={hideDatePicker}>
                <Text style={[styles.modalClose, { color: theme.colors.mint }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={dateOptions}
              keyExtractor={(date) => date.toISOString()}
              renderItem={({ item: date }) => {
                const isSelected = date.toDateString() === selectedDateObj.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <TouchableOpacity
                    style={[
                      styles.dateOption,
                      { borderBottomColor: theme.colors.border }
                    ]}
                    onPress={() => handleConfirmDate(date)}
                  >
                    <View>
                      <Text style={[
                        styles.dateOptionText,
                        { 
                          color: isSelected 
                            ? theme.colors.mint 
                            : theme.colors.text 
                        }
                      ]}>
                        {date.toLocaleDateString('en-GB', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                      {isToday && (
                        <Text style={[styles.todayLabel, { color: theme.colors.mint }]}>
                          Today
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <Text style={[styles.checkmark, { color: theme.colors.mint }]}>
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              }}
              style={styles.dateList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    );
  };

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
        {renderDateSelector()}
      </ScrollView>
      
      {renderActionButtons()}
      {renderCategoryPicker()}
      {renderDateTimePicker()}
    </SafeAreaView>
  );
};

// ==========================================
// EXPORT
// ==========================================

export default AddTransactionScreen;