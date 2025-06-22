import { CreateTransactionData, UpdateTransactionData } from './types';
import { 
  validateTransactionAmount, 
  validateTransactionDescription, 
  validateTransactionDate,
  ValidationResult 
} from '../../../shared/utils/validation';
import { getCategoryByKey } from '../../../shared/constants/categories';
import { ERROR_MESSAGES } from '../../../shared/constants/errors';

export interface TransactionValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export class TransactionValidator {
  static validateCreate(data: CreateTransactionData): TransactionValidationResult {
    const errors: Record<string, string[]> = {};

    // Validate amount
    const amountValidation = validateTransactionAmount(data.amount);
    if (!amountValidation.isValid) {
      errors.amount = amountValidation.errors;
    }

    // Validate description
    const descriptionValidation = validateTransactionDescription(data.description);
    if (!descriptionValidation.isValid) {
      errors.description = descriptionValidation.errors;
    }

    // Validate category
    if (!data.category) {
      errors.category = [ERROR_MESSAGES.REQUIRED_FIELD];
    } else if (!getCategoryByKey(data.category)) {
      errors.category = [`Invalid category: ${data.category}`];
    }

    // Validate type
    if (!data.type) {
      errors.type = [ERROR_MESSAGES.REQUIRED_FIELD];
    } else if (!['expense', 'income'].includes(data.type)) {
      errors.type = ['Type must be either expense or income'];
    }

    // Validate date if provided
    if (data.date) {
      const dateValidation = validateTransactionDate(data.date);
      if (!dateValidation.isValid) {
        errors.date = dateValidation.errors;
      }
    }

    // Validate tags if provided
    if (data.tags && data.tags.length > 0) {
      const tagErrors = this.validateTags(data.tags);
      if (tagErrors.length > 0) {
        errors.tags = tagErrors;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validateUpdate(data: UpdateTransactionData): TransactionValidationResult {
    const errors: Record<string, string[]> = {};

    // Validate ID
    if (!data.id) {
      errors.id = [ERROR_MESSAGES.REQUIRED_FIELD];
    }

    // Validate amount if provided
    if (data.amount !== undefined) {
      const amountValidation = validateTransactionAmount(data.amount);
      if (!amountValidation.isValid) {
        errors.amount = amountValidation.errors;
      }
    }

    // Validate description if provided
    if (data.description !== undefined) {
      const descriptionValidation = validateTransactionDescription(data.description);
      if (!descriptionValidation.isValid) {
        errors.description = descriptionValidation.errors;
      }
    }

    // Validate category if provided
    if (data.category !== undefined) {
      if (!getCategoryByKey(data.category)) {
        errors.category = [`Invalid category: ${data.category}`];
      }
    }

    // Validate type if provided
    if (data.type !== undefined) {
      if (!['expense', 'income'].includes(data.type)) {
        errors.type = ['Type must be either expense or income'];
      }
    }

    // Validate date if provided
    if (data.date !== undefined) {
      const dateValidation = validateTransactionDate(data.date);
      if (!dateValidation.isValid) {
        errors.date = dateValidation.errors;
      }
    }

    // Validate tags if provided
    if (data.tags !== undefined && data.tags.length > 0) {
      const tagErrors = this.validateTags(data.tags);
      if (tagErrors.length > 0) {
        errors.tags = tagErrors;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  private static validateTags(tags: string[]): string[] {
    const errors: string[] = [];

    if (tags.length > 10) {
      errors.push('Maximum 10 tags allowed');
    }

    tags.forEach((tag, index) => {
      if (!tag.trim()) {
        errors.push(`Tag ${index + 1} cannot be empty`);
      } else if (tag.length > 20) {
        errors.push(`Tag "${tag}" is too long (max 20 characters)`);
      }
    });

    return errors;
  }

  static getFieldError(
    validationResult: TransactionValidationResult,
    field: string
  ): string | undefined {
    return validationResult.errors[field]?.[0];
  }

  static hasFieldError(
    validationResult: TransactionValidationResult,
    field: string
  ): boolean {
    return !!validationResult.errors[field]?.length;
  }
}