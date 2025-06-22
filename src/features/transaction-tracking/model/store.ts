import { create } from 'zustand';
import { Transaction, CreateTransactionData, UpdateTransactionData, TransactionFilter, TransactionSummary } from '../../../entities/transaction';
import { TransactionEntity } from '../../../entities/transaction/model/entity';
import { TransactionCalculator } from '../../../entities/transaction/lib/calculator';
import { StorageService, STORAGE_KEYS } from '../../../shared/lib/storage';
import { Logger } from '../../../shared/lib/logger';
import { AnalyticsService } from '../../../shared/lib/analytics';
import { ERROR_MESSAGES } from '../../../shared/constants/errors';
import { getToday } from '../../../shared/utils/date';

interface TransactionState {
  // Data
  transactions: Transaction[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  filter: TransactionFilter;
  
  // Actions - CRUD Operations
  addTransaction: (data: CreateTransactionData) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<CreateTransactionData>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  loadTransactions: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  
  // Actions - Filtering & Search
  setFilter: (filter: TransactionFilter) => void;
  clearFilter: () => void;
  searchTransactions: (searchTerm: string) => void;
  
  // Actions - Bulk Operations
  deleteMultiple: (ids: string[]) => Promise<void>;
  bulkCategorize: (ids: string[], category: string) => Promise<void>;
  
  // Actions - Error Handling
  clearError: () => void;
  
  // Selectors - Filtered Data
  getFilteredTransactions: () => Transaction[];
  getTransactionById: (id: string) => Transaction | undefined;
  
  // Selectors - Summaries
  getSummary: () => TransactionSummary;
  getTodaySummary: () => TransactionSummary;
  getThisMonthSummary: () => TransactionSummary;
  
  // Selectors - Categories
  getTopCategories: (limit?: number) => Array<{ category: string; amount: number; count: number }>;
  getCategoryTotal: (category: string) => number;
  
  // Selectors - Date-based
  getTransactionsByDate: (date: string) => Transaction[];
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
  
  // Selectors - Quick Access
  getRecentTransactions: (limit?: number) => Transaction[];
  getLargestTransactions: (limit?: number) => Transaction[];
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  // Initial state
  transactions: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  filter: {},

  // CRUD Operations
  addTransaction: async (data: CreateTransactionData) => {
    set({ isLoading: true, error: null });
    
    try {
      Logger.info('Adding new transaction', data, 'TransactionStore');
      
      // Create entity (includes validation)
      const entity = TransactionEntity.create(data);
      const transaction = entity.toJSON();
      
      // Update state optimistically
      set(state => ({
        transactions: [transaction, ...state.transactions],
        isLoading: false,
      }));
      
      // Persist to storage
      const allTransactions = [transaction, ...get().transactions.slice(1)];
      await StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, allTransactions);
      
      // Analytics
      AnalyticsService.transactionAdded(transaction.type, transaction.amount, transaction.category);
      
      Logger.info('Transaction added successfully', { id: transaction.id }, 'TransactionStore');
      return transaction;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.TRANSACTION_ADD_FAILED;
      
      Logger.error('Failed to add transaction', error, 'TransactionStore');
      
      set({ 
        error: errorMessage,
        isLoading: false,
        // Revert optimistic update
        transactions: get().transactions.slice(1),
      });
      
      throw new Error(errorMessage);
    }
  },

  updateTransaction: async (id: string, data: Partial<CreateTransactionData>) => {
    set({ isLoading: true, error: null });
    
    try {
      Logger.info('Updating transaction', { id, data }, 'TransactionStore');
      
      const existingTransaction = get().getTransactionById(id);
      if (!existingTransaction) {
        throw new Error('Transaction not found');
      }
      
      // Create updated entity
      const entity = TransactionEntity.fromJSON(existingTransaction);
      const updatedEntity = entity.update({ id, ...data });
      const updatedTransaction = updatedEntity.toJSON();
      
      // Update state
      set(state => ({
        transactions: state.transactions.map(t => 
          t.id === id ? updatedTransaction : t
        ),
        isLoading: false,
      }));
      
      // Persist to storage
      await StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, get().transactions);
      
      Logger.info('Transaction updated successfully', { id }, 'TransactionStore');
      return updatedTransaction;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.TRANSACTION_UPDATE_FAILED;
      
      Logger.error('Failed to update transaction', error, 'TransactionStore');
      
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      
      throw new Error(errorMessage);
    }
  },

  deleteTransaction: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      Logger.info('Deleting transaction', { id }, 'TransactionStore');
      
      const transactionToDelete = get().getTransactionById(id);
      
      // Update state optimistically
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id),
        isLoading: false,
      }));
      
      // Persist to storage
      await StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, get().transactions);
      
      Logger.info('Transaction deleted successfully', { id }, 'TransactionStore');
      
    } catch (error) {
      const errorMessage = ERROR_MESSAGES.TRANSACTION_DELETE_FAILED;
      
      Logger.error('Failed to delete transaction', error, 'TransactionStore');
      
      set({ 
        error: errorMessage,
        isLoading: false,
        // Revert optimistic update if we had the transaction
        transactions: transactionToDelete ? [transactionToDelete, ...get().transactions] : get().transactions,
      });
      
      throw new Error(errorMessage);
    }
  },

  loadTransactions: async () => {
    set({ isLoading: true, error: null });
    
    try {
      Logger.info('Loading transactions from storage', {}, 'TransactionStore');
      
      const savedTransactions = await StorageService.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS);
      
      if (savedTransactions && Array.isArray(savedTransactions)) {
        // Sort by date and creation time (newest first)
        const sortedTransactions = savedTransactions.sort((a, b) => {
          const dateComparison = b.date.localeCompare(a.date);
          if (dateComparison !== 0) return dateComparison;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        set({ 
          transactions: sortedTransactions,
          isLoading: false 
        });
        
        Logger.info('Transactions loaded successfully', { count: sortedTransactions.length }, 'TransactionStore');
      } else {
        // No saved transactions, create sample data for first time users
        const sampleTransactions = get().createSampleData();
        set({ 
          transactions: sampleTransactions,
          isLoading: false 
        });
        
        // Save sample data
        await StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, sampleTransactions);
        
        Logger.info('Created sample transactions for new user', { count: sampleTransactions.length }, 'TransactionStore');
      }
      
    } catch (error) {
      Logger.error('Failed to load transactions', error, 'TransactionStore');
      
      set({ 
        error: ERROR_MESSAGES.TRANSACTION_LOAD_FAILED,
        isLoading: false 
      });
    }
  },

  refreshTransactions: async () => {
    set({ isRefreshing: true });
    await get().loadTransactions();
    set({ isRefreshing: false });
  },

  // Filtering & Search
  setFilter: (filter: TransactionFilter) => {
    Logger.debug('Setting transaction filter', filter, 'TransactionStore');
    set({ filter });
  },

  clearFilter: () => {
    Logger.debug('Clearing transaction filter', {}, 'TransactionStore');
    set({ filter: {} });
  },

  searchTransactions: (searchTerm: string) => {
    set({ 
      filter: { 
        ...get().filter, 
        searchTerm: searchTerm.trim() || undefined 
      } 
    });
  },

  // Bulk Operations
  deleteMultiple: async (ids: string[]) => {
    set({ isLoading: true, error: null });
    
    try {
      Logger.info('Bulk deleting transactions', { count: ids.length }, 'TransactionStore');
      
      const transactionsToDelete = get().transactions.filter(t => ids.includes(t.id));
      
      // Update state optimistically
      set(state => ({
        transactions: state.transactions.filter(t => !ids.includes(t.id)),
        isLoading: false,
      }));
      
      // Persist to storage
      await StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, get().transactions);
      
      Logger.info('Bulk delete completed successfully', { deletedCount: ids.length }, 'TransactionStore');
      
    } catch (error) {
      Logger.error('Failed to bulk delete transactions', error, 'TransactionStore');
      
      set({ 
        error: ERROR_MESSAGES.TRANSACTION_DELETE_FAILED,
        isLoading: false 
      });
      
      throw new Error(ERROR_MESSAGES.TRANSACTION_DELETE_FAILED);
    }
  },

  bulkCategorize: async (ids: string[], category: string) => {
    set({ isLoading: true, error: null });
    
    try {
      Logger.info('Bulk categorizing transactions', { count: ids.length, category }, 'TransactionStore');
      
      // Update state
      set(state => ({
        transactions: state.transactions.map(t => 
          ids.includes(t.id) 
            ? { ...t, category, updatedAt: new Date().toISOString() }
            : t
        ),
        isLoading: false,
      }));
      
      // Persist to storage
      await StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, get().transactions);
      
      Logger.info('Bulk categorization completed successfully', { updatedCount: ids.length }, 'TransactionStore');
      
    } catch (error) {
      Logger.error('Failed to bulk categorize transactions', error, 'TransactionStore');
      
      set({ 
        error: ERROR_MESSAGES.TRANSACTION_UPDATE_FAILED,
        isLoading: false 
      });
      
      throw new Error(ERROR_MESSAGES.TRANSACTION_UPDATE_FAILED);
    }
  },

  // Error Handling
  clearError: () => {
    set({ error: null });
  },

  // Selectors - Filtered Data
  getFilteredTransactions: () => {
    const { transactions, filter } = get();
    
    return transactions.filter(transaction => {
      // Type filter
      if (filter.type && transaction.type !== filter.type) return false;
      
      // Category filter
      if (filter.category && transaction.category !== filter.category) return false;
      if (filter.categories && !filter.categories.includes(transaction.category)) return false;
      
      // Date range filter
      if (filter.dateFrom && transaction.date < filter.dateFrom) return false;
      if (filter.dateTo && transaction.date > filter.dateTo) return false;
      
      // Amount range filter
      if (filter.minAmount && transaction.amount < filter.minAmount) return false;
      if (filter.maxAmount && transaction.amount > filter.maxAmount) return false;
      
      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        const transactionTags = transaction.tags || [];
        if (!filter.tags.some(tag => transactionTags.includes(tag))) return false;
      }
      
      // Search term filter
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        const searchText = `${transaction.description} ${transaction.notes || ''}`.toLowerCase();
        if (!searchText.includes(searchTerm)) return false;
      }
      
      return true;
    });
  },

  getTransactionById: (id: string) => {
    return get().transactions.find(t => t.id === id);
  },

  // Selectors - Summaries
  getSummary: () => {
    const filteredTransactions = get().getFilteredTransactions();
    return TransactionCalculator.calculateSummary(filteredTransactions);
  },

  getTodaySummary: () => {
    const today = getToday();
    const todayTransactions = get().transactions.filter(t => t.date === today);
    return TransactionCalculator.calculateSummary(todayTransactions);
  },

  getThisMonthSummary: () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const monthTransactions = get().transactions.filter(t => 
      t.date >= startOfMonth && t.date <= endOfMonth
    );
    
    return TransactionCalculator.calculateSummary(monthTransactions);
  },

  // Selectors - Categories
  getTopCategories: (limit = 5) => {
    const expenses = get().transactions.filter(t => t.type === 'expense');
    const categorySummary = TransactionCalculator.calculateCategorySummary(expenses);
    
    return categorySummary.slice(0, limit).map(cat => ({
      category: cat.category,
      amount: cat.totalAmount,
      count: cat.transactionCount,
    }));
  },

  getCategoryTotal: (category: string) => {
    return get().transactions
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  },

  // Selectors - Date-based
  getTransactionsByDate: (date: string) => {
    return get().transactions.filter(t => t.date === date);
  },

  getTransactionsByDateRange: (startDate: string, endDate: string) => {
    return get().transactions.filter(t => 
      t.date >= startDate && t.date <= endDate
    );
  },

  // Selectors - Quick Access
  getRecentTransactions: (limit = 10) => {
    return get().getFilteredTransactions().slice(0, limit);
  },

  getLargestTransactions: (limit = 5) => {
    return [...get().getFilteredTransactions()]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  },

  // Private helper methods (not in interface)
  createSampleData: (): Transaction[] => {
    const today = getToday();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const sampleData: CreateTransactionData[] = [
      {
        amount: 450,
        description: 'Lunch at cafe',
        category: 'food',
        type: 'expense',
        date: today,
      },
      {
        amount: 1200,
        description: 'New shirt',
        category: 'shopping',
        type: 'expense',
        date: today,
      },
      {
        amount: 80,
        description: 'Metro ticket',
        category: 'transport',
        type: 'expense',
        date: yesterdayStr,
      },
      {
        amount: 25000,
        description: 'Salary',
        category: 'other',
        type: 'income',
        date: yesterdayStr,
      },
      {
        amount: 180,
        description: 'Movie tickets',
        category: 'entertainment',
        type: 'expense',
        date: yesterdayStr,
      },
    ];
    
    return sampleData.map(data => TransactionEntity.create(data).toJSON());
  },
}));