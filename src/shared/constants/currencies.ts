export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'en-EU' },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', locale: 'en-CA' },
];

export const getCurrencyByCode = (code: string): Currency | undefined => {
  return CURRENCIES.find(curr => curr.code === code);
};

export const getCurrencySymbol = (code: string): string => {
  return getCurrencyByCode(code)?.symbol || '₹';
};

export const getDefaultCurrency = (): Currency => {
  return CURRENCIES[0]; // INR
};