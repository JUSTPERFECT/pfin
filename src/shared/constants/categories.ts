export interface Category {
  key: string;
  label: string;
  icon: string;
  color: string;
}

export const EXPENSE_CATEGORIES: Category[] = [
  { key: 'food', label: 'Food', icon: '🍔', color: '#FF6B6B' },
  { key: 'transport', label: 'Travel', icon: '🚛', color: '#4ECDC4' },
  { key: 'shopping', label: 'Shopping', icon: '🛍️', color: '#45B7D1' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#96CEB4' },
  { key: 'bills', label: 'Bills', icon: '💡', color: '#FFEAA7' },
  { key: 'health', label: 'Healthcare', icon: '🏥', color: '#DDA0DD' },
  { key: 'other', label: 'Other', icon: '💰', color: '#95A5A6' },
];

export const getCategoryByKey = (key: string): Category | undefined => {
  return EXPENSE_CATEGORIES.find(cat => cat.key === key);
};

export const getCategoryColor = (key: string): string => {
  return getCategoryByKey(key)?.color || '#95A5A6';
};

export const getCategoryIcon = (key: string): string => {
  return getCategoryByKey(key)?.icon || '💰';
};

export const getCategoryLabel = (key: string): string => {
  return getCategoryByKey(key)?.label || 'Other';
};