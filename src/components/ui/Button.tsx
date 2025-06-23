// src/components/ui/Button.tsx
// Reusable Button component with multiple variants and sizes

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// ==========================================
// TYPES
// ==========================================

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  // Content
  children: React.ReactNode;
  
  // Appearance
  variant?: ButtonVariant;
  size?: ButtonSize;
  
  // State
  loading?: boolean;
  disabled?: boolean;
  
  // Styling
  style?: ViewStyle;
  textStyle?: TextStyle;
  
  // Custom colors (override theme)
  backgroundColor?: string;
  textColor?: string;
  
  // Layout
  fullWidth?: boolean;
}

// ==========================================
// COMPONENT
// ==========================================

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  backgroundColor,
  textColor,
  fullWidth = false,
  onPress,
  ...rest
}) => {
  const { theme } = useTheme();

  // ==========================================
  // VARIANT STYLES
  // ==========================================
  
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    const variants = {
      primary: {
        container: {
          backgroundColor: backgroundColor || theme.colors.mint,
          borderWidth: 0,
        },
        text: {
          color: textColor || theme.colors.dark,
          fontWeight: theme.fontWeight.semibold,
        },
      },
      secondary: {
        container: {
          backgroundColor: backgroundColor || theme.colors.softMint,
          borderWidth: 0,
        },
        text: {
          color: textColor || theme.colors.dark,
          fontWeight: theme.fontWeight.semibold,
        },
      },
      accent: {
        container: {
          backgroundColor: backgroundColor || theme.colors.accent,
          borderWidth: 0,
        },
        text: {
          color: textColor || theme.colors.dark,
          fontWeight: theme.fontWeight.semibold,
        },
      },
      outline: {
        container: {
          backgroundColor: backgroundColor || 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.mint,
        },
        text: {
          color: textColor || theme.colors.mint,
          fontWeight: theme.fontWeight.medium,
        },
      },
      ghost: {
        container: {
          backgroundColor: backgroundColor || 'transparent',
          borderWidth: 0,
        },
        text: {
          color: textColor || theme.colors.mint,
          fontWeight: theme.fontWeight.medium,
        },
      },
      danger: {
        container: {
          backgroundColor: backgroundColor || theme.colors.error,
          borderWidth: 0,
        },
        text: {
          color: textColor || theme.colors.surface,
          fontWeight: theme.fontWeight.semibold,
        },
      },
    };

    return variants[variant];
  };

  // ==========================================
  // SIZE STYLES
  // ==========================================
  
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    const sizes = {
      small: {
        container: {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          minHeight: 32,
          borderRadius: theme.borderRadius.sm,
        },
        text: {
          fontSize: theme.fontSize.sm,
        },
      },
      medium: {
        container: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          minHeight: 44,
          borderRadius: theme.borderRadius.md,
        },
        text: {
          fontSize: theme.fontSize.md,
        },
      },
      large: {
        container: {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          minHeight: 52,
          borderRadius: theme.borderRadius.lg,
        },
        text: {
          fontSize: theme.fontSize.lg,
        },
      },
    };

    return sizes[size];
  };

  // ==========================================
  // COMPUTED STYLES
  // ==========================================
  
  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  
  const isDisabled = disabled || loading;
  
  const containerStyle: ViewStyle = [
    styles.baseContainer,
    sizeStyles.container,
    variantStyles.container,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle;

  const textStyleComputed: TextStyle = [
    styles.baseText,
    sizeStyles.text,
    variantStyles.text,
    isDisabled && styles.disabledText,
    textStyle,
  ].filter(Boolean) as TextStyle;

  // ==========================================
  // LOADING INDICATOR COLOR
  // ==========================================
  
  const getLoadingColor = (): string => {
    if (variant === 'outline' || variant === 'ghost') {
      return theme.colors.mint;
    }
    if (variant === 'danger') {
      return theme.colors.surface;
    }
    return theme.colors.dark;
  };

  // ==========================================
  // RENDER
  // ==========================================
  
  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getLoadingColor()} 
          style={styles.loadingIndicator}
        />
      ) : (
        <Text style={textStyleComputed}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  baseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  baseText: {
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
  loadingIndicator: {
    // You could add margin here if you want text alongside loading
  },
});

// ==========================================
// EXPORT
// ==========================================

export default Button;