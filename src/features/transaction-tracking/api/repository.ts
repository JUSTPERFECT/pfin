import { Transaction, CreateTransactionData, UpdateTransactionData } from '../../../entities/transaction';
import { StorageService, STORAGE_KEYS } from '../../../shared/lib/storage';
import { Logger } from '../../../shared/lib/logger';

export interface ITransactionRepository {
  getAll(): Promise<Transaction[]>;
  getById(id: string): Promise<Transaction | null>;
  save(transaction: Transaction): Promise<void>;
  update(id: string, data: Partial<Transaction>): Promise<void>;
  delete(id: string): Promise<void>;
  deleteAll(): Promise<void>;
  count(): Promise<number>;
}

export class TransactionRepository implements ITransactionRepository {
  async getAll(): Promise<Transaction[]> {
    try {
      const transactions = await StorageService.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS);
      return transactions || [];
    } catch (error) {
      Logger.error('Failed to get all transactions', error, 'TransactionRepository');
      return [];
    }
  }

  async getById(id: string): Promise<Transaction | null> {
    try {
      const transactions = await this.getAll();
      return transactions.find(t => t.id === id) || null;
    } catch (error) {
      Logger.error('Failed to get transaction by ID', { id, error }, 'TransactionRepository');
      return null;
    }
  }

  async save(transaction: Transaction): Promise<void> {
    try {
      const transactions = await this.getAll();
      const existingIndex = transactions.findIndex(t => t.id === transaction.id);
      
      if (existingIndex >= 0) {
        transactions[existingIndex] = transaction;
      } else {
        transactions.unshift(transaction); // Add to beginning
      }
      
      await StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
      Logger.debug('Transaction saved', { id: transaction.id }, 'TransactionRepository');
    } catch (error) {
      Logger.error('Failed to save transaction', { transaction, error }, 'TransactionRepository');
      throw error;
    }
  }

  async update(id: string, data: Partial<Transaction>): Promise<void> {
    try {
      const transactions = await this.getAll();
      const index = transactions.findIndex(t => t.id === id);
      
      if (index === -1) {
        throw new Error(`Transaction with ID ${id} not found`);
      }
      
      transactions[index] = {
        ...transactions[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      await StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
      Logger.debug('Transaction updated', { id }, 'TransactionRepository');
    } catch (error) {
      Logger.error('Failed to update transaction', { id, data, error }, 'TransactionRepository');
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const transactions = await this.getAll();
      const filteredTransactions = transactions.filter(t => t.id !== id);
      
      await StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, filteredTransactions);
      Logger.debug('Transaction deleted', { id }, 'TransactionRepository');
    } catch (error) {
      Logger.error('Failed to delete transaction', { id, error }, 'TransactionRepository');
      throw error;
    }
  }

  async deleteAll(): Promise<void> {
    try {
      await StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, []);
      Logger.info('All transactions deleted', {}, 'TransactionRepository');
    } catch (error) {
      Logger.error('Failed to delete all transactions', error, 'TransactionRepository');
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      const transactions = await this.getAll();
      return transactions.length;
    } catch (error) {
      Logger.error('Failed to count transactions', error, 'TransactionRepository');
      return 0;
    }
  }

  // Batch operations
  async saveMultiple(transactions: Transaction[]): Promise<void> {
    try {
      const existingTransactions = await this.getAll();
      const existingIds = new Set(existingTransactions.map(t => t.id));
      
      // Merge new and existing transactions
      const newTransactions = transactions.filter(t => !existingIds.has(t.id));
      const allTransactions = [...newTransactions, ...existingTransactions];
      
      // Sort by date and creation time
      allTransactions.sort((a, b) => {
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison !== 0) return dateComparison;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      await StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, allTransactions);
      Logger.info('Multiple transactions saved', { count: transactions.length }, 'TransactionRepository');
    } catch (error) {
      Logger.error('Failed to save multiple transactions', { count: transactions.length, error }, 'TransactionRepository');
      throw error;
    }
  }

  async deleteMultiple(ids: string[]): Promise<void> {
    try {
      const transactions = await this.getAll();
      const filteredTransactions = transactions.filter(t => !ids.includes(t.id));
      
      await StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, filteredTransactions);
      Logger.info('Multiple transactions deleted', { count: ids.length }, 'TransactionRepository');
    } catch (error) {
      Logger.error('Failed to delete multiple transactions', { ids, error }, 'TransactionRepository');
      throw error;
    }
  }

  // Query operations
  async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const transactions = await this.getAll();
      return transactions.filter(t => t.date >= startDate && t.date <= endDate);
    } catch (error) {
      Logger.error('Failed to get transactions by date range', { startDate, endDate, error }, 'TransactionRepository');
      return [];
    }
  }

  async getByCategory(category: string): Promise<Transaction[]> {
    try {
      const transactions = await this.getAll();
      return transactions.filter(t => t.category === category);
    } catch (error) {
      Logger.error('Failed to get transactions by category', { category, error }, 'TransactionRepository');
      return [];
    }
  }

  async getByType(type: 'expense' | 'income'): Promise<Transaction[]> {
    try {
      const transactions = await this.getAll();
      return transactions.filter(t => t.type === type);
    } catch (error) {
      Logger.error('Failed to get transactions by type', { type, error }, 'TransactionRepository');
      return [];
    }
  }
}

// Singleton instance
export const transactionRepository = new TransactionRepository();