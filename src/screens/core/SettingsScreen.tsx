import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Modal,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserSettings {
  monthlyBudget: number;
  currency: string;
  notifications: boolean;
  faceId: boolean;
  darkMode: boolean;
  weeklyGoals: boolean;
  autoScan: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  joinDate: string;
}

const CURRENCIES = [
  { code: '₹', name: 'Indian Rupee (INR)' },
  { code: '$', name: 'US Dollar (USD)' },
  { code: '€', name: 'Euro (EUR)' },
  { code: '£', name: 'British Pound (GBP)' },
  { code: '¥', name: 'Japanese Yen (JPY)' },
  { code: 'C$', name: 'Canadian Dollar (CAD)' },
];

export default function SettingsScreen() {
  const [settings, setSettings] = useState<UserSettings>({
    monthlyBudget: 0,
    currency: '₹',
    notifications: true,
    faceId: false,
    darkMode: false,
    weeklyGoals: true,
    autoScan: true,
  });

  const [profile, setProfile] = useState<UserProfile>({
    name: 'User',
    email: 'user@example.com',
    joinDate: '2025-01-01',
  });

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempBudget, setTempBudget] = useState('');
  const [tempName, setTempName] = useState('');
  const [tempEmail, setTempEmail] = useState('');

  useEffect(() => {
    loadSettings();
    loadProfile();
  }, []);

  const loadSettings = async () => {
    try {
      const userSettings = await AsyncStorage.getItem('userSettings');
      if (userSettings) {
        const parsed = JSON.parse(userSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) {
        setProfile(JSON.parse(userProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const saveProfile = async (newProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  const handleToggleSetting = (key: keyof UserSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const handleBudgetUpdate = () => {
    const budgetValue = parseFloat(tempBudget);
    if (!tempBudget || isNaN(budgetValue) || budgetValue <= 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    const newSettings = { ...settings, monthlyBudget: budgetValue };
    saveSettings(newSettings);
    setShowBudgetModal(false);
    setTempBudget('');
  };

  const handleCurrencyUpdate = (currency: string) => {
    const newSettings = { ...settings, currency };
    saveSettings(newSettings);
    setShowCurrencyModal(false);
  };

  const handleProfileUpdate = () => {
    if (!tempName.trim() || !tempEmail.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newProfile = { ...profile, name: tempName.trim(), email: tempEmail.trim() };
    saveProfile(newProfile);
    setShowProfileModal(false);
    setTempName('');
    setTempEmail('');
  };

  const handleExportData = async () => {
    try {
      const expenses = await AsyncStorage.getItem('expenses');
      const userData = {
        profile,
        settings,
        expenses: expenses ? JSON.parse(expenses) : [],
        exportDate: new Date().toISOString(),
      };

      const shareContent = {
        title: 'My Financial Data Export',
        message: `My financial data export from ${new Date().toLocaleDateString()}`,
        url: `data:application/json;base64,${btoa(JSON.stringify(userData, null, 2))}`,
      };

      await Share.share(shareContent);
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your expenses, settings, and profile data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['expenses', 'userSettings', 'userProfile']);
              Alert.alert('Success', 'All data has been cleared');
              // Reset to default values
              setSettings({
                monthlyBudget: 0,
                currency: '₹',
                notifications: true,
                faceId: false,
                darkMode: false,
                weeklyGoals: true,
                autoScan: true,
              });
              setProfile({
                name: 'User',
                email: 'user@example.com',
                joinDate: '2025-01-01',
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true, 
    value,
    toggle = false,
    toggleValue = false,
    onToggle
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    value?: string;
    toggle?: boolean;
    toggleValue?: boolean;
    onToggle?: () => void;
  }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={toggle}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {toggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: '#E0E0E0', true: '#2E7D61' }}
            thumbColor={toggleValue ? '#FFFFFF' : '#FFFFFF'}
          />
        ) : (
          showArrow && <Text style={styles.settingArrow}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
              <Text style={styles.profileJoinDate}>
                Member since {new Date(profile.joinDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              setTempName(profile.name);
              setTempEmail(profile.email);
              setShowProfileModal(true);
            }}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Budget & Currency */}
        <SectionHeader title="Budget & Currency" />
        <View style={styles.settingsSection}>
          <SettingRow
            icon="💰"
            title="Monthly Budget"
            subtitle={`Your current monthly spending limit`}
            value={`${settings.currency}${settings.monthlyBudget || 'Not set'}`}
            onPress={() => {
              setTempBudget(settings.monthlyBudget.toString());
              setShowBudgetModal(true);
            }}
          />
          <SettingRow
            icon="🌍"
            title="Currency"
            subtitle="Change your preferred currency"
            value={settings.currency}
            onPress={() => setShowCurrencyModal(true)}
          />
        </View>

        {/* Notifications & Privacy */}
        <SectionHeader title="Notifications & Privacy" />
        <View style={styles.settingsSection}>
          <SettingRow
            icon="🔔"
            title="Push Notifications"
            subtitle="Get reminders and insights"
            toggle={true}
            toggleValue={settings.notifications}
            onToggle={() => handleToggleSetting('notifications')}
          />
          <SettingRow
            icon="👤"
            title="Face ID / Touch ID"
            subtitle="Secure app access"
            toggle={true}
            toggleValue={settings.faceId}
            onToggle={() => handleToggleSetting('faceId')}
          />
        </View>

        {/* App Preferences */}
        <SectionHeader title="App Preferences" />
        <View style={styles.settingsSection}>
          <SettingRow
            icon="🌙"
            title="Dark Mode"
            subtitle="Switch to dark theme"
            toggle={true}
            toggleValue={settings.darkMode}
            onToggle={() => handleToggleSetting('darkMode')}
          />
          <SettingRow
            icon="🎯"
            title="Weekly Goals"
            subtitle="Enable weekly spending goals"
            toggle={true}
            toggleValue={settings.weeklyGoals}
            onToggle={() => handleToggleSetting('weeklyGoals')}
          />
          <SettingRow
            icon="📸"
            title="Auto-scan Receipts"
            subtitle="Automatically process receipt photos"
            toggle={true}
            toggleValue={settings.autoScan}
            onToggle={() => handleToggleSetting('autoScan')}
          />
        </View>

        {/* Data & Support */}
        <SectionHeader title="Data & Support" />
        <View style={styles.settingsSection}>
          <SettingRow
            icon="📤"
            title="Export Data"
            subtitle="Download your financial data"
            onPress={handleExportData}
          />
          <SettingRow
            icon="❓"
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => Alert.alert('Help', 'Contact support at help@example.com')}
          />
          <SettingRow
            icon="⭐"
            title="Rate App"
            subtitle="Rate us on the App Store"
            onPress={() => Alert.alert('Rate App', 'Thanks for your support!')}
          />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="Danger Zone" />
        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.dangerRow} onPress={handleClearData}>
            <Text style={styles.dangerIcon}>🗑️</Text>
            <View style={styles.dangerText}>
              <Text style={styles.dangerTitle}>Clear All Data</Text>
              <Text style={styles.dangerSubtitle}>Permanently delete all your data</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>© 2025 Financial Tracker</Text>
        </View>
      </ScrollView>

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBudgetModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Update Budget</Text>
            <TouchableOpacity onPress={handleBudgetUpdate}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Monthly Budget ({settings.currency})</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter monthly budget"
              keyboardType="numeric"
              value={tempBudget}
              onChangeText={setTempBudget}
              autoFocus
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <View style={{ width: 50 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyOption,
                  settings.currency === currency.code && styles.selectedCurrencyOption
                ]}
                onPress={() => handleCurrencyUpdate(currency.code)}
              >
                <Text style={styles.currencyCode}>{currency.code}</Text>
                <Text style={styles.currencyName}>{currency.name}</Text>
                {settings.currency === currency.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Profile Modal */}
      <Modal visible={showProfileModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProfileModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleProfileUpdate}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={tempName}
                onChangeText={setTempName}
                autoFocus
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={tempEmail}
                onChangeText={setTempEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4F8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2E7D61',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profileJoinDate: {
    fontSize: 12,
    color: '#999',
  },
  editButton: {
    backgroundColor: '#2E7D61',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  settingArrow: {
    fontSize: 18,
    color: '#CCC',
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dangerIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  dangerText: {
    flex: 1,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
    marginBottom: 2,
  },
  dangerSubtitle: {
    fontSize: 14,
    color: '#E74C3C',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6C757D',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalSave: {
    fontSize: 16,
    color: '#2E7D61',
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedCurrencyOption: {
    backgroundColor: '#F8F9FA',
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginRight: 16,
    minWidth: 40,
  },
  currencyName: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  checkmark: {
    fontSize: 16,
    color: '#2E7D61',
    fontWeight: 'bold',
  },
});