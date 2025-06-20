import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppStateContext = createContext(null);

export const AppStateProvider = ({ children }) => {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.clear();
    AsyncStorage.getItem('hasOnboarded').then(value => {
      setHasOnboarded(value === 'true');
      setLoading(false);
    });
  }, []);

  const setOnboarded = () => {
    setHasOnboarded(true);
  };

  return (
    <AppStateContext.Provider value={{ hasOnboarded, setHasOnboarded: setOnboarded }}>
      {!loading && children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used inside AppStateProvider');
  return context;
};
