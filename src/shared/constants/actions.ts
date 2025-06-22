export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'scan' | 'view';
}

export const QUICK_ACTIONS: QuickAction[] = [
  { 
    id: 'add_expense', 
    title: 'Add Expense', 
    icon: '💸', 
    color: '#FF6B6B',
    type: 'expense'
  },
  { 
    id: 'scan_receipt', 
    title: 'Scan Receipt', 
    icon: '📸', 
    color: '#4ECDC4',
    type: 'scan'
  },
  { 
    id: 'add_income', 
    title: 'Add Income', 
    icon: '💰', 
    color: '#2E7D61',
    type: 'income'
  },
  { 
    id: 'view_insights', 
    title: 'View Insights', 
    icon: '📊', 
    color: '#45B7D1',
    type: 'view'
  },
];

export const getActionById = (id: string): QuickAction | undefined => {
  return QUICK_ACTIONS.find(action => action.id === id);
};