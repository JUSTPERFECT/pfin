export interface ApiError {
    code: string;
    message: string;
    details?: any;
  }
  
  export interface RequestConfig {
    timeout?: number;
    retries?: number;
    headers?: Record<string, string>;
  }