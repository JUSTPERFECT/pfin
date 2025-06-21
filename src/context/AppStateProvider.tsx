import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppStateContextType {
  hasOnboarded: boolean;
  setHasOnboarded: (value: boolean) => void;
  isLoading: boolean;
  error: string | null;
}

interface AppStateProviderProps {
  children: ReactNode;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

// Storage keys - centralized for easier maintenance
const STORAGE_KEYS = {
  HAS_ONBOARDED: 'hasOnboarded',
} as const;

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setError(null);
        
        // TEMPORARY: Force clear storage to test onboarding
        // Remove this in production
        if (__DEV__) {
          await AsyncStorage.clear();
          console.log('🗑️ [DEV] Cleared storage - forcing onboarding');
        }
        
        const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED);
        const hasCompletedOnboarding = value === 'true';
        
        setHasOnboarded(hasCompletedOnboarding);
        
        if (__DEV__) {
          console.log('📱 hasOnboarded:', hasCompletedOnboarding);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('❌ App initialization error:', err);
        
        // Fallback to default state on error
        setHasOnboarded(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const updateOnboardingStatus = async (value: boolean) => {
    try {
      setError(null);
      
      if (__DEV__) {
        console.log('✅ Setting hasOnboarded to:', value);
      }
      
      // Update state immediately for better UX
      setHasOnboarded(value);
      
      // Persist to storage
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, value.toString());
      
      if (__DEV__) {
        console.log('💾 Saved hasOnboarded to storage');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save onboarding status';
      setError(errorMessage);
      console.error('❌ Save error:', err);
      
      // Revert state on save failure
      setHasOnboarded(!value);
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    hasOnboarded,
    setHasOnboarded: updateOnboardingStatus,
    isLoading,
    error,
  }), [hasOnboarded, isLoading, error]);

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D61" />
      </View>
    );
  }

  // Show error state (optional - you might want to handle this differently)
  if (error) {
    console.warn('App running with error state:', error);
    // Continue rendering but log the error
    // In production, you might want to show an error screen or retry button
  }

  if (__DEV__) {
    console.log('🔄 Rendering app with hasOnboarded:', hasOnboarded);
  }

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  
  return context;
};

// Optional: Export hook for checking if user has onboarded
export const useHasOnboarded = (): boolean => {
  const { hasOnboarded } = useAppState();
  return hasOnboarded;
};

// Optional: Export hook for onboarding actions
export const useOnboardingActions = () => {
  const { setHasOnboarded } = useAppState();
  
  const completeOnboarding = () => setHasOnboarded(true);
  const resetOnboarding = () => setHasOnboarded(false);
  
  return { completeOnboarding, resetOnboarding };
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3FFF7',
  },
});