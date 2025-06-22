import { Transaction, TransactionSummary, CategorySummary, DateRangeSummary } from '../model/types';
import { sum, average, percentage } from '../../../shared/utils/math';
import { getCategoryLabel } from '../../../shared/constants/categories';

export class TransactionCalculator {
  static calculateSummary(transactions: Transaction[]): TransactionSummary {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');

    const totalExpenses = sum(expenses.map(t => t.amount));
    const totalIncome = sum(income.map(t => t.amount));

    return {
      totalExpenses,
      totalIncome,
      netAmount: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      averageExpense: expenses.length > 0 ? average(expenses.map(t => t.amount)) : 0,
      averageIncome: income.length > 0 ? average(income.map(t => t.amount)) : 0,
    };
  }

  static calculateCategorySummary(transactions: Transaction[]): CategorySummary[] {
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExpenses = sum(expenses.map(t => t.amount));

    // Group by category
    const categoryGroups = expenses.reduce((groups, transaction) => {
      const category = transaction.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);

    // Calculate summary for each category
    return Object.entries(categoryGroups)
      .map(([category, categoryTransactions]) => {
        const totalAmount = sum(categoryTransactions.map(t => t.amount));
        
        return {
          category,
          totalAmount,
          transactionCount: categoryTransactions.length,
          percentage: percentage(totalAmount, totalExpenses),
          averageAmount: average(categoryTransactions.map(t => t.amount)),
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount); // Sort by amount descending
  }

  static calculateDateRangeSummary(
    transactions: Transaction[], 
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): DateRangeSummary[] {
    // Group transactions by date period
    const groups = transactions.reduce((acc, transaction) => {
      const period = this.getDatePeriod(transaction.date, groupBy);
      
      if (!acc[period]) {
        acc[period] = [];
      }
      acc[period].push(transaction);
      
      return acc;
    }, {} as Record<string, Transaction[]>);

    // Calculate summary for each period
    return Object.entries(groups)
      .map(([period, periodTransactions]) => {
        const expenses = periodTransactions.filter(t => t.type === 'expense');
        const income = periodTransactions.filter(t => t.type === 'income');
        
        const totalExpenses = sum(expenses.map(t => t.amount));
        const totalIncome = sum(income.map(t => t.amount));

        return {
          period,
          totalExpenses,
          totalIncome,
          netAmount: totalIncome - totalExpenses,
          transactionCount: periodTransactions.length,
        };
      })
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  static getTopCategories(transactions: Transaction[], limit: number = 5): CategorySummary[] {
    const categorySummary = this.calculateCategorySummary(transactions);
    return categorySummary.slice(0, limit);
  }

  static getSpendingTrend(transactions: Transaction[], days: number = 30): DateRangeSummary[] {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    return this.calculateDateRangeSummary(filteredTransactions, 'day');
  }

  static getBudgetProgress(
    transactions: Transaction[], 
    category: string, 
    budgetAmount: number,
    startDate: string,
    endDate: string
  ): {
    spent: number;
    remaining: number;
    percentage: number;
    isOverBudget: boolean;
  } {
    const categoryExpenses = transactions.filter(t => 
      t.type === 'expense' && 
      t.category === category &&
      t.date >= startDate &&
      t.date <= endDate
    );

    const spent = sum(categoryExpenses.map(t => t.amount));
    const remaining = Math.max(0, budgetAmount - spent);
    const spentPercentage = percentage(spent, budgetAmount);

    return {
      spent,
      remaining,
      percentage: spentPercentage,
      isOverBudget: spent > budgetAmount,
    };
  }

  private static getDatePeriod(date: string, groupBy: 'day' | 'week' | 'month'): string {
    const dateObj = new Date(date);
    
    switch (groupBy) {
      case 'day':
        return date; // Already in YYYY-MM-DD format
      case 'week':
        const startOfWeek = new Date(dateObj);
        startOfWeek.setDate(dateObj.getDate() - dateObj.getDay());
        return startOfWeek.toISOString().split('T')[0];
      case 'month':
        return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      default:
        return date;
    }
  }
}