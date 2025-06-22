import { useTransactionStore } from './store';
import { CreateTransactionData, TransactionFilter } from '../../../entities/transaction';
import { TransactionCategorizer } from '../../../entities/transaction/lib/categorizer';
import { HapticService } from '../../../shared/lib/haptics';
import { Logger } from '../../../shared/lib/logger';

// Action creators and helper functions
export const useTransactionActions = () => {
  const store = useTransactionStore();

  return {
    // Enhanced add transaction with smart categorization
    addTransactionWithSmartCategory: async (data: Omit<CreateTransactionData, 'category'>) => {
      try {
        // Suggest category based on description
        const suggestedCategory = TransactionCategorizer.suggestCategory(
          data.description,
          data.amount
        );

        const transactionData: CreateTransactionData = {
          ...data,
          category: suggestedCategory,
        };

        const transaction = await store.addTransaction(transactionData);
        HapticService.success();
        
        return {
          transaction,
          suggestedCategory,
          confidence: TransactionCategorizer.getConfidenceScore(data.description, suggestedCategory),
        };
      } catch (error) {
        HapticService.error();
        throw error;
      }
    },

    // Quick add expense
    addQuickExpense: async (amount: number, description: string) => {
      return store.addTransaction({
        amount,
        description,
        category: TransactionCategorizer.suggestCategory(description, amount),
        type: 'expense',
      });
    },

    // Quick add income
    addQuickIncome: async (amount: number, description: string) => {
      return store.addTransaction({
        amount,
        description,
        category: 'other',
        type: 'income',
      });
    },

    // Duplicate transaction
    duplicateTransaction: async (id: string) => {
      const original = store.getTransactionById(id);
      if (!original) {
        throw new Error('Transaction not found');
      }

      const duplicateData: CreateTransactionData = {
        amount: original.amount,
        description: `${original.description} (Copy)`,
        category: original.category,
        type: original.type,
        tags: original.tags,
        notes: original.notes,
      };

      return store.addTransaction(duplicateData);
    },

    // Update with category learning
    updateTransactionAndLearn: async (
      id: string, 
      data: Partial<CreateTransactionData>
    ) => {
      const original = store.getTransactionById(id);
      if (!original) {
        throw new Error('Transaction not found');
      }

      // If category is being changed, learn from this correction
      if (data.category && data.category !== original.category) {
        TransactionCategorizer.learnFromTransaction(original.description, data.category);
        Logger.info('Learned new category mapping', {
          description: original.description,
          newCategory: data.category,
        }, 'TransactionActions');
      }

      return store.updateTransaction(id, data);
    },

    // Smart filtering
    applySmartFilter: (preset: 'today' | 'yesterday' | 'this_week' | 'this_month' | 'large_expenses') => {
      const today = new Date();
      let filter: TransactionFilter = {};

      switch (preset) {
        case 'today':
          filter = {
            dateFrom: today.toISOString().split('T')[0],
            dateTo: today.toISOString().split('T')[0],
          };
          break;

        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          filter = {
            dateFrom: yesterdayStr,
            dateTo: yesterdayStr,
          };
          break;

        case 'this_week':
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          filter = {
            dateFrom: startOfWeek.toISOString().split('T')[0],
            dateTo: today.toISOString().split('T')[0],
          };
          break;

        case 'this_month':
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          filter = {
            dateFrom: startOfMonth.toISOString().split('T')[0],
            dateTo: today.toISOString().split('T')[0],
          };
          break;

        case 'large_expenses':
          // Get average expense amount and filter for transactions above 2x average
          const expenses = store.transactions.filter(t => t.type === 'expense');
          const avgExpense = expenses.reduce((sum, t) => sum + t.amount, 0) / expenses.length;
          filter = {
            type: 'expense',
            minAmount: avgExpense * 2,
          };
          break;
      }

      store.setFilter(filter);
    },

    // Bulk operations with feedback
    bulkDeleteWithConfirmation: async (ids: string[]) => {
      if (ids.length === 0) return;

      try {
        await store.deleteMultiple(ids);
        HapticService.success();
        Logger.info('Bulk delete completed', { count: ids.length }, 'TransactionActions');
      } catch (error) {
        HapticService.error();
        throw error;
      }
    },

    bulkCategorizeWithFeedback: async (ids: string[], category: string) => {
      if (ids.length === 0) return;

      try {
        await store.bulkCategorize(ids, category);
        HapticService.success();
        Logger.info('Bulk categorization completed', { count: ids.length, category }, 'TransactionActions');
      } catch (error) {
        HapticService.error();
        throw error;
      }
    },

    // Export functionality
    exportTransactions: (format: 'json' | 'csv' = 'json') => {
      const transactions = store.getFilteredTransactions();
      
      if (format === 'csv') {
        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Tags', 'Notes'];
        const rows = transactions.map(t => [
          t.date,
          t.type,
          t.category,
          t.description,
          t.amount.toString(),
          (t.tags || []).join(';'),
          t.notes || '',
        ]);
        
        const csvContent = [headers, ...rows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');
          
        return csvContent;
      }
      
      return JSON.stringify(transactions, null, 2);
    },

    // Clear all data (with confirmation)
    clearAllData: async () => {
      try {
        await store.deleteMultiple(store.transactions.map(t => t.id));
        Logger.info('All transaction data cleared', {}, 'TransactionActions');
      } catch (error) {
        Logger.error('Failed to clear all data', error, 'TransactionActions');
        throw error;
      }},

      // Analytics helpers
      getInsights: () => {
        const transactions = store.transactions;
        const expenses = transactions.filter(t => t.type === 'expense');
        const income = transactions.filter(t => t.type === 'income');
   
        if (expenses.length === 0) {
          return {
            topSpendingDay: null,
            averageDailySpending: 0,
            mostExpensiveCategory: null,
            spendingPattern: 'insufficient_data',
            suggestions: ['Start tracking your expenses to get insights'],
          };
        }
   
        // Find top spending day
        const dailyTotals: Record<string, number> = {};
        expenses.forEach(t => {
          dailyTotals[t.date] = (dailyTotals[t.date] || 0) + t.amount;
        });
   
        const topSpendingDay = Object.entries(dailyTotals)
          .sort(([,a], [,b]) => b - a)[0];
   
        // Calculate average daily spending
        const uniqueDays = new Set(expenses.map(t => t.date)).size;
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        const averageDailySpending = totalExpenses / uniqueDays;
   
        // Find most expensive category
        const categoryTotals = store.getTopCategories(1);
        const mostExpensiveCategory = categoryTotals[0];
   
        // Determine spending pattern
        const recentExpenses = expenses
          .filter(t => {
            const transactionDate = new Date(t.date);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return transactionDate >= sevenDaysAgo;
          })
          .reduce((sum, t) => sum + t.amount, 0);
   
        const olderExpenses = totalExpenses - recentExpenses;
        const spendingPattern = recentExpenses > olderExpenses * 0.5 ? 'increasing' : 'stable';
   
        // Generate suggestions
        const suggestions = [];
        if (mostExpensiveCategory && mostExpensiveCategory.amount > totalExpenses * 0.4) {
          suggestions.push(`Consider reducing spending on ${mostExpensiveCategory.category}`);
        }
        if (averageDailySpending > 1000) {
          suggestions.push('Try setting daily spending limits');
        }
        if (spendingPattern === 'increasing') {
          suggestions.push('Your spending has increased recently. Review your budget.');
        }
   
        return {
          topSpendingDay: topSpendingDay ? {
            date: topSpendingDay[0],
            amount: topSpendingDay[1],
          } : null,
          averageDailySpending,
          mostExpensiveCategory,
          spendingPattern,
          suggestions,
        };
      },
    };
   };
   
   // Standalone action functions for use outside components
   export const transactionActions = {
    // Quick actions that can be called from anywhere
    quickAddExpense: async (amount: number, description: string, category?: string) => {
      const store = useTransactionStore.getState();
      return store.addTransaction({
        amount,
        description,
        category: category || TransactionCategorizer.suggestCategory(description, amount),
        type: 'expense',
      });
    },
   
    quickAddIncome: async (amount: number, description: string) => {
      const store = useTransactionStore.getState();
      return store.addTransaction({
        amount,
        description,
        category: 'other',
        type: 'income',
      });
    },
   
    // Batch import from external source
    importTransactions: async (transactions: CreateTransactionData[]) => {
      const store = useTransactionStore.getState();
      const results = [];
   
      for (const transactionData of transactions) {
        try {
          const transaction = await store.addTransaction(transactionData);
          results.push({ success: true, transaction });
        } catch (error) {
          results.push({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error',
            data: transactionData 
          });
        }
      }
   
      Logger.info('Batch import completed', { 
        total: transactions.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      }, 'TransactionActions');
   
      return results;
    },
   };