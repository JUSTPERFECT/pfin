type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  source?: string;
}

export class Logger {
  private static logs: LogEntry[] = [];
  private static maxLogs = 1000;
  private static isEnabled = __DEV__;

  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  static debug(message: string, data?: any, source?: string): void {
    this.log('debug', message, data, source);
  }

  static info(message: string, data?: any, source?: string): void {
    this.log('info', message, data, source);
  }

  static warn(message: string, data?: any, source?: string): void {
    this.log('warn', message, data, source);
  }

  static error(message: string, data?: any, source?: string): void {
    this.log('error', message, data, source);
  }

  private static log(level: LogLevel, message: string, data?: any, source?: string): void {
    if (!this.isEnabled) return;

    const logEntry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      source,
    };

    // Add to logs array
    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with appropriate method
    const consoleMethod = console[level] || console.log;
    const logMessage = source ? `[${source}] ${message}` : message;
    
    if (data !== undefined) {
      consoleMethod(logMessage, data);
    } else {
      consoleMethod(logMessage);
    }
  }

  static getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  static clearLogs(): void {
    this.logs = [];
  }

  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Convenience methods for common use cases
  static logTransaction(action: string, data: any): void {
    this.info(`Transaction ${action}`, data, 'TransactionService');
  }

  static logNavigation(screen: string, params?: any): void {
    this.debug(`Navigated to ${screen}`, params, 'Navigation');
  }

  static logError(error: Error, context?: string): void {
    this.error(error.message, {
      name: error.name,
      stack: error.stack,
      context,
    }, 'ErrorHandler');
  }

  static logPerformance(operation: string, duration: number): void {
    this.info(`Performance: ${operation} took ${duration}ms`, { duration }, 'Performance');
  }
}