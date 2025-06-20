import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppStateContext = createContext(null);

export const AppStateProvider = ({ children }) => {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // TEMPORARY: Force clear storage to test onboarding
        await AsyncStorage.clear();
        console.log('🗑️ Cleared storage - forcing onboarding');
        
        const value = await AsyncStorage.getItem('hasOnboarded');
        setHasOnboarded(value === 'true');
        console.log('📱 hasOnboarded:', value === 'true');
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const setOnboarded = async (value) => {
    console.log('✅ Setting hasOnboarded to:', value);
    setHasOnboarded(value);
    try {
      await AsyncStorage.setItem('hasOnboarded', value.toString());
      console.log('💾 Saved hasOnboarded to storage');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  if (loading) return null;

  console.log('🔄 Rendering app with hasOnboarded:', hasOnboarded);

  return (
    <AppStateContext.Provider value={{ hasOnboarded, setHasOnboarded: setOnboarded }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used inside AppStateProvider');
  return context;
};