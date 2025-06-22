import { CreateTransactionData, UpdateTransactionData } from '../../../entities/transaction';
import { TransactionValidator, TransactionValidationResult } from '../../../entities/transaction/model/validator';

// Re-export the entity validator for convenience
export { TransactionValidator, type TransactionValidationResult };

// Additional form-specific validation helpers
export class TransactionFormValidator {
  static validateFormData(data: Partial<CreateTransactionData>): {
    isValid: boolean;
    errors: Record<string, string>;
    canSubmit: boolean;
  } {
    const errors: Record<string, string> = {};
    
    // Required field checks
    if (!data.amount || data.amount <= 0) {
      errors.amount = 'Amount is required and must be greater than 0';
    }
    
    if (!data.description?.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!data.category) {
      errors.category = 'Category is required';
    }
    
    if (!data.type) {
      errors.type = 'Transaction type is required';
    }

    // Validation for amount
    if (data.amount && data.amount > 10000000) {
      errors.amount = 'Amount cannot exceed 1 crore';
    }

    // Validation for description
    if (data.description && data.description.trim().length < 3) {
      errors.description = 'Description must be at least 3 characters';
    }

    if (data.description && data.description.length > 100) {
      errors.description = 'Description cannot exceed 100 characters';
    }

    const isValid = Object.keys(errors).length === 0;
    const canSubmit = isValid && !!data.amount && !!data.description?.trim() && !!data.category && !!data.type;

    return {
      isValid,
      errors,
      canSubmit,
    };
  }

  static validateStep(step: 'amount' | 'description' | 'category' | 'type', value: any): {
    isValid: boolean;
    error?: string;
  } {
    switch (step) {
      case 'amount':
        if (!value || value <= 0) {
          return { isValid: false, error: 'Amount must be greater than 0' };
        }
        if (value > 10000000) {
          return { isValid: false, error: 'Amount cannot exceed 1 crore' };
        }
        return { isValid: true };

      case 'description':
        if (!value?.trim()) {
          return { isValid: false, error: 'Description is required' };
        }
        if (value.trim().length < 3) {
          return { isValid: false, error: 'Description must be at least 3 characters' };
        }
        if (value.length > 100) {
          return { isValid: false, error: 'Description cannot exceed 100 characters' };
        }
        return { isValid: true };

      case 'category':
        if (!value) {
          return { isValid: false, error: 'Category is required' };
        }
        return { isValid: true };

      case 'type':
        if (!value || !['expense', 'income'].includes(value)) {
          return { isValid: false, error: 'Valid transaction type is required' };
        }
        return { isValid: true };

      default:
        return { isValid: true };
    }
  }

  static getFieldValidationState(
    value: any,
    field: keyof CreateTransactionData,
    touched: boolean = false
  ): {
    isValid: boolean;
    hasError: boolean;
    error?: string;
    showError: boolean;
  } {
    const validation = this.validateStep(field as any, value);
    const hasError = !validation.isValid;
    const showError = hasError && touched;

    return {
      isValid: validation.isValid,
      hasError,
      error: validation.error,
      showError,
    };
  }
}