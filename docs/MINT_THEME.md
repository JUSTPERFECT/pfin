# 🌿 Mint Theme — Complete Design System

## 🎨 Colors

### Primary Colors
- **Background**: `#F3FFF7` (Ultra-light mint) — Main app background
- **Surface**: `#FFFFFF` (Cards, Modals) — Container background
- **Mint**: `#A0DABB` (Buttons, CTA) — Primary call to action
- **Soft Mint**: `#CFFAE2` (Fills, Secondary) — Subtle fill areas
- **Accent**: `#FFF3B0` (Highlights, Alerts) — Highlighted elements
- **Dark**: `#2E7D61` (Text, Strong CTA) — Strong text and icons

### Text Colors
- **Text**: `#1A1A1A` (Headings, Main Text) — Main text color
- **Gray**: `#888888` (Secondary Text) — Placeholder or hint text

### Functional Colors
- **Border**: `#E0E0E0` (Input Borders, Dividers) — Subtle outlines
- **Error**: `#FF5A5F` (Error State) — Alerts, errors
- **Success**: `#2ECC71` (Success State) — Confirmations

## 📐 Spacing

```typescript
SPACING = {
  xs: 4,   // Extra Small
  sm: 8,   // Small
  md: 16,  // Medium
  lg: 24,  // Large
  xl: 32,  // Extra Large
  xxl: 40, // Extra Extra Large
}
```

## 🔳 Border Radius

```typescript
BORDER_RADIUS = {
  sm: 8,     // Small
  md: 12,    // Medium
  input: 16, // Input fields
  lg: 24,    // Cards
  xl: 24,    // Cards (alias)
  round: 999, // Full circle
}
```

## 🔤 Typography

### Font Sizes
```typescript
FONT_SIZE = {
  xs: 12,   // Extra Small
  sm: 14,   // Caption
  md: 16,   // Body
  lg: 18,   // Large
  xl: 20,   // H3
  xxl: 28,  // H2
  xxxl: 36, // H1
}
```

### Font Weights
```typescript
FONT_WEIGHT = {
  light: '300',     // Light
  normal: '400',    // Regular
  medium: '500',    // Medium
  semibold: '600',  // Semi Bold
  bold: '700',      // Bold
}
```

### Typography Styles
```typescript
typography = {
  h1: {
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: 44,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  h3: {
    fontSize: 20,
    fontWeight: 'semibold',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'light',
    lineHeight: 20,
  },
}
```

## 🌫️ Shadows

```typescript
shadows = {
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
}
```

## ⚡ Z-Indices

```typescript
zIndex = {
  base: 0,      // Base level
  dropdown: 10, // Dropdown menus
  header: 50,   // Headers
  overlay: 100, // Overlays
  modal: 200,   // Modals
  toast: 300,   // Toast notifications
}
```

## 🎯 Usage Examples

### Button Components
```typescript
// Primary Button
<Button 
  variant="primary" 
  size="medium"
  style={{
    backgroundColor: theme.colors.mint,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  }}
/>

// Secondary Button
<Button 
  variant="secondary"
  style={{
    backgroundColor: theme.colors.softMint,
  }}
/>

// Accent Button
<Button 
  variant="accent"
  style={{
    backgroundColor: theme.colors.accent,
  }}
/>
```

### Card Components
```typescript
<Card style={{
  backgroundColor: theme.colors.surface,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.md,
  ...theme.shadows.card,
}} />
```

### Input Components
```typescript
<Input style={{
  borderWidth: 1,
  borderColor: theme.colors.border,
  borderRadius: theme.borderRadius.input,
  paddingHorizontal: theme.spacing.md,
  paddingVertical: theme.spacing.sm,
  fontSize: theme.fontSize.md,
  color: theme.colors.text,
  backgroundColor: theme.colors.surface,
  minHeight: 44, // Minimum tap area
}} />
```

### Text Components
```typescript
// Heading 1
<Text style={theme.typography.h1}>
  Welcome to PFin
</Text>

// Body Text
<Text style={theme.typography.body}>
  Manage your finances with ease
</Text>

// Caption
<Text style={theme.typography.caption}>
  Last updated 2 hours ago
</Text>
```

## ✅ Accessibility Guidelines

### Contrast Requirements
- **Text on Background**: Minimum 4.5:1 contrast ratio
- **Text on Surface**: Minimum 4.5:1 contrast ratio
- **Interactive Elements**: Minimum 3:1 contrast ratio

### Touch Targets
- **Minimum Size**: 44x44 points for all interactive elements
- **Spacing**: At least 8px between touch targets

### Color Usage
- **Primary Text**: Use `text` color (#1A1A1A) for main content
- **Secondary Text**: Use `gray` color (#888888) for hints and placeholders
- **Interactive Elements**: Use `mint` color (#A0DABB) for primary actions
- **Error States**: Use `error` color (#FF5A5F) for errors and warnings
- **Success States**: Use `success` color (#2ECC71) for confirmations

### Typography Guidelines
- **Headings**: Use H1, H2, H3 hierarchy for content structure
- **Body Text**: Use 16px for optimal readability
- **Captions**: Use 14px light weight for secondary information
- **Line Height**: Maintain 1.4-1.5 ratio for body text

## 🎨 Component Patterns

### Layout Spacing
```typescript
// Consistent spacing between sections
<View style={{ marginBottom: theme.spacing.lg }}>
  <Section />
</View>

// Card padding
<Card style={{ padding: theme.spacing.md }}>
  <Content />
</Card>

// Button spacing
<View style={{ gap: theme.spacing.sm }}>
  <Button />
  <Button />
</View>
```

### Color Combinations
```typescript
// Primary action
backgroundColor: theme.colors.mint
color: theme.colors.dark

// Secondary action
backgroundColor: theme.colors.softMint
color: theme.colors.dark

// Accent highlight
backgroundColor: theme.colors.accent
color: theme.colors.dark

// Error state
backgroundColor: theme.colors.error
color: theme.colors.surface

// Success state
backgroundColor: theme.colors.success
color: theme.colors.surface
```

## 🔄 Migration Guide

### From Old Theme
```typescript
// Old
backgroundColor: theme.colors.primary

// New
backgroundColor: theme.colors.mint
```

```typescript
// Old
borderRadius: theme.borderRadius.md

// New
borderRadius: theme.borderRadius.input // for inputs
borderRadius: theme.borderRadius.lg    // for cards
```

```typescript
// Old
fontSize: theme.fontSize.xxl

// New
...theme.typography.h2 // includes fontSize, fontWeight, lineHeight
```

## 📱 Platform Considerations

### iOS
- Use `elevation` for Android shadows
- Maintain iOS-style touch targets (44pt minimum)
- Follow iOS Human Interface Guidelines for spacing

### Android
- Use `shadowOffset`, `shadowOpacity`, `shadowRadius` for iOS shadows
- Maintain Material Design touch targets (48dp minimum)
- Follow Material Design spacing guidelines

## 🎯 Best Practices

1. **Consistency**: Always use theme tokens instead of hardcoded values
2. **Accessibility**: Test color contrast and touch target sizes
3. **Performance**: Use theme objects efficiently to avoid re-renders
4. **Maintainability**: Keep theme changes centralized in theme files
5. **Documentation**: Update this guide when adding new design tokens

## 🔧 Customization

### Adding New Colors
```typescript
// In constants/index.ts
export const COLORS = {
  // ... existing colors
  customColor: '#YOUR_COLOR',
} as const;

// In theme/index.ts
export const lightTheme = {
  colors: {
    // ... existing colors
    customColor: COLORS.customColor,
  },
} as const;
```

### Adding New Spacing
```typescript
// In constants/index.ts
export const SPACING = {
  // ... existing spacing
  xxxl: 48,
} as const;
```

### Adding New Typography
```typescript
// In theme/index.ts
typography: {
  // ... existing typography
  custom: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.medium,
    lineHeight: 26,
  },
}
``` 