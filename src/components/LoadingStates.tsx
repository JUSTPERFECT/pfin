// src/components/LoadingStates.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

// Loading Spinner Component
export const LoadingSpinner = ({ 
  size = 'large', 
  color = '#2E7D61', 
  text = 'Loading...' 
}: {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
}) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size={size} color={color} />
    <Text style={styles.loadingText}>{text}</Text>
  </View>
);

// Card Loading Skeleton
export const CardSkeleton = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonHeader}>
      <View style={[styles.skeletonLine, styles.skeletonTitle]} />
      <View style={[styles.skeletonLine, styles.skeletonDate]} />
    </View>
    <View style={styles.skeletonBody}>
      <View style={[styles.skeletonLine, styles.skeletonAmount]} />
      <View style={[styles.skeletonLine, styles.skeletonDescription]} />
    </View>
  </View>
);

// Transaction Loading Skeleton
export const TransactionSkeleton = () => (
  <View style={styles.transactionSkeleton}>
    <View style={styles.skeletonAvatar} />
    <View style={styles.transactionSkeletonContent}>
      <View style={[styles.skeletonLine, styles.skeletonTransactionTitle]} />
      <View style={[styles.skeletonLine, styles.skeletonTransactionSubtitle]} />
    </View>
    <View style={[styles.skeletonLine, styles.skeletonTransactionAmount]} />
  </View>
);

// Empty State Component
export const EmptyState = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  style,
}: {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  style?: any;
}) => (
  <View style={[styles.emptyState, style]}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyDescription}>{description}</Text>
    {actionText && onAction && (
      <TouchableOpacity style={styles.emptyButton} onPress={onAction}>
        <Text style={styles.emptyButtonText}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// Error State Component
export const ErrorState = ({
  title = 'Something went wrong',
  description = 'Please try again later',
  actionText = 'Try Again',
  onRetry,
}: {
  title?: string;
  description?: string;
  actionText?: string;
  onRetry?: () => void;
}) => (
  <View style={styles.errorState}>
    <Text style={styles.errorIcon}>😕</Text>
    <Text style={styles.errorTitle}>{title}</Text>
    <Text style={styles.errorDescription}>{description}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.errorButton} onPress={onRetry}>
        <Text style={styles.errorButtonText}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// Loading Overlay (for full screen loading)
export const LoadingOverlay = ({ 
  visible, 
  text = 'Loading...' 
}: { 
  visible: boolean; 
  text?: string; 
}) => {
  if (!visible) return null;
  
  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <ActivityIndicator size="large" color="#2E7D61" />
        <Text style={styles.overlayText}>{text}</Text>
      </View>
    </View>
  );
};

// Inline Loading (for buttons)
export const InlineLoading = ({ 
  loading, 
  text, 
  loadingText 
}: { 
  loading: boolean; 
  text: string; 
  loadingText?: string; 
}) => {
  if (loading) {
    return (
      <View style={styles.inlineLoading}>
        <ActivityIndicator size="small" color="#FFFFFF" style={styles.inlineSpinner} />
        <Text style={styles.inlineLoadingText}>{loadingText || 'Loading...'}</Text>
      </View>
    );
  }
  
  return <Text style={styles.buttonText}>{text}</Text>;
};

const styles = StyleSheet.create({
  // Loading Spinner
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Skeleton Components
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  skeletonBody: {
    gap: 12,
  },
  skeletonLine: {
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    opacity: 0.7,
  },
  skeletonTitle: {
    height: 20,
    width: '60%',
  },
  skeletonDate: {
    height: 16,
    width: '30%',
  },
  skeletonAmount: {
    height: 24,
    width: '40%',
  },
  skeletonDescription: {
    height: 16,
    width: '80%',
  },

  // Transaction Skeleton
  transactionSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 12,
  },
  transactionSkeletonContent: {
    flex: 1,
    gap: 6,
  },
  skeletonTransactionTitle: {
    height: 16,
    width: '70%',
  },
  skeletonTransactionSubtitle: {
    height: 14,
    width: '50%',
  },
  skeletonTransactionAmount: {
    height: 18,
    width: '25%',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#2E7D61',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Error State
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Loading Overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  overlayText: {
    marginTop: 16,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },

  // Inline Loading
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineSpinner: {
    marginRight: 8,
  },
  inlineLoadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#2E7D61',
    fontSize: 16,
    fontWeight: '600',
  },
});