import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Temporary inline components
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

// Simple chart components (no external dependencies)
const SimpleBarChart = ({ data, title }: { data: any[]; title: string }) => (
  <View style={styles.chartContainer}>
    <Text style={styles.chartTitle}>{title}</Text>
    <View style={styles.barsContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.barWrapper}>
          <View 
            style={[
              styles.bar, 
              { 
                height: Math.max(item.value / Math.max(...data.map(d => d.value)) * 120, 10),
                backgroundColor: item.color || '#2E7D61'
              }
            ]} 
          />
          <Text style={styles.barLabel}>{item.label}</Text>
          <Text style={styles.barValue}>₹{item.value}</Text>
        </View>
      ))}
    </View>
  </View>
);

const SimplePieChart = ({ data, title }: { data: any[]; title: string }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.pieContainer}>
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.value / total * 100) : 0;
          return (
            <View key={index} style={styles.pieItem}>
              <View style={[styles.pieColor, { backgroundColor: item.color }]} />
              <Text style={styles.pieLabel}>{item.label}</Text>
              <Text style={styles.piePercentage}>{percentage.toFixed(0)}%</Text>
              <Text style={styles.pieValue}>₹{item.value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
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

const ACHIEVEMENTS = [
  { id: 'first_week', title: 'First Week', description: 'Tracked expenses for 7 days', icon: '🎯', earned: true },
  { id: 'budget_master', title: 'Budget Master', description: 'Stayed under budget for a month', icon: '👑', earned: true },
  { id: 'streak_7', title: '7 Day Streak', description: 'Logged expenses for 7 consecutive days', icon: '🔥', earned: true },
  { id: 'saver', title: 'Smart Saver', description: 'Saved 20% of your budget', icon: '💎', earned: false },
  { id: 'scanner', title: 'Receipt Master', description: 'Scanned 50 receipts', icon: '📸', earned: false },
  { id: 'monthly', title: 'Monthly Goal', description: 'Reached monthly savings goal', icon: '⭐', earned: false },
];

const screenWidth = Dimensions.get('window').width;

export default function InsightsScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    monthlyBudget: 10000,
    currency: '₹',
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingError(null);
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const [expensesData, settingsData] = await Promise.all([
        AsyncStorage.getItem('expenses'),
        AsyncStorage.getItem('userSettings'),
      ]);

      if (expensesData) {
        setExpenses(JSON.parse(expensesData));
      } else {
        // Sample data for demonstration
        const sampleExpenses: Expense[] = [
          { id: '1', date: '2025-06-20', amount: 1200, category: 'food', description: 'Groceries', type: 'expense' },
          { id: '2', date: '2025-06-19', amount: 800, category: 'transport', description: 'Fuel', type: 'expense' },
          { id: '3', date: '2025-06-18', amount: 2500, category: 'shopping', description: 'Clothes', type: 'expense' },
          { id: '4', date: '2025-06-17', amount: 600, category: 'entertainment', description: 'Movie', type: 'expense' },
          { id: '5', date: '2025-06-16', amount: 1500, category: 'bills', description: 'Electricity', type: 'expense' },
          { id: '6', date: '2025-06-15', amount: 900, category: 'food', description: 'Dining out', type: 'expense' },
          { id: '7', date: '2025-06-14', amount: 400, category: 'transport', description: 'Metro', type: 'expense' },
          { id: '8', date: '2025-06-13', amount: 3000, category: 'health', description: 'Doctor visit', type: 'expense' },
        ];
        setExpenses(sampleExpenses);
        await AsyncStorage.setItem('expenses', JSON.stringify(sampleExpenses));
      }

      if (settingsData) {
        setUserSettings(JSON.parse(settingsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setLoadingError('Failed to load insights data. Please try again.');
    } finally {
      setIsInitialLoading(false);
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

  const getCurrentPeriodExpenses = () => {
    const now = new Date();
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      
      switch (selectedPeriod) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return expenseDate >= weekAgo && expense.type === 'expense';
        case 'month':
          return expenseDate.getMonth() === now.getMonth() && 
                 expenseDate.getFullYear() === now.getFullYear() && 
                 expense.type === 'expense';
        case 'year':
          return expenseDate.getFullYear() === now.getFullYear() && expense.type === 'expense';
        default:
          return false;
      }
    });
  };

  const getCategoryBreakdown = () => {
    const periodExpenses = getCurrentPeriodExpenses();
    const categoryTotals = new Map();
    
    periodExpenses.forEach(expense => {
      const current = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, current + expense.amount);
    });

    return Array.from(categoryTotals.entries()).map(([category, amount]) => {
      const categoryInfo = EXPENSE_CATEGORIES.find(cat => cat.key === category) || EXPENSE_CATEGORIES[6];
      return {
        label: categoryInfo.label,
        value: amount,
        color: categoryInfo.color,
        icon: categoryInfo.icon,
      };
    }).sort((a, b) => b.value - a.value);
  };

  const getSpendingTrend = () => {
    const last7Days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];
      const dayExpenses = expenses.filter(expense => 
        expense.date === dateString && expense.type === 'expense'
      );
      const dayTotal = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      last7Days.push({
        label: date.toLocaleDateString('en', { weekday: 'short' }),
        value: dayTotal,
        color: '#2E7D61',
      });
    }
    
    return last7Days;
  };

  const getTotalSpent = () => {
    return getCurrentPeriodExpenses().reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getBudgetProgress = () => {
    const spent = getTotalSpent();
    const budget = selectedPeriod === 'month' ? userSettings.monthlyBudget : 
                   selectedPeriod === 'week' ? userSettings.monthlyBudget / 4 : 
                   userSettings.monthlyBudget * 12;
    
    return budget > 0 ? (spent / budget) * 100 : 0;
  };

  const getInsights = () => {
    const insights = [];
    const totalSpent = getTotalSpent();
    const budgetProgress = getBudgetProgress();
    const categoryBreakdown = getCategoryBreakdown();
    const topCategory = categoryBreakdown[0];

    // Budget insights
    if (budgetProgress > 90) {
      insights.push({
        title: 'Budget Alert',
        description: `You've spent ${budgetProgress.toFixed(0)}% of your ${selectedPeriod}ly budget`,
        icon: '⚠️',
        type: 'warning',
      });
    } else if (budgetProgress < 70) {
      insights.push({
        title: 'Great Progress!',
        description: `You're doing well! Only ${budgetProgress.toFixed(0)}% of budget used`,
        icon: '🎯',
        type: 'achievement',
      });
    }

    // Category insights
    if (topCategory && topCategory.value > 0) {
      const percentage = totalSpent > 0 ? (topCategory.value / totalSpent) * 100 : 0;
      if (percentage > 40) {
        insights.push({
          title: 'Top Spending Category',
          description: `${topCategory.label} accounts for ${percentage.toFixed(0)}% of your spending`,
          icon: topCategory.icon,
          type: 'tip',
        });
      }
    }

    return insights;
  };

  // Show loading state on initial load
  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text="Loading insights..." />
      </SafeAreaView>
    );
  }

  // Show error state if loading failed
  if (loadingError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          title="Failed to load insights"
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

  const totalSpent = getTotalSpent();
  const budgetProgress = getBudgetProgress();
  const categoryBreakdown = getCategoryBreakdown();
  const spendingTrend = getSpendingTrend();
  const insights = getInsights();

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.title}>Insights</Text>
          <View style={styles.periodSelector}>
            {(['week', 'month', 'year'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.selectedPeriodButton
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.selectedPeriodButtonText
                ]}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Budget Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>
            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}ly Overview
          </Text>
          <Text style={styles.totalSpent}>
            {userSettings.currency}{totalSpent.toLocaleString()}
          </Text>
          <View style={styles.budgetProgress}>
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
            <Text style={styles.budgetText}>
              {budgetProgress.toFixed(0)}% of budget used
            </Text>
          </View>
        </View>

        {/* Spending Trend Chart */}
        <View style={styles.chartCard}>
          <SimpleBarChart data={spendingTrend} title="7-Day Spending Trend" />
        </View>

        {/* Category Breakdown */}
        <View style={styles.chartCard}>
          <SimplePieChart data={categoryBreakdown} title="Spending by Category" />
        </View>

        {/* Insights & Tips */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Smart Insights</Text>
          {insights.length > 0 ? insights.map((insight, index) => (
            <View key={index} style={[
              styles.insightRow,
              insight.type === 'warning' && styles.warningInsight,
              insight.type === 'achievement' && styles.achievementInsight,
            ]}>
              <Text style={styles.insightIcon}>{insight.icon}</Text>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            </View>
          )) : (
            <Text style={styles.noInsights}>Add more expenses to see personalized insights!</Text>
          )}
        </View>

        {/* Achievements */}
        <View style={styles.achievementsCard}>
          <Text style={styles.achievementsTitle}>Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.achievementsRow}>
              {ACHIEVEMENTS.map((achievement) => (
                <View 
                  key={achievement.id} 
                  style={[
                    styles.achievementBadge,
                    !achievement.earned && styles.lockedBadge
                  ]}
                >
                  <Text style={[
                    styles.achievementIcon,
                    !achievement.earned && styles.lockedIcon
                  ]}>
                    {achievement.earned ? achievement.icon : '🔒'}
                  </Text>
                  <Text style={[
                    styles.achievementTitle,
                    !achievement.earned && styles.lockedText
                  ]}>
                    {achievement.title}
                  </Text>
                  <Text style={[
                    styles.achievementDescription,
                    !achievement.earned && styles.lockedText
                  ]}>
                    {achievement.description}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
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
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedPeriodButton: {
    backgroundColor: '#2E7D61',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedPeriodButtonText: {
    color: '#FFFFFF',
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    marginTop: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  overviewTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  totalSpent: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  budgetProgress: {
    width: '100%',
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
  budgetText: {
    fontSize: 14,
    color: '#666',
  },
  chartCard: {
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
  chartContainer: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    width: '100%',
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    backgroundColor: '#2E7D61',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#999',
  },
  pieContainer: {
    width: '100%',
  },
  pieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pieColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  pieLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  piePercentage: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  pieValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  insightsCard: {
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
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginBottom: 12,
  },
  warningInsight: {
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  achievementInsight: {
    backgroundColor: '#F0FFF4',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D61',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
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
  noInsights: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  achievementsCard: {
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
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  achievementsRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  achievementBadge: {
    backgroundColor: '#F0FFF4',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 2,
    borderColor: '#2E7D61',
  },
  lockedBadge: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E0E0E0',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D61',
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  lockedText: {
    color: '#999',
  },
});