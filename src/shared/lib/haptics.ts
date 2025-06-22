import { Platform } from 'react-native';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export class HapticService {
  private static isEnabled = true;

  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  static trigger(type: HapticType = 'light'): void {
    if (!this.isEnabled) return;

    try {
      if (Platform.OS === 'ios') {
        this.triggerIOS(type);
      } else if (Platform.OS === 'android') {
        this.triggerAndroid(type);
      }
    } catch (error) {
      console.warn('Failed to trigger haptic feedback:', error);
    }
  }

  private static triggerIOS(type: HapticType): void {
    // TODO: Implement iOS haptic feedback
    // This would use @react-native-community/react-native-haptic-feedback
    // or expo-haptics
    
    if (__DEV__) {
      console.log(`🔊 iOS Haptic: ${type}`);
    }
  }

  private static triggerAndroid(type: HapticType): void {
    // TODO: Implement Android haptic feedback
    
    if (__DEV__) {
      console.log(`🔊 Android Haptic: ${type}`);
    }
  }

  // Convenience methods for common actions
  static success(): void {
    this.trigger('success');
  }

  static error(): void {
    this.trigger('error');
  }

  static warning(): void {
    this.trigger('warning');
  }

  static buttonPress(): void {
    this.trigger('light');
  }

  static longPress(): void {
    this.trigger('medium');
  }

  static swipe(): void {
    this.trigger('light');
  }
}