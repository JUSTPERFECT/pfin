import { BaseEntity, TransactionType } from '../../../shared/types/common';

export interface Transaction extends BaseEntity {
  amount: number;
  description: string;
  category: string;
  date: string;
  type: TransactionType;
  attachments?: string[];
  tags?: string[];
  location?: string;
  notes?: string;
}

export interface CreateTransactionData {
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  date?: string;
  attachments?: string[];
  tags?: string[];
  location?: string;
  notes?: string;
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {
  id: string;
}

export interface TransactionFilter {
  type?: TransactionType;
  category?: string;
  categories?: string[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  searchTerm?: string;
}

export interface TransactionSummary {
  totalExpenses: number;
  totalIncome: number;
  netAmount: number;
  transactionCount: number;
  averageExpense: number;
  averageIncome: number;
}

export interface CategorySummary {
  category: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
  averageAmount: number;
}

export interface DateRangeSummary {
  period: string;
  totalExpenses: number;
  totalIncome: number;
  netAmount: number;
  transactionCount: number;
}