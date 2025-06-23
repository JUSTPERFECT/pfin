// src/theme/index.ts
// Centralized theme system for consistent styling

import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants';

// ==========================================
// THEME DEFINITION
// ==========================================

export const lightTheme = {
  colors: {
    // Primary colors
    primary: COLORS.primary,
    primaryDark: COLORS.primaryDark,
    primaryLight: COLORS.primaryLight,
    
    // Secondary colors
    secondary: COLORS.secondary,
    secondaryDark: COLORS.secondaryDark,
    secondaryLight: COLORS.secondaryLight,
    
    // Status colors
    success: COLORS.success,
    successDark: COLORS.successDark,
    successLight: COLORS.successLight,
    
    warning: COLORS.warning,
    warningDark: COLORS.warningDark,
    warningLight: COLORS.warningLight,
    
    error: COLORS.error,
    errorDark: COLORS.errorDark,
    errorLight: COLORS.errorLight,
    
    // Background colors
    background: COLORS.background,
    surface: COLORS.surface,
    
    // Text colors
    text: COLORS.text,
    textSecondary: COLORS.textSecondary,
    
    // Border colors
    border: COLORS.border,
    separator: COLORS.separator,
    
    // Input colors
    placeholder: COLORS.placeholder,
    
    // Transaction colors
    expense: COLORS.expense,
    income: COLORS.income,
    
    // Chart colors
    chart: COLORS.chart,
  },
  
  spacing: {
    xs: SPACING.xs,
    sm: SPACING.sm,
    md: SPACING.md,
    lg: SPACING.lg,
    xl: SPACING.xl,
    xxl: SPACING.xxl,
  },
  
  borderRadius: {
    sm: BORDER_RADIUS.sm,
    md: BORDER_RADIUS.md,
    lg: BORDER_RADIUS.lg,
    xl: BORDER_RADIUS.xl,
    round: BORDER_RADIUS.round,
  },
  
  fontSize: {
    xs: FONT_SIZE.xs,
    sm: FONT_SIZE.sm,
    md: FONT_SIZE.md,
    lg: FONT_SIZE.lg,
    xl: FONT_SIZE.xl,
    xxl: FONT_SIZE.xxl,
    xxxl: FONT_SIZE.xxxl,
  },
  
  fontWeight: {
    normal: FONT_WEIGHT.normal,
    medium: FONT_WEIGHT.medium,
    semibold: FONT_WEIGHT.semibold,
    bold: FONT_WEIGHT.bold,
  },
  
  // Shadow styles for elevation
  shadows: {
    small: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
} as const;

// Dark theme (for future implementation)
export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    // Override colors for dark mode
    background: COLORS.backgroundDark,
    surface: COLORS.surfaceDark,
    text: COLORS.textDark,
    textSecondary: COLORS.textSecondaryDark,
    border: COLORS.borderDark,
    separator: COLORS.separatorDark,
    placeholder: COLORS.placeholderDark,
  },
} as const;

// Default theme (light)
export const theme = lightTheme;
export type Theme = typeof lightTheme | typeof darkTheme;

// ==========================================
// COMPONENT STYLES
// ==========================================

// Common component style patterns
export const componentStyles = {
  // Button styles
  button: {
    base: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
    },
    
    sizes: {
      small: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        minHeight: 32,
      },
      medium: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: 52,
      },
    },
    
    variants: {
      primary: {
        backgroundColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: theme.colors.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    },
  },
  
  // Input styles
  input: {
    base: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
    },
    
    focused: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    
    error: {
      borderColor: theme.colors.error,
    },
    
    sizes: {
      small: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        fontSize: theme.fontSize.sm,
        minHeight: 32,
      },
      medium: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        fontSize: theme.fontSize.md,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        fontSize: theme.fontSize.lg,
        minHeight: 52,
      },
    },
  },
  
  // Card styles
  card: {
    base: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.small,
    },
    
    variants: {
      elevated: {
        ...theme.shadows.medium,
      },
      outlined: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowOpacity: 0,
        elevation: 0,
      },
    },
  },
  
  // Text styles
  text: {
    heading1: {
      fontSize: theme.fontSize.xxxl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      lineHeight: theme.fontSize.xxxl * 1.2,
    },
    
    heading2: {
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      lineHeight: theme.fontSize.xxl * 1.2,
    },
    
    heading3: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      lineHeight: theme.fontSize.xl * 1.2,
    },
    
    body: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.normal,
      color: theme.colors.text,
      lineHeight: theme.fontSize.md * 1.4,
    },
    
    caption: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.normal,
      color: theme.colors.textSecondary,
      lineHeight: theme.fontSize.sm * 1.3,
    },
    
    small: {
      fontSize: theme.fontSize.xs,
      fontWeight: theme.fontWeight.normal,
      color: theme.colors.textSecondary,
      lineHeight: theme.fontSize.xs * 1.3,
    },
  },
} as const;

// ==========================================
// LAYOUT STYLES
// ==========================================

export const layoutStyles = {
  // Container styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Safe area styles
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Screen padding
  screenPadding: {
    paddingHorizontal: theme.spacing.md,
  },
  
  // Section styles
  section: {
    marginBottom: theme.spacing.lg,
  },
  
  // Row layouts
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  
  rowBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  
  // Center layouts
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  // Flex layouts
  flex1: {
    flex: 1,
  },
  
  // Margin utilities
  marginTop: {
    xs: { marginTop: theme.spacing.xs },
    sm: { marginTop: theme.spacing.sm },
    md: { marginTop: theme.spacing.md },
    lg: { marginTop: theme.spacing.lg },
    xl: { marginTop: theme.spacing.xl },
  },
  
  marginBottom: {
    xs: { marginBottom: theme.spacing.xs },
    sm: { marginBottom: theme.spacing.sm },
    md: { marginBottom: theme.spacing.md },
    lg: { marginBottom: theme.spacing.lg },
    xl: { marginBottom: theme.spacing.xl },
  },
  
  // Padding utilities
  padding: {
    xs: { padding: theme.spacing.xs },
    sm: { padding: theme.spacing.sm },
    md: { padding: theme.spacing.md },
    lg: { padding: theme.spacing.lg },
    xl: { padding: theme.spacing.xl },
  },
} as const;

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Get color with opacity
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Simple implementation - in a real app you might want to use a color library
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

// Get spacing value
export const getSpacing = (size: keyof typeof theme.spacing): number => {
  return theme.spacing[size];
};

// Get font size
export const getFontSize = (size: keyof typeof theme.fontSize): number => {
  return theme.fontSize[size];
};

// Get border radius
export const getBorderRadius = (size: keyof typeof theme.borderRadius): number => {
  return theme.borderRadius[size];
};

// ==========================================
// RESPONSIVE HELPERS
// ==========================================

// Screen size breakpoints (you can expand this later)
export const breakpoints = {
  small: 320,
  medium: 768,
  large: 1024,
} as const;

// Check if screen is small, medium, or large
export const isSmallScreen = (width: number): boolean => width < breakpoints.medium;
export const isMediumScreen = (width: number): boolean => 
  width >= breakpoints.medium && width < breakpoints.large;
export const isLargeScreen = (width: number): boolean => width >= breakpoints.large;

// ==========================================
// EXPORTS
// ==========================================

export default theme;