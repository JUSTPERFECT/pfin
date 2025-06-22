import { getCurrencyByCode, getCurrencySymbol } from '../constants/currencies';

export const formatCurrency = (
  amount: number, 
  currencyCode: string = 'INR'
): string => {
  const currency = getCurrencyByCode(currencyCode);
  const symbol = currency?.symbol || '₹';
  const locale = currency?.locale || 'en-IN';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode === 'INR' ? 'INR' : currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace(/^(\D+)/, symbol);
};

export const formatAmount = (amount: number): string => {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
};

export const parseCurrency = (value: string): number => {
  // Remove all non-numeric characters except decimal point and minus
  const cleaned = value.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.abs(parsed); // Ensure positive
};

export const formatCurrencyInput = (value: string): string => {
  // Format as user types (for input fields)
  const number = parseCurrency(value);
  if (number === 0) return '';
  return number.toString();
};

export const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 10000000; // Max 1 crore
};