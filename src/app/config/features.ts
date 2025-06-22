import { environment, canUseFeature } from './environment';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiresPremium: boolean;
  betaFeature: boolean;
  platforms?: ('ios' | 'android' | 'web')[];
  minVersion?: string;
}

const ALL_FEATURES: FeatureFlag[] = [
  {
    id: 'receipt_scanning',
    name: 'Receipt Scanning',
    description: 'Scan receipts using camera and extract transaction data with OCR',
    enabled: canUseFeature('receiptScanning'),
    requiresPremium: false,
    betaFeature: false,
    platforms: ['ios', 'android'],
  },
  {
    id: 'cloud_sync',
    name: 'Cloud Synchronization',
    description: 'Sync your data across multiple devices using cloud storage',
    enabled: canUseFeature('cloudSync'),
    requiresPremium: true,
    betaFeature: false,
  },
  {
    id: 'budget_tracking',
    name: 'Budget Tracking',
    description: 'Set and track budgets for different categories',
    enabled: true, // Always enabled
    requiresPremium: false,
    betaFeature: false,
  },
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Detailed spending insights, trends, and financial reports',
    enabled: canUseFeature('premiumFeatures'),
    requiresPremium: true,
    betaFeature: false,
  },
  {
    id: 'recurring_transactions',
    name: 'Recurring Transactions',
    description: 'Set up automatic recurring income and expenses',
    enabled: canUseFeature('premiumFeatures'),
    requiresPremium: true,
    betaFeature: false,
  },
  {
    id: 'export_data',
    name: 'Data Export',
    description: 'Export your financial data to CSV, PDF, or Excel formats',
    enabled: canUseFeature('premiumFeatures'),
    requiresPremium: true,
    betaFeature: false,
  },
  {
    id: 'dark_mode',
    name: 'Dark Mode',
    description: 'Switch between light and dark themes',
    enabled: true, // Always enabled
    requiresPremium: false,
    betaFeature: false,
  },
  {
    id: 'multi_currency',
    name: 'Multi-Currency Support',
    description: 'Track expenses in multiple currencies with automatic conversion',
    enabled: canUseFeature('premiumFeatures'),
    requiresPremium: true,
    betaFeature: false,
  },
  {
    id: 'voice_notes',
    name: 'Voice Notes',
    description: 'Add voice notes to your transactions',
    enabled: canUseFeature('betaFeatures'),
    requiresPremium: false,
    betaFeature: true,
    platforms: ['ios', 'android'],
  },
  {
    id: 'ai_insights',
    name: 'AI Financial Insights',
    description: 'Get personalized financial advice powered by AI',
    enabled: canUseFeature('betaFeatures'),
    requiresPremium: true,
    betaFeature: true,
  },
  {
    id: 'family_sharing',
    name: 'Family Sharing',
    description: 'Share expenses and budgets with family members',
    enabled: canUseFeature('betaFeatures'),
    requiresPremium: true,
    betaFeature: true,
  },
  {
    id: 'investment_tracking',
    name: 'Investment Tracking',
    description: 'Track your investments and portfolio performance',
    enabled: canUseFeature('betaFeatures'),
    requiresPremium: true,
    betaFeature: true,
  },
];

export class FeatureManager {
  private static userHasPremium: boolean = false;
  private static enabledBetaFeatures: Set<string> = new Set();

  static setUserPremiumStatus(hasPremium: boolean): void {
    this.userHasPremium = hasPremium;
  }

  static enableBetaFeature(featureId: string): void {
    this.enabledBetaFeatures.add(featureId);
  }

  static disableBetaFeature(featureId: string): void {
    this.enabledBetaFeatures.delete(featureId);
  }

  static isFeatureEnabled(featureId: string): boolean {
    const feature = ALL_FEATURES.find(f => f.id === featureId);
    if (!feature) return false;

    // Check if feature is globally enabled
    if (!feature.enabled) return false;

    // Check premium requirement
    if (feature.requiresPremium && !this.userHasPremium) return false;

    // Check beta feature requirement
    if (feature.betaFeature && !this.enabledBetaFeatures.has(featureId)) return false;

    // Check platform compatibility
    if (feature.platforms) {
      // TODO: Add platform detection
      // For now, assume all platforms are supported
    }

    return true;
  }

  static getEnabledFeatures(): FeatureFlag[] {
    return ALL_FEATURES.filter(feature => this.isFeatureEnabled(feature.id));
  }

  static getPremiumFeatures(): FeatureFlag[] {
    return ALL_FEATURES.filter(feature => feature.requiresPremium);
  }

  static getBetaFeatures(): FeatureFlag[] {
    return ALL_FEATURES.filter(feature => feature.betaFeature);
  }

  static getFeatureById(featureId: string): FeatureFlag | undefined {
    return ALL_FEATURES.find(f => f.id === featureId);
  }

  static canUseFeature(featureId: string): boolean {
    return this.isFeatureEnabled(featureId);
  }

  // Convenience methods for common features
  static canScanReceipts(): boolean {
    return this.isFeatureEnabled('receipt_scanning');
  }

  static canSyncToCloud(): boolean {
    return this.isFeatureEnabled('cloud_sync');
  }

  static canUseAdvancedAnalytics(): boolean {
    return this.isFeatureEnabled('advanced_analytics');
  }

  static canCreateRecurringTransactions(): boolean {
    return this.isFeatureEnabled('recurring_transactions');
  }

  static canExportData(): boolean {
    return this.isFeatureEnabled('export_data');
  }

  static canUseMultiCurrency(): boolean {
    return this.isFeatureEnabled('multi_currency');
  }

  static canUseVoiceNotes(): boolean {
    return this.isFeatureEnabled('voice_notes');
  }

  static canUseAIInsights(): boolean {
    return this.isFeatureEnabled('ai_insights');
  }

  static canUseFamilySharing(): boolean {
    return this.isFeatureEnabled('family_sharing');
  }

  static canTrackInvestments(): boolean {
    return this.isFeatureEnabled('investment_tracking');
  }
}

// Export feature flags for easy access
export const featureFlags = {
  RECEIPT_SCANNING: 'receipt_scanning',
  CLOUD_SYNC: 'cloud_sync',
  BUDGET_TRACKING: 'budget_tracking',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  RECURRING_TRANSACTIONS: 'recurring_transactions',
  EXPORT_DATA: 'export_data',
  DARK_MODE: 'dark_mode',
  MULTI_CURRENCY: 'multi_currency',
  VOICE_NOTES: 'voice_notes',
  AI_INSIGHTS: 'ai_insights',
  FAMILY_SHARING: 'family_sharing',
  INVESTMENT_TRACKING: 'investment_tracking',
} as const;

export type FeatureFlagKey = keyof typeof featureFlags;