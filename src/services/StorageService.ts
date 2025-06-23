// src/services/StorageService.ts
// Centralized storage service using AsyncStorage with improved architecture

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import type { 
  Transaction, 
  Budget, 
  User, 
  UserSettings,
  CreateTransaction,
  CreateBudget,
} from '../types';
import { generateTransactionId, generateBudgetId, generateUserId } from '../utils';

// ==========================================
// STORAGE ERRORS
// ==========================================

export class StorageError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

// ==========================================
// BASE STORAGE SERVICE
// ==========================================

class BaseStorageService {
  /**
   * Generic method to store data
   */
  protected static async setData<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      throw new StorageError(`Failed to save data for ${key}`, error as Error);
    }
  }

  /**
   * Generic method to get data
   */
  protected static async getData<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Storage getData error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Generic method to remove data
   */
  protected static async removeData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      throw new StorageError(`Failed to remove data for ${key}`, error as Error);
    }
  }

  /**
   * Check if data exists for a key
   */
  protected static async hasData(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      return false;
    }
  }
}

// ==========================================
// USER STORAGE SERVICE
// ==========================================

export class UserStorage extends BaseStorageService {
  /**
   * Get current user
   */
  static async get(): Promise<User | null> {
    return await this.getData<User>(STORAGE_KEYS.USER);
  }

  /**
   * Create or update user
   */
  static async save(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date().toISOString();
    const existingUser = await this.get();
    
    const user: User = {
      id: existingUser?.id || generateUserId(),
      ...userData,
      createdAt: existingUser?.createdAt || now,
      updatedAt: now,
    };

    await this.setData(STORAGE_KEYS.USER, user);
    return user;
  }

  /**
   * Update user partially
   */
  static async update(updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
    const existingUser = await this.get();
    if (!existingUser) {
      throw new StorageError('No user found to update');
    }

    const updatedUser: User = {
      ...existingUser,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.setData(STORAGE_KEYS.USER, updatedUser);
    return updatedUser;
  }

  /**
   * Delete user (logout)
   */
  static async delete(): Promise<void> {
    await this.removeData(STORAGE_KEYS.USER);
  }

  /**
   * Check if user exists
   */
  static async exists(): Promise<boolean> {
    return await this.hasData(STORAGE_KEYS.USER);
  }
}

// ==========================================
// SETTINGS STORAGE SERVICE
// ==========================================

export class SettingsStorage extends BaseStorageService {
  private static getDefaultSettings(): UserSettings {
    return {
      currency: 'INR',
      defaultTransactionType: 'expense',
      budgetNotifications: true,
      darkMode: false,
    };
  }

  /**
   * Get user settings with defaults
   */
  static async get(): Promise<UserSettings> {
    const settings = await this.getData<UserSettings>(STORAGE_KEYS.SETTINGS);
    return { ...this.getDefaultSettings(), ...settings };
  }

  /**
   * Save complete settings
   */
  static async save(settings: UserSettings): Promise<void> {
    await this.setData(STORAGE_KEYS.SETTINGS, settings);
  }

  /**
   * Update specific setting
   */
  static async update<K extends keyof UserSettings>(
    key: K, 
    value: UserSettings[K]
  ): Promise<UserSettings> {
    const currentSettings = await this.get();
    const updatedSettings = { ...currentSettings, [key]: value };
    await this.save(updatedSettings);
    return updatedSettings;
  }

  /**
   * Reset to default settings
   */
  static async reset(): Promise<UserSettings> {
    const defaultSettings = this.getDefaultSettings();
    await this.save(defaultSettings);
    return defaultSettings;
  }
}

// ==========================================
// TRANSACTION STORAGE SERVICE
// ==========================================

export class TransactionStorage extends BaseStorageService {
  /**
   * Get all transactions
   */
  static async getAll(): Promise<Transaction[]> {
    const transactions = await this.getData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS);
    return transactions || [];
  }

  /**
   * Get transaction by ID
   */
  static async getById(id: string): Promise<Transaction | null> {
    const transactions = await this.getAll();
    return transactions.find(t => t.id === id) || null;
  }

  /**
   * Add new transaction
   */
  static async add(data: CreateTransaction): Promise<Transaction> {
    const user = await UserStorage.get();
    if (!user) {
      throw new StorageError('No user found. Please set up user first.');
    }

    const transactions = await this.getAll();
    const now = new Date().toISOString();
    
    const newTransaction: Transaction = {
      id: generateTransactionId(),
      ...data,
      userId: user.id,
      createdAt: now,
      updatedAt: now,
    };

    transactions.push(newTransaction);
    await this.saveAll(transactions);
    
    // Update budget spending after adding transaction
    if (newTransaction.type === 'expense') {
      await BudgetStorage.updateSpending();
    }
    
    return newTransaction;
  }

  /**
   * Update existing transaction
   */
  static async update(
    id: string, 
    updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Transaction> {
    const transactions = await this.getAll();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new StorageError(`Transaction with ID ${id} not found`);
    }

    const oldTransaction = transactions[index];
    transactions[index] = {
      ...oldTransaction,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.saveAll(transactions);
    
    // Update budget spending if amount or category changed
    if (updates.amount !== undefined || updates.category !== undefined) {
      await BudgetStorage.updateSpending();
    }
    
    return transactions[index];
  }

  /**
   * Delete transaction
   */
  static async delete(id: string): Promise<void> {
    const transactions = await this.getAll();
    const transaction = transactions.find(t => t.id === id);
    
    if (!transaction) {
      throw new StorageError(`Transaction with ID ${id} not found`);
    }

    const filteredTransactions = transactions.filter(t => t.id !== id);
    await this.saveAll(filteredTransactions);
    
    // Update budget spending after deletion
    if (transaction.type === 'expense') {
      await BudgetStorage.updateSpending();
    }
  }

  /**
   * Get transactions by filters
   */
  static async getFiltered(filters: {
    type?: 'income' | 'expense';
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Transaction[]> {
    const transactions = await this.getAll();
    
    return transactions.filter(transaction => {
      // Filter by type
      if (filters.type && transaction.type !== filters.type) {
        return false;
      }
      
      // Filter by category
      if (filters.category && transaction.category !== filters.category) {
        return false;
      }
      
      // Filter by date range
      const transactionDate = new Date(transaction.date);
      if (filters.startDate && transactionDate < filters.startDate) {
        return false;
      }
      if (filters.endDate && transactionDate > filters.endDate) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Get transactions for current month
   */
  static async getCurrentMonth(): Promise<Transaction[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return await this.getFiltered({
      startDate: startOfMonth,
      endDate: endOfMonth,
    });
  }

  /**
   * Get recent transactions (last N transactions)
   */
  static async getRecent(limit: number = 10): Promise<Transaction[]> {
    const transactions = await this.getAll();
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  /**
   * Save all transactions with sorting
   */
  private static async saveAll(transactions: Transaction[]): Promise<void> {
    // Sort by date (newest first)
    const sortedTransactions = transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    await this.setData(STORAGE_KEYS.TRANSACTIONS, sortedTransactions);
  }
}

// ==========================================
// BUDGET STORAGE SERVICE
// ==========================================

export class BudgetStorage extends BaseStorageService {
  /**
   * Get all budgets
   */
  static async getAll(): Promise<Budget[]> {
    const budgets = await this.getData<Budget[]>(STORAGE_KEYS.BUDGETS);
    return budgets || [];
  }

  /**
   * Get budget by ID
   */
  static async getById(id: string): Promise<Budget | null> {
    const budgets = await this.getAll();
    return budgets.find(b => b.id === id) || null;
  }

  /**
   * Get budget by category
   */
  static async getByCategory(category: string): Promise<Budget | null> {
    const budgets = await this.getAll();
    return budgets.find(b => b.category === category) || null;
  }

  /**
   * Add new budget
   */
  static async add(data: CreateBudget): Promise<Budget> {
    const user = await UserStorage.get();
    if (!user) {
      throw new StorageError('No user found. Please set up user first.');
    }

    const budgets = await this.getAll();
    
    // Check for existing budget with same category and period
    const existing = budgets.find(
      b => b.category === data.category && b.period === data.period
    );
    
    if (existing) {
      throw new StorageError(
        `Budget already exists for ${data.category} (${data.period})`
      );
    }

    const now = new Date().toISOString();
    const newBudget: Budget = {
      id: generateBudgetId(),
      ...data,
      spent: 0,
      userId: user.id,
      createdAt: now,
      updatedAt: now,
    };

    budgets.push(newBudget);
    await this.setData(STORAGE_KEYS.BUDGETS, budgets);
    
    // Calculate initial spending
    await this.updateSpending();
    
    return newBudget;
  }

  /**
   * Update existing budget
   */
  static async update(
    id: string, 
    updates: Partial<Omit<Budget, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Budget> {
    const budgets = await this.getAll();
    const index = budgets.findIndex(b => b.id === id);
    
    if (index === -1) {
      throw new StorageError(`Budget with ID ${id} not found`);
    }

    budgets[index] = {
      ...budgets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.setData(STORAGE_KEYS.BUDGETS, budgets);
    return budgets[index];
  }

  /**
   * Delete budget
   */
  static async delete(id: string): Promise<void> {
    const budgets = await this.getAll();
    const filteredBudgets = budgets.filter(b => b.id !== id);
    
    if (filteredBudgets.length === budgets.length) {
      throw new StorageError(`Budget with ID ${id} not found`);
    }

    await this.setData(STORAGE_KEYS.BUDGETS, filteredBudgets);
  }

  /**
   * Update spending for all budgets based on transactions
   */
  static async updateSpending(): Promise<void> {
    const [budgets, transactions] = await Promise.all([
      this.getAll(),
      TransactionStorage.getAll(),
    ]);

    if (budgets.length === 0) return;

    const updatedBudgets = budgets.map(budget => {
      const spent = this.calculateSpentAmount(budget, transactions);
      return {
        ...budget,
        spent,
        updatedAt: new Date().toISOString(),
      };
    });

    await this.setData(STORAGE_KEYS.BUDGETS, updatedBudgets);
  }

  /**
   * Calculate spent amount for a specific budget
   */
  private static calculateSpentAmount(budget: Budget, transactions: Transaction[]): number {
    // Get date range for budget period
    const { startDate } = this.getBudgetPeriodRange(budget.period);
    
    // Filter transactions for this budget
    const relevantTransactions = transactions.filter(transaction => 
      transaction.type === 'expense' &&
      transaction.category === budget.category &&
      new Date(transaction.date) >= startDate
    );

    // Sum the amounts
    return relevantTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  }

  /**
   * Get date range for budget period
   */
  private static getBudgetPeriodRange(period: Budget['period']): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'weekly':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        startDate = startOfWeek;
        endDate = new Date(startOfWeek);
        endDate.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
        break;
        
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
        
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
    }

    return { startDate, endDate };
  }

  /**
   * Get budgets that are over limit
   */
  static async getOverBudget(): Promise<Budget[]> {
    const budgets = await this.getAll();
    return budgets.filter(budget => budget.spent > budget.amount);
  }

  /**
   * Get budget utilization percentage
   */
  static getBudgetUtilization(budget: Budget): number {
    if (budget.amount === 0) return 0;
    return Math.round((budget.spent / budget.amount) * 100);
  }
}

// ==========================================
// GENERAL STORAGE SERVICE
// ==========================================

export class StorageService extends BaseStorageService {
  /**
   * Clear all app data
   */
  static async clearAll(): Promise<void> {
    try {
      const keys = [
        STORAGE_KEYS.USER,
        STORAGE_KEYS.TRANSACTIONS,
        STORAGE_KEYS.BUDGETS,
        STORAGE_KEYS.SETTINGS,
      ];
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      throw new StorageError('Failed to clear all data', error as Error);
    }
  }

  /**
   * Get storage info for debugging
   */
  static async getInfo(): Promise<{
    userExists: boolean;
    transactionCount: number;
    budgetCount: number;
    hasSettings: boolean;
    storageSize: string;
  }> {
    try {
      const [user, transactions, budgets, settings] = await Promise.all([
        UserStorage.get(),
        TransactionStorage.getAll(),
        BudgetStorage.getAll(),
        SettingsStorage.get(),
      ]);

      // Calculate approximate storage size
      const dataSize = JSON.stringify({ user, transactions, budgets, settings }).length;
      const storageSize = `${(dataSize / 1024).toFixed(2)} KB`;

      return {
        userExists: Boolean(user),
        transactionCount: transactions.length,
        budgetCount: budgets.length,
        hasSettings: Boolean(settings),
        storageSize,
      };
    } catch (error) {
      return {
        userExists: false,
        transactionCount: 0,
        budgetCount: 0,
        hasSettings: false,
        storageSize: '0 KB',
      };
    }
  }

  /**
   * Export all data for backup
   */
  static async exportData(): Promise<{
    user: User | null;
    transactions: Transaction[];
    budgets: Budget[];
    settings: UserSettings;
    exportDate: string;
  }> {
    const [user, transactions, budgets, settings] = await Promise.all([
      UserStorage.get(),
      TransactionStorage.getAll(),
      BudgetStorage.getAll(),
      SettingsStorage.get(),
    ]);

    return {
      user,
      transactions,
      budgets,
      settings,
      exportDate: new Date().toISOString(),
    };
  }

  /**
   * Import data from backup
   */
  static async importData(data: {
    user?: User;
    transactions?: Transaction[];
    budgets?: Budget[];
    settings?: UserSettings;
  }): Promise<void> {
    try {
      if (data.user) {
        await UserStorage.save(data.user);
      }
      
      if (data.settings) {
        await SettingsStorage.save(data.settings);
      }
      
      if (data.transactions?.length) {
        await this.setData(STORAGE_KEYS.TRANSACTIONS, data.transactions);
      }
      
      if (data.budgets?.length) {
        await this.setData(STORAGE_KEYS.BUDGETS, data.budgets);
        await BudgetStorage.updateSpending();
      }
    } catch (error) {
      throw new StorageError('Failed to import data', error as Error);
    }
  }
}