// src/navigation/AppNavigator.tsx
// Main navigation structure for the app

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { HomeScreen, AddTransactionScreen, CalendarScreen, UserSetupScreen } from '../screens';
import type { RootStackParamList, MainTabParamList } from '../types';
import { NavigationHelpers } from './NavigationHelpers';

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

// A component that renders nothing, used for the "Add" tab button.
const NullScreen = () => null;

function MainTabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.mint,
        tabBarInactiveTintColor: theme.colors.gray,
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          height: 70,
          ...theme.shadows.fab,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: -5,
          marginBottom: 10,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📅</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Add"
        component={NullScreen}
        options={{
          tabBarButton: () => (
            <TouchableOpacity
              onPress={() => NavigationHelpers.addTransaction()}
              style={{
                top: -25,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: theme.colors.mint,
                justifyContent: 'center',
                alignItems: 'center',
                ...theme.shadows.fab,
              }}>
                <Text style={{ color: theme.colors.dark, fontSize: 35 }}>+</Text>
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⚙️</Text>
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
      
      <Stack.Screen 
        name="UserSetup" 
        component={UserSetupScreen}
        options={{
          title: 'Setup Profile',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerLeft: () => null,
        }}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;