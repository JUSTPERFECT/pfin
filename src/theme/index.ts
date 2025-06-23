// src/theme/index.ts
// Centralized theme system for consistent styling

import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants';

// ==========================================
// 🌿 MINT THEME DEFINITION
// ==========================================

export const lightTheme = {
  colors: {
    // 🌿 Mint Theme Colors
    background: COLORS.background,
    surface: COLORS.surface,
    mint: COLORS.mint,
    softMint: COLORS.softMint,
    accent: COLORS.accent,
    dark: COLORS.dark,
    text: COLORS.text,
    gray: COLORS.gray,
    border: COLORS.border,
    error: COLORS.error,
    success: COLORS.success,
    
    // Status colors
    successDark: COLORS.successDark,
    successLight: COLORS.successLight,
    
    warning: COLORS.warning,
    warningDark: COLORS.warningDark,
    warningLight: COLORS.warningLight,
    
    errorDark: COLORS.errorDark,
    errorLight: COLORS.errorLight,
    
    // Text colors
    textSecondary: COLORS.gray, // Maps to gray
    
    // Border colors
    separator: COLORS.border,
    
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
    input: BORDER_RADIUS.input,
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
    light: FONT_WEIGHT.light,
    normal: FONT_WEIGHT.normal,
    medium: FONT_WEIGHT.medium,
    semibold: FONT_WEIGHT.semibold,
    bold: FONT_WEIGHT.bold,
  },
  
  // 🌫️ Shadow styles for elevation (mint theme)
  shadows: {
    card: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    fab: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    modal: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 16,
    },
  },
  
  // ⚡ Z-Indices (mint theme)
  zIndex: {
    base: 0,
    dropdown: 10,
    header: 50,
    overlay: 100,
    modal: 200,
    toast: 300,
  },
  
  // 🔤 Typography styles (mint theme)
  typography: {
    h1: {
      fontSize: FONT_SIZE.xxxl, // 36px
      fontWeight: FONT_WEIGHT.bold,
      lineHeight: 44,
    },
    h2: {
      fontSize: FONT_SIZE.xxl, // 28px
      fontWeight: FONT_WEIGHT.bold,
      lineHeight: 36,
    },
    h3: {
      fontSize: FONT_SIZE.xl, // 20px
      fontWeight: FONT_WEIGHT.semibold,
      lineHeight: 28,
    },
    body: {
      fontSize: FONT_SIZE.md, // 16px
      fontWeight: FONT_WEIGHT.normal,
      lineHeight: 24,
    },
    caption: {
      fontSize: FONT_SIZE.sm, // 14px
      fontWeight: FONT_WEIGHT.light,
      lineHeight: 20,
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
      minHeight: 44, // Minimum tap area
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
        backgroundColor: theme.colors.mint,
      },
      secondary: {
        backgroundColor: theme.colors.softMint,
      },
      accent: {
        backgroundColor: theme.colors.accent,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.mint,
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
      borderRadius: theme.borderRadius.input,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      minHeight: 44, // Minimum tap area
    },
    
    focus: {
      borderColor: theme.colors.mint,
    },
    
    error: {
      borderColor: theme.colors.error,
    },
  },
  
  // Card styles
  card: {
    base: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.card,
    },
    
    elevated: {
      ...theme.shadows.fab,
    },
  },
  
  // Text styles
  text: {
    h1: theme.typography.h1,
    h2: theme.typography.h2,
    h3: theme.typography.h3,
    body: theme.typography.body,
    caption: theme.typography.caption,
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