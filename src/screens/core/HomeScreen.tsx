// src/screens/core/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ FIXED: Use proper imports instead of inline components
import { 
  LoadingSpinner, 
  CardSkeleton, 
  TransactionSkeleton, 
  EmptyState, 
  ErrorState,
  LoadingOverlay,
  InlineLoading 
} from '../../components/LoadingStates';

// ✅ FIXED: Use proper validation instead of inline
import { useFormValidation, createExpenseValidator } from '../../utils/validation';

// ✅ FIXED: Use proper navigation types
import { useMainTabNavigation } from '../../types/navigation';

// Main interfaces
interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'expense' | 'income';
}

interface UserSettings {
  monthlyBudget: number;
  currency: string;
}

interface UserProfile {
  name: string;
  email: string;
}

const EXPENSE_CATEGORIES = [
  { key: 'food', label: 'Food', icon: '🍔', color: '#FF6B6B' },
  { key: 'transport', label: 'Travel', icon: '🚛', color: '#4ECDC4' },
  { key: 'shopping', label: 'Shopping', icon: '🛍️', color: '#45B7D1' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#96CEB4' },
  { key: 'bills', label: 'Bills', icon: '💡', color: '#FFEAA7' },
  { key: 'health', label: 'Healthcare', icon: '🏥', color: '#DDA0DD' },
  { key: 'other', label: 'Other', icon: '💰', color: '#95A5A6' },
];

const QUICK_ACTIONS = [
  { id: 'add_expense', title: 'Add Expense', icon: '💸', color: '#FF6B6B' },
  { id: 'scan_receipt', title: 'Scan Receipt', icon: '📸', color: '#4ECDC4' },
  { id: 'add_income', title: 'Add Income', icon: '💰', color: '#2E7D61' },
  { id: 'view_insights', title: 'View Insights', icon: '📊', color: '#45B7D1' },
];

export default function HomeScreen() {
  // ✅ FIXED: Use typed navigation
  const navigation = useMainTabNavigation();
  
  // State management
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    monthlyBudget: 10000,
    currency: '₹',
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'User',
    email: 'user@example.com',
  });
  
  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  // Modal states
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState<'expense' | 'income'>('expense');
  
  // ✅ FIXED: Use proper validation hook with expense validator
  const {
    formData,
    updateField,
    validateForm,
    getFieldError,
    hasFieldError,
    resetValidation,
  } = useFormValidation(createExpenseValidator(), {
    amount: '',
    description: '',
    category: 'food',
  });

  // Effects
  useEffect(() => {
    loadData();
  }, []);

  // ✅ IMPROVED: Better error handling and loading management
  const loadData = async (silent = false) => {
    try {
      if (!silent) {
        setIsInitialLoading(true);
      }
      setLoadingError(null);
      
      const [expensesData, settingsData, profileData] = await Promise.all([
        AsyncStorage.getItem('expenses'),
        AsyncStorage.getItem('userSettings'),
        AsyncStorage.getItem('userProfile'),
      ]);

      // Load expenses
      if (expensesData) {
        setExpenses(JSON.parse(expensesData));
      } else {
        // Sample data for first time users
        const sampleExpenses: Expense[] = [
          { id: '1', date: '2025-06-22', amount: 450, category: 'food', description: 'Lunch at cafe', type: 'expense' },
          { id: '2', date: '2025-06-22', amount: 1200, category: 'shopping', description: 'New shirt', type: 'expense' },
          { id: '3', date: '2025-06-21', amount: 80, category: 'transport', description: 'Metro ticket', type: 'expense' },
          { id: '4', date: '2025-06-21', amount: 2500, category: 'other', description: 'Salary bonus', type: 'income' },
          { id: '5', date: '2025-06-20', amount: 180, category: 'entertainment', description: 'Movie tickets', type: 'expense' },
        ];
        setExpenses(sampleExpenses);
        await AsyncStorage.setItem('expenses', JSON.stringify(sampleExpenses));
      }

      // Load settings
      if (settingsData) {
        setUserSettings(JSON.parse(settingsData));
      }

      // Load profile
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setLoadingError('Failed to load data. Please try again.');
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  };

  // ✅ IMPROVED: Better refresh handling
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(true);
  };

  // ✅ IMPROVED: Better form submission with proper validation
  const handleSubmitExpense = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const newExpense: Expense = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description.trim(),
        type: selectedActionType,
      };

      const updatedExpenses = [newExpense, ...expenses];
      setExpenses(updatedExpenses);
      await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));

      // Reset form and close modal
      resetValidation();
      setShowAddExpense(false);
      
      Alert.alert(
        'Success', 
        `${selectedActionType === 'expense' ? 'Expense' : 'Income'} added successfully!`
      );
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ IMPROVED: Better action handling with navigation
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'add_expense':
        setSelectedActionType('expense');
        setShowAddExpense(true);
        break;
      case 'add_income':
        setSelectedActionType('income');
        setShowAddExpense(true);
        break;
      case 'scan_receipt':
        Alert.alert('Coming Soon', 'Receipt scanning feature will be available soon!');
        break;
      case 'view_insights':
        navigation.navigate('Insights');
        break;
    }
  };

  // ✅ IMPROVED: Better list rendering with proper optimization
  const renderTransaction = ({ item }: { item: Expense }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Text style={styles.transactionIconText}>
          {EXPENSE_CATEGORIES.find(cat => cat.key === item.category)?.icon || '💰'}
        </Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionCategory}>
          {EXPENSE_CATEGORIES.find(cat => cat.key === item.category)?.label || 'Other'} • {item.date}
        </Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: item.type === 'expense' ? '#FF6B6B' : '#2E7D61' }
      ]}>
        {item.type === 'expense' ? '-' : '+'}{userSettings.currency}{item.amount}
      </Text>
    </View>
  );

  // Calculate summary data
  const todayExpenses = expenses.filter(exp => 
    exp.date === new Date().toISOString().split('T')[0] && exp.type === 'expense'
  );
  const todayIncome = expenses.filter(exp => 
    exp.date === new Date().toISOString().split('T')[0] && exp.type === 'income'
  );
  const totalTodayExpenses = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalTodayIncome = todayIncome.reduce((sum, exp) => sum + exp.amount, 0);

  // ✅ IMPROVED: Proper loading state handling
  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text="Loading your expenses..." />
      </SafeAreaView>
    );
  }

  // ✅ IMPROVED: Proper error state handling
  if (loadingError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          title="Failed to load"
          description={loadingError}
          onRetry={() => loadData()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh}
            colors={['#2E7D61']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back, {userProfile.name}!</Text>
          <Text style={styles.dateText}>Today, {new Date().toLocaleDateString()}</Text>
        </View>

        {/* Today's Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Today's Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Spent</Text>
              <Text style={styles.summaryExpense}>
                -{userSettings.currency}{totalTodayExpenses}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Earned</Text>
              <Text style={styles.summaryIncome}>
                +{userSettings.currency}{totalTodayIncome}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionButton, { backgroundColor: action.color }]}
                onPress={() => handleQuickAction(action.id)}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsCard}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {expenses.length === 0 ? (
            <EmptyState
              icon="💸"
              title="No transactions yet"
              description="Start by adding your first expense or income"
              actionText="Add Transaction"
              onAction={() => setShowAddExpense(true)}
            />
          ) : (
            <FlatList
              data={expenses.slice(0, 10)}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={showAddExpense}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowAddExpense(false);
                resetValidation();
              }}
            >
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Add {selectedActionType === 'expense' ? 'Expense' : 'Income'}
            </Text>
            <TouchableOpacity onPress={handleSubmitExpense}>
              <InlineLoading
                loading={isSaving}
                text="Save"
                loadingText="Saving..."
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Action Type Toggle */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Type</Text>
              <View style={styles.actionTypeToggle}>
                <TouchableOpacity
                  style={[
                    styles.actionTypeButton,
                    selectedActionType === 'expense' && styles.activeActionType
                  ]}
                  onPress={() => setSelectedActionType('expense')}
                >
                  <Text style={[
                    styles.actionTypeText,
                    selectedActionType === 'expense' && styles.activeActionTypeText
                  ]}>
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionTypeButton,
                    selectedActionType === 'income' && styles.activeActionType
                  ]}
                  onPress={() => setSelectedActionType('income')}
                >
                  <Text style={[
                    styles.actionTypeText,
                    selectedActionType === 'income' && styles.activeActionTypeText
                  ]}>
                    Income
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount *</Text>
              <TextInput
                style={[styles.amountInput, hasFieldError('amount') && styles.inputError]}
                placeholder="0.00"
                keyboardType="numeric"
                value={formData.amount}
                onChangeText={(value) => updateField('amount', value)}
              />
              {hasFieldError('amount') && (
                <Text style={styles.errorText}>{getFieldError('amount')}</Text>
              )}
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, hasFieldError('description') && styles.inputError]}
                placeholder={`What did you ${selectedActionType === 'expense' ? 'spend on' : 'earn from'}?`}
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                maxLength={100}
              />
              {hasFieldError('description') && (
                <Text style={styles.errorText}>{getFieldError('description')}</Text>
              )}
              <Text style={styles.charCount}>
                {formData.description.length}/100 characters
              </Text>
            </View>

            {/* Category Selection (only for expenses) */}
            {selectedActionType === 'expense' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categorySelector}>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <TouchableOpacity
                        key={category.key}
                        style={[
                          styles.categoryOption,
                          formData.category === category.key && styles.selectedCategory
                        ]}
                        onPress={() => updateField('category', category.key)}
                      >
                        <Text style={styles.categoryOptionIcon}>{category.icon}</Text>
                        <Text style={[
                          styles.categoryOptionText,
                          formData.category === category.key && styles.selectedCategoryText
                        ]}>
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                {hasFieldError('category') && (
                  <Text style={styles.errorText}>{getFieldError('category')}</Text>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Loading Overlay */}
      <LoadingOverlay visible={isSaving} text="Saving..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4F8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 12,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  summaryExpense: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  summaryIncome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D61',
  },
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  transactionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 18,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  actionTypeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
  },
  actionTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeActionType: {
    backgroundColor: '#2E7D61',
  },
  actionTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeActionTypeText: {
    color: '#FFFFFF',
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  categoryOption: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategory: {
    backgroundColor: '#E8F4F8',
    borderColor: '#2E7D61',
  },
  categoryOptionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#2E7D61',
    fontWeight: 'bold',
  },
});