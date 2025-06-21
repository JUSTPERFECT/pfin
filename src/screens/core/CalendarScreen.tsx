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
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Temporary inline components (same as HomeScreen)
const LoadingSpinner = ({ text = 'Loading...' }: { text?: string }) => (
  <View style={tempStyles.loadingContainer}>
    <ActivityIndicator size="large" color="#2E7D61" />
    <Text style={tempStyles.loadingText}>{text}</Text>
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
        <ActivityIndicator size="large" color="#2E7D61" />
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

// Simple validation
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

const EXPENSE_CATEGORIES = [
  { key: 'food', label: 'Food', icon: '🍔', color: '#FF6B6B' },
  { key: 'transport', label: 'Travel', icon: '🚛', color: '#4ECDC4' },
  { key: 'shopping', label: 'Shopping', icon: '🛍️', color: '#45B7D1' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#96CEB4' },
  { key: 'bills', label: 'Bills', icon: '💡', color: '#FFEAA7' },
  { key: 'health', label: 'Healthcare', icon: '🏥', color: '#DDA0DD' },
  { key: 'other', label: 'Other', icon: '💰', color: '#95A5A6' },
];

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    monthlyBudget: 10000,
    currency: '₹',
  });
  
  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  const [showAddExpense, setShowAddExpense] = useState(false);
  
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
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const [expensesData, settingsData] = await Promise.all([
        AsyncStorage.getItem('expenses'),
        AsyncStorage.getItem('userSettings'),
      ]);

      if (expensesData) {
        setExpenses(JSON.parse(expensesData));
      }

      if (settingsData) {
        setUserSettings(JSON.parse(settingsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setLoadingError('Failed to load calendar data. Please try again.');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const saveExpenses = async (newExpenses: Expense[]) => {
    try {
      setIsSaving(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      await AsyncStorage.setItem('expenses', JSON.stringify(newExpenses));
      setExpenses(newExpenses);
    } catch (error) {
      console.error('Error saving expenses:', error);
      Alert.alert('Error', 'Failed to save expense. Please try again.');
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getExpensesForDate = (dateString: string) => {
    return expenses.filter(expense => expense.date === dateString);
  };

  const getMonthlyTotal = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && 
             expenseDate.getMonth() === month &&
             expense.type === 'expense';
    });
    
    return monthExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoryTotals = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && 
             expenseDate.getMonth() === month && 
             expense.type === 'expense';
    });

    const categoryTotals = new Map();
    const categoryExpenses = new Map();

    monthExpenses.forEach(expense => {
      const current = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, current + expense.amount);
      
      if (!categoryExpenses.has(expense.category)) {
        categoryExpenses.set(expense.category, []);
      }
      categoryExpenses.get(expense.category).push(expense);
    });

    return Array.from(categoryTotals.entries()).map(([category, total]) => ({
      category,
      total,
      expenses: categoryExpenses.get(category) || []
    })).sort((a, b) => b.total - a.total);
  };

  const handleDatePress = (day: number) => {
    setSelectedDate(selectedDate === day ? null : day);
  };

  const handleAddExpense = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }

    try {
      const newExpense: Expense = {
        id: Date.now().toString(),
        date: selectedDate 
          ? formatDate(currentDate.getFullYear(), currentDate.getMonth(), selectedDate)
          : new Date().toISOString().split('T')[0],
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        type: 'expense',
      };

      const updatedExpenses = [newExpense, ...expenses];
      await saveExpenses(updatedExpenses);

      resetValidation();
      setShowAddExpense(false);
      setSelectedDate(null);
      
      Alert.alert('Success!', 'Expense added successfully');
    } catch (error) {
      // Error already handled in saveExpenses
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const renderDay = (day: number | null, index: number) => {
    if (day === null) {
      return <View key={index} style={styles.emptyDay} />;
    }

    const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayExpenses = getExpensesForDate(dateString);
    const isToday = new Date().toDateString() === new Date(dateString).toDateString();
    const hasExpenses = dayExpenses.length > 0;
    const isSelected = selectedDate === day;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayContainer,
          isToday && styles.todayContainer,
          isSelected && styles.selectedContainer,
        ]}
        onPress={() => handleDatePress(day)}
      >
        <Text style={[
          styles.dayText,
          isToday && styles.todayText,
          isSelected && styles.selectedText
        ]}>
          {day}
        </Text>
        {hasExpenses && !isToday && (
          <View style={styles.expenseIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  // Show loading state on initial load
  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text="Loading calendar..." />
      </SafeAreaView>
    );
  }

  // Show error state if loading failed
  if (loadingError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          title="Failed to load calendar"
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentDate);
  const monthlyTotal = getMonthlyTotal();
  const categoryTotals = getCategoryTotals();

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={isSaving} text="Saving expense..." />
      
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
        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          {/* Month Navigation */}
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={() => navigateMonth('prev')}>
              <Text style={styles.navArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth('next')}>
              <Text style={styles.navArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Week Days Header */}
          <View style={styles.weekHeader}>
            {weekDays.map(day => (
              <Text key={day} style={styles.weekDay}>{day}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {days.map((day, index) => renderDay(day, index))}
          </View>
        </View>

        {/* Total Spent Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Spent</Text>
          <Text style={styles.totalAmount}>{userSettings.currency}{monthlyTotal.toLocaleString()}</Text>
        </View>

        {/* Category Breakdown */}
        {categoryTotals.map(({ category, total, expenses: categoryExpenses }) => {
          const categoryInfo = EXPENSE_CATEGORIES.find(cat => cat.key === category) || EXPENSE_CATEGORIES[6];
          
          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryIcon}>{categoryInfo.icon}</Text>
                  <Text style={styles.categoryName}>{categoryInfo.label}</Text>
                </View>
                <View style={styles.categoryAmount}>
                  <Text style={styles.categoryTotal}>{userSettings.currency}{total.toLocaleString()}</Text>
                  <Text style={styles.categoryArrow}>▲</Text>
                </View>
              </View>
              
              {/* Sub-expenses */}
              {categoryExpenses.map((expense) => (
                <View key={expense.id} style={styles.subExpense}>
                  <Text style={styles.subExpenseDescription}>{expense.description}</Text>
                  <Text style={styles.subExpenseAmount}>{userSettings.currency}{expense.amount}</Text>
                </View>
              ))}
            </View>
          );
        })}

        {/* Add Expense Button */}
        <TouchableOpacity 
          style={styles.addExpenseButton}
          onPress={() => {
            resetValidation();
            setShowAddExpense(true);
          }}
        >
          <Text style={styles.addExpenseText}>+ Add Expense</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Expense Modal */}
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
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TouchableOpacity onPress={handleAddExpense}>
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
                placeholder="What did you spend on?"
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

            {selectedDate && (
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>
                  Adding expense for: {monthNames[currentDate.getMonth()]} {selectedDate}, {currentDate.getFullYear()}
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// Temporary styles
const tempStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
    marginTop: 16,
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navArrow: {
    fontSize: 24,
    color: '#2E7D61',
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  weekDay: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    width: 40,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  todayContainer: {
    backgroundColor: '#2E7D61',
    borderRadius: 20,
  },
  selectedContainer: {
    backgroundColor: '#E8F4F8',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#2E7D61',
    fontWeight: 'bold',
  },
  expenseIndicator: {
    position: 'absolute',
    bottom: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF6B6B',
  },
  totalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  totalLabel: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D61',
  },
  categorySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  categoryAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginRight: 8,
  },
  categoryArrow: {
    fontSize: 12,
    color: '#1A1A1A',
  },
  subExpense: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 36,
    borderLeftWidth: 3,
    borderLeftColor: '#2E7D61',
    marginBottom: 8,
  },
  subExpenseDescription: {
    fontSize: 16,
    color: '#555',
  },
  subExpenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  addExpenseButton: {
    backgroundColor: '#2E7D61',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  addExpenseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  dateInfo: {
    backgroundColor: '#F0FFF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#2E7D61',
    fontWeight: '600',
    textAlign: 'center',
  },
});