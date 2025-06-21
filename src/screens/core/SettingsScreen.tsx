// src/screens/core/SettingsScreen.tsx
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

// ✅ FIXED: Use proper imports and validation
import { LoadingSpinner, ErrorState } from '../../components/LoadingStates';
import { useFormValidation, createProfileValidator, createBudgetValidator } from '../../utils/validation';
import { useMainTabNavigation } from '../../types/navigation';

// Interfaces
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
  // ✅ FIXED: Use typed navigation
  const navigation = useMainTabNavigation();

  // State management
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
    joinDate: new Date().toISOString().split('T')[0],
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // ✅ FIXED: Use proper validation for profile
  const profileValidation = useFormValidation(createProfileValidator(), {
    name: profile.name,
    email: profile.email,
  });

  // ✅ FIXED: Use proper validation for budget
  const budgetValidation = useFormValidation(createBudgetValidator(), {
    monthlyBudget: settings.monthlyBudget.toString(),
    currency: settings.currency,
  });

  // Effects
  useEffect(() => {
    loadData();
  }, []);

  // ✅ IMPROVED: Better data loading with error handling
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [userSettings, userProfile] = await Promise.all([
        AsyncStorage.getItem('userSettings'),
        AsyncStorage.getItem('userProfile'),
      ]);

      if (userSettings) {
        const parsed = JSON.parse(userSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }

      if (userProfile) {
        const parsed = JSON.parse(userProfile);
        setProfile(parsed);
        // Update form data when profile loads
        profileValidation.updateField('name', parsed.name);
        profileValidation.updateField('email', parsed.email);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ IMPROVED: Better save functions with error handling
  const saveSettings = async (newSettings: UserSettings) => {
    try {
      setIsSaving(true);
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const saveProfile = async (newProfile: UserProfile) => {
    try {
      setIsSaving(true);
      await AsyncStorage.setItem('userProfile', JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Event handlers
  const handleToggleSetting = async (key: keyof UserSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    await saveSettings(newSettings);
  };

  const handleBudgetUpdate = async () => {
    if (!budgetValidation.validateForm()) {
      return;
    }

    try {
      const budgetValue = parseFloat(budgetValidation.formData.monthlyBudget);
      const newSettings = { ...settings, monthlyBudget: budgetValue };
      await saveSettings(newSettings);
      setShowBudgetModal(false);
      budgetValidation.resetValidation();
      Alert.alert('Success', 'Budget updated successfully');
    } catch (error) {
      // Error already handled in saveSettings
    }
  };

  const handleCurrencyUpdate = async (currency: string) => {
    try {
      const newSettings = { ...settings, currency };
      await saveSettings(newSettings);
      setShowCurrencyModal(false);
    } catch (error) {
      // Error already handled in saveSettings
    }
  };

  const handleProfileUpdate = async () => {
    if (!profileValidation.validateForm()) {
      return;
    }

    try {
      const newProfile = { 
        ...profile, 
        name: profileValidation.formData.name.trim(), 
        email: profileValidation.formData.email.trim() 
      };
      await saveProfile(newProfile);
      setShowProfileModal(false);
      profileValidation.resetValidation();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      // Error already handled in saveProfile
    }
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
                joinDate: new Date().toISOString().split('T')[0],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  // ✅ IMPROVED: Better component with proper TypeScript
  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true, 
    value,
    toggle = false,
    toggleValue = false,
    onToggle,
    danger = false,
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
    danger?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.settingRow, danger && styles.dangerRow]} 
      onPress={onPress} 
      disabled={toggle}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
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

  // ✅ IMPROVED: Proper loading and error states
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text="Loading settings..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          title="Failed to load settings"
          description={error}
          onRetry={() => loadData()}
        />
      </SafeAreaView>
    );
  }

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
              profileValidation.updateField('name', profile.name);
              profileValidation.updateField('email', profile.email);
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
            subtitle="Your current monthly spending limit"
            value={`${settings.currency}${settings.monthlyBudget || 'Not set'}`}
            onPress={() => {
              budgetValidation.updateField('monthlyBudget', settings.monthlyBudget.toString());
              budgetValidation.updateField('currency', settings.currency);
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
          <SettingRow
            icon="🗑️"
            title="Clear All Data"
            subtitle="Permanently delete all app data"
            onPress={handleClearData}
            showArrow={true}
            danger={true}
          />
        </View>
      </ScrollView>

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowBudgetModal(false);
              budgetValidation.resetValidation();
            }}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Update Budget</Text>
            <TouchableOpacity 
              onPress={handleBudgetUpdate}
              disabled={isSaving}
            >
              <Text style={[styles.modalSave, isSaving && styles.modalSaveDisabled]}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monthly Budget Amount</Text>
              <TextInput
                style={[
                  styles.budgetInput, 
                  budgetValidation.hasFieldError('monthlyBudget') && styles.inputError
                ]}
                placeholder="Enter amount"
                keyboardType="numeric"
                value={budgetValidation.formData.monthlyBudget}
                onChangeText={(value) => budgetValidation.updateField('monthlyBudget', value)}
                autoFocus
              />
              {budgetValidation.hasFieldError('monthlyBudget') && (
                <Text style={styles.errorText}>
                  {budgetValidation.getFieldError('monthlyBudget')}
                </Text>
              )}
            </View>
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
            <TouchableOpacity onPress={() => {
              setShowProfileModal(false);
              profileValidation.resetValidation();
            }}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity 
              onPress={handleProfileUpdate}
              disabled={isSaving}
            >
              <Text style={[styles.modalSave, isSaving && styles.modalSaveDisabled]}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={[
                  styles.input, 
                  profileValidation.hasFieldError('name') && styles.inputError
                ]}
                placeholder="Enter your name"
                value={profileValidation.formData.name}
                onChangeText={(value) => profileValidation.updateField('name', value)}
              />
              {profileValidation.hasFieldError('name') && (
                <Text style={styles.errorText}>{profileValidation.getFieldError('name')}</Text>
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[
                  styles.input, 
                  profileValidation.hasFieldError('email') && styles.inputError
                ]}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={profileValidation.formData.email}
                onChangeText={(value) => profileValidation.updateField('email', value)}
              />
              {profileValidation.hasFieldError('email') && (
                <Text style={styles.errorText}>{profileValidation.getFieldError('email')}</Text>
              )}
            </View>
          </ScrollView>
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
    padding: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 16,
    padding: 20,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2E7D61',
    alignItems: 'center',
    justifyContent: 'center',
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
  dangerRow: {
    borderTopWidth: 1,
    borderTopColor: '#FFE6E6',
    backgroundColor: '#FFFAFA',
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
  dangerText: {
    color: '#FF6B6B',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  modalSave: {
    fontSize: 16,
    color: '#2E7D61',
    fontWeight: '600',
  },
  modalSaveDisabled: {
    color: '#999',
  },
  modalContent: {
    flex: 1,
    padding: 16,
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
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  budgetInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 4,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  selectedCurrencyOption: {
    backgroundColor: '#F0FFF4',
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