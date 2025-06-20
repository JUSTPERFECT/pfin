import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import FeaturesScreen from '../screens/onboarding/FeaturesScreen';
import SetupBudgetScreen from '../screens/onboarding/SetupBudgetScreen';
import DoneScreen from '../screens/onboarding/DoneScreen';

const Stack = createNativeStackNavigator();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Features" component={FeaturesScreen} />
      <Stack.Screen name="SetupBudget" component={SetupBudgetScreen} />
      <Stack.Screen name="Done" component={DoneScreen} />
    </Stack.Navigator>
  );
}