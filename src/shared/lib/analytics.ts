interface AnalyticsEvent {
    event: string;
    properties?: Record<string, any>;
    userId?: string;
  }
  
  interface AnalyticsUser {
    userId: string;
    properties?: Record<string, any>;
  }
  
  export class AnalyticsService {
    private static isEnabled = true;
    private static userId: string | null = null;
  
    static setEnabled(enabled: boolean): void {
      this.isEnabled = enabled;
    }
  
    static setUserId(userId: string): void {
      this.userId = userId;
    }
  
    static track(event: string, properties?: Record<string, any>): void {
      if (!this.isEnabled) return;
  
      const analyticsEvent: AnalyticsEvent = {
        event,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          platform: 'mobile',
        },
        userId: this.userId || undefined,
      };
  
      // In development, just log to console
      if (__DEV__) {
        console.log('📊 Analytics Event:', analyticsEvent);
        return;
      }
  
      // TODO: Send to analytics service (Firebase, Mixpanel, etc.)
      this.sendToAnalyticsService(analyticsEvent);
    }
  
    static identify(user: AnalyticsUser): void {
      if (!this.isEnabled) return;
  
      this.userId = user.userId;
  
      if (__DEV__) {
        console.log('👤 Analytics Identify:', user);
        return;
      }
  
      // TODO: Send user identification to analytics service
      this.sendUserToAnalyticsService(user);
    }
  
    static screen(screenName: string, properties?: Record<string, any>): void {
      this.track('screen_view', {
        screen_name: screenName,
        ...properties,
      });
    }
  
    // Transaction-specific events
    static transactionAdded(type: 'expense' | 'income', amount: number, category: string): void {
      this.track('transaction_added', {
        transaction_type: type,
        amount,
        category,
      });
    }
  
    static budgetCreated(amount: number, category: string): void {
      this.track('budget_created', {
        amount,
        category,
      });
    }
  
    static receiptScanned(success: boolean): void {
      this.track('receipt_scanned', {
        success,
      });
    }
  
    static insightViewed(insightType: string): void {
      this.track('insight_viewed', {
        insight_type: insightType,
      });
    }
  
    private static async sendToAnalyticsService(event: AnalyticsEvent): Promise<void> {
      try {
        // TODO: Implement actual analytics service integration
        // Examples:
        // - Firebase Analytics
        // - Mixpanel
        // - Amplitude
        // - Custom analytics endpoint
      } catch (error) {
        console.error('Failed to send analytics event:', error);
      }
    }
  
    private static async sendUserToAnalyticsService(user: AnalyticsUser): Promise<void> {
      try {
        // TODO: Implement user identification
      } catch (error) {
        console.error('Failed to identify user:', error);
      }
    }
  }