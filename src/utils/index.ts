// src/utils/index.ts
// Essential utility functions for the finance app

import { CURRENCIES, VALIDATION, APP_CONFIG } from '../constants';
import type { CurrencyCode } from '../constants';

// ==========================================
// CURRENCY UTILITIES
// ==========================================

// Format amount as currency
export const formatCurrency = (
  amount: number, 
  currencyCode: CurrencyCode = 'INR'
): string => {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  
  if (!currency) {
    // Fallback to INR if currency not found
    return formatCurrency(amount, 'INR');
  }

  try {
    // Use Intl.NumberFormat for proper formatting
    const formatter = new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  } catch (error) {
    // Fallback to manual formatting if Intl fails
    const formattedAmount = amount.toLocaleString(currency.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    
    return currency.position === 'before' 
      ? `${currency.symbol}${formattedAmount}`
      : `${formattedAmount}${currency.symbol}`;
  }
};

// Parse currency string to number
export const parseCurrency = (value: string): number => {
  // Remove all non-numeric characters except decimal point and minus
  const cleanValue = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

// Get currency symbol
export const getCurrencySymbol = (currencyCode: CurrencyCode): string => {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || '₹';
};

// Format amount with sign prefix (+ for income, - for expense)
export const formatAmountWithSign = (
  amount: number,
  type: 'income' | 'expense',
  currencyCode: CurrencyCode = 'INR'
): string => {
  const formattedAmount = formatCurrency(Math.abs(amount), currencyCode);
  const prefix = type === 'income' ? '+' : '-';
  return `${prefix}${formattedAmount}`;
};

// ==========================================
// DATE UTILITIES
// ==========================================

// Format date to readable string
export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  const formatOptions: Record<'short' | 'long' | 'time', Intl.DateTimeFormatOptions> = {
    short: {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
    long: {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    },
  };

  const options = formatOptions[format];
  return d.toLocaleDateString('en-IN', options);
};

// Get relative date (Today, Yesterday, etc.)
export const getRelativeDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // Reset time to compare only dates
  const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  } else {
    return formatDate(d, 'short');
  }
};

// Get start and end of month
export const getMonthRange = (date: Date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end };
};

// Get start and end of week
export const getWeekRange = (date: Date = new Date()) => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  return { start, end };
};

// Check if date is in current month
export const isCurrentMonth = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

// ==========================================
// VALIDATION UTILITIES
// ==========================================

// Validate amount
export const isValidAmount = (amount: string | number): boolean => {
  const num = typeof amount === 'string' ? parseCurrency(amount) : amount;
  return !isNaN(num) && num >= VALIDATION.amount.min && num <= VALIDATION.amount.max;
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  return VALIDATION.email.pattern.test(email.trim());
};

// Validate required field
export const isRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

// Validate description length
export const isValidDescription = (description: string): boolean => {
  const length = description.trim().length;
  return length >= VALIDATION.description.minLength && 
         length <= VALIDATION.description.maxLength;
};

// Get validation error message
export const getValidationError = (
  value: string,
  rules: {
    required?: boolean;
    email?: boolean;
    amount?: boolean;
    description?: boolean;
    minLength?: number;
    maxLength?: number;
  }
): string | undefined => {
  if (rules.required && !isRequired(value)) {
    return 'This field is required';
  }
  
  if (rules.email && value && !isValidEmail(value)) {
    return 'Please enter a valid email address';
  }
  
  if (rules.amount && value && !isValidAmount(value)) {
    return 'Please enter a valid amount';
  }
  
  if (rules.description && value && !isValidDescription(value)) {
    return `Description must be between ${VALIDATION.description.minLength} and ${VALIDATION.description.maxLength} characters`;
  }
  
  if (rules.minLength && value.length < rules.minLength) {
    return `Minimum ${rules.minLength} characters required`;
  }
  
  if (rules.maxLength && value.length > rules.maxLength) {
    return `Maximum ${rules.maxLength} characters allowed`;
  }
  
  return undefined;
};

// ==========================================
// ID GENERATION
// ==========================================

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate transaction ID with prefix
export const generateTransactionId = (): string => {
  return `txn_${generateId()}`;
};

// Generate budget ID with prefix
export const generateBudgetId = (): string => {
  return `budget_${generateId()}`;
};

// Generate user ID with prefix
export const generateUserId = (): string => {
  return `user_${generateId()}`;
};

// ==========================================
// MATH UTILITIES
// ==========================================

// Round to specific decimal places
export const roundToDecimals = (num: number, decimals: number = 2): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// Calculate percentage
export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return roundToDecimals((part / total) * 100);
};

// Calculate budget progress
export const calculateBudgetProgress = (spent: number, budget: number): number => {
  return calculatePercentage(spent, budget);
};

// Sum array of numbers
export const sum = (numbers: number[]): number => {
  return numbers.reduce((acc, num) => acc + num, 0);
};

// Get average of numbers
export const average = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return sum(numbers) / numbers.length;
};

// ==========================================
// STRING UTILITIES
// ==========================================

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncate string with ellipsis
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
};

// Generate initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// ==========================================
// ARRAY UTILITIES
// ==========================================

// Group array by key
export const groupBy = <T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

// Sort array by multiple criteria
export const sortBy = <T>(
  array: T[], 
  sortFns: Array<(item: T) => any>, 
  orders: Array<'asc' | 'desc'> = []
): T[] => {
  return [...array].sort((a, b) => {
    for (let i = 0; i < sortFns.length; i++) {
      const aVal = sortFns[i](a);
      const bVal = sortFns[i](b);
      const order = orders[i] || 'asc';
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

// Remove duplicates from array
export const unique = <T>(array: T[], keyFn?: (item: T) => any): T[] => {
  if (!keyFn) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// ==========================================
// OBJECT UTILITIES
// ==========================================

// Deep clone object
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

// Pick specific keys from object
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

// Omit specific keys from object
export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

// ==========================================
// DEBOUNCE UTILITY
// ==========================================

// Debounce function calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// ==========================================
// STORAGE KEYS (RE-EXPORT FOR CONVENIENCE)
// ==========================================

export { STORAGE_KEYS } from '../constants';

// ==========================================
// TYPE GUARDS
// ==========================================

// Check if value is a valid transaction type
export const isTransactionType = (value: string): value is 'income' | 'expense' => {
  return value === 'income' || value === 'expense';
};

// Check if value is a valid currency code
export const isCurrencyCode = (value: string): value is CurrencyCode => {
  return CURRENCIES.some(currency => currency.code === value);
};

// Check if value is a number
export const isNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

// Check if value is a valid date
export const isValidDate = (value: any): value is Date => {
  return value instanceof Date && !isNaN(value.getTime());
};