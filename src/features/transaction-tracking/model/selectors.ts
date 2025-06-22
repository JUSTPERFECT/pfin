import { useTransactionStore } from './store';
import { Transaction, TransactionFilter } from '../../../entities/transaction';
import { isToday, isYesterday, getRelativeDate } from '../../../shared/utils/date';

// Custom selectors for common use cases
export const useTransactionSelectors = () => {
  const store = useTransactionStore();

  return {
    // Enhanced selectors with computed data
    getTransactionsWithRelativeDate: () => {
      return store.getFilteredTransactions().map(transaction => ({
        ...transaction,
        relativeDate: getRelativeDate(transaction.date),
        isToday: isToday(transaction.date),
        isYesterday: isYesterday(transaction.date),
      }));
    },

    getGroupedTransactionsByDate: () => {
      const transactions = store.getFilteredTransactions();
      const groups: Record<string, Transaction[]> = {};

      transactions.forEach(transaction => {
        const date = transaction.date;
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(transaction);
      });

      // Convert to array and sort by date (newest first)
      return Object.entries(groups)
        .map(([date, transactions]) => ({
          date,
          relativeDate: getRelativeDate(date),
          transactions: transactions.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
          totalExpenses: transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
          totalIncome: transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
        }))
        .sort((a, b) => b.date.localeCompare(a.date));
    },

    getExpensesByCategory: () => {
      const expenses = store.transactions.filter(t => t.type === 'expense');
      const categoryGroups: Record<string, { transactions: Transaction[]; total: number }> = {};

      expenses.forEach(transaction => {
        const category = transaction.category;
        if (!categoryGroups[category]) {
          categoryGroups[category] = { transactions: [], total: 0 };
        }
        categoryGroups[category].transactions.push(transaction);
        categoryGroups[category].total += transaction.amount;
      });

      return Object.entries(categoryGroups)
        .map(([category, data]) => ({
          category,
          ...data,
          count: data.transactions.length,
          average: data.total / data.transactions.length,
        }))
        .sort((a, b) => b.total - a.total);
    },

    getSpendingTrend: (days: number = 7) => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days + 1);

      const trend = [];
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTransactions = store.transactions.filter(t => t.date === dateStr);
        const expenses = dayTransactions.filter(t => t.type === 'expense');
        const income = dayTransactions.filter(t => t.type === 'income');
        
        trend.push({
          date: dateStr,
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          expenses: expenses.reduce((sum, t) => sum + t.amount, 0),
          income: income.reduce((sum, t) => sum + t.amount, 0),
          transactionCount: dayTransactions.length,
        });
      }

      return trend;
    },

    getQuickStats: () => {
      const { transactions } = store;
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      const todayTransactions = transactions.filter(t => t.date === today);
      const monthTransactions = transactions.filter(t => t.date.startsWith(thisMonth));

      return {
        today: {
          expenses: todayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
          income: todayTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
          count: todayTransactions.length,
        },
        thisMonth: {
          expenses: monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
          income: monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
          count: monthTransactions.length,
        },
        total: {
          expenses: transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
          income: transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
          count: transactions.length,
        },
      };
    },
  };
};

// Individual selector hooks for specific use cases
export const useFilteredTransactions = (filter?: TransactionFilter) => {
  return useTransactionStore(state => {
    if (filter) {
      const originalFilter = state.filter;
      state.setFilter({ ...originalFilter, ...filter });
      const result = state.getFilteredTransactions();
      state.setFilter(originalFilter);
      return result;
    }
    return state.getFilteredTransactions();
  });
};

export const useTransactionSummary = () => {
  return useTransactionStore(state => state.getSummary());
};

export const useTodayTransactions = () => {
  const today = new Date().toISOString().split('T')[0];
  return useTransactionStore(state => 
    state.transactions.filter(t => t.date === today)
  );
};

export const useRecentTransactions = (limit: number = 5) => {
  return useTransactionStore(state => state.getRecentTransactions(limit));
};

export const useTopCategories = (limit: number = 5) => {
  return useTransactionStore(state => state.getTopCategories(limit));
};