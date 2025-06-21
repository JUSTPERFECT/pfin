import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
    static async setItem<T>(key: string, value: T): Promise<void> {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to save ${key}:`, error);
        throw error;
      }
    }
  
    static async getItem<T>(key: string): Promise<T | null> {
      try {
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error(`Failed to get ${key}:`, error);
        return null;
      }
    }
  }