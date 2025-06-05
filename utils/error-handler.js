/**
 * Error Handling Utilities
 * Centralized error handling and logging for the application
 */

const ErrorHandler = {
  /**
   * Error types enumeration
   */
  ErrorTypes: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    PERMISSION_ERROR: 'PERMISSION_ERROR',
    BROWSER_ERROR: 'BROWSER_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
  },

  /**
   * Log levels enumeration
   */
  LogLevels: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  },

  /**
   * Handle and categorize errors
   * @param {Error|string} error - Error object or message
   * @param {string} context - Context where error occurred
   * @returns {Object} Processed error information
   */
  handleError(error, context = 'Unknown') {
    const errorInfo = this.categorizeError(error);
    
    // Log the error
    this.log(this.LogLevels.ERROR, `[${context}] ${errorInfo.message}`, errorInfo);
    
    // Return user-friendly error information
    return {
      type: errorInfo.type,
      message: errorInfo.userMessage,
      technical: errorInfo.message,
      context: context,
      timestamp: new Date().toISOString(),
      canRetry: errorInfo.canRetry
    };
  },

  /**
   * Categorize error based on type and content
   * @param {Error|string} error - Error to categorize
   * @returns {Object} Categorized error information
   */
  categorizeError(error) {
    let message = '';
    let type = this.ErrorTypes.UNKNOWN_ERROR;
    let userMessage = 'An unexpected error occurred';
    let canRetry = true;

    if (typeof error === 'string') {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
    } else {
      message = 'Unknown error occurred';
    }

    // Network-related errors
    if (this.isNetworkError(error)) {
      type = this.ErrorTypes.NETWORK_ERROR;
      userMessage = 'Network connection failed. Please check your internet connection.';
      canRetry = true;
    }
    // Timeout errors
    else if (this.isTimeoutError(error)) {
      type = this.ErrorTypes.TIMEOUT_ERROR;
      userMessage = 'Request timed out. Please try again.';
      canRetry = true;
    }
    // Permission errors
    else if (this.isPermissionError(error)) {
      type = this.ErrorTypes.PERMISSION_ERROR;
      userMessage = 'Permission denied. Please allow the required permissions.';
      canRetry = false;
    }
    // Browser compatibility errors
    else if (this.isBrowserError(error)) {
      type = this.ErrorTypes.BROWSER_ERROR;
      userMessage = 'Your browser does not support this feature. Please use a modern browser.';
      canRetry = false;
    }

    return {
      type,
      message,
      userMessage,
      canRetry
    };
  },

  /**
   * Check if error is network-related
   * @param {Error|string} error - Error to check
   * @returns {boolean} True if network error
   */
  isNetworkError(error) {
    const networkKeywords = [
      'network', 'connection', 'fetch', 'xhr', 'cors',
      'net::', 'ERR_NETWORK', 'ERR_INTERNET_DISCONNECTED'
    ];
    
    const errorString = error.toString().toLowerCase();
    return networkKeywords.some(keyword => errorString.includes(keyword));
  },

  /**
   * Check if error is timeout-related
   * @param {Error|string} error - Error to check
   * @returns {boolean} True if timeout error
   */
  isTimeoutError(error) {
    const timeoutKeywords = ['timeout', 'aborted', 'cancelled'];
    const errorString = error.toString().toLowerCase();
    return timeoutKeywords.some(keyword => errorString.includes(keyword));
  },

  /**
   * Check if error is permission-related
   * @param {Error|string} error - Error to check
   * @returns {boolean} True if permission error
   */
  isPermissionError(error) {
    const permissionKeywords = ['permission', 'denied', 'blocked', 'not allowed'];
    const errorString = error.toString().toLowerCase();
    return permissionKeywords.some(keyword => errorString.includes(keyword));
  },

  /**
   * Check if error is browser compatibility-related
   * @param {Error|string} error - Error to check
   * @returns {boolean} True if browser error
   */
  isBrowserError(error) {
    const browserKeywords = [
      'not supported', 'undefined', 'not a function',
      'performance', 'fetch is not defined'
    ];
    const errorString = error.toString().toLowerCase();
    return browserKeywords.some(keyword => errorString.includes(keyword));
  },

  /**
   * Log message with specified level
   * @param {string} level - Log level
   * @param {string} message - Message to log
   * @param {Object} data - Additional data to log
   */
  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    // Console logging based on level
    switch (level) {
      case this.LogLevels.ERROR:
        console.error(`[${timestamp}] ERROR: ${message}`, data);
        break;
      case this.LogLevels.WARN:
        console.warn(`[${timestamp}] WARN: ${message}`, data);
        break;
      case this.LogLevels.INFO:
        console.info(`[${timestamp}] INFO: ${message}`, data);
        break;
      case this.LogLevels.DEBUG:
        console.debug(`[${timestamp}] DEBUG: ${message}`, data);
        break;
      default:
        console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data);
    }

    // Store in local storage for debugging (optional)
    this.storeLog(logEntry);
  },

  /**
   * Store log entry in local storage
   * @param {Object} logEntry - Log entry to store
   */
  storeLog(logEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('netpulse_logs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 100 log entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('netpulse_logs', JSON.stringify(logs));
    } catch (e) {
      // Ignore storage errors
    }
  },

  /**
   * Get stored logs
   * @returns {Array} Array of log entries
   */
  getLogs() {
    try {
      return JSON.parse(localStorage.getItem('netpulse_logs') || '[]');
    } catch (e) {
      return [];
    }
  },

  /**
   * Clear stored logs
   */
  clearLogs() {
    try {
      localStorage.removeItem('netpulse_logs');
    } catch (e) {
      // Ignore storage errors
    }
  },

  /**
   * Create a retry wrapper for functions
   * @param {Function} fn - Function to wrap
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delay - Delay between retries in ms
   * @returns {Function} Wrapped function with retry logic
   */
  withRetry(fn, maxRetries = 3, delay = 1000) {
    return async (...args) => {
      let lastError;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await fn(...args);
        } catch (error) {
          lastError = error;
          const errorInfo = this.categorizeError(error);
          
          // Don't retry if error is not retryable
          if (!errorInfo.canRetry) {
            throw error;
          }
          
          // Don't retry on last attempt
          if (attempt === maxRetries) {
            break;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
          
          this.log(this.LogLevels.WARN, `Retrying operation (attempt ${attempt + 2}/${maxRetries + 1})`);
        }
      }
      
      throw lastError;
    };
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
} else {
  window.ErrorHandler = ErrorHandler;
}
