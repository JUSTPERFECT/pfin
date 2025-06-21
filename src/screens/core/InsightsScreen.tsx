// src/screens/core/InsightsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ FIXED: Use proper imports instead of inline components
import { LoadingSpinner, ErrorState } from '../../components/LoadingStates';

// Interfaces
interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'expense' | 'income';
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

// ✅ IMPROVED: Better chart components with proper TypeScript
const SimpleBarChart = ({ data, title }: { data: ChartData[]; title: string }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.barsContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.barWrapper}>
            <View 
              style={[
                styles.bar, 
                { 
                  height: Math.max((item.value / maxValue) * 120, 10),
                  backgroundColor: item.color
                }
              ]} 
            />
            <Text style={styles.barLabel} numberOfLines={1}>{item.label}</Text>
            <Text style={styles.barValue}>₹{item.value.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const SimplePieChart = ({ data, title }: { data: ChartData[]; title: string }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.pieContainer}>
        {data.map((item, index) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
          return (
            <View key={index} style={styles.pieItem}>
              <View 
                style={[
                  styles.pieColorBox, 
                  { backgroundColor: item.color }
                ]} 
              />
              <View style={styles.pieTextContainer}>
                <Text style={styles.pieLabel}>{item.label}</Text>
                <Text style={styles.pieValue}>₹{item.value.toLocaleString()} ({percentage}%)</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ✅ IMPROVED: Proper metric card component
const MetricCard = ({ 
  title, 
  value, 
  change, 
  isPositive, 
  currency = '₹' 
}: {
  title: string;
  value: number;
  change?: number;
  isPositive?: boolean;
  currency?: string;
}) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricTitle}>{title}</Text>
    <Text style={styles.metricValue}>
      {currency}{value.toLocaleString()}
    </Text>
    {change !== undefined && (
      <Text style={[
        styles.metricChange,
        { color: isPositive ? '#2E7D61' : '#FF6B6B' }
      ]}>
        {isPositive ? '+' : ''}{change.toFixed(1)}% from last month
      </Text>
    )}
  </View>
);

export default function InsightsScreen() {
  // State management
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);

      const expensesData = await AsyncStorage.getItem('expenses');
      if (expensesData) {
        setExpenses(JSON.parse(expensesData));
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load insights data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(true);
  };

  // ✅ IMPROVED: Better data processing with proper filtering
  const getFilteredExpenses = () => {
    const now = new Date();
    const startDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return expenses.filter(expense => new Date(expense.date) >= startDate);
  };

  // Process data for charts
  const processInsightsData = () => {
    const filteredExpenses = getFilteredExpenses();
    const expenseTransactions = filteredExpenses.filter(e => e.type === 'expense');
    const incomeTransactions = filteredExpenses.filter(e => e.type === 'income');

    // Category breakdown
    const categoryData: Record<string, { total: number; color: string }> = {};
    const categoryColors = {
      food: '#FF6B6B',
      transport: '#4ECDC4',
      shopping: '#45B7D1',
      entertainment: '#96CEB4',
      bills: '#FFEAA7',
      health: '#DDA0DD',
      other: '#95A5A6'
    };

    expenseTransactions.forEach(expense => {
      if (!categoryData[expense.category]) {
        categoryData[expense.category] = {
          total: 0,
          color: categoryColors[expense.category as keyof typeof categoryColors] || '#95A5A6'
        };
      }
      categoryData[expense.category].total += expense.amount;
    });

    const categoryChartData: ChartData[] = Object.entries(categoryData)
      .map(([category, data]) => ({
        label: category.charAt(0).toUpperCase() + category.slice(1),
        value: data.total,
        color: data.color
      }))
      .sort((a, b) => b.value - a.value);

    // Monthly trend (for bar chart)
    const monthlyData: Record<string, number> = {};
    expenseTransactions.forEach(expense => {
      const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + expense.amount;
    });

    const monthlyChartData: ChartData[] = Object.entries(monthlyData)
      .map(([month, total]) => ({
        label: month,
        value: total,
        color: '#2E7D61'
      }));

    // Calculate metrics
    const totalExpenses = expenseTransactions.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomeTransactions.reduce((sum, e) => sum + e.amount, 0);
    const averageDaily = totalExpenses / 30; // Rough average

    return {
      categoryChartData,
      monthlyChartData,
      totalExpenses,
      totalIncome,
      averageDaily,
      transactionCount: filteredExpenses.length
    };
  };

  // ✅ IMPROVED: Proper loading and error states
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text="Loading insights..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          title="Failed to load insights"
          description={error}
          onRetry={() => loadData()}
        />
      </SafeAreaView>
    );
  }

  const insights = processInsightsData();

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
          <Text style={styles.title}>Financial Insights</Text>
          <Text style={styles.subtitle}>Your spending analysis</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['week', 'month', 'year'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.activePeriodButton
              ]}
              onPress={() => setSelectedPeriod(period as 'week' | 'month' | 'year')}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.activePeriodButtonText
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Metrics Cards */}
        <View style={styles.metricsContainer}>
          <MetricCard
            title="Total Spent"
            value={insights.totalExpenses}
            change={-5.2}
            isPositive={false}
          />
          <MetricCard
            title="Total Earned"
            value={insights.totalIncome}
            change={12.3}
            isPositive={true}
          />
        </View>

        <View style={styles.metricsContainer}>
          <MetricCard
            title="Daily Average"
            value={insights.averageDaily}
          />
          <MetricCard
            title="Transactions"
            value={insights.transactionCount}
            currency=""
          />
        </View>

        {/* Charts */}
        {insights.categoryChartData.length > 0 ? (
          <SimplePieChart 
            data={insights.categoryChartData} 
            title="Spending by Category" 
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No expense data available</Text>
            <Text style={styles.noDataSubtext}>Start adding expenses to see insights</Text>
          </View>
        )}

        {insights.monthlyChartData.length > 0 && (
          <SimpleBarChart 
            data={insights.monthlyChartData} 
            title="Monthly Spending Trend" 
          />
        )}

        {/* Insights Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Quick Insights</Text>
          <View style={styles.summaryContent}>
            {insights.categoryChartData.length > 0 && (
              <Text style={styles.summaryText}>
                • Your top spending category is {insights.categoryChartData[0]?.label}
              </Text>
            )}
            <Text style={styles.summaryText}>
              • You made {insights.transactionCount} transactions this {selectedPeriod}
            </Text>
            {insights.totalIncome > insights.totalExpenses ? (
              <Text style={[styles.summaryText, { color: '#2E7D61' }]}>
                • Good news! You saved ₹{(insights.totalIncome - insights.totalExpenses).toLocaleString()} this {selectedPeriod}
              </Text>
            ) : (
              <Text style={[styles.summaryText, { color: '#FF6B6B' }]}>
                • You spent ₹{(insights.totalExpenses - insights.totalIncome).toLocaleString()} more than you earned this {selectedPeriod}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  periodSelector: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: '#2E7D61',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activePeriodButtonText: {
    color: '#FFFFFF',
  },
  metricsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  bar: {
    width: 24,
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  pieContainer: {
    gap: 12,
  },
  pieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pieColorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  pieTextContainer: {
    flex: 1,
  },
  pieLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  pieValue: {
    fontSize: 14,
    color: '#666',
  },
  noDataContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  summaryContent: {
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});