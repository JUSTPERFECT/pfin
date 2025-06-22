import { Alert, Linking, Platform } from 'react-native';

export type PermissionType = 'camera' | 'storage' | 'notifications';

export interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'never_ask_again' | 'undetermined';
}

export class PermissionService {
  static async requestCameraPermission(): Promise<PermissionResult> {
    try {
      // TODO: Implement camera permission request
      // This would use expo-camera or react-native-permissions
      
      if (__DEV__) {
        console.log('📷 Camera permission requested');
        return {
          granted: true,
          canAskAgain: true,
          status: 'granted',
        };
      }

      // Placeholder implementation
      return {
        granted: false,
        canAskAgain: true,
        status: 'undetermined',
      };
    } catch (error) {
      console.error('Failed to request camera permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
    }
  }

  static async requestStoragePermission(): Promise<PermissionResult> {
    try {
      // TODO: Implement storage permission request
      
      if (__DEV__) {
        console.log('💾 Storage permission requested');
        return {
          granted: true,
          canAskAgain: true,
          status: 'granted',
        };
      }

      return {
        granted: false,
        canAskAgain: true,
        status: 'undetermined',
      };
    } catch (error) {
      console.error('Failed to request storage permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
    }
  }

  static async requestNotificationPermission(): Promise<PermissionResult> {
    try {
      // TODO: Implement notification permission request
      
      if (__DEV__) {
        console.log('🔔 Notification permission requested');
        return {
          granted: true,
          canAskAgain: true,
          status: 'granted',
        };
      }

      return {
        granted: false,
        canAskAgain: true,
        status: 'undetermined',
      };
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
    }
  }

  static showPermissionAlert(
    permissionType: PermissionType,
    onOpenSettings?: () => void
  ): void {
    const permissionNames = {
      camera: 'Camera',
      storage: 'Storage',
      notifications: 'Notifications',
    };

    const permissionName = permissionNames[permissionType];

    Alert.alert(
      `${permissionName} Permission Required`,
      `This app needs ${permissionName.toLowerCase()} permission to function properly. Please enable it in your device settings.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => {
            onOpenSettings?.();
            this.openAppSettings();
          },
        },
      ]
    );
  }

  static openAppSettings(): void {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }

  static async checkPermission(permissionType: PermissionType): Promise<PermissionResult> {
    switch (permissionType) {
      case 'camera':
        return this.requestCameraPermission();
      case 'storage':
        return this.requestStoragePermission();
      case 'notifications':
        return this.requestNotificationPermission();
      default:
        return {
          granted: false,
          canAskAgain: false,
          status: 'denied',
        };
    }
  }
}