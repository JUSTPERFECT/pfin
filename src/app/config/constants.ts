import { environment } from './environment';

export const APP_CONFIG = {
  // App metadata
  name: 'pfin',
  displayName: 'pfin - Personal Finance',
  version: '1.0.0',
  buildNumber: '1',
  description: 'Smart personal finance tracking app',
  
  // Developer info
  developer: {
    name: 'pfin Team',
    email: 'support@pfin.app',
    website: 'https://pfin.app',
  },
  
  // App Store info
  appStore: {
    ios: {
      id: 'YOUR_IOS_APP_ID',
      url: 'https://apps.apple.com/app/pfin/idYOUR_IOS_APP_ID',
    },
    android: {
      id: 'com.pfin.app',
      url: 'https://play.google.com/store/apps/details?id=com.pfin.app',
    },
  },
  
  // Social links
  social: {
    twitter: 'https://twitter.com/pfinapp',
    facebook: 'https://facebook.com/pfinapp',
    instagram: 'https://instagram.com/pfinapp',
    linkedin: 'https://linkedin.com/company/pfin',
  },
  
  // Support
  support: {
    email: 'support@pfin.app',
    helpUrl: 'https://pfin.app/help',
    privacyUrl: 'https://pfin.app/privacy',
    termsUrl: 'https://pfin.app/terms',
    feedbackUrl: 'https://pfin.app/feedback',
  },
  
  // Currency settings
  currency: {
    default: 'INR',
    defaultSymbol: '₹',
    supported: [
      { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
      { code: 'USD', symbol: '$', name: 'US Dollar' },
      { code: 'EUR', symbol: '€', name: 'Euro' },
      { code: 'GBP', symbol: '£', name: 'British Pound' },
      { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
      { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    ],
  },
  
  // Default settings
  defaults: {
    theme: 'light' as 'light' | 'dark' | 'auto',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-IN',
    startOfWeek: 1, // Monday
    budgetPeriod: 'monthly' as 'weekly' | 'monthly' | 'yearly',
  },
  
  // Limits from environment
  limits: environment.limits,
  
  // File upload limits
  files: {
    maxReceiptSize: 10 * 1024 * 1024, // 10MB
    allowedReceiptTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    maxAttachmentSize: 5 * 1024 * 1024, // 5MB
    maxAttachmentsPerTransaction: 5,
  },
  
  // Validation rules
  validation: {
    transaction: {
      minAmount: 0.01,
      maxAmount: 10000000, // 1 crore
      descriptionMinLength: 3,
      descriptionMaxLength: 100,
      maxTags: 10,
      maxTagLength: 20,
    },
    budget: {
      minAmount: 1,
      maxAmount: 100000000, // 10 crore
      nameMinLength: 3,
      nameMaxLength: 50,
    },
    category: {
      nameMinLength: 2,
      nameMaxLength: 30,
      maxCustomCategories: 20,
    },
  },
  
  // UI constants
  ui: {
    animationDuration: 250,
    debounceDelay: 300,
    loadingTimeout: 10000,
    toastDuration: 3000,
    bottomSheetSnapPoints: ['25%', '50%', '75%', '90%'],
    maxRecentTransactions: 10,
    maxQuickActions: 6,
    itemsPerPage: 20,
  },
  
  // Analytics events
  analytics: {
    events: {
      APP_OPENED: 'app_opened',
      TRANSACTION_ADDED: 'transaction_added',
      TRANSACTION_EDITED: 'transaction_edited',
      TRANSACTION_DELETED: 'transaction_deleted',
      BUDGET_CREATED: 'budget_created',
      RECEIPT_SCANNED: 'receipt_scanned',
      EXPORT_DATA: 'export_data',
      PREMIUM_UPGRADE: 'premium_upgrade',
      FEATURE_USED: 'feature_used',
      ERROR_OCCURRED: 'error_occurred',
    },
    userProperties: {
      USER_TYPE: 'user_type', // free, premium
      TRANSACTION_COUNT: 'transaction_count',
      DAYS_SINCE_INSTALL: 'days_since_install',
      FAVORITE_CATEGORY: 'favorite_category',
    },
  },
  
  // Error codes
  errorCodes: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    STORAGE_ERROR: 'STORAGE_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',
    LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  },
} as const;

// Computed values
export const COMPUTED_CONFIG = {
  // App version display
  get versionDisplay(): string {
    return `${APP_CONFIG.version} (${APP_CONFIG.buildNumber})`;
  },
  
  // Environment-specific app name
  get displayName(): string {
    if (environment.name === 'development') {
      return `${APP_CONFIG.displayName} (Dev)`;
    }
    if (environment.name === 'staging') {
      return `${APP_CONFIG.displayName} (Staging)`;
    }
    return APP_CONFIG.displayName;
  },
  
  // Full support email
  get supportEmailSubject(): string {
    return `${APP_CONFIG.displayName} Support - v${APP_CONFIG.version}`;
  },
  
  // App store rating URL
  get ratingUrl(): string {
    // TODO: Detect platform and return appropriate URL
    return APP_CONFIG.appStore.ios.url;
  },
};

// Type exports
export type CurrencyConfig = typeof APP_CONFIG.currency.supported[0];
export type ThemeMode = typeof APP_CONFIG.defaults.theme;
export type BudgetPeriod = typeof APP_CONFIG.defaults.budgetPeriod;
export type AnalyticsEvent = keyof typeof APP_CONFIG.analytics.events;
export type UserProperty = keyof typeof APP_CONFIG.analytics.userProperties;
export type ErrorCode = keyof typeof APP_CONFIG.errorCodes;