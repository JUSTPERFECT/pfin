// src/navigation/AppNavigator.tsx
// Main navigation structure for the app

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { HomeScreen, AddTransactionScreen } from '../screens';
import type { RootStackParamList, MainTabParamList } from '../types';

// ==========================================
// NAVIGATOR INSTANCES
// ==========================================

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// ==========================================
// PLACEHOLDER SCREENS
// ==========================================

const PlaceholderScreen = ({ route }: any) => {
  const { theme } = useTheme();
  
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: 20,
    }}>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 8,
      }}>
        {route.name}
      </Text>
      <Text style={{
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
      }}>
        Coming soon...
      </Text>
    </View>
  );
};

// ==========================================
// TAB ICON COMPONENT
// ==========================================

interface TabIconProps {
  name: string;
  color: string;
  size: number;
}

const TabIcon: React.FC<TabIconProps> = ({ name, color, size }) => {
  return (
    <Text style={{ fontSize: size, color }}>
      {name}
    </Text>
  );
};

// ==========================================
// TAB NAVIGATOR
// ==========================================

function MainTabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="🏠" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Transactions" 
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Transactions',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="📊" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Budget" 
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Budget',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="💰" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="👤" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ==========================================
// STACK NAVIGATOR (MAIN APP)
// ==========================================

export function AppNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      {/* Main Tab Navigator */}
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Modal/Overlay Screens */}
      <Stack.Screen 
        name="AddTransaction" 
        component={AddTransactionScreen}
        options={({ route }) => ({
          title: route.params?.editId ? 'Edit Transaction' : 'Add Transaction',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerLeft: () => null,
        })}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;