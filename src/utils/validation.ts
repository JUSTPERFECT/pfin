// src/utils/validation.ts

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
  }
  
  export interface ValidationRule {
    validator: (value: any) => boolean;
    message: string;
  }
  
  export class FormValidator {
    private rules: Map<string, ValidationRule[]> = new Map();
  
    // Add validation rule for a field
    addRule(fieldName: string, rule: ValidationRule): FormValidator {
      if (!this.rules.has(fieldName)) {
        this.rules.set(fieldName, []);
      }
      this.rules.get(fieldName)!.push(rule);
      return this;
    }
  
    // Validate all fields
    validate(data: Record<string, any>): Record<string, ValidationResult> {
      const results: Record<string, ValidationResult> = {};
  
      for (const [fieldName, rules] of this.rules.entries()) {
        const fieldValue = data[fieldName];
        const errors: string[] = [];
  
        for (const rule of rules) {
          if (!rule.validator(fieldValue)) {
            errors.push(rule.message);
          }
        }
  
        results[fieldName] = {
          isValid: errors.length === 0,
          errors,
        };
      }
  
      return results;
    }
  
    // Validate single field
    validateField(fieldName: string, value: any): ValidationResult {
      const rules = this.rules.get(fieldName) || [];
      const errors: string[] = [];
  
      for (const rule of rules) {
        if (!rule.validator(value)) {
          errors.push(rule.message);
        }
      }
  
      return {
        isValid: errors.length === 0,
        errors,
      };
    }
  
    // Check if all fields are valid
    isFormValid(validationResults: Record<string, ValidationResult>): boolean {
      return Object.values(validationResults).every(result => result.isValid);
    }
  }
  
  // Common validation rules
  export const ValidationRules = {
    required: (message: string = 'This field is required'): ValidationRule => ({
      validator: (value: any) => value !== null && value !== undefined && String(value).trim() !== '',
      message,
    }),
  
    minLength: (min: number, message?: string): ValidationRule => ({
      validator: (value: string) => String(value || '').length >= min,
      message: message || `Must be at least ${min} characters`,
    }),
  
    maxLength: (max: number, message?: string): ValidationRule => ({
      validator: (value: string) => String(value || '').length <= max,
      message: message || `Must be no more than ${max} characters`,
    }),
  
    email: (message: string = 'Please enter a valid email address'): ValidationRule => ({
      validator: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !value || emailRegex.test(value);
      },
      message,
    }),
  
    numeric: (message: string = 'Must be a number'): ValidationRule => ({
      validator: (value: any) => !value || !isNaN(Number(value)),
      message,
    }),
  
    positiveNumber: (message: string = 'Must be a positive number'): ValidationRule => ({
      validator: (value: any) => !value || (!isNaN(Number(value)) && Number(value) > 0),
      message,
    }),
  
    integer: (message: string = 'Must be a whole number'): ValidationRule => ({
      validator: (value: any) => !value || (Number.isInteger(Number(value))),
      message,
    }),
  
    minValue: (min: number, message?: string): ValidationRule => ({
      validator: (value: any) => !value || Number(value) >= min,
      message: message || `Must be at least ${min}`,
    }),
  
    maxValue: (max: number, message?: string): ValidationRule => ({
      validator: (value: any) => !value || Number(value) <= max,
      message: message || `Must be no more than ${max}`,
    }),
  
    currency: (message: string = 'Please enter a valid amount'): ValidationRule => ({
      validator: (value: string) => {
        if (!value) return true;
        const currencyRegex = /^\d+(\.\d{1,2})?$/;
        return currencyRegex.test(value);
      },
      message,
    }),
  
    noSpecialChars: (message: string = 'Special characters are not allowed'): ValidationRule => ({
      validator: (value: string) => {
        if (!value) return true;
        const specialCharsRegex = /^[a-zA-Z0-9\s]*$/;
        return specialCharsRegex.test(value);
      },
      message,
    }),
  };
  
  // Expense form validation
  export const createExpenseValidator = (): FormValidator => {
    return new FormValidator()
      .addRule('amount', ValidationRules.required('Amount is required'))
      .addRule('amount', ValidationRules.positiveNumber('Amount must be a positive number'))
      .addRule('amount', ValidationRules.currency('Please enter a valid amount (e.g., 10.50)'))
      .addRule('description', ValidationRules.required('Description is required'))
      .addRule('description', ValidationRules.minLength(3, 'Description must be at least 3 characters'))
      .addRule('description', ValidationRules.maxLength(100, 'Description must be less than 100 characters'))
      .addRule('category', ValidationRules.required('Please select a category'));
  };
  
  // Budget setup validation
  export const createBudgetValidator = (): FormValidator => {
    return new FormValidator()
      .addRule('monthlyBudget', ValidationRules.required('Monthly budget is required'))
      .addRule('monthlyBudget', ValidationRules.positiveNumber('Budget must be a positive number'))
      .addRule('monthlyBudget', ValidationRules.minValue(100, 'Budget should be at least 100'))
      .addRule('monthlyBudget', ValidationRules.maxValue(10000000, 'Budget seems too high'))
      .addRule('currency', ValidationRules.required('Please select a currency'));
  };
  
  // Profile validation
  export const createProfileValidator = (): FormValidator => {
    return new FormValidator()
      .addRule('name', ValidationRules.required('Name is required'))
      .addRule('name', ValidationRules.minLength(2, 'Name must be at least 2 characters'))
      .addRule('name', ValidationRules.maxLength(50, 'Name must be less than 50 characters'))
      .addRule('name', ValidationRules.noSpecialChars('Name can only contain letters, numbers, and spaces'))
      .addRule('email', ValidationRules.required('Email is required'))
      .addRule('email', ValidationRules.email('Please enter a valid email address'));
  };
  
  // Real-time validation hook
  export const useFormValidation = (validator: FormValidator, initialData: Record<string, any> = {}) => {
    const [formData, setFormData] = React.useState(initialData);
    const [validationResults, setValidationResults] = React.useState<Record<string, ValidationResult>>({});
    const [hasSubmitted, setHasSubmitted] = React.useState(false);
  
    // Update field value and validate if form has been submitted
    const updateField = (fieldName: string, value: any) => {
      const newFormData = { ...formData, [fieldName]: value };
      setFormData(newFormData);
  
      // Only show validation errors after first submit attempt
      if (hasSubmitted) {
        const fieldResult = validator.validateField(fieldName, value);
        setValidationResults(prev => ({
          ...prev,
          [fieldName]: fieldResult,
        }));
      }
    };
  
    // Validate entire form (usually called on submit)
    const validateForm = (): boolean => {
      setHasSubmitted(true);
      const results = validator.validate(formData);
      setValidationResults(results);
      return validator.isFormValid(results);
    };
  
    // Get error message for a field
    const getFieldError = (fieldName: string): string | null => {
      const result = validationResults[fieldName];
      return result && !result.isValid ? result.errors[0] : null;
    };
  
    // Check if field has error
    const hasFieldError = (fieldName: string): boolean => {
      const result = validationResults[fieldName];
      return result ? !result.isValid : false;
    };
  
    // Reset validation state
    const resetValidation = () => {
      setValidationResults({});
      setHasSubmitted(false);
    };
  
    return {
      formData,
      updateField,
      validateForm,
      getFieldError,
      hasFieldError,
      resetValidation,
      isFormValid: validator.isFormValid(validationResults),
    };
  };
  
  // React import for the hook
  import React from 'react';