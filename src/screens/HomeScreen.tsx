// src/screens/HomeScreen.tsx
// Main dashboard screen showing financial overview

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Button, Card } from '../components/ui';
import {
  useCurrentMonthTransactions,
  useBudgetAnalytics,
  useRecentTransactions,
  useUser,
  useSettings,
} from '../hooks';
import { formatCurrency, getRelativeDate } from '../utils';
import { type CurrencyCode } from '../constants';
import { NavigationHelpers } from '../navigation/NavigationHelpers';

// ==========================================
// TYPES
// ==========================================

interface HomeScreenProps {
  navigation?: any;
}

// ==========================================
// COMPONENT
// ==========================================

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useUser();
  const { currency } = useSettings();
  
  // Data hooks
  const {
    transactions: monthTransactions,
    totals,
    loading: monthLoading,
    refresh: refreshMonth,
  } = useCurrentMonthTransactions();
  
  const {
    analytics: budgetAnalytics,
    loading: budgetLoading,
    refresh: refreshBudgets,
  } = useBudgetAnalytics();
  
  const {
    transactions: recentTransactions,
    loading: recentLoading,
    refresh: refreshRecent,
  } = useRecentTransactions(5);

  // ==========================================
  // COMPUTED VALUES
  // ==========================================
  
  const isLoading = monthLoading || budgetLoading || recentLoading;
  
  const welcomeMessage = user ? `Welcome back, ${user.name.split(' ')[0]}!` : 'Welcome to PFin!';
  
  const netAmountColor = totals.net >= 0 ? theme.colors.income : theme.colors.expense;
  
  // Safe currency casting
  const safeCurrency = (currency as CurrencyCode) || 'INR';
  
  // Calculate budget health
  const budgetHealth = budgetAnalytics.budgetDetails.length > 0 
    ? budgetAnalytics.onTrackCount / budgetAnalytics.budgetDetails.length * 100
    : 100;
  
  const budgetHealthColor = budgetHealth >= 70 
    ? theme.colors.success 
    : budgetHealth >= 40 
      ? theme.colors.warning 
      : theme.colors.error;

  // ==========================================
  // HANDLERS
  // ==========================================
  
  const handleRefresh = async () => {
    await Promise.all([
      refreshMonth(),
      refreshBudgets(),
      refreshRecent(),
    ]);
  };

  const handleAddTransaction = () => {
    NavigationHelpers.addTransaction('expense');
  };

  const handleAddIncome = () => {
    NavigationHelpers.addTransaction('income');
  };

  const handleViewAllTransactions = () => {
    Alert.alert('View All', 'Transactions screen coming soon!');
  };

  const handleViewBudgets = () => {
    Alert.alert('View Budgets', 'Budget screen coming soon!');
  };

  const handleTransactionPress = (transactionId: string) => {
    NavigationHelpers.editTransaction(transactionId);
  };

  // ==========================================
  // RENDER COMPONENTS
  // ==========================================
  
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
        {welcomeMessage}
      </Text>
      <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
        {new Date().toLocaleDateString('en-IN', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </Text>
    </View>
  );

  const renderMonthSummary = () => (
    <Card style={styles.summaryCard}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
        This Month
      </Text>
      
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Income
          </Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.income }]}>
            {formatCurrency(totals.income, safeCurrency)}
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Expenses
          </Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.expense }]}>
            {formatCurrency(totals.expenses, safeCurrency)}
          </Text>
        </View>
      </View>
      
      <View style={[styles.netAmountContainer, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.netAmountLabel, { color: theme.colors.textSecondary }]}>
          Net Amount
        </Text>
        <Text style={[styles.netAmount, { color: netAmountColor }]}>
          {totals.net >= 0 ? '+' : ''}{formatCurrency(totals.net, safeCurrency)}
        </Text>
      </View>
    </Card>
  );

  const renderBudgetOverview = () => (
    <Card style={styles.budgetCard}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Budget Overview
        </Text>
        <TouchableOpacity onPress={handleViewBudgets}>
          <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      
      {budgetAnalytics.budgetDetails.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
            No budgets set up yet
          </Text>
          <Button 
            variant="outline" 
            size="small" 
            onPress={handleViewBudgets}
            style={styles.emptyStateButton}
          >
            Create Budget
          </Button>
        </View>
      ) : (
        <>
          <View style={styles.budgetSummary}>
            <View style={styles.budgetSummaryItem}>
              <Text style={[styles.budgetSummaryLabel, { color: theme.colors.textSecondary }]}>
                Total Budget
              </Text>
              <Text style={[styles.budgetSummaryValue, { color: theme.colors.text }]}>
                {formatCurrency(budgetAnalytics.totalBudget, safeCurrency)}
              </Text>
            </View>
            
            <View style={styles.budgetSummaryItem}>
              <Text style={[styles.budgetSummaryLabel, { color: theme.colors.textSecondary }]}>
                Spent
              </Text>
              <Text style={[styles.budgetSummaryValue, { color: theme.colors.expense }]}>
                {formatCurrency(budgetAnalytics.totalSpent, safeCurrency)}
              </Text>
            </View>
            
            <View style={styles.budgetSummaryItem}>
              <Text style={[styles.budgetSummaryLabel, { color: theme.colors.textSecondary }]}>
                Health
              </Text>
              <Text style={[styles.budgetSummaryValue, { color: budgetHealthColor }]}>
                {Math.round(budgetHealth)}%
              </Text>
            </View>
          </View>
          
          {budgetAnalytics.overBudgetCount > 0 && (
            <View style={[styles.warningBadge, { backgroundColor: theme.colors.error + '20' }]}>
              <Text style={[styles.warningText, { color: theme.colors.error }]}>
                ⚠️ {budgetAnalytics.overBudgetCount} budget{budgetAnalytics.overBudgetCount > 1 ? 's' : ''} exceeded
              </Text>
            </View>
          )}
        </>
      )}
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.actionsCard}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
        Quick Actions
      </Text>
      
      <View style={styles.actionsRow}>
        <Button 
          variant="primary" 
          style={styles.actionButton}
          onPress={handleAddTransaction}
        >
          Add Expense
        </Button>
        
        <Button 
          variant="secondary" 
          style={styles.actionButton}
          onPress={handleAddIncome}
        >
          Add Income
        </Button>
      </View>
    </Card>
  );

  const renderRecentTransactions = () => (
    <Card style={styles.transactionsCard}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Recent Transactions
        </Text>
        <TouchableOpacity onPress={handleViewAllTransactions}>
          <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
            See All
          </Text>
        </TouchableOpacity>
      </View>
      
      {recentTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
            No transactions yet
          </Text>
          <Button 
            variant="outline" 
            size="small" 
            onPress={handleAddTransaction}
            style={styles.emptyStateButton}
          >
            Add First Transaction
          </Button>
        </View>
      ) : (
        <View style={styles.transactionsList}>
          {recentTransactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              style={styles.transactionItem}
              onPress={() => handleTransactionPress(transaction.id)}
            >
              <View style={styles.transactionLeft}>
                <Text style={[styles.transactionDescription, { color: theme.colors.text }]}>
                  {transaction.description}
                </Text>
                <Text style={[styles.transactionCategory, { color: theme.colors.textSecondary }]}>
                  {transaction.category} • {getRelativeDate(transaction.date)}
                </Text>
              </View>
              
              <Text style={[
                styles.transactionAmount,
                { 
                  color: transaction.type === 'income' 
                    ? theme.colors.income 
                    : theme.colors.expense 
                }
              ]}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount, safeCurrency)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Card>
  );

  // ==========================================
  // RENDER
  // ==========================================
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderMonthSummary()}
        {renderBudgetOverview()}
        {renderQuickActions()}
        {renderRecentTransactions()}
      </ScrollView>
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
    paddingBottom: 32,
  },
  
  // Header
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Cards
  summaryCard: {
    marginBottom: 16,
  },
  budgetCard: {
    marginBottom: 16,
  },
  actionsCard: {
    marginBottom: 16,
  },
  transactionsCard: {
    marginBottom: 16,
  },
  
  // Card headers
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  netAmountContainer: {
    borderTopWidth: 1,
    paddingTop: 16,
    alignItems: 'center',
  },
  netAmountLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  netAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  
  // Budget
  budgetSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  budgetSummaryItem: {
    alignItems: 'center',
  },
  budgetSummaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  budgetSummaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  warningBadge: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  
  // Transactions
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  
  // Empty states
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: 14,
    marginBottom: 12,
  },
  emptyStateButton: {
    marginTop: 8,
  },
});

export default HomeScreen;