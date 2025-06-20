import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const features = [
  {
    icon: '📸',
    title: 'Scan receipts',
    description: 'Auto-log expenses with one tap.'
  },
  {
    icon: '💡',
    title: 'Smart insights',
    description: 'Get personalized tips to reduce overspending.'
  },
  {
    icon: '🎯',
    title: 'Gamified savings',
    description: 'Earn badges by hitting weekly goals.'
  }
];

export default function FeaturesScreen() {
  const navigation = useNavigation();

  const handleNext = () => {
    navigation.navigate('SetupBudget');
  };

  const handleSkip = () => {
    navigation.navigate('Done');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={features}
        keyExtractor={(item) => item.title}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.buttons}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    justifyContent: 'space-between',
    backgroundColor: '#F3FFF7',
  },
  listContainer: {
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  skip: {
    fontSize: 16,
    color: '#999',
  },
  nextButton: {
    backgroundColor: '#2E7D61',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});