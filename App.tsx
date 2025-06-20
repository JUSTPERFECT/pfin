import React from 'react';
import { AppStateProvider } from './src/context/AppStateProvider';
import { AppNavigator } from './src/app/AppNavigator';

export default function App() {
  return (
    <AppStateProvider>
      <AppNavigator />
    </AppStateProvider>
  );
}
