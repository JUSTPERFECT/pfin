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
  // 🌿 MINT THEME COLORS
  // ==========================================
  
  export const COLORS = {
    // 🌿 Mint Theme Colors
    background: '#F3FFF7',    // Ultra-light mint — Main app background
    surface: '#FFFFFF',       // Cards, Modals — Container background
    mint: '#A0DABB',         // Buttons, CTA — Primary call to action
    softMint: '#CFFAE2',     // Fills, Secondary — Subtle fill areas
    accent: '#FFF3B0',       // Highlights, Alerts — Highlighted elements
    dark: '#2E7D61',         // Text, Strong CTA — Strong text and icons
    text: '#1A1A1A',         // Headings, Main Text — Main text color
    gray: '#888888',         // Secondary Text — Placeholder or hint text
    border: '#E0E0E0',       // Input Borders, Dividers — Subtle outlines
    error: '#FF5A5F',        // Error State — Alerts, errors
    success: '#2ECC71',      // Success State — Confirmations
    
    // Status colors (using mint theme)
    successDark: '#25A55A',
    successLight: '#4CD964',
    
    warning: '#FFF3B0',      // Maps to accent
    warningDark: '#E6D99C',
    warningLight: '#FFF8D1',
    
    errorDark: '#E64A4F',
    errorLight: '#FF7A7F',
    
    // Dark theme colors (for future implementation)
    backgroundDark: '#1A1A1A',
    surfaceDark: '#2A2A2A',
    
    textDark: '#FFFFFF',
    textSecondaryDark: '#CCCCCC',
    
    borderDark: '#404040',
    separatorDark: '#404040',
    
    placeholder: '#888888',  // Maps to gray
    placeholderDark: '#666666',
    
    // Expense and Income colors (using mint theme)
    expense: '#FF5A5F',      // Error color for expenses
    income: '#2ECC71',       // Success color for income
    
    // Chart colors (mint theme palette)
    chart: [
      '#A0DABB', '#CFFAE2', '#2E7D61', '#FFF3B0', 
      '#FF5A5F', '#2ECC71', '#888888', '#E0E0E0'
    ],
  } as const;
  
  // ==========================================
  // 📐 SPACING & SIZING
  // ==========================================
  
  export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,  // Updated to match mint theme
  } as const;
  
  export const BORDER_RADIUS = {
    sm: 8,    // Small
    md: 12,   // Medium
    input: 16, // Input
    lg: 24,   // Card
    xl: 24,   // Card (alias)
    round: 999, // Full
  } as const;
  
  export const FONT_SIZE = {
    xs: 12,
    sm: 14,   // Caption
    md: 16,   // Body
    lg: 18,
    xl: 20,   // H3
    xxl: 28,  // H2
    xxxl: 36, // H1
  } as const;
  
  export const FONT_WEIGHT = {
    light: '300' as const,
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