import { Transaction } from '../../../entities/transaction';
import { formatCurrency } from '../../../shared/utils/currency';
import { formatDate, getRelativeDate } from '../../../shared/utils/date';
import { getCategoryLabel, getCategoryIcon } from '../../../shared/constants/categories';

export class TransactionFormatter {
  static formatAmount(transaction: Transaction, currencySymbol: string = '₹'): string {
    const prefix = transaction.type === 'expense' ? '-' : '+';
    return `${prefix}${formatCurrency(transaction.amount, currencySymbol)}`;
  }

  static formatAmountWithoutSign(transaction: Transaction, currencySymbol: string = '₹'): string {
    return formatCurrency(transaction.amount, currencySymbol);
  }

  static formatDate(transaction: Transaction, format: 'short' | 'long' | 'relative' = 'relative'): string {
    if (format === 'relative') {
      return getRelativeDate(transaction.date);
    }
    return formatDate(transaction.date, format);
  }

  static formatCategory(transaction: Transaction): {
    label: string;
    icon: string;
  } {
    return {
      label: getCategoryLabel(transaction.category),
      icon: getCategoryIcon(transaction.category),
    };
  }

  static formatDescription(transaction: Transaction, maxLength: number = 50): string {
    if (transaction.description.length <= maxLength) {
      return transaction.description;
    }
    return `${transaction.description.substring(0, maxLength - 3)}...`;
  }

  static formatTags(transaction: Transaction): string {
    if (!transaction.tags || transaction.tags.length === 0) {
      return '';
    }
    return transaction.tags.map(tag => `#${tag}`).join(' ');
  }

  static formatForExport(transaction: Transaction): Record<string, any> {
    return {
      id: transaction.id,
      date: transaction.date,
      type: transaction.type,
      category: this.formatCategory(transaction).label,
      description: transaction.description,
      amount: transaction.amount,
      tags: transaction.tags?.join(', ') || '',
      notes: transaction.notes || '',
      created: formatDate(transaction.createdAt, 'long'),
      updated: formatDate(transaction.updatedAt, 'long'),
    };
  }

  static formatForDisplay(transaction: Transaction): {
    id: string;
    displayAmount: string;
    displayDate: string;
    displayCategory: { label: string; icon: string };
    displayDescription: string;
    displayTags: string;
    isExpense: boolean;
    isIncome: boolean;
  } {
    return {
      id: transaction.id,
      displayAmount: this.formatAmount(transaction),
      displayDate: this.formatDate(transaction),
      displayCategory: this.formatCategory(transaction),
      displayDescription: this.formatDescription(transaction),
      displayTags: this.formatTags(transaction),
      isExpense: transaction.type === 'expense',
      isIncome: transaction.type === 'income',
    };
  }

  // Group formatting
  static formatTransactionGroup(transactions: Transaction[], groupDate: string): {
    date: string;
    displayDate: string;
    totalExpenses: string;
    totalIncome: string;
    netAmount: string;
    count: number;
    transactions: ReturnType<typeof TransactionFormatter.formatForDisplay>[];
  } {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const netAmount = totalIncome - totalExpenses;

    return {
      date: groupDate,
      displayDate: getRelativeDate(groupDate),
      totalExpenses: formatCurrency(totalExpenses),
      totalIncome: formatCurrency(totalIncome),
      netAmount: `${netAmount >= 0 ? '+' : ''}${formatCurrency(Math.abs(netAmount))}`,
      count: transactions.length,
      transactions: transactions.map(t => this.formatForDisplay(t)),
    };
  }

  // Summary formatting
  static formatSummary(summary: {
    totalExpenses: number;
    totalIncome: number;
    netAmount: number;
    transactionCount: number;
  }): {
    totalExpenses: string;
    totalIncome: string;
    netAmount: string;
    netAmountLabel: string;
    transactionCount: string;
    isProfit: boolean;
    isLoss: boolean;
  } {
    const isProfit = summary.netAmount > 0;
    const isLoss = summary.netAmount < 0;

    return {
      totalExpenses: formatCurrency(summary.totalExpenses),
      totalIncome: formatCurrency(summary.totalIncome),
      netAmount: formatCurrency(Math.abs(summary.netAmount)),
      netAmountLabel: isProfit ? 'Profit' : isLoss ? 'Loss' : 'Break Even',
      transactionCount: `${summary.transactionCount} transaction${summary.transactionCount !== 1 ? 's' : ''}`,
      isProfit,
      isLoss,
    };
  }
}