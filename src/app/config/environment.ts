interface Environment {
    name: 'development' | 'production' | 'staging';
    api: {
      baseUrl: string;
      timeout: number;
      retries: number;
    };
    storage: {
      prefix: string;
      encryption: boolean;
    };
    analytics: {
      enabled: boolean;
      trackingId?: string;
      debugMode: boolean;
    };
    logging: {
      enabled: boolean;
      level: 'debug' | 'info' | 'warn' | 'error';
      maxLogs: number;
    };
    features: {
      receiptScanning: boolean;
      cloudSync: boolean;
      premiumFeatures: boolean;
      betaFeatures: boolean;
    };
    limits: {
      maxTransactionsPerMonth: number;
      maxReceiptScansPerMonth: number;
      maxBudgets: number;
      maxCategories: number;
    };
  }
  
  const development: Environment = {
    name: 'development',
    api: {
      baseUrl: 'http://localhost:3000/api',
      timeout: 10000,
      retries: 3,
    },
    storage: {
      prefix: 'pfin_dev_',
      encryption: false,
    },
    analytics: {
      enabled: false,
      debugMode: true,
    },
    logging: {
      enabled: true,
      level: 'debug',
      maxLogs: 1000,
    },
    features: {
      receiptScanning: true,
      cloudSync: false,
      premiumFeatures: true, // All features enabled in dev
      betaFeatures: true,
    },
    limits: {
      maxTransactionsPerMonth: -1, // Unlimited in dev
      maxReceiptScansPerMonth: -1,
      maxBudgets: -1,
      maxCategories: -1,
    },
  };
  
  const staging: Environment = {
    name: 'staging',
    api: {
      baseUrl: 'https://staging-api.pfin.app/api',
      timeout: 15000,
      retries: 3,
    },
    storage: {
      prefix: 'pfin_staging_',
      encryption: true,
    },
    analytics: {
      enabled: true,
      trackingId: 'STAGING_ANALYTICS_ID',
      debugMode: true,
    },
    logging: {
      enabled: true,
      level: 'info',
      maxLogs: 500,
    },
    features: {
      receiptScanning: true,
      cloudSync: true,
      premiumFeatures: true,
      betaFeatures: true,
    },
    limits: {
      maxTransactionsPerMonth: 1000,
      maxReceiptScansPerMonth: 100,
      maxBudgets: 20,
      maxCategories: 50,
    },
  };
  
  const production: Environment = {
    name: 'production',
    api: {
      baseUrl: 'https://api.pfin.app/api',
      timeout: 15000,
      retries: 3,
    },
    storage: {
      prefix: 'pfin_',
      encryption: true,
    },
    analytics: {
      enabled: true,
      trackingId: process.env.EXPO_PUBLIC_ANALYTICS_ID,
      debugMode: false,
    },
    logging: {
      enabled: true,
      level: 'error',
      maxLogs: 100,
    },
    features: {
      receiptScanning: true,
      cloudSync: true,
      premiumFeatures: false, // Requires subscription
      betaFeatures: false,
    },
    limits: {
      maxTransactionsPerMonth: 100, // Free tier limit
      maxReceiptScansPerMonth: 10,
      maxBudgets: 5,
      maxCategories: 20,
    },
  };
  
  // Environment detection
  const getEnvironment = (): Environment => {
    const nodeEnv = process.env.NODE_ENV;
    const expoEnv = process.env.EXPO_PUBLIC_ENVIRONMENT;
    
    if (expoEnv === 'production' || nodeEnv === 'production') {
      return production;
    }
    
    if (expoEnv === 'staging') {
      return staging;
    }
    
    return development;
  };
  
  export const environment = getEnvironment();
  
  // Helper functions
  export const isDevelopment = () => environment.name === 'development';
  export const isProduction = () => environment.name === 'production';
  export const isStaging = () => environment.name === 'staging';
  
  // Feature checks
  export const canUseFeature = (feature: keyof Environment['features']): boolean => {
    return environment.features[feature];
  };
  
  export const isWithinLimit = (
    limitType: keyof Environment['limits'],
    currentCount: number
  ): boolean => {
    const limit = environment.limits[limitType];
    return limit === -1 || currentCount < limit;
  };
  
  export const getRemainingLimit = (
    limitType: keyof Environment['limits'],
    currentCount: number
  ): number => {
    const limit = environment.limits[limitType];
    if (limit === -1) return -1; // Unlimited
    return Math.max(0, limit - currentCount);
  };