// src/hooks/useTransactions.ts
// Custom hooks for transaction management

import { useState, useEffect, useCallback } from 'react';
import { TransactionStorage, BudgetStorage } from '../services';
import type { Transaction, CreateTransaction } from '../types';

// ==========================================
// TRANSACTION HOOKS
// ==========================================

/**
 * Hook for managing all transactions with CRUD operations
 */
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all transactions
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TransactionStorage.getAll();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new transaction
  const addTransaction = useCallback(async (data: CreateTransaction): Promise<Transaction | null> => {
    try {
      setError(null);
      const newTransaction = await TransactionStorage.add(data);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add transaction';
      setError(errorMessage);
      return null;
    }
  }, []);

  // Update existing transaction
  const updateTransaction = useCallback(async (
    id: string, 
    updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
  ): Promise<boolean> => {
    try {
      setError(null);
      const updatedTransaction = await TransactionStorage.update(id, updates);
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction : t)
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      return false;
    }
  }, []);

  // Delete transaction
  const deleteTransaction = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await TransactionStorage.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      return false;
    }
  }, []);

  // Refresh transactions
  const refresh = useCallback(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    // Data
    transactions,
    
    // State
    loading,
    error,
    
    // Actions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refresh,
  };
}

/**
 * Hook for getting recent transactions
 */
export function useRecentTransactions(limit: number = 10) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecentTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TransactionStorage.getRecent(limit);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recent transactions');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadRecentTransactions();
  }, [loadRecentTransactions]);

  return {
    transactions,
    loading,
    error,
    refresh: loadRecentTransactions,
  };
}

/**
 * Hook for getting current month transactions
 */
export function useCurrentMonthTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCurrentMonth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TransactionStorage.getCurrentMonth();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load current month transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentMonth();
  }, [loadCurrentMonth]);

  // Calculate totals for current month
  const totals = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === 'income') {
        acc.income += transaction.amount;
      } else {
        acc.expenses += transaction.amount;
      }
      acc.net = acc.income - acc.expenses;
      return acc;
    },
    { income: 0, expenses: 0, net: 0 }
  );

  return {
    transactions,
    loading,
    error,
    totals,
    refresh: loadCurrentMonth,
  };
}

/**
 * Hook for getting filtered transactions
 */
export function useFilteredTransactions(filters: {
  type?: 'income' | 'expense';
  category?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFilteredTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TransactionStorage.getFiltered(filters);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load filtered transactions');
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.category, filters.startDate, filters.endDate]);

  useEffect(() => {
    loadFilteredTransactions();
  }, [loadFilteredTransactions]);

  return {
    transactions,
    loading,
    error,
    refresh: loadFilteredTransactions,
  };
}

/**
 * Hook for getting a single transaction by ID
 */
export function useTransaction(id: string | null) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransaction = useCallback(async () => {
    if (!id) {
      setTransaction(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await TransactionStorage.getById(id);
      setTransaction(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transaction');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTransaction();
  }, [loadTransaction]);

  return {
    transaction,
    loading,
    error,
    refresh: loadTransaction,
  };
}

/**
 * Hook for transaction analytics
 */
export function useTransactionAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netAmount: 0,
    transactionCount: 0,
    categoryBreakdown: [] as { category: string; amount: number; count: number }[],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const transactions = await TransactionStorage.getCurrentMonth();
      
      // Calculate totals
      const totals = transactions.reduce(
        (acc, t) => {
          if (t.type === 'income') {
            acc.totalIncome += t.amount;
          } else {
            acc.totalExpenses += t.amount;
          }
          return acc;
        },
        { totalIncome: 0, totalExpenses: 0 }
      );

      // Calculate category breakdown
      const categoryMap = new Map<string, { amount: number; count: number }>();
      
      transactions.forEach(t => {
        if (t.type === 'expense') {
          const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
          categoryMap.set(t.category, {
            amount: existing.amount + t.amount,
            count: existing.count + 1,
          });
        }
      });

      const categoryBreakdown = Array.from(categoryMap.entries())
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.amount - a.amount);

      setAnalytics({
        ...totals,
        netAmount: totals.totalIncome - totals.totalExpenses,
        transactionCount: transactions.length,
        categoryBreakdown,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    analytics,
    loading,
    error,
    refresh: loadAnalytics,
  };
}