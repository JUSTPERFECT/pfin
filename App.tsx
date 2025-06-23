// App.tsx
// Main App component - entry point of the application

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/NavigationHelpers';

// ==========================================
// APP CONTENT (INSIDE THEME PROVIDER)
// ==========================================

function AppContent() {
  const { theme, isDarkMode } = useTheme();

  return (
    <>
      {/* Status bar configuration */}
      <StatusBar 
        style={isDarkMode ? 'light' : 'dark'} 
        backgroundColor={theme.colors.background}
      />
      
      {/* Navigation */}
      <NavigationContainer 
        ref={navigationRef}
        theme={{
          dark: isDarkMode,
          colors: {
            primary: theme.colors.mint,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.text,
            border: theme.colors.border,
            notification: theme.colors.mint,
          },
        }}
      >
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}