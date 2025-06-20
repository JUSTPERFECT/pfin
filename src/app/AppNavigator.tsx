import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAppState } from '../context/AppStateProvider';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainTabNavigator } from '../navigation/MainTabNavigator';

export function AppNavigator() {
  const { hasOnboarded } = useAppState();

  return (
    <NavigationContainer>
      {hasOnboarded ? <MainTabNavigator /> : <OnboardingNavigator />}
    </NavigationContainer>
  );
}