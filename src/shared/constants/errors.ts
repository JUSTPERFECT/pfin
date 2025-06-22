export const ERROR_MESSAGES = {
    // Validation errors
    REQUIRED_FIELD: 'This field is required',
    INVALID_AMOUNT: 'Please enter a valid amount',
    AMOUNT_TOO_SMALL: 'Amount must be greater than 0',
    AMOUNT_TOO_LARGE: 'Amount is too large',
    INVALID_DATE: 'Please select a valid date',
    DESCRIPTION_TOO_SHORT: 'Description must be at least 3 characters',
    DESCRIPTION_TOO_LONG: 'Description cannot exceed 100 characters',
  
    // API errors
    NETWORK_ERROR: 'Network connection failed',
    SERVER_ERROR: 'Server error occurred',
    TIMEOUT_ERROR: 'Request timeout',
    UNAUTHORIZED: 'Unauthorized access',
  
    // Storage errors
    STORAGE_SAVE_FAILED: 'Failed to save data',
    STORAGE_LOAD_FAILED: 'Failed to load data',
    STORAGE_DELETE_FAILED: 'Failed to delete data',
  
    // Transaction errors
    TRANSACTION_ADD_FAILED: 'Failed to add transaction',
    TRANSACTION_UPDATE_FAILED: 'Failed to update transaction',
    TRANSACTION_DELETE_FAILED: 'Failed to delete transaction',
    TRANSACTION_LOAD_FAILED: 'Failed to load transactions',
  
    // General
    UNKNOWN_ERROR: 'An unexpected error occurred',
  } as const;
  
  export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;