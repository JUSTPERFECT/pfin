// src/components/ui/ThemeShowcase.tsx
// Showcase component demonstrating the mint theme implementation

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Button from './Button';
import Card from './Card';
import Input from './Input';

const ThemeShowcase: React.FC = () => {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = React.useState('');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    title: {
      fontSize: theme.fontSize.xxl,
      fontWeight: 'bold',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.fontSize.md,
      textAlign: 'center',
    },
    section: {
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.fontSize.xl,
      fontWeight: '600',
      marginBottom: theme.spacing.md,
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    colorSwatch: {
      width: 80,
      height: 60,
      borderRadius: theme.borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    colorLabel: {
      fontSize: 10,
      fontWeight: '600',
      textAlign: 'center',
    },
    buttonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    cardGrid: {
      gap: theme.spacing.sm,
    },
    demoCard: {
      marginBottom: theme.spacing.sm,
    },
    spacingDemo: {
      gap: theme.spacing.xs,
    },
    spacingItem: {
      backgroundColor: '#F0F0F0',
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
    },
    statusGrid: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    statusItem: {
      flex: 1,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
    },
    statusText: {
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
    },
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          🌿 Mint Theme Showcase
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.gray }]}>
          Complete design system implementation
        </Text>
      </View>

      {/* Colors Section */}
      <Card variant="elevated" style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          🎨 Colors
        </Text>
        
        <View style={styles.colorGrid}>
          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.background }]}>
            <Text style={styles.colorLabel}>Background</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.colorLabel}>Surface</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.mint }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.dark }]}>Mint</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.softMint }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.dark }]}>Soft Mint</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.accent }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.dark }]}>Accent</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.dark }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.surface }]}>Dark</Text>
          </View>
        </View>
      </Card>

      {/* Typography Section */}
      <Card variant="elevated" style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          🔤 Typography
        </Text>
        
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>
          Heading 1 (36px Bold)
        </Text>
        <Text style={[theme.typography.h2, { color: theme.colors.text }]}>
          Heading 2 (28px Bold)
        </Text>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
          Heading 3 (20px Semi-bold)
        </Text>
        <Text style={[theme.typography.body, { color: theme.colors.text }]}>
          Body text (16px Regular) - This is the main text style used throughout the app for readable content.
        </Text>
        <Text style={[theme.typography.caption, { color: theme.colors.gray }]}>
          Caption (14px Light) - Used for secondary information and hints.
        </Text>
      </Card>

      {/* Buttons Section */}
      <Card variant="elevated" style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          🔘 Buttons
        </Text>
        
        <View style={styles.buttonGrid}>
          <Button variant="primary" size="medium">
            Primary
          </Button>
          <Button variant="secondary" size="medium">
            Secondary
          </Button>
          <Button variant="accent" size="medium">
            Accent
          </Button>
          <Button variant="outline" size="medium">
            Outline
          </Button>
          <Button variant="ghost" size="medium">
            Ghost
          </Button>
          <Button variant="danger" size="medium">
            Danger
          </Button>
        </View>

        <View style={styles.buttonGrid}>
          <Button variant="primary" size="small">
            Small
          </Button>
          <Button variant="primary" size="medium">
            Medium
          </Button>
          <Button variant="primary" size="large">
            Large
          </Button>
        </View>
      </Card>

      {/* Inputs Section */}
      <Card variant="elevated" style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          📝 Inputs
        </Text>
        
        <Input
          label="Text Input"
          placeholder="Enter some text..."
          value={inputValue}
          onChangeText={setInputValue}
          type="text"
        />
        
        <Input
          label="Email Input"
          placeholder="Enter your email"
          value=""
          onChangeText={() => {}}
          type="email"
        />
        
        <Input
          label="Password Input"
          placeholder="Enter your password"
          value=""
          onChangeText={() => {}}
          type="password"
        />
        
        <Input
          label="Currency Input"
          placeholder="0.00"
          value=""
          onChangeText={() => {}}
          type="currency"
          currencySymbol="₹"
        />
      </Card>

      {/* Cards Section */}
      <Card variant="elevated" style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          🃏 Cards
        </Text>
        
        <View style={styles.cardGrid}>
          <Card variant="default" style={styles.demoCard}>
            <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
              Default Card
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.gray }]}>
              Standard card with subtle shadow
            </Text>
          </Card>
          
          <Card variant="elevated" style={styles.demoCard}>
            <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
              Elevated Card
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.gray }]}>
              Card with enhanced shadow
            </Text>
          </Card>
          
          <Card variant="outlined" style={styles.demoCard}>
            <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
              Outlined Card
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.gray }]}>
              Card with border only
            </Text>
          </Card>
        </View>
      </Card>

      {/* Spacing Section */}
      <Card variant="elevated" style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          📐 Spacing
        </Text>
        
        <View style={styles.spacingDemo}>
          <View style={[styles.spacingItem, { marginBottom: theme.spacing.xs }]}>
            <Text style={[theme.typography.caption, { color: theme.colors.gray }]}>
              XS (4px)
            </Text>
          </View>
          <View style={[styles.spacingItem, { marginBottom: theme.spacing.sm }]}>
            <Text style={[theme.typography.caption, { color: theme.colors.gray }]}>
              SM (8px)
            </Text>
          </View>
          <View style={[styles.spacingItem, { marginBottom: theme.spacing.md }]}>
            <Text style={[theme.typography.caption, { color: theme.colors.gray }]}>
              MD (16px)
            </Text>
          </View>
          <View style={[styles.spacingItem, { marginBottom: theme.spacing.lg }]}>
            <Text style={[theme.typography.caption, { color: theme.colors.gray }]}>
              LG (24px)
            </Text>
          </View>
          <View style={[styles.spacingItem, { marginBottom: theme.spacing.xl }]}>
            <Text style={[theme.typography.caption, { color: theme.colors.gray }]}>
              XL (32px)
            </Text>
          </View>
          <View style={[styles.spacingItem, { marginBottom: theme.spacing.xxl }]}>
            <Text style={[theme.typography.caption, { color: theme.colors.gray }]}>
              XXL (40px)
            </Text>
          </View>
        </View>
      </Card>

      {/* Status Colors */}
      <Card variant="elevated" style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          ✅ Status Colors
        </Text>
        
        <View style={styles.statusGrid}>
          <View style={[styles.statusItem, { backgroundColor: theme.colors.success }]}>
            <Text style={[styles.statusText, { color: theme.colors.surface }]}>
              Success
            </Text>
          </View>
          <View style={[styles.statusItem, { backgroundColor: theme.colors.error }]}>
            <Text style={[styles.statusText, { color: theme.colors.surface }]}>
              Error
            </Text>
          </View>
          <View style={[styles.statusItem, { backgroundColor: theme.colors.accent }]}>
            <Text style={[styles.statusText, { color: theme.colors.dark }]}>
              Warning
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

export default ThemeShowcase; 