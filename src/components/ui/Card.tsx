// src/components/ui/Card.tsx
// Reusable Card component for displaying content with elevation

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// ==========================================
// TYPES
// ==========================================

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'flat';
export type CardPadding = 'none' | 'small' | 'medium' | 'large';

export interface CardProps {
  // Content
  children: React.ReactNode;
  
  // Appearance
  variant?: CardVariant;
  padding?: CardPadding;
  
  // Interaction
  onPress?: () => void;
  disabled?: boolean;
  
  // Styling
  style?: ViewStyle;
  backgroundColor?: string;
  
  // Layout
  fullWidth?: boolean;
  
  // TouchableOpacity props (when onPress is provided)
  touchableProps?: Omit<TouchableOpacityProps, 'style' | 'onPress' | 'disabled'>;
}

// ==========================================
// COMPONENT
// ==========================================

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  onPress,
  disabled = false,
  style,
  backgroundColor,
  fullWidth = false,
  touchableProps,
}) => {
  const { theme } = useTheme();

  // ==========================================
  // VARIANT STYLES
  // ==========================================
  
  const getVariantStyles = (): ViewStyle => {
    const variants = {
      default: {
        backgroundColor: backgroundColor || theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.small,
      },
      elevated: {
        backgroundColor: backgroundColor || theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.medium,
      },
      outlined: {
        backgroundColor: backgroundColor || theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowOpacity: 0,
        elevation: 0,
      },
      flat: {
        backgroundColor: backgroundColor || theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        shadowOpacity: 0,
        elevation: 0,
      },
    };

    return variants[variant];
  };

  // ==========================================
  // PADDING STYLES
  // ==========================================
  
  const getPaddingStyles = (): ViewStyle => {
    const paddings = {
      none: {
        padding: 0,
      },
      small: {
        padding: theme.spacing.sm,
      },
      medium: {
        padding: theme.spacing.md,
      },
      large: {
        padding: theme.spacing.lg,
      },
    };

    return paddings[padding];
  };

  // ==========================================
  // COMPUTED STYLES
  // ==========================================
  
  const variantStyles = getVariantStyles();
  const paddingStyles = getPaddingStyles();
  
  const containerStyle: ViewStyle = [
    styles.baseCard,
    variantStyles,
    paddingStyles,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle;

  // ==========================================
  // RENDER
  // ==========================================
  
  // If onPress is provided, render as TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.8}
        {...touchableProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // Otherwise, render as regular View
  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
};

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  baseCard: {
    // Base styles that apply to all cards
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
});

// ==========================================
// EXPORT
// ==========================================

export default Card;