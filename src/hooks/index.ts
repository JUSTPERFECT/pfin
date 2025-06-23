// src/hooks/index.ts
// Export all custom hooks

// ==========================================
// TRANSACTION HOOKS
// ==========================================

export {
    useTransactions,
    useRecentTransactions,
    useCurrentMonthTransactions,
    useFilteredTransactions,
    useTransaction,
    useTransactionAnalytics,
  } from './useTransactions';
  
  // ==========================================
  // BUDGET HOOKS
  // ==========================================
  
  export {
    useBudgets,
    useBudget,
    useBudgetByCategory,
    useBudgetAnalytics,
    useOverBudgetItems,
    useBudgetRecommendations,
  } from './useBudgets';
  
  // ==========================================
  // USER & SETTINGS HOOKS
  // ==========================================
  
  export {
    useUser,
    useSettings,
    useCurrency,
    useDarkMode,
    useNotificationSettings,
    useUserSetup,
  } from './useUser';
  
  // TODO: Add more hooks as we create them
  // export * from './useStorage';
  // export * from './useAnalytics';
  // export * from './useNotifications';