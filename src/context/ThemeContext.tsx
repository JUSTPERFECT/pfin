// src/context/ThemeContext.tsx
// React context for theme management with dark mode support

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme, lightTheme, darkTheme, Theme } from '../theme';
import { STORAGE_KEYS } from '../constants';

// ==========================================
// TYPES
// ==========================================

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  // Current theme object
  theme: Theme;
  
  // Theme mode
  themeMode: ThemeMode;
  
  // Whether dark mode is active
  isDarkMode: boolean;
  
  // Functions to change theme
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  
  // Loading state
  isLoading: boolean;
}

// ==========================================
// CONTEXT
// ==========================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ==========================================
// PROVIDER COMPONENT
// ==========================================

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  const [isLoading, setIsLoading] = useState(true);

  // Determine if dark mode should be active
  const isDarkMode = 
    themeMode === 'dark' || 
    (themeMode === 'system' && systemColorScheme === 'dark');

  // Get current theme based on dark mode state
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // ==========================================
  // LOAD SAVED THEME MODE
  // ==========================================

  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (savedMode) {
          const settings = JSON.parse(savedMode);
          if (settings.themeMode) {
            setThemeModeState(settings.themeMode);
          }
        }
      } catch (error) {
        console.error('Failed to load theme mode:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeMode();
  }, []);

  // ==========================================
  // LISTEN TO SYSTEM THEME CHANGES
  // ==========================================

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  // ==========================================
  // SAVE THEME MODE
  // ==========================================

  const saveThemeMode = async (mode: ThemeMode) => {
    try {
      // Get existing settings
      const existingSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      const settings = existingSettings ? JSON.parse(existingSettings) : {};
      
      // Update theme mode
      settings.themeMode = mode;
      
      // Save back to storage
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  // ==========================================
  // THEME MODE FUNCTIONS
  // ==========================================

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    saveThemeMode(mode);
  };

  const toggleTheme = () => {
    if (themeMode === 'system') {
      // If currently on system, toggle to opposite of current system theme
      setThemeMode(systemColorScheme === 'dark' ? 'light' : 'dark');
    } else {
      // Toggle between light and dark
      setThemeMode(themeMode === 'light' ? 'dark' : 'light');
    }
  };

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const contextValue: ThemeContextType = {
    theme: currentTheme,
    themeMode,
    isDarkMode,
    setThemeMode,
    toggleTheme,
    isLoading,
  };

  // Show loading state while theme is being loaded
  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// ==========================================
// HOOK TO USE THEME
// ==========================================

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// ==========================================
// ADDITIONAL HOOKS
// ==========================================

// Hook to get just the theme object (most common use case)
export function useThemeColors() {
  const { theme } = useTheme();
  return theme.colors;
}

// Hook to get spacing values
export function useThemeSpacing() {
  const { theme } = useTheme();
  return theme.spacing;
}

// Hook to get component styles
export function useComponentStyles() {
  const { theme } = useTheme();
  return {
    button: theme.shadows, // You can expand this
    card: theme.shadows,
    // Add more component styles as needed
  };
}

// Hook to check if dark mode is active
export function useIsDarkMode(): boolean {
  const { isDarkMode } = useTheme();
  return isDarkMode;
}

// ==========================================
// UTILITY HOOKS
// ==========================================

// Hook to create styles that depend on theme
export function useThemedStyles<T>(
  createStyles: (theme: Theme) => T
): T {
  const { theme } = useTheme();
  return React.useMemo(() => createStyles(theme), [theme, createStyles]);
}

// Example usage of useThemedStyles:
// const styles = useThemedStyles((theme) => StyleSheet.create({
//   container: {
//     backgroundColor: theme.colors.background,
//     padding: theme.spacing.md,
//   },
// }));

export default ThemeProvider;