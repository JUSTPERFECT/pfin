// src/screens/core/CalendarScreen.tsx
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ FIXED: Use proper imports instead of inline components
import { 
  LoadingSpinner, 
  ErrorState,
  LoadingOverlay,
  InlineLoading 
} from '../../components/LoadingStates';

// ✅ FIXED: Use proper validation instead of inline
import { useFormValidation, createExpenseValidator } from '../../utils/validation';

// ✅ FIXED: Use proper navigation types
import { useMainTabNavigation } from '../../types/navigation';

// Interfaces
interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'expense' | 'income';
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

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarScreen() {
  // ✅ FIXED: Use typed navigation
  const navigation = useMainTabNavigation();

  // State management
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // ✅ FIXED: Use proper validation hook
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
    loadExpenses();
  }, []);

  // ✅ IMPROVED: Better data loading with error handling
  const loadExpenses = async (silent = false) => {
    try {
      if (!silent) setIsInitialLoading(true);
      setLoadingError(null);

      const expensesData = await AsyncStorage.getItem('expenses');
      if (expensesData) {
        setExpenses(JSON.parse(expensesData));
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
      setLoadingError('Failed to load calendar data');
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadExpenses(true);
  };

  // ✅ IMPROVED: Better expense saving with error handling
  const saveExpenses = async (updatedExpenses: Expense[]) => {
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      setExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error saving expenses:', error);
      Alert.alert('Error', 'Failed to save expense. Please try again.');
      throw error;
    }
  };

  // Utility functions
  const formatDate = (year: number, month: number, day: number): string => {
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  };

  const getExpensesForDate = (dateString: string): Expense[] => {
    return expenses.filter(expense => expense.date === dateString);
  };

  const getTotalForDate = (dateString: string): number => {
    return getExpensesForDate(dateString)
      .filter(expense => expense.type === 'expense')
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getMonthTotal = (): number => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthStart = new Date(year, month, 1).toISOString().split('T')[0];
    const monthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0];

    return expenses
      .filter(expense => 
        expense.date >= monthStart && 
        expense.date <= monthEnd && 
        expense.type === 'expense'
      )
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  // Calendar logic
  const getDaysInMonth = (date: Date): (number | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

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

  // Event handlers
  const handleDatePress = (day: number) => {
    setSelectedDate(day);
    setShowAddExpense(true);
  };

  const handleAddExpense = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const newExpense: Expense = {
        id: Date.now().toString(),
        date: selectedDate 
          ? formatDate(currentDate.getFullYear(), currentDate.getMonth(), selectedDate)
          : new Date().toISOString().split('T')[0],
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description.trim(),
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
    } finally {
      setIsSaving(false);
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

  // ✅ IMPROVED: Better calendar day rendering with proper logic
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

  // ✅ IMPROVED: Proper loading and error states
  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text="Loading calendar..." />
      </SafeAreaView>
    );
  }

  if (loadingError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          title="Failed to load calendar"
          description={loadingError}
          onRetry={() => loadExpenses()}
        />
      </SafeAreaView>
    );
  }

  const days = getDaysInMonth(currentDate);
  const monthTotal = getMonthTotal();

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
        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          {/* Month Header */}
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={() => navigateMonth('prev')}>
              <Text style={styles.navArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth('next')}>
              <Text style={styles.navArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Week Header */}
          <View style={styles.weekHeader}>
            {WEEK_DAYS.map((day) => (
              <Text key={day} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {days.map((day, index) => renderDay(day, index))}
          </View>
        </View>

        {/* Monthly Total Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalTitle}>
            {MONTH_NAMES[currentDate.getMonth()]} Expenses
          </Text>
          <Text style={styles.totalAmount}>₹{monthTotal.toLocaleString()}</Text>
          <Text style={styles.totalSubtext}>
            Total spent this month
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Quick Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {expenses.filter(e => 
                  e.date.startsWith(currentDate.getFullYear() + '-' + 
                  String(currentDate.getMonth() + 1).padStart(2, '0'))
                ).length}
              </Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ₹{monthTotal > 0 ? Math.round(monthTotal / new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()).toLocaleString() : 0}
              </Text>
              <Text style={styles.statLabel}>Daily Average</Text>
            </View>
          </View>
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
            <TouchableOpacity onPress={() => {
              setShowAddExpense(false);
              resetValidation();
              setSelectedDate(null);
            }}>
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
            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount *</Text>
              <TextInput
                style={[styles.input, hasFieldError('amount') && styles.inputError]}
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

            {/* Category Selection */}
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

            {/* Date Info */}
            {selectedDate && (
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>
                  Adding expense for: {MONTH_NAMES[currentDate.getMonth()]} {selectedDate}, {currentDate.getFullYear()}
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Loading Overlay */}
      <LoadingOverlay visible={isSaving} text="Saving expense..." />
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
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  totalTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  totalSubtext: {
    fontSize: 14,
    color: '#999',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D61',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
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