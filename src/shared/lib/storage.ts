import AsyncStorage from '@react-native-async-storage/async-storage';
import { ERROR_MESSAGES } from '../constants/errors';

export class StorageService {
  private static readonly PREFIX = 'pfin_';

  private static getKey(key: string): string {
    return `${this.PREFIX}${key}`;
  }

  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await AsyncStorage.setItem(this.getKey(key), serializedValue);
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      throw new Error(ERROR_MESSAGES.STORAGE_SAVE_FAILED);
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(this.getKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      throw new Error(ERROR_MESSAGES.STORAGE_DELETE_FAILED);
    }
  }

  static async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pfinKeys = keys.filter(key => key.startsWith(this.PREFIX));
      await AsyncStorage.multiRemove(pfinKeys);
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw new Error(ERROR_MESSAGES.STORAGE_DELETE_FAILED);
    }
  }

  static async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys
        .filter(key => key.startsWith(this.PREFIX))
        .map(key => key.replace(this.PREFIX, ''));
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }

  static async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const prefixedKeys = keys.map(key => this.getKey(key));
      const keyValuePairs = await AsyncStorage.multiGet(prefixedKeys);
      
      const result: Record<string, T | null> = {};
      keyValuePairs.forEach(([key, value], index) => {
        const originalKey = keys[index];
        result[originalKey] = value ? JSON.parse(value) : null;
      });
      
      return result;
    } catch (error) {
      console.error('Failed to get multiple items:', error);
      return {};
    }
  }

  static async setMultiple<T>(items: Record<string, T>): Promise<void> {
    try {
      const keyValuePairs = Object.entries(items).map(([key, value]) => [
        this.getKey(key),
        JSON.stringify(value),
      ]);
      
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('Failed to set multiple items:', error);
      throw new Error(ERROR_MESSAGES.STORAGE_SAVE_FAILED);
    }
  }
}

// Storage keys constants
export const STORAGE_KEYS = {
  TRANSACTIONS: 'transactions',
  USER_SETTINGS: 'user_settings',
  USER_PROFILE: 'user_profile',
  BUDGETS: 'budgets',
  CATEGORIES: 'categories',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  APP_VERSION: 'app_version',
  THEME_PREFERENCE: 'theme_preference',
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;