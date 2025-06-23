// src/constants/index.ts
// App-wide constants and configuration

// ==========================================
// CATEGORIES
// ==========================================

export const EXPENSE_CATEGORIES = [
    'Food & Dining',
    'Shopping', 
    'Transportation',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Groceries',
    'Fuel',
    'Insurance',
    'Rent',
    'Other'
  ] as const;
  
  export const INCOME_CATEGORIES = [
    'Salary',
    'Freelance', 
    'Investment',
    'Business',
    'Gift',
    'Bonus',
    'Rental Income',
    'Side Hustle',
    'Refund',
    'Other'
  ] as const;
  
  export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
  export type IncomeCategory = typeof INCOME_CATEGORIES[number];
  
  // Category icons mapping (you can use these with react-native-vector-icons)
  export const CATEGORY_ICONS: Record<string, string> = {
    'Food & Dining': 'restaurant',
    'Shopping': 'shopping-bag',
    'Transportation': 'car',
    'Entertainment': 'music',
    'Bills & Utilities': 'receipt',
    'Healthcare': 'medical-bag',
    'Travel': 'airplane',
    'Education': 'school',
    'Groceries': 'basket',
    'Fuel': 'local-gas-station',
    'Insurance': 'security',
    'Rent': 'home',
    'Salary': 'attach-money',
    'Freelance': 'work',
    'Investment': 'trending-up',
    'Business': 'business',
    'Gift': 'card-giftcard',
    'Bonus': 'star',
    'Rental Income': 'home-work',
    'Side Hustle': 'work-outline',
    'Refund': 'refresh',
    'Other': 'more-horiz'
  };
  
  // ==========================================
  // CURRENCIES
  // ==========================================
  
  export const CURRENCIES = [
    { 
      code: 'INR', 
      symbol: '₹', 
      name: 'Indian Rupee',
      locale: 'en-IN',
      position: 'before' // ₹100
    },
    { 
      code: 'USD', 
      symbol: '$', 
      name: 'US Dollar',
      locale: 'en-US',
      position: 'before' // $100
    },
    { 
      code: 'EUR', 
      symbol: '€', 
      name: 'Euro',
      locale: 'en-EU',
      position: 'before' // €100
    },
    { 
      code: 'GBP', 
      symbol: '£', 
      name: 'British Pound',
      locale: 'en-GB',
      position: 'before' // £100
    },
    { 
      code: 'JPY', 
      symbol: '¥', 
      name: 'Japanese Yen',
      locale: 'ja-JP',
      position: 'before' // ¥100
    },
    { 
      code: 'CAD', 
      symbol: 'C$', 
      name: 'Canadian Dollar',
      locale: 'en-CA',
      position: 'before' // C$100
    },
  ] as const;
  
  export type CurrencyCode = typeof CURRENCIES[number]['code'];
  
  // ==========================================
  // COLORS
  // ==========================================
  
  export const COLORS = {
    // Primary colors
    primary: '#007AFF',      // iOS blue
    primaryDark: '#0056CC',
    primaryLight: '#4DA2FF',
    
    // Secondary colors
    secondary: '#5856D6',    // iOS purple
    secondaryDark: '#4339A3',
    secondaryLight: '#7B79E8',
    
    // Status colors
    success: '#34C759',      // iOS green
    successDark: '#28A745',
    successLight: '#5DD87A',
    
    warning: '#FF9500',      // iOS orange
    warningDark: '#E6850E',
    warningLight: '#FFB340',
    
    error: '#FF3B30',        // iOS red
    errorDark: '#E62E24',
    errorLight: '#FF6B62',
    
    // Neutral colors
    background: '#F2F2F7',   // iOS background
    backgroundDark: '#000000',
    
    surface: '#FFFFFF',      // Card backgrounds
    surfaceDark: '#1C1C1E',
    
    // Text colors
    text: '#000000',
    textDark: '#FFFFFF',
    textSecondary: '#6D6D80',
    textSecondaryDark: '#8E8E93',
    
    // Border and separator colors
    border: '#C6C6C8',
    borderDark: '#38383A',
    separator: '#E5E5EA',
    separatorDark: '#38383A',
    
    // Input colors
    placeholder: '#C7C7CC',
    placeholderDark: '#48484A',
    
    // Expense and Income colors
    expense: '#FF3B30',      // Red for expenses
    income: '#34C759',       // Green for income
    
    // Chart colors
    chart: [
      '#007AFF', '#5856D6', '#34C759', '#FF9500', 
      '#FF3B30', '#8E8E93', '#5AC8FA', '#FFCC00'
    ],
  } as const;
  
  // ==========================================
  // SPACING & SIZING
  // ==========================================
  
  export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  } as const;
  
  export const BORDER_RADIUS = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 999,
  } as const;
  
  export const FONT_SIZE = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  } as const;
  
  export const FONT_WEIGHT = {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  };
  
  // ==========================================
  // APP CONFIGURATION
  // ==========================================
  
  export const APP_CONFIG = {
    name: 'PFin',
    version: '1.0.0',
    
    // Defaults
    defaultCurrency: 'INR' as CurrencyCode,
    defaultTransactionType: 'expense' as const,
    
    // Limits
    maxTransactionAmount: 10000000, // 1 crore
    maxTransactionDescriptionLength: 100,
    maxBudgetAmount: 10000000,
    
    // Pagination
    transactionsPerPage: 20,
    budgetsPerPage: 20,
    
    // Date formats
    dateFormat: 'DD MMM YYYY',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'DD MMM YYYY, HH:mm',
    
    // Storage
    storagePrefix: '@pfin_',
  } as const;
  
  // ==========================================
  // STORAGE KEYS
  // ==========================================
  
  export const STORAGE_KEYS = {
    USER: `${APP_CONFIG.storagePrefix}user`,
    TRANSACTIONS: `${APP_CONFIG.storagePrefix}transactions`,
    BUDGETS: `${APP_CONFIG.storagePrefix}budgets`,
    SETTINGS: `${APP_CONFIG.storagePrefix}settings`,
    ONBOARDING_COMPLETED: `${APP_CONFIG.storagePrefix}onboarding_completed`,
    LAST_SYNC: `${APP_CONFIG.storagePrefix}last_sync`,
    APP_VERSION: `${APP_CONFIG.storagePrefix}app_version`,
  } as const;
  
  // ==========================================
  // BUDGET PERIODS
  // ==========================================
  
  export const BUDGET_PERIODS = [
    { key: 'weekly', label: 'Weekly', days: 7 },
    { key: 'monthly', label: 'Monthly', days: 30 },
    { key: 'yearly', label: 'Yearly', days: 365 },
  ] as const;
  
  // ==========================================
  // TRANSACTION TYPES
  // ==========================================
  
  export const TRANSACTION_TYPES = [
    { 
      key: 'expense', 
      label: 'Expense', 
      color: COLORS.expense,
      icon: 'remove',
      prefix: '-'
    },
    { 
      key: 'income', 
      label: 'Income', 
      color: COLORS.income,
      icon: 'add',
      prefix: '+'
    },
  ] as const;
  
  // ==========================================
  // VALIDATION RULES
  // ==========================================
  
  export const VALIDATION = {
    amount: {
      min: 0.01,
      max: APP_CONFIG.maxTransactionAmount,
      precision: 2, // decimal places
    },
    description: {
      minLength: 1,
      maxLength: APP_CONFIG.maxTransactionDescriptionLength,
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    name: {
      minLength: 2,
      maxLength: 50,
    },
  } as const;
  
  // ==========================================
  // ERROR MESSAGES
  // ==========================================
  
  export const ERROR_MESSAGES = {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_AMOUNT: 'Please enter a valid amount',
    AMOUNT_TOO_LARGE: `Amount cannot exceed ${APP_CONFIG.maxTransactionAmount.toLocaleString()}`,
    AMOUNT_TOO_SMALL: 'Amount must be greater than 0',
    DESCRIPTION_TOO_LONG: `Description cannot exceed ${VALIDATION.description.maxLength} characters`,
    NETWORK_ERROR: 'Network error. Please check your connection.',
    STORAGE_ERROR: 'Failed to save data. Please try again.',
    UNKNOWN_ERROR: 'Something went wrong. Please try again.',
  } as const;
  
  // ==========================================
  // SUCCESS MESSAGES
  // ==========================================
  
  export const SUCCESS_MESSAGES = {
    TRANSACTION_ADDED: 'Transaction added successfully',
    TRANSACTION_UPDATED: 'Transaction updated successfully',
    TRANSACTION_DELETED: 'Transaction deleted successfully',
    BUDGET_ADDED: 'Budget created successfully',
    BUDGET_UPDATED: 'Budget updated successfully',
    BUDGET_DELETED: 'Budget deleted successfully',
    SETTINGS_SAVED: 'Settings saved successfully',
  } as const;
  
  // ==========================================
  // ANIMATIONS
  // ==========================================
  
  export const ANIMATIONS = {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  } as const;