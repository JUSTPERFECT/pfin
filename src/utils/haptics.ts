// src/utils/haptics.ts
import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utilities for better user experience
 * Provides consistent haptic feedback across the app
 */

export const HapticFeedback = {
  // Light impact - for button taps, selections
  light: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics might not be available on all devices
      console.log('Haptic feedback not available:', error);
    }
  },

  // Medium impact - for swipe actions, toggles
  medium: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  },

  // Heavy impact - for important actions, confirmations
  heavy: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  },

  // Success feedback - for successful operations
  success: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  },

  // Warning feedback - for warnings, alerts
  warning: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  },

  // Error feedback - for errors, failed operations
  error: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  },

  // Selection feedback - for picker selections
  selection: async () => {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.log('Haptic feedback not available:', error);
    }
  },
};

/**
 * Enhanced TouchableOpacity with haptic feedback
 */
import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface HapticTouchableOpacityProps extends TouchableOpacityProps {
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';
  disabled?: boolean;
}

export const HapticTouchableOpacity: React.FC<HapticTouchableOpacityProps> = ({
  onPress,
  hapticType = 'light',
  disabled,
  children,
  ...props
}) => {
  const handlePress = async (event: any) => {
    if (!disabled) {
      // Trigger haptic feedback
      await HapticFeedback[hapticType]();
      
      // Call original onPress handler
      if (onPress) {
        onPress(event);
      }
    }
  };

  return (
    <TouchableOpacity
      {...props}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : (props.activeOpacity || 0.7)}
    >
      {children}
    </TouchableOpacity>
  );
};

/**
 * Haptic feedback for specific actions
 */
export const ActionHaptics = {
  // Money-related actions
  addExpense: () => HapticFeedback.medium(),
  addIncome: () => HapticFeedback.success(),
  deleteTransaction: () => HapticFeedback.heavy(),
  
  // Navigation
  tabSwitch: () => HapticFeedback.light(),
  buttonTap: () => HapticFeedback.light(),
  
  // Form interactions
  formSubmit: () => HapticFeedback.medium(),
  formError: () => HapticFeedback.error(),
  formSuccess: () => HapticFeedback.success(),
  
  // UI interactions
  toggle: () => HapticFeedback.selection(),
  swipeAction: () => HapticFeedback.medium(),
  longPress: () => HapticFeedback.heavy(),
  
  // Budget alerts
  budgetWarning: () => HapticFeedback.warning(),
  budgetExceeded: () => HapticFeedback.error(),
  goalAchieved: () => HapticFeedback.success(),
  
  // Camera/scanning
  photoCapture: () => HapticFeedback.heavy(),
  scanSuccess: () => HapticFeedback.success(),
  scanFailure: () => HapticFeedback.error(),
};

/**
 * Hook for haptic feedback in functional components
 */
export const useHaptics = () => {
  const triggerHaptic = React.useCallback((type: keyof typeof HapticFeedback) => {
    HapticFeedback[type]();
  }, []);

  const triggerActionHaptic = React.useCallback((action: keyof typeof ActionHaptics) => {
    ActionHaptics[action]();
  }, []);

  return {
    triggerHaptic,
    triggerActionHaptic,
    haptics: HapticFeedback,
    actions: ActionHaptics,
  };
};

/**
 * Haptic feedback for pull-to-refresh
 */
export const RefreshHaptics = {
  start: () => HapticFeedback.light(),
  complete: () => HapticFeedback.success(),
  error: () => HapticFeedback.error(),
};