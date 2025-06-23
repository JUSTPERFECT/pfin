// src/types/index.ts
// Core type definitions for the finance app

// ==========================================
// TRANSACTION TYPES
// ==========================================

export interface Transaction {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: string; // ISO string format
    type: 'income' | 'expense';
    userId: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export type TransactionType = 'income' | 'expense';
  
  export interface TransactionFormData {
    amount: string; // String for form input
    description: string;
    category: string;
    date: string;
    type: TransactionType;
  }
  
  // ==========================================
  // BUDGET TYPES
  // ==========================================
  
  export interface Budget {
    id: string;
    category: string;
    amount: number;
    spent: number;
    period: 'weekly' | 'monthly' | 'yearly';
    userId: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';
  
  export interface BudgetFormData {
    category: string;
    amount: string;
    period: BudgetPeriod;
  }
  
  // ==========================================
  // USER TYPES
  // ==========================================
  
  export interface User {
    id: string;
    name: string;
    email: string;
    currency: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface UserSettings {
    currency: string;
    defaultTransactionType: TransactionType;
    budgetNotifications: boolean;
    darkMode: boolean;
  }
  
  // ==========================================
  // NAVIGATION TYPES
  // ==========================================
  
  export type RootStackParamList = {
    MainTabs: undefined;
    AddTransaction: { 
      editId?: string;
      initialType?: TransactionType;
    };
    TransactionDetail: { 
      transactionId: string;
    };
    AddBudget: {
      editId?: string;
      category?: string;
    };
    Settings: undefined;
  };
  
  export type MainTabParamList = {
    Home: undefined;
    Calendar: undefined;
    Add: undefined;
    Analytics: undefined;
    Settings: undefined;
  };
  
  // ==========================================
  // API TYPES
  // ==========================================
  
  export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    timestamp: string;
  }
  
  export interface ApiError {
    message: string;
    code: number;
    details?: Record<string, any>;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
  
  // ==========================================
  // FORM TYPES
  // ==========================================
  
  export interface FormField {
    value: string;
    error?: string;
    touched: boolean;
  }
  
  export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | undefined;
  }
  
  // ==========================================
  // COMPONENT TYPES
  // ==========================================
  
  export interface ThemeColors {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    placeholder: string;
  }
  
  export interface ButtonVariant {
    primary: string;
    secondary: string;
    outline: string;
    ghost: string;
  }
  
  export type ButtonSize = 'small' | 'medium' | 'large';
  export type InputSize = 'small' | 'medium' | 'large';
  
  // ==========================================
  // ANALYTICS TYPES
  // ==========================================
  
  export interface SpendingAnalytics {
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
    topCategories: {
      category: string;
      amount: number;
      percentage: number;
    }[];
    monthlyTrend: {
      month: string;
      income: number;
      expenses: number;
    }[];
  }
  
  export interface BudgetAnalytics {
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    budgetUtilization: number; // percentage
    overBudgetCategories: string[];
  }
  
  // ==========================================
  // STORAGE TYPES
  // ==========================================
  
  export interface StorageKeys {
    USER: string;
    TRANSACTIONS: string;
    BUDGETS: string;
    SETTINGS: string;
    LAST_SYNC: string;
  }
  
  // ==========================================
  // UTILITY TYPES
  // ==========================================
  
  export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
  export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
  
  // For creating new records (without id, timestamps)
  export type CreateTransaction = OptionalFields<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
  export type CreateBudget = OptionalFields<Budget, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'spent'>;
  export type CreateUser = OptionalFields<User, 'id' | 'createdAt' | 'updatedAt'>;
  
  // For updating records (all fields optional except id)
  export type UpdateTransaction = RequiredFields<Partial<Transaction>, 'id'>;
  export type UpdateBudget = RequiredFields<Partial<Budget>, 'id'>;
  export type UpdateUser = RequiredFields<Partial<User>, 'id'>;