export interface UserSettings {
    monthlyBudget: number;
    currency: string;
  }
  
  export const validateUserSettings = (settings: Partial<UserSettings>): string | null => {
    if (!settings.monthlyBudget || settings.monthlyBudget <= 0) {
      return 'Budget must be greater than 0';
    }
    if (!settings.currency || settings.currency.trim().length === 0) {
      return 'Currency is required';
    }
    return null;
  };