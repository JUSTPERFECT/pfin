// src/hooks/useBudgets.ts
// Custom hooks for budget management

import { useState, useEffect, useCallback } from 'react';
import { BudgetStorage } from '../services';
import type { Budget, CreateBudget } from '../types';

// ==========================================
// BUDGET HOOKS
// ==========================================

/**
 * Hook for managing all budgets with CRUD operations
 */
export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all budgets
  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BudgetStorage.getAll();
      setBudgets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new budget
  const addBudget = useCallback(async (data: CreateBudget): Promise<Budget | null> => {
    try {
      setError(null);
      const newBudget = await BudgetStorage.add(data);
      setBudgets(prev => [...prev, newBudget]);
      return newBudget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add budget';
      setError(errorMessage);
      return null;
    }
  }, []);

  // Update existing budget
  const updateBudget = useCallback(async (
    id: string, 
    updates: Partial<Omit<Budget, 'id' | 'userId' | 'createdAt'>>
  ): Promise<boolean> => {
    try {
      setError(null);
      const updatedBudget = await BudgetStorage.update(id, updates);
      setBudgets(prev => 
        prev.map(b => b.id === id ? updatedBudget : b)
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update budget');
      return false;
    }
  }, []);

  // Delete budget
  const deleteBudget = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await BudgetStorage.delete(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget');
      return false;
    }
  }, []);

  // Update spending for all budgets
  const updateSpending = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      await BudgetStorage.updateSpending();
      // Reload budgets to get updated spending
      await loadBudgets();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update spending');
      return false;
    }
  }, [loadBudgets]);

  // Refresh budgets
  const refresh = useCallback(() => {
    loadBudgets();
  }, [loadBudgets]);

  // Load budgets on mount
  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  return {
    // Data
    budgets,
    
    // State
    loading,
    error,
    
    // Actions
    addBudget,
    updateBudget,
    deleteBudget,
    updateSpending,
    refresh,
  };
}

/**
 * Hook for getting a single budget by ID
 */
export function useBudget(id: string | null) {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBudget = useCallback(async () => {
    if (!id) {
      setBudget(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await BudgetStorage.getById(id);
      setBudget(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budget');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBudget();
  }, [loadBudget]);

  return {
    budget,
    loading,
    error,
    refresh: loadBudget,
  };
}

/**
 * Hook for getting budget by category
 */
export function useBudgetByCategory(category: string | null) {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBudget = useCallback(async () => {
    if (!category) {
      setBudget(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await BudgetStorage.getByCategory(category);
      setBudget(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budget');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadBudget();
  }, [loadBudget]);

  return {
    budget,
    loading,
    error,
    refresh: loadBudget,
  };
}

/**
 * Hook for budget analytics and insights
 */
export function useBudgetAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalBudget: 0,
    totalSpent: 0,
    remainingBudget: 0,
    budgetUtilization: 0,
    overBudgetCount: 0,
    onTrackCount: 0,
    budgetDetails: [] as Array<{
      id: string;
      category: string;
      amount: number;
      spent: number;
      remaining: number;
      utilization: number;
      status: 'on-track' | 'warning' | 'over-budget';
    }>,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const budgets = await BudgetStorage.getAll();
      
      if (budgets.length === 0) {
        setAnalytics({
          totalBudget: 0,
          totalSpent: 0,
          remainingBudget: 0,
          budgetUtilization: 0,
          overBudgetCount: 0,
          onTrackCount: 0,
          budgetDetails: [],
        });
        return;
      }

      // Calculate totals
      const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
      const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
      const remainingBudget = totalBudget - totalSpent;
      const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      // Calculate budget details and status counts
      let overBudgetCount = 0;
      let onTrackCount = 0;

      const budgetDetails = budgets.map(budget => {
        const remaining = budget.amount - budget.spent;
        const utilization = BudgetStorage.getBudgetUtilization(budget);
        
        let status: 'on-track' | 'warning' | 'over-budget';
        if (utilization > 100) {
          status = 'over-budget';
          overBudgetCount++;
        } else if (utilization > 80) {
          status = 'warning';
        } else {
          status = 'on-track';
          onTrackCount++;
        }

        return {
          id: budget.id,
          category: budget.category,
          amount: budget.amount,
          spent: budget.spent,
          remaining,
          utilization,
          status,
        };
      });

      setAnalytics({
        totalBudget,
        totalSpent,
        remainingBudget,
        budgetUtilization,
        overBudgetCount,
        onTrackCount,
        budgetDetails: budgetDetails.sort((a, b) => b.utilization - a.utilization),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budget analytics');
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

/**
 * Hook for getting over-budget items
 */
export function useOverBudgetItems() {
  const [overBudgetItems, setOverBudgetItems] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverBudgetItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await BudgetStorage.getOverBudget();
      setOverBudgetItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load over-budget items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverBudgetItems();
  }, [loadOverBudgetItems]);

  return {
    overBudgetItems,
    loading,
    error,
    refresh: loadOverBudgetItems,
  };
}

/**
 * Hook for budget recommendations
 */
export function useBudgetRecommendations() {
  const [recommendations, setRecommendations] = useState<{
    suggestedBudgets: Array<{
      category: string;
      suggestedAmount: number;
      reason: string;
    }>;
    adjustments: Array<{
      budgetId: string;
      category: string;
      currentAmount: number;
      suggestedAmount: number;
      reason: string;
    }>;
  }>({
    suggestedBudgets: [],
    adjustments: [],
  });
  const [loading, setLoading] = useState(true);

  const loadRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      
      // This would typically involve more complex analysis
      // For now, we'll provide basic recommendations
      const budgets = await BudgetStorage.getAll();
      const overBudgetItems = await BudgetStorage.getOverBudget();
      
      const adjustments = overBudgetItems.map(budget => ({
        budgetId: budget.id,
        category: budget.category,
        currentAmount: budget.amount,
        suggestedAmount: Math.ceil(budget.spent * 1.2), // 20% buffer
        reason: `You've exceeded this budget by ${Math.round(((budget.spent - budget.amount) / budget.amount) * 100)}%. Consider increasing it.`,
      }));

      setRecommendations({
        suggestedBudgets: [], // Could add logic for suggesting new budgets
        adjustments,
      });
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  return {
    recommendations,
    loading,
    refresh: loadRecommendations,
  };
}