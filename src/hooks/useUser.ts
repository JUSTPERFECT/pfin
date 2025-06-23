// src/hooks/useUser.ts
// Custom hooks for user and settings management

import { useState, useEffect, useCallback } from 'react';
import { UserStorage, SettingsStorage } from '../services';
import type { User, UserSettings } from '../types';

// ==========================================
// USER HOOKS
// ==========================================

/**
 * Hook for managing user data
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data
  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await UserStorage.get();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save user data
  const saveUser = useCallback(async (
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> => {
    try {
      setError(null);
      const savedUser = await UserStorage.save(userData);
      setUser(savedUser);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
      return false;
    }
  }, []);

  // Update user data
  const updateUser = useCallback(async (
    updates: Partial<Omit<User, 'id' | 'createdAt'>>
  ): Promise<boolean> => {
    try {
      setError(null);
      const updatedUser = await UserStorage.update(updates);
      setUser(updatedUser);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      return false;
    }
  }, []);

  // Delete user (logout)
  const deleteUser = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      await UserStorage.delete();
      setUser(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      return false;
    }
  }, []);

  // Check if user exists
  const checkUserExists = useCallback(async (): Promise<boolean> => {
    try {
      return await UserStorage.exists();
    } catch (err) {
      return false;
    }
  }, []);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    // Data
    user,
    
    // State
    loading,
    error,
    isLoggedIn: Boolean(user),
    
    // Actions
    saveUser,
    updateUser,
    deleteUser,
    checkUserExists,
    refresh: loadUser,
  };
}

// ==========================================
// SETTINGS HOOKS
// ==========================================

/**
 * Hook for managing user settings
 */
export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    currency: 'INR',
    defaultTransactionType: 'expense',
    budgetNotifications: true,
    darkMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userSettings = await SettingsStorage.get();
      setSettings(userSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save all settings
  const saveSettings = useCallback(async (newSettings: UserSettings): Promise<boolean> => {
    try {
      setError(null);
      await SettingsStorage.save(newSettings);
      setSettings(newSettings);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      return false;
    }
  }, []);

  // Update specific setting
  const updateSetting = useCallback(async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ): Promise<boolean> => {
    try {
      setError(null);
      const updatedSettings = await SettingsStorage.update(key, value);
      setSettings(updatedSettings);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update ${key}`);
      return false;
    }
  }, []);

  // Reset to defaults
  const resetSettings = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const defaultSettings = await SettingsStorage.reset();
      setSettings(defaultSettings);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
      return false;
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    // Data
    settings,
    
    // State
    loading,
    error,
    
    // Actions
    saveSettings,
    updateSetting,
    resetSettings,
    refresh: loadSettings,
    
    // Convenient getters
    currency: settings.currency,
    defaultTransactionType: settings.defaultTransactionType,
    budgetNotifications: settings.budgetNotifications,
    darkMode: settings.darkMode,
  };
}

/**
 * Hook for currency-specific operations
 */
export function useCurrency() {
  const { settings, updateSetting } = useSettings();

  const setCurrency = useCallback(async (currency: string): Promise<boolean> => {
    return await updateSetting('currency', currency);
  }, [updateSetting]);

  return {
    currency: settings.currency,
    setCurrency,
  };
}

/**
 * Hook for dark mode toggle
 */
export function useDarkMode() {
  const { settings, updateSetting } = useSettings();

  const toggleDarkMode = useCallback(async (): Promise<boolean> => {
    return await updateSetting('darkMode', !settings.darkMode);
  }, [settings.darkMode, updateSetting]);

  const setDarkMode = useCallback(async (enabled: boolean): Promise<boolean> => {
    return await updateSetting('darkMode', enabled);
  }, [updateSetting]);

  return {
    darkMode: settings.darkMode,
    toggleDarkMode,
    setDarkMode,
  };
}

/**
 * Hook for notification settings
 */
export function useNotificationSettings() {
  const { settings, updateSetting } = useSettings();

  const toggleBudgetNotifications = useCallback(async (): Promise<boolean> => {
    return await updateSetting('budgetNotifications', !settings.budgetNotifications);
  }, [settings.budgetNotifications, updateSetting]);

  const setBudgetNotifications = useCallback(async (enabled: boolean): Promise<boolean> => {
    return await updateSetting('budgetNotifications', enabled);
  }, [updateSetting]);

  return {
    budgetNotifications: settings.budgetNotifications,
    toggleBudgetNotifications,
    setBudgetNotifications,
  };
}

// ==========================================
// COMBINED HOOKS
// ==========================================

/**
 * Hook that combines user and settings for onboarding/setup
 */
export function useUserSetup() {
  const userHook = useUser();
  const settingsHook = useSettings();

  const setupUser = useCallback(async (userData: {
    name: string;
    email: string;
    currency: string;
  }): Promise<boolean> => {
    try {
      // Save user data
      const userSaved = await userHook.saveUser({
        name: userData.name,
        email: userData.email,
        currency: userData.currency,
      });

      if (!userSaved) {
        return false;
      }

      // Update settings with user's currency preference
      const settingsUpdated = await settingsHook.updateSetting('currency', userData.currency);
      
      return settingsUpdated;
    } catch (err) {
      console.error('Failed to setup user:', err);
      return false;
    }
  }, [userHook, settingsHook]);

  const isSetupComplete = useCallback((): boolean => {
    return Boolean(userHook.user && !userHook.loading && !settingsHook.loading);
  }, [userHook.user, userHook.loading, settingsHook.loading]);

  return {
    // User data
    user: userHook.user,
    settings: settingsHook.settings,
    
    // Loading states
    userLoading: userHook.loading,
    settingsLoading: settingsHook.loading,
    loading: userHook.loading || settingsHook.loading,
    
    // Error states
    userError: userHook.error,
    settingsError: settingsHook.error,
    error: userHook.error || settingsHook.error,
    
    // Setup actions
    setupUser,
    isSetupComplete,
    
    // Individual hooks for advanced usage
    userHook,
    settingsHook,
  };
}