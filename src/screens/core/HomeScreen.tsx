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

// Import validation utilities (you'll need to create this file)
// import { useFormValidation, createExpenseValidator } from '../utils/validation';

// Import loading components (you'll need to create this file)
// import { 
//   LoadingSpinner, 
//   CardSkeleton, 
//   TransactionSkeleton, 
//   EmptyState, 
//   ErrorState,
//   LoadingOverlay,
//   InlineLoading 
// } from '../components/LoadingStates';

// Temporary inline validation for now (replace with proper validation later)
const useFormValidation = (validator: any, initialData: any) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const updateField = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const hasFieldError = (field: string) => !!errors[field];
  const getFieldError = (field: string) => errors[field];
  const resetValidation = () => {
    setErrors({});
    setFormData(initialData);
  };
  
  return {
    formData,
    updateField,
    validateForm,
    getFieldError,
    hasFieldError,
    resetValidation,
  };
};

// Temporary inline loading components (replace with proper components later)
const LoadingSpinner = ({ text = 'Loading...' }: { text?: string }) => (
  <View style={tempStyles.loadingContainer}>
    <Text style={tempStyles.loadingText}>{text}</Text>
  </View>
);

const CardSkeleton = () => (
  <View style={tempStyles.skeletonCard}>
    <View style={tempStyles.skeletonLine} />
    <View style={tempStyles.skeletonLine} />
  </View>
);

const TransactionSkeleton = () => (
  <View style={tempStyles.transactionSkeleton}>
    <View style={tempStyles.skeletonAvatar} />
    <View style={tempStyles.skeletonContent}>
      <View style={tempStyles.skeletonLine} />
      <View style={tempStyles.skeletonLine} />
    </View>
  </View>
);

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionText, 
  onAction, 
  style 
}: {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  style?: any;
}) => (
  <View style={[tempStyles.emptyState, style]}>
    <Text style={tempStyles.emptyIcon}>{icon}</Text>
    <Text style={tempStyles.emptyTitle}>{title}</Text>
    <Text style={tempStyles.emptyDescription}>{description}</Text>
    {actionText && onAction && (
      <TouchableOpacity style={tempStyles.emptyButton} onPress={onAction}>
        <Text style={tempStyles.emptyButtonText}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const ErrorState = ({ 
  title, 
  description, 
  onRetry 
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) => (
  <View style={tempStyles.errorState}>
    <Text style={tempStyles.errorIcon}>😕</Text>
    <Text style={tempStyles.errorTitle}>{title}</Text>
    <Text style={tempStyles.errorDescription}>{description}</Text>
    {onRetry && (
      <TouchableOpacity style={tempStyles.errorButton} onPress={onRetry}>
        <Text style={tempStyles.errorButtonText}>Try Again</Text>
      </TouchableOpacity>
    )}
  </View>
);

const LoadingOverlay = ({ visible, text }: { visible: boolean; text?: string }) => {
  if (!visible) return null;
  return (
    <View style={tempStyles.overlay}>
      <View style={tempStyles.overlayContent}>
        <Text style={tempStyles.overlayText}>{text || 'Loading...'}</Text>
      </View>
    </View>
  );
};

const InlineLoading = ({ 
  loading, 
  text, 
  loadingText 
}: { 
  loading: boolean; 
  text: string; 
  loadingText?: string; 
}) => (
  <Text style={tempStyles.buttonText}>
    {loading ? (loadingText || 'Loading...') : text}
  </Text>
);

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
  
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState<'expense' | 'income'>('expense');
  
  // Form validation
  const {
    formData,
    updateField,
    validateForm,
    getFieldError,
    hasFieldError,
    resetValidation,
  } = useFormValidation(null, {
    amount: '',
    description: '',
    category: 'food',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingError(null);
      
      // Simulate loading delay to see skeleton
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const [expensesData, settingsData, profileData] = await Promise.all([
        AsyncStorage.getItem('expenses'),
        AsyncStorage.getItem('userSettings'),
        AsyncStorage.getItem('userProfile'),
      ]);

      if (expensesData) {
        setExpenses(JSON.parse(expensesData));
      } else {
        // Sample data for demonstration
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

      if (settingsData) {
        setUserSettings(JSON.parse(settingsData));
      }

      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setLoadingError('Failed to load data. Please try again.');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const saveExpenses = async (newExpenses: Expense[]) => {
    try {
      setIsSaving(true);
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      await AsyncStorage.setItem('expenses', JSON.stringify(newExpenses));
      setExpenses(newExpenses);
    } catch (error) {
      console.error('Error saving expenses:', error);
      Alert.alert('Error', 'Failed to save data. Please try again.');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadData();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const getMonthlySpending = () => {
    const now = new Date();
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear() &&
             expense.type === 'expense';
    });
    
    return monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getMonthlyIncome = () => {
    const now = new Date();
    const monthlyIncome = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear() &&
             expense.type === 'income';
    });
    
    return monthlyIncome.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getRecentExpenses = () => {
    return expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const getTodayExpenses = () => {
    const today = new Date().toISOString().split('T')[0];
    return expenses.filter(expense => expense.date === today && expense.type === 'expense');
  };

  const getBudgetProgress = () => {
    const spent = getMonthlySpending();
    return userSettings.monthlyBudget > 0 ? (spent / userSettings.monthlyBudget) * 100 : 0;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'add_expense':
        setSelectedActionType('expense');
        resetValidation();
        setShowAddExpense(true);
        break;
      case 'add_income':
        setSelectedActionType('income');
        resetValidation();
        setShowAddExpense(true);
        break;
      case 'scan_receipt':
        Alert.alert('Receipt Scanner', 'Camera functionality will be available soon!');
        break;
      case 'view_insights':
        Alert.alert('View Insights', 'Navigate to insights screen');
        break;
    }
  };

  const handleAddTransaction = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }

    try {
      const newTransaction: Expense = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        type: selectedActionType,
      };

      const updatedExpenses = [newTransaction, ...expenses];
      await saveExpenses(updatedExpenses);

      // Reset form
      resetValidation();
      setShowAddExpense(false);
      
      Alert.alert(
        'Success!', 
        `${selectedActionType === 'expense' ? 'Expense' : 'Income'} added successfully`
      );
    } catch (error) {
      // Error already handled in saveExpenses
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    }
  };

  const renderRecentTransaction = ({ item }: { item: Expense }) => {
    const category = EXPENSE_CATEGORIES.find(cat => cat.key === item.category) || EXPENSE_CATEGORIES[6];
    
    return (
      <TouchableOpacity style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View style={[styles.transactionIcon, { backgroundColor: category.color + '20' }]}>
            <Text style={styles.transactionEmoji}>{category.icon}</Text>
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionDescription}>{item.description}</Text>
            <Text style={styles.transactionCategory}>{category.label} • {formatDate(item.date)}</Text>
          </View>
        </View>
        <Text style={[
          styles.transactionAmount,
          { color: item.type === 'expense' ? '#FF6B6B' : '#2E7D61' }
        ]}>
          {item.type === 'expense' ? '-' : '+'}{userSettings.currency}{item.amount}
        </Text>
      </TouchableOpacity>
    );
  };

  // Show loading state on initial load
  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Loading...</Text>
              <Text style={styles.userName}>Please wait</Text>
            </View>
            <View style={styles.profileButton} />
          </View>
          <CardSkeleton />
          <CardSkeleton />
          <View style={styles.recentCard}>
            <Text style={styles.recentTitle}>Recent Transactions</Text>
            <TransactionSkeleton />
            <TransactionSkeleton />
            <TransactionSkeleton />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show error state if loading failed
  if (loadingError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          title="Failed to load data"
          description={loadingError}
          onRetry={() => {
            setLoadingError(null);
            setIsInitialLoading(true);
            loadData();
          }}
        />
      </SafeAreaView>
    );
  }

  const monthlySpending = getMonthlySpending();
  const monthlyIncome = getMonthlyIncome();
  const todayExpenses = getTodayExpenses();
  const budgetProgress = getBudgetProgress();
  const recentExpenses = getRecentExpenses();
  const todayTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={isSaving} text="Saving..." />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={onRefresh}
            tintColor="#2E7D61"
            colors={['#2E7D61']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userProfile.name}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileInitial}>{userProfile.name.charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Budget Overview Card */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetTitle}>Monthly Overview</Text>
            <Text style={styles.budgetMonth}>
              {new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' })}
            </Text>
          </View>
          
          <View style={styles.budgetStats}>
            <View style={styles.budgetStat}>
              <Text style={styles.budgetLabel}>Spent</Text>
              <Text style={styles.budgetSpent}>
                {userSettings.currency}{monthlySpending.toLocaleString()}
              </Text>
            </View>
            <View style={styles.budgetStat}>
              <Text style={styles.budgetLabel}>Budget</Text>
              <Text style={styles.budgetTotal}>
                {userSettings.currency}{userSettings.monthlyBudget.toLocaleString()}
              </Text>
            </View>
            <View style={styles.budgetStat}>
              <Text style={styles.budgetLabel}>Income</Text>
              <Text style={styles.budgetIncome}>
                {userSettings.currency}{monthlyIncome.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min(budgetProgress, 100)}%`,
                    backgroundColor: budgetProgress > 90 ? '#FF6B6B' : 
                                   budgetProgress > 70 ? '#FFEAA7' : '#2E7D61'
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {budgetProgress.toFixed(0)}% of budget used
            </Text>
          </View>
        </View>

        {/* Today's Summary */}
        <View style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <Text style={styles.todayTitle}>Today's Spending</Text>
            <Text style={styles.todayAmount}>
              {userSettings.currency}{todayTotal.toLocaleString()}
            </Text>
          </View>
          <Text style={styles.todaySubtitle}>
            {todayExpenses.length} transaction{todayExpenses.length !== 1 ? 's' : ''} today
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionButton}
                onPress={() => handleQuickAction(action.id)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <Text style={styles.quickActionEmoji}>{action.icon}</Text>
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentCard}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentExpenses.length > 0 ? (
            <FlatList
              data={recentExpenses}
              keyExtractor={(item) => item.id}
              renderItem={renderRecentTransaction}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <EmptyState
              icon="💳"
              title="No transactions yet"
              description="Start by adding your first expense or income"
              actionText="Add Transaction"
              onAction={() => handleQuickAction('add_expense')}
              style={{ paddingVertical: 40 }}
            />
          )}
        </View>

        {/* Smart Insight */}
        <View style={styles.insightCard}>
          <TouchableOpacity style={styles.insightHeader}>
            <Text style={styles.insightIcon}>💡</Text>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Smart Tip</Text>
              <Text style={styles.insightDescription}>
                {budgetProgress > 80 
                  ? "You're close to your budget limit. Consider reducing discretionary spending."
                  : monthlySpending > 0
                  ? `Your top spending category this month is ${EXPENSE_CATEGORIES.find(cat => 
                      expenses.filter(e => e.category === cat.key && e.type === 'expense').length > 0
                    )?.label || 'Food'}. Try to optimize here.`
                  : "Great start! Begin tracking your expenses to get personalized insights."
                }
              </Text>
            </View>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Transaction Modal */}
      <Modal
        visible={showAddExpense}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddExpense(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Add {selectedActionType === 'expense' ? 'Expense' : 'Income'}
            </Text>
            <TouchableOpacity onPress={handleAddTransaction}>
              <InlineLoading
                loading={isSaving}
                text="Save"
                loadingText="Saving..."
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount ({userSettings.currency}) *</Text>
              <TextInput
                style={[
                  styles.input,
                  hasFieldError('amount') && styles.inputError
                ]}
                placeholder="Enter amount"
                keyboardType="numeric"
                value={formData.amount}
                onChangeText={(value) => updateField('amount', value)}
                autoFocus
              />
              {hasFieldError('amount') && (
                <Text style={styles.errorText}>{getFieldError('amount')}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[
                  styles.input,
                  hasFieldError('description') && styles.inputError
                ]}
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
    </SafeAreaView>
  );
}

// Temporary styles for inline components
const tempStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    height: 120,
    justifyContent: 'space-between',
  },
  skeletonLine: {
    backgroundColor: '#F0F0F0',
    height: 16,
    borderRadius: 4,
    width: '70%',
  },
  transactionSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 12,
  },
  skeletonContent: {
    flex: 1,
    gap: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#2E7D61',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  buttonText: {
    color: '#2E7D61',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Main styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4F8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D61',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  budgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  budgetMonth: {
    fontSize: 14,
    color: '#666',
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetStat: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  budgetSpent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  budgetTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  budgetIncome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D61',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  todayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  todayAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  todaySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginBottom: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2E7D61',
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionEmoji: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  arrowText: {
    fontSize: 18,
    color: '#CCC',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6C757D',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  categorySelector: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoryOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selectedCategory: {
    backgroundColor: '#2E7D61',
    borderColor: '#2E7D61',
  },
  categoryOptionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
});