// theme.ts

export const colors = {
  background: '#F3FFF7',   // ultra-light mint
  surface: '#FFFFFF',      // cards
  mint: '#A0DABB',         // primary mint
  softmint: '#CFFAE2',     // secondary mint
  accent: '#FFF3B0',       // highlight/accent
  dark: '#2E7D61',         // deep green (text/icon)
  text: '#1A1A1A',         // primary text
  gray: '#888888',         // secondary text
  border: '#E0E0E0',       // input/card border
  error: '#FF5A5F',        // error state
  success: '#2ECC71',      // success state
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 16,
  card: 24,
  full: 999,
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
};

export const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  bold: '700',
};

export const typography = {
  h1: { fontSize: fontSizes.xxl, fontWeight: fontWeights.bold },
  h2: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold },
  h3: { fontSize: fontSizes.lg, fontWeight: fontWeights.medium },
  body: { fontSize: fontSizes.md, fontWeight: fontWeights.regular },
  caption: { fontSize: fontSizes.sm, fontWeight: fontWeights.light },
};

export const zIndices = {
  base: 0,
  dropdown: 10,
  header: 50,
  overlay: 100,
  modal: 200,
  toast: 300,
};

export const opacity = {
  subtle: 0.1,
  medium: 0.5,
  disabled: 0.3,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
};

export const Theme = {
  colors,
  spacing,
  radius,
  fontSizes,
  fontWeights,
  typography,
  zIndices,
  opacity,
  shadows,
};