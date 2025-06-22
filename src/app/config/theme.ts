interface ColorPalette {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    accent: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    textDisabled: string;
    border: string;
    borderLight: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    income: string;
    expense: string;
  }
  
  interface Typography {
    fontFamily: {
      regular: string;
      medium: string;
      semiBold: string;
      bold: string;
    };
    fontSize: {
      xs: number;
      sm: number;
      base: number;
      lg: number;
      xl: number;
      xl2: number;
      xl3: number;
      xl4: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  }
  
  interface Spacing {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xl2: number;
    xl3: number;
    xl4: number;
  }
  
  interface BorderRadius {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  }
  
  interface Shadows {
    sm: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    md: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    lg: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  }
  
  interface Theme {
    colors: ColorPalette;
    typography: Typography;
    spacing: Spacing;
    borderRadius: BorderRadius;
    shadows: Shadows;
    isDark: boolean;
  }
  
  // Light theme colors
  const lightColors: ColorPalette = {
    primary: '#2E7D61',
    primaryLight: '#4CAF50',
    primaryDark: '#1B5E20',
    secondary: '#45B7D1',
    secondaryLight: '#64B5F6',
    secondaryDark: '#1976D2',
    accent: '#FF6B6B',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textDisabled: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    income: '#2E7D61',
    expense: '#FF6B6B',
  };
  
  // Dark theme colors
  const darkColors: ColorPalette = {
    primary: '#4CAF50',
    primaryLight: '#66BB6A',
    primaryDark: '#2E7D61',
    secondary: '#64B5F6',
    secondaryLight: '#90CAF9',
    secondaryDark: '#1976D2',
    accent: '#FF8A80',
    background: '#121212',
    surface: '#1E1E1E',
    card: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textDisabled: '#6B6B6B',
    border: '#3D3D3D',
    borderLight: '#2A2A2A',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    income: '#4ADE80',
    expense: '#F87171',
  };
  
  // Common typography
  const typography: Typography = {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semiBold: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xl2: 24,
      xl3: 28,
      xl4: 32,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  };
  
  // Common spacing
  const spacing: Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xl2: 40,
    xl3: 48,
    xl4: 56,
  };
  
  // Common border radius
  const borderRadius: BorderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  };
  
  // Light theme shadows
  const lightShadows: Shadows = {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  };
  
  // Dark theme shadows
  const darkShadows: Shadows = {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 5,
    },
  };
  
  // Theme objects
  export const lightTheme: Theme = {
    colors: lightColors,
    typography,
    spacing,
    borderRadius,
    shadows: lightShadows,
    isDark: false,
  };
  
  export const darkTheme: Theme = {
    colors: darkColors,
    typography,
    spacing,
    borderRadius,
    shadows: darkShadows,
    isDark: true,
  };
  
  // Theme manager
  export class ThemeManager {
    private static currentTheme: Theme = lightTheme;
    private static themeMode: 'light' | 'dark' | 'auto' = 'auto';
  
    static setThemeMode(mode: 'light' | 'dark' | 'auto'): void {
      this.themeMode = mode;
      this.updateCurrentTheme();
    }
  
    static getThemeMode(): 'light' | 'dark' | 'auto' {
      return this.themeMode;
    }
  
    static getCurrentTheme(): Theme {
      return this.currentTheme;
    }
  
    static isCurrentlyDark(): boolean {
      return this.currentTheme.isDark;
    }
  
    private static updateCurrentTheme(): void {
      if (this.themeMode === 'auto') {
        // TODO: Detect system theme preference
        // For now, default to light theme
        this.currentTheme = lightTheme;
      } else {
        this.currentTheme = this.themeMode === 'dark' ? darkTheme : lightTheme;
      }
    }
  
    static getThemedColors(): ColorPalette {
      return this.currentTheme.colors;
    }
  
    static getThemedTypography(): Typography {
      return this.currentTheme.typography;
    }
  
    static getThemedSpacing(): Spacing {
      return this.currentTheme.spacing;
    }
  
    static getThemedBorderRadius(): BorderRadius {
      return this.currentTheme.borderRadius;
    }
  
    static getThemedShadows(): Shadows {
      return this.currentTheme.shadows;
    }
  }
  
  // Category colors (theme-aware)
  export const getCategoryColors = (isDark: boolean = false) => ({
    food: isDark ? '#FF8A80' : '#FF6B6B',
    transport: isDark ? '#4DD0E1' : '#4ECDC4',
    shopping: isDark ? '#64B5F6' : '#45B7D1',
    entertainment: isDark ? '#A5D6A7' : '#96CEB4',
    bills: isDark ? '#FFF176' : '#FFEAA7',
    health: isDark ? '#E1BEE7' : '#DDA0DD',
    other: isDark ? '#B0BEC5' : '#95A5A6',
  });
  
  // Quick action colors (theme-aware)
  export const getQuickActionColors = (isDark: boolean = false) => ({
    add_expense: isDark ? '#F87171' : '#FF6B6B',
    scan_receipt: isDark ? '#4DD0E1' : '#4ECDC4',
    add_income: isDark ? '#4ADE80' : '#2E7D61',
    view_insights: isDark ? '#60A5FA' : '#45B7D1',
  });
  
  export type { Theme, ColorPalette, Typography, Spacing, BorderRadius, Shadows };