import { ERROR_MESSAGES } from '../constants/errors';

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidation {
  [key: string]: ValidationResult;
}

export const createValidator = <T>(rules: ValidationRule<T>[]) => {
  return (value: T): ValidationResult => {
    const errors: string[] = [];
    
    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  };
};

// Common validation rules
export const required = (message: string = ERROR_MESSAGES.REQUIRED_FIELD): ValidationRule<any> => ({
  validate: (value) => {
    if (typeof value === 'string') return value.trim() !== '';
    return value !== null && value !== undefined && value !== '';
  },
  message,
});

export const minLength = (min: number, message?: string): ValidationRule<string> => ({
  validate: (value) => value.length >= min,
  message: message || `Minimum ${min} characters required`,
});

export const maxLength = (max: number, message?: string): ValidationRule<string> => ({
  validate: (value) => value.length <= max,
  message: message || `Maximum ${max} characters allowed`,
});

export const positive = (message: string = ERROR_MESSAGES.AMOUNT_TOO_SMALL): ValidationRule<number> => ({
  validate: (value) => value > 0,
  message,
});

export const maxAmount = (max: number, message?: string): ValidationRule<number> => ({
  validate: (value) => value <= max,
  message: message || `Amount cannot exceed ${max}`,
});

export const isNumber = (message: string = ERROR_MESSAGES.INVALID_AMOUNT): ValidationRule<any> => ({
  validate: (value) => !isNaN(Number(value)) && isFinite(Number(value)),
  message,
});

export const isValidDate = (message: string = ERROR_MESSAGES.INVALID_DATE): ValidationRule<string> => ({
  validate: (value) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  },
  message,
});

// Composite validators for common use cases
export const validateTransactionAmount = createValidator([
  required(ERROR_MESSAGES.REQUIRED_FIELD),
  isNumber(ERROR_MESSAGES.INVALID_AMOUNT),
  positive(ERROR_MESSAGES.AMOUNT_TOO_SMALL),
  maxAmount(10000000, ERROR_MESSAGES.AMOUNT_TOO_LARGE),
]);

export const validateTransactionDescription = createValidator([
  required(ERROR_MESSAGES.REQUIRED_FIELD),
  minLength(3, ERROR_MESSAGES.DESCRIPTION_TOO_SHORT),
  maxLength(100, ERROR_MESSAGES.DESCRIPTION_TOO_LONG),
]);

export const validateTransactionDate = createValidator([
  required(ERROR_MESSAGES.REQUIRED_FIELD),
  isValidDate(ERROR_MESSAGES.INVALID_DATE),
]);