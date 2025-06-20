import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smarter way to manage money</Text>
      <Text style={styles.subtitle}>Track, Scan, Learn — All in one place.</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Features')} style={styles.button}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24,
    backgroundColor: '#F3FFF7'
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#2E7D61',
    textAlign: 'center',
    marginBottom: 16
  },
  subtitle: { 
    fontSize: 16, 
    color: '#555', 
    marginVertical: 16,
    textAlign: 'center'
  },
  button: { 
    backgroundColor: '#2E7D61', 
    paddingVertical: 16, 
    paddingHorizontal: 32, 
    borderRadius: 12,
    marginTop: 32
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});