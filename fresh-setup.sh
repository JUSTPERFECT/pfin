#!/bin/bash

# 🏗️ PFIN FRESH ARCHITECTURE SETUP
# Creates the complete scalable folder structure from scratch

echo "🚀 Creating pfin scalable architecture from scratch..."

# =============================================
# 1. CREATE COMPLETE DIRECTORY STRUCTURE
# =============================================

echo "📁 Creating directory structure..."

# Remove old src if exists and create fresh
rm -rf src
mkdir -p src

# App layer - Application composition & providers
mkdir -p src/app/providers
mkdir -p src/app/navigation
mkdir -p src/app/config

# Shared layer - Common utilities & resources
mkdir -p src/shared/api
mkdir -p src/shared/ui/components/Button
mkdir -p src/shared/ui/components/Input
mkdir -p src/shared/ui/components/Card
mkdir -p src/shared/ui/components/Modal
mkdir -p src/shared/ui/components/Loading
mkdir -p src/shared/ui/theme
mkdir -p src/shared/lib
mkdir -p src/shared/utils
mkdir -p src/shared/types
mkdir -p src/shared/hooks
mkdir -p src/shared/constants

# Entities layer - Business domain logic
mkdir -p src/entities/transaction/model
mkdir -p src/entities/transaction/lib
mkdir -p src/entities/user/model
mkdir -p src/entities/budget/model
mkdir -p src/entities/category/model

# Features layer - Self-contained feature modules
mkdir -p src/features/transaction-tracking/api
mkdir -p src/features/transaction-tracking/model
mkdir -p src/features/transaction-tracking/ui/AddTransactionForm
mkdir -p src/features/transaction-tracking/ui/TransactionList
mkdir -p src/features/transaction-tracking/ui/TransactionDetail
mkdir -p src/features/transaction-tracking/ui/CategoryPicker
mkdir -p src/features/transaction-tracking/lib

mkdir -p src/features/budget-management/api
mkdir -p src/features/budget-management/model
mkdir -p src/features/budget-management/ui/CreateBudgetForm
mkdir -p src/features/budget-management/ui/BudgetProgressCard
mkdir -p src/features/budget-management/ui/BudgetList

mkdir -p src/features/receipt-scanning/api
mkdir -p src/features/receipt-scanning/model
mkdir -p src/features/receipt-scanning/ui/CameraView
mkdir -p src/features/receipt-scanning/ui/ProcessingModal
mkdir -p src/features/receipt-scanning/ui/ReceiptPreview
mkdir -p src/features/receipt-scanning/lib

mkdir -p src/features/insights-analytics/api
mkdir -p src/features/insights-analytics/model
mkdir -p src/features/insights-analytics/ui/SpendingChart
mkdir -p src/features/insights-analytics/ui/CategoryBreakdown
mkdir -p src/features/insights-analytics/ui/TrendAnalysis
mkdir -p src/features/insights-analytics/ui/InsightCard
mkdir -p src/features/insights-analytics/lib

mkdir -p src/features/user-profile/api
mkdir -p src/features/user-profile/model
mkdir -p src/features/user-profile/ui/ProfileForm
mkdir -p src/features/user-profile/ui/SettingsList
mkdir -p src/features/user-profile/ui/CurrencyPicker

mkdir -p src/features/onboarding/model
mkdir -p src/features/onboarding/ui/WelcomeScreen
mkdir -p src/features/onboarding/ui/FeaturesScreen
mkdir -p src/features/onboarding/ui/SetupBudgetScreen
mkdir -p src/features/onboarding/ui/DoneScreen

# Widgets layer - Complex UI compositions
mkdir -p src/widgets/transaction-summary/hooks
mkdir -p src/widgets/quick-actions
mkdir -p src/widgets/expense-calendar
mkdir -p src/widgets/budget-overview

# Pages layer - Screen compositions
mkdir -p src/pages/HomeScreen
mkdir -p src/pages/TransactionsScreen
mkdir -p src/pages/BudgetScreen
mkdir -p src/pages/InsightsScreen
mkdir -p src/pages/SettingsScreen
mkdir -p src/pages/ReceiptScanScreen

# Test directories
mkdir -p __tests__/entities
mkdir -p __tests__/features
mkdir -p __tests__/utils

# Documentation
mkdir -p docs

echo "✅ Directory structure created!"

# =============================================
# 2. CREATE ALL INDEX FILES FOR EXPORTS
# =============================================

echo "📝 Creating index files for proper exports..."

# Root src index
cat > src/index.ts << 'EOF'
export * from './app';
export * from './shared';
export * from './entities';
export * from './features';
export * from './widgets';
export * from './pages';
EOF

# App layer indices
cat > src/app/index.ts << 'EOF'
export { default as App } from './App';
export * from './providers';
export * from './navigation';
export * from './config';
EOF

cat > src/app/providers/index.ts << 'EOF'
// Will export providers here
// export { ServiceProvider } from './ServiceProvider';
// export { ThemeProvider } from './ThemeProvider';
// export { AuthProvider } from './AuthProvider';
EOF

cat > src/app/navigation/index.ts << 'EOF'
// Will export navigation here
// export { MainTabNavigator } from './MainTabNavigator';
// export { AuthNavigator } from './AuthNavigator';
// export { OnboardingNavigator } from './OnboardingNavigator';
EOF

cat > src/app/config/index.ts << 'EOF'
export * from './environment';
export * from './features';
export * from './constants';
EOF

# Shared layer indices
cat > src/shared/index.ts << 'EOF'
export * from './api';
export * from './ui';
export * from './lib';
export * from './utils';
export * from './types';
export * from './hooks';
export * from './constants';
EOF

cat > src/shared/ui/index.ts << 'EOF'
export * from './components';
export * from './theme';
EOF

cat > src/shared/ui/components/index.ts << 'EOF'
export * from './Button';
export * from './Input';
export * from './Card';
export * from './Modal';
export * from './Loading';
EOF

cat > src/shared/ui/components/Button/index.ts << 'EOF'
export { default as Button } from './Button';
export * from './Button';
EOF

cat > src/shared/ui/components/Input/index.ts << 'EOF'
export { default as Input } from './Input';
export * from './Input';
EOF

cat > src/shared/ui/components/Card/index.ts << 'EOF'
export { default as Card } from './Card';
export * from './Card';
EOF

cat > src/shared/ui/components/Modal/index.ts << 'EOF'
export { default as Modal } from './Modal';
export * from './Modal';
EOF

cat > src/shared/ui/components/Loading/index.ts << 'EOF'
export * from './LoadingStates';
EOF

cat > src/shared/ui/theme/index.ts << 'EOF'
export * from './colors';
export * from './typography';
export * from './spacing';
EOF

cat > src/shared/utils/index.ts << 'EOF'
export * from './currency';
export * from './date';
export * from './validation';
export * from './math';
export * from './format';
EOF

cat > src/shared/types/index.ts << 'EOF'
export * from './common';
export * from './api';
export * from './navigation';
EOF

cat > src/shared/hooks/index.ts << 'EOF'
export * from './useAsyncStorage';
export * from './useDebounce';
export * from './usePermissions';
EOF

cat > src/shared/constants/index.ts << 'EOF'
export * from './categories';
export * from './currencies';
export * from './errors';
EOF

# Entities layer indices
cat > src/entities/index.ts << 'EOF'
export * from './transaction';
export * from './user';
export * from './budget';
export * from './category';
EOF

cat > src/entities/transaction/index.ts << 'EOF'
export * from './model';
export * from './lib';
EOF

cat > src/entities/transaction/model/index.ts << 'EOF'
export * from './types';
export * from './entity';
export * from './validator';
EOF

cat > src/entities/transaction/lib/index.ts << 'EOF'
export * from './calculator';
export * from './categorizer';
EOF

cat > src/entities/user/index.ts << 'EOF'
export * from './model';
EOF

cat > src/entities/user/model/index.ts << 'EOF'
export * from './types';
export * from './entity';
EOF

cat > src/entities/budget/index.ts << 'EOF'
export * from './model';
EOF

cat > src/entities/budget/model/index.ts << 'EOF'
export * from './types';
export * from './entity';
export * from './calculator';
EOF

cat > src/entities/category/index.ts << 'EOF'
export * from './model';
EOF

cat > src/entities/category/model/index.ts << 'EOF'
export * from './types';
export * from './entity';
EOF

# Features layer indices
cat > src/features/index.ts << 'EOF'
export * from './transaction-tracking';
export * from './budget-management';
export * from './receipt-scanning';
export * from './insights-analytics';
export * from './user-profile';
export * from './onboarding';
EOF

# Transaction tracking feature
cat > src/features/transaction-tracking/index.ts << 'EOF'
export * from './model';
export * from './ui';
export * from './api';
export * from './lib';
EOF

cat > src/features/transaction-tracking/model/index.ts << 'EOF'
export * from './store';
export * from './selectors';
export * from './actions';
EOF

cat > src/features/transaction-tracking/ui/index.ts << 'EOF'
export * from './AddTransactionForm';
export * from './TransactionList';
export * from './TransactionDetail';
export * from './CategoryPicker';
EOF

cat > src/features/transaction-tracking/ui/AddTransactionForm/index.ts << 'EOF'
export { default as AddTransactionForm } from './AddTransactionForm';
export * from './AddTransactionForm';
EOF

cat > src/features/transaction-tracking/ui/TransactionList/index.ts << 'EOF'
export { default as TransactionList } from './TransactionList';
export * from './TransactionList';
EOF

cat > src/features/transaction-tracking/ui/TransactionDetail/index.ts << 'EOF'
export { default as TransactionDetail } from './TransactionDetail';
export * from './TransactionDetail';
EOF

cat > src/features/transaction-tracking/ui/CategoryPicker/index.ts << 'EOF'
export { default as CategoryPicker } from './CategoryPicker';
export * from './CategoryPicker';
EOF

cat > src/features/transaction-tracking/api/index.ts << 'EOF'
export * from './repository';
export * from './client';
EOF

cat > src/features/transaction-tracking/lib/index.ts << 'EOF'
export * from './validator';
export * from './formatter';
EOF

# Budget management feature
cat > src/features/budget-management/index.ts << 'EOF'
export * from './model';
export * from './ui';
export * from './api';
EOF

cat > src/features/budget-management/model/index.ts << 'EOF'
export * from './store';
export * from './calculator';
EOF

cat > src/features/budget-management/ui/index.ts << 'EOF'
export * from './CreateBudgetForm';
export * from './BudgetProgressCard';
export * from './BudgetList';
EOF

cat > src/features/budget-management/ui/CreateBudgetForm/index.ts << 'EOF'
export { default as CreateBudgetForm } from './CreateBudgetForm';
export * from './CreateBudgetForm';
EOF

cat > src/features/budget-management/ui/BudgetProgressCard/index.ts << 'EOF'
export { default as BudgetProgressCard } from './BudgetProgressCard';
export * from './BudgetProgressCard';
EOF

cat > src/features/budget-management/ui/BudgetList/index.ts << 'EOF'
export { default as BudgetList } from './BudgetList';
export * from './BudgetList';
EOF

cat > src/features/budget-management/api/index.ts << 'EOF'
export * from './repository';
EOF

# Receipt scanning feature
cat > src/features/receipt-scanning/index.ts << 'EOF'
export * from './model';
export * from './ui';
export * from './api';
export * from './lib';
EOF

cat > src/features/receipt-scanning/model/index.ts << 'EOF'
export * from './processor';
export * from './parser';
EOF

cat > src/features/receipt-scanning/ui/index.ts << 'EOF'
export * from './CameraView';
export * from './ProcessingModal';
export * from './ReceiptPreview';
EOF

cat > src/features/receipt-scanning/ui/CameraView/index.ts << 'EOF'
export { default as CameraView } from './CameraView';
export * from './CameraView';
EOF

cat > src/features/receipt-scanning/ui/ProcessingModal/index.ts << 'EOF'
export { default as ProcessingModal } from './ProcessingModal';
export * from './ProcessingModal';
EOF

cat > src/features/receipt-scanning/ui/ReceiptPreview/index.ts << 'EOF'
export { default as ReceiptPreview } from './ReceiptPreview';
export * from './ReceiptPreview';
EOF

cat > src/features/receipt-scanning/api/index.ts << 'EOF'
export * from './ocr-service';
export * from './ml-service';
EOF

cat > src/features/receipt-scanning/lib/index.ts << 'EOF'
export * from './image-processor';
export * from './text-extractor';
EOF

# Insights analytics feature
cat > src/features/insights-analytics/index.ts << 'EOF'
export * from './model';
export * from './ui';
export * from './api';
export * from './lib';
EOF

cat > src/features/insights-analytics/model/index.ts << 'EOF'
export * from './analyzer';
export * from './insights-store';
EOF

cat > src/features/insights-analytics/ui/index.ts << 'EOF'
export * from './SpendingChart';
export * from './CategoryBreakdown';
export * from './TrendAnalysis';
export * from './InsightCard';
EOF

cat > src/features/insights-analytics/ui/SpendingChart/index.ts << 'EOF'
export { default as SpendingChart } from './SpendingChart';
export * from './SpendingChart';
EOF

cat > src/features/insights-analytics/ui/CategoryBreakdown/index.ts << 'EOF'
export { default as CategoryBreakdown } from './CategoryBreakdown';
export * from './CategoryBreakdown';
EOF

cat > src/features/insights-analytics/ui/TrendAnalysis/index.ts << 'EOF'
export { default as TrendAnalysis } from './TrendAnalysis';
export * from './TrendAnalysis';
EOF

cat > src/features/insights-analytics/ui/InsightCard/index.ts << 'EOF'
export { default as InsightCard } from './InsightCard';
export * from './InsightCard';
EOF

cat > src/features/insights-analytics/api/index.ts << 'EOF'
export * from './analytics-service';
EOF

cat > src/features/insights-analytics/lib/index.ts << 'EOF'
export * from './chart-utils';
export * from './data-transformer';
EOF

# User profile feature
cat > src/features/user-profile/index.ts << 'EOF'
export * from './model';
export * from './ui';
export * from './api';
EOF

cat > src/features/user-profile/model/index.ts << 'EOF'
export * from './profile-store';
export * from './settings-store';
EOF

cat > src/features/user-profile/ui/index.ts << 'EOF'
export * from './ProfileForm';
export * from './SettingsList';
export * from './CurrencyPicker';
EOF

cat > src/features/user-profile/ui/ProfileForm/index.ts << 'EOF'
export { default as ProfileForm } from './ProfileForm';
export * from './ProfileForm';
EOF

cat > src/features/user-profile/ui/SettingsList/index.ts << 'EOF'
export { default as SettingsList } from './SettingsList';
export * from './SettingsList';
EOF

cat > src/features/user-profile/ui/CurrencyPicker/index.ts << 'EOF'
export { default as CurrencyPicker } from './CurrencyPicker';
export * from './CurrencyPicker';
EOF

cat > src/features/user-profile/api/index.ts << 'EOF'
export * from './profile-service';
EOF

# Onboarding feature
cat > src/features/onboarding/index.ts << 'EOF'
export * from './model';
export * from './ui';
EOF

cat > src/features/onboarding/model/index.ts << 'EOF'
export * from './onboarding-store';
EOF

cat > src/features/onboarding/ui/index.ts << 'EOF'
export * from './WelcomeScreen';
export * from './FeaturesScreen';
export * from './SetupBudgetScreen';
export * from './DoneScreen';
EOF

cat > src/features/onboarding/ui/WelcomeScreen/index.ts << 'EOF'
export { default as WelcomeScreen } from './WelcomeScreen';
export * from './WelcomeScreen';
EOF

cat > src/features/onboarding/ui/FeaturesScreen/index.ts << 'EOF'
export { default as FeaturesScreen } from './FeaturesScreen';
export * from './FeaturesScreen';
EOF

cat > src/features/onboarding/ui/SetupBudgetScreen/index.ts << 'EOF'
export { default as SetupBudgetScreen } from './SetupBudgetScreen';
export * from './SetupBudgetScreen';
EOF

cat > src/features/onboarding/ui/DoneScreen/index.ts << 'EOF'
export { default as DoneScreen } from './DoneScreen';
export * from './DoneScreen';
EOF

# Widgets layer indices
cat > src/widgets/index.ts << 'EOF'
export * from './transaction-summary';
export * from './quick-actions';
export * from './expense-calendar';
export * from './budget-overview';
EOF

cat > src/widgets/transaction-summary/index.ts << 'EOF'
export { default as TransactionSummary } from './TransactionSummary';
export * from './TransactionSummary';
export * from './hooks';
EOF

cat > src/widgets/transaction-summary/hooks/index.ts << 'EOF'
export * from './useTransactionSummary';
EOF

cat > src/widgets/quick-actions/index.ts << 'EOF'
export { default as QuickActions } from './QuickActions';
export * from './QuickActions';
EOF

cat > src/widgets/expense-calendar/index.ts << 'EOF'
export { default as ExpenseCalendar } from './ExpenseCalendar';
export * from './ExpenseCalendar';
EOF

cat > src/widgets/budget-overview/index.ts << 'EOF'
export { default as BudgetOverview } from './BudgetOverview';
export * from './BudgetOverview';
EOF

# Pages layer indices
cat > src/pages/index.ts << 'EOF'
export * from './HomeScreen';
export * from './TransactionsScreen';
export * from './BudgetScreen';
export * from './InsightsScreen';
export * from './SettingsScreen';
export * from './ReceiptScanScreen';
EOF

cat > src/pages/HomeScreen/index.ts << 'EOF'
export { default as HomeScreen } from './HomeScreen';
export * from './HomeScreen';
EOF

cat > src/pages/TransactionsScreen/index.ts << 'EOF'
export { default as TransactionsScreen } from './TransactionsScreen';
export * from './TransactionsScreen';
EOF

cat > src/pages/BudgetScreen/index.ts << 'EOF'
export { default as BudgetScreen } from './BudgetScreen';
export * from './BudgetScreen';
EOF

cat > src/pages/InsightsScreen/index.ts << 'EOF'
export { default as InsightsScreen } from './InsightsScreen';
export * from './InsightsScreen';
EOF

cat > src/pages/SettingsScreen/index.ts << 'EOF'
export { default as SettingsScreen } from './SettingsScreen';
export * from './SettingsScreen';
EOF

cat > src/pages/ReceiptScanScreen/index.ts << 'EOF'
export { default as ReceiptScanScreen } from './ReceiptScanScreen';
export * from './ReceiptScanScreen';
EOF

echo "✅ All index files created!"

echo ""
echo "🎉 Fresh pfin architecture setup complete!"
echo ""
echo "📋 What was created:"
echo "✅ Complete scalable folder structure"
echo "✅ All necessary index.ts files for proper exports"
echo "✅ Feature-Slice Design + Clean Architecture layout"
echo "✅ Ready for immediate development"
echo ""
echo "🚀 Next steps:"
echo "1. Start creating your configuration files"
echo "2. Add your business entities (Transaction, User, Budget)"
echo "3. Build your first feature module (transaction-tracking)"
echo "4. Create shared UI components"
echo ""
echo "📁 Your new structure is ready in src/ directory!"
echo "🎯 Perfect foundation for a scalable fintech app!"