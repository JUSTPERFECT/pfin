// src/navigation/NavigationHelpers.ts
// Navigation helper functions - separate from AppNavigator to avoid circular imports

import { createNavigationContainerRef } from '@react-navigation/native';

// ==========================================
// NAVIGATION REF
// ==========================================

export const navigationRef = createNavigationContainerRef();

// ==========================================
// BASIC NAVIGATION FUNCTIONS
// ==========================================

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    // @ts-ignore - Simplified navigation to avoid complex type issues
    navigationRef.navigate(name, params);
  }
}

export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}

// ==========================================
// NAVIGATION HELPERS
// ==========================================

export const NavigationHelpers = {
  // Navigate to Add Transaction screen
  addTransaction: (initialType?: 'income' | 'expense') => {
    navigate('AddTransaction', { initialType });
  },
  
  // Navigate to Edit Transaction screen
  editTransaction: (transactionId: string) => {
    navigate('AddTransaction', { editId: transactionId });
  },
  
  // Navigate to User Setup screen
  userSetup: () => {
    navigate('UserSetup');
  },
  
  // Navigate to Transaction Detail screen
  viewTransaction: (transactionId: string) => {
    console.log('Navigate to transaction detail:', transactionId);
  },
  
  // Navigate to Add Budget screen
  addBudget: (category?: string) => {
    console.log('Navigate to add budget:', category);
  },
  
  // Navigate to main tabs
  goToHome: () => navigate('MainTabs'),
  
  // Go back
  goBack,
};