// src/types/navigation.ts

// Define the root stack parameter list
export type RootStackParamList = {
  // Onboarding flow
  Welcome: undefined;
  Features: undefined;
  SetupBudget: undefined;
  Done: undefined;
  
  // Main tab navigation
  MainTabs: undefined;
  
  // Individual tab screens
  Home: undefined;
  Calendar: undefined;
  Insights: undefined;
  Settings: undefined;
};

// Define the main tab parameter list
export type MainTabParamList = {
  Home: undefined;
  Insights: undefined;
  Calendar: undefined;
  Settings: undefined;
};

// Define the onboarding stack parameter list
export type OnboardingStackParamList = {
  Welcome: undefined;
  SetupBudget: undefined;
  Done: undefined;
};

// Re-export navigation types from React Navigation
export type { NavigationProp, RouteProp } from '@react-navigation/native';

// Create typed navigation hooks
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

// Typed navigation hook for the root stack
export const useRootNavigation = () => {
  return useNavigation<NavigationProp<RootStackParamList>>();
};

// Typed navigation hook for main tabs
export const useMainTabNavigation = () => {
  return useNavigation<NavigationProp<MainTabParamList>>();
};

// Typed navigation hook for onboarding
export const useOnboardingNavigation = () => {
  return useNavigation<NavigationProp<OnboardingStackParamList>>();
};

// Typed route hooks
export const useRootRoute = <T extends keyof RootStackParamList>() => {
  return useRoute<RouteProp<RootStackParamList, T>>();
};

export const useMainTabRoute = <T extends keyof MainTabParamList>() => {
  return useRoute<RouteProp<MainTabParamList, T>>();
};

export const useOnboardingRoute = <T extends keyof OnboardingStackParamList>() => {
  return useRoute<RouteProp<OnboardingStackParamList, T>>();
};