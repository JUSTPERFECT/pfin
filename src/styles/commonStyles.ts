import { StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});