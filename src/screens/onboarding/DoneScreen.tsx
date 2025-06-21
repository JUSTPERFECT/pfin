// src/screens/onboarding/DoneScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// ✅ FIXED: Import proper context for app state management
import { useAppState } from '../../context/AppStateProvider';

export default function DoneScreen() {
  const { setHasOnboarded } = useAppState();

  const enterApp = () => {
    // Complete onboarding immediately - no artificial delays
    setHasOnboarded(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>You're all set!</Text>
      <Text style={styles.subtitle}>
        Let's start managing your finances smartly.
      </Text>

      <TouchableOpacity style={styles.button} onPress={enterApp}>
        <Text style={styles.buttonText}>Enter App</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F3FFF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2E7D61',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#2E7D61',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
