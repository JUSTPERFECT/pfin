// src/components/ui/Input.tsx
// Reusable Input component with validation and different types

import React, { useState, forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// ==========================================
// TYPES
// ==========================================

export type InputSize = 'small' | 'medium' | 'large';
export type InputType = 'text' | 'email' | 'password' | 'number' | 'currency';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  // Content
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  
  // Type and behavior
  type?: InputType;
  size?: InputSize;
  
  // Validation
  error?: string;
  required?: boolean;
  
  // State
  disabled?: boolean;
  
  // Styling
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  
  // Layout
  fullWidth?: boolean;
  
  // Icons or actions
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  
  // Currency specific
  currencySymbol?: string;
}

// ==========================================
// COMPONENT
// ==========================================

const Input = forwardRef<TextInput, InputProps>(({
  label,
  placeholder,
  value,
  onChangeText,
  type = 'text',
  size = 'medium',
  error,
  required = false,
  disabled = false,
  style,
  inputStyle,
  labelStyle,
  fullWidth = true,
  leftIcon,
  rightIcon,
  onRightIconPress,
  currencySymbol = '₹',
  ...rest
}, ref) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ==========================================
  // INPUT TYPE CONFIGURATIONS
  // ==========================================
  
  const getInputConfig = () => {
    const configs = {
      text: {
        keyboardType: 'default' as const,
        autoCapitalize: 'sentences' as const,
        secureTextEntry: false,
      },
      email: {
        keyboardType: 'email-address' as const,
        autoCapitalize: 'none' as const,
        autoCorrect: false,
        secureTextEntry: false,
      },
      password: {
        keyboardType: 'default' as const,
        autoCapitalize: 'none' as const,
        secureTextEntry: !showPassword,
      },
      number: {
        keyboardType: 'numeric' as const,
        autoCapitalize: 'none' as const,
        secureTextEntry: false,
      },
      currency: {
        keyboardType: 'numeric' as const,
        autoCapitalize: 'none' as const,
        secureTextEntry: false,
      },
    };

    return configs[type];
  };

  // ==========================================
  // SIZE STYLES
  // ==========================================
  
  const getSizeStyles = () => {
    const sizes = {
      small: {
        container: {
          minHeight: 32,
        },
        input: {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          fontSize: theme.fontSize.sm,
        },
        label: {
          fontSize: theme.fontSize.xs,
          marginBottom: theme.spacing.xs / 2,
        },
      },
      medium: {
        container: {
          minHeight: 44,
        },
        input: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          fontSize: theme.fontSize.md,
        },
        label: {
          fontSize: theme.fontSize.sm,
          marginBottom: theme.spacing.xs,
        },
      },
      large: {
        container: {
          minHeight: 52,
        },
        input: {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          fontSize: theme.fontSize.lg,
        },
        label: {
          fontSize: theme.fontSize.md,
          marginBottom: theme.spacing.sm,
        },
      },
    };

    return sizes[size];
  };

  // ==========================================
  // COMPUTED STYLES
  // ==========================================
  
  const sizeStyles = getSizeStyles();
  const inputConfig = getInputConfig();
  const hasError = Boolean(error);
  
  // Container styles
  const containerStyle: ViewStyle = [
    styles.container,
    fullWidth && styles.fullWidth,
    style,
  ].filter(Boolean) as ViewStyle;

  // Input container styles
  const inputContainerStyle: ViewStyle = [
    styles.inputContainer,
    sizeStyles.container,
    {
      borderColor: hasError 
        ? theme.colors.error 
        : isFocused 
          ? theme.colors.mint 
          : theme.colors.border,
      borderWidth: isFocused ? 2 : 1,
      borderRadius: theme.borderRadius.input,
      backgroundColor: disabled ? theme.colors.background : theme.colors.surface,
    },
    disabled && styles.disabled,
  ].filter(Boolean) as ViewStyle;

  // Input text styles
  const textInputStyle: TextStyle = [
    styles.textInput,
    sizeStyles.input,
    {
      color: theme.colors.text,
    },
    disabled && { color: theme.colors.textSecondary },
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
    type === 'currency' && styles.inputWithCurrency,
    inputStyle,
  ].filter(Boolean) as TextStyle;

  // Label styles
  const labelTextStyle: TextStyle = [
    styles.label,
    sizeStyles.label,
    {
      color: theme.colors.text,
    },
    required && styles.requiredLabel,
    labelStyle,
  ].filter(Boolean) as TextStyle;

  // Required asterisk styles
  const asteriskStyle: TextStyle = {
    color: theme.colors.error,
  };

  // ==========================================
  // HANDLERS
  // ==========================================
  
  const handleChangeText = (text: string) => {
    if (type === 'currency') {
      // Remove non-numeric characters except decimal point
      const cleanText = text.replace(/[^0-9.]/g, '');
      // Ensure only one decimal point
      const parts = cleanText.split('.');
      const formattedText = parts.length > 2 
        ? `${parts[0]}.${parts.slice(1).join('')}`
        : cleanText;
      onChangeText(formattedText);
    } else {
      onChangeText(text);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ==========================================
  // RENDER HELPERS
  // ==========================================
  
  const renderLabel = () => {
    if (!label) return null;
    
    return (
      <Text style={labelTextStyle}>
        {label}
        {required && <Text style={asteriskStyle}> *</Text>}
      </Text>
    );
  };

  const renderError = () => {
    if (!error) return null;
    
    return (
      <Text style={[styles.errorText, { color: theme.colors.error }]}>
        {error}
      </Text>
    );
  };

  const renderPasswordToggle = () => {
    if (type !== 'password') return null;
    
    return (
      <TouchableOpacity
        style={styles.passwordToggle}
        onPress={togglePasswordVisibility}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.passwordToggleText, { color: theme.colors.textSecondary }]}>
          {showPassword ? 'Hide' : 'Show'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCurrencySymbol = () => {
    if (type !== 'currency') return null;
    
    return (
      <Text style={[styles.currencySymbol, { color: theme.colors.textSecondary }]}>
        {currencySymbol}
      </Text>
    );
  };

  // ==========================================
  // RENDER
  // ==========================================
  
  return (
    <View style={containerStyle}>
      {renderLabel()}
      
      <View style={inputContainerStyle}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        {renderCurrencySymbol()}
        
        <TextInput
          ref={ref}
          style={textInputStyle}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          editable={!disabled}
          {...inputConfig}
          {...rest}
        />
        
        {type === 'password' && renderPasswordToggle()}
        
        {rightIcon && type !== 'password' && (
          <TouchableOpacity 
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {renderError()}
    </View>
  );
});

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    marginBottom: 4, // Small margin for error text
  },
  fullWidth: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  inputWithCurrency: {
    paddingLeft: 8,
  },
  label: {
    fontWeight: '500',
  },
  requiredLabel: {
    // Additional styles for required labels if needed
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  leftIconContainer: {
    paddingLeft: 12,
    paddingRight: 8,
    justifyContent: 'center',
  },
  rightIconContainer: {
    paddingRight: 12,
    paddingLeft: 8,
    justifyContent: 'center',
  },
  passwordToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  passwordToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  currencySymbol: {
    paddingLeft: 12,
    paddingRight: 4,
    fontSize: 16,
    fontWeight: '500',
  },
});

// Add display name for debugging
Input.displayName = 'Input';

// ==========================================
// EXPORT
// ==========================================

export default Input;