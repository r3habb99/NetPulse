/**
 * Data Formatting Utilities
 * Format data for display in the user interface
 */

const Formatters = {
  /**
   * Format speed value for display
   * @param {number} speed - Speed in Mbps
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted speed string
   */
  formatSpeed(speed, decimals = 1) {
    if (speed === null || speed === undefined || isNaN(speed)) {
      return '-- Mbps';
    }

    if (speed < 0.1) {
      return '< 0.1 Mbps';
    }

    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(decimals)} Gbps`;
    }

    return `${speed.toFixed(decimals)} Mbps`;
  },

  /**
   * Format latency value for display
   * @param {number} latency - Latency in milliseconds
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted latency string
   */
  formatLatency(latency, decimals = 0) {
    if (latency === null || latency === undefined || isNaN(latency)) {
      return '-- ms';
    }

    if (latency < 1) {
      return '< 1 ms';
    }

    return `${latency.toFixed(decimals)} ms`;
  },

  /**
   * Format percentage value
   * @param {number} percentage - Percentage value
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted percentage string
   */
  formatPercentage(percentage, decimals = 1) {
    if (percentage === null || percentage === undefined || isNaN(percentage)) {
      return '--%';
    }

    return `${percentage.toFixed(decimals)}%`;
  },

  /**
   * Format file size for display
   * @param {number} bytes - Size in bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted size string
   */
  formatFileSize(bytes, decimals = 1) {
    if (bytes === null || bytes === undefined || isNaN(bytes)) {
      return '-- B';
    }

    return MathUtils.formatBytes(bytes, decimals);
  },

  /**
   * Format duration in seconds
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration string
   */
  formatDuration(seconds) {
    if (seconds === null || seconds === undefined || isNaN(seconds)) {
      return '--:--';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    return `${remainingSeconds}s`;
  },

  /**
   * Format timestamp for display
   * @param {string|Date} timestamp - Timestamp to format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted timestamp
   */
  formatTimestamp(timestamp, options = {}) {
    const {
      includeDate = true,
      includeTime = true,
      includeSeconds = false,
      locale = 'en-US'
    } = options;

    if (!timestamp) {
      return '--';
    }

    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const formatOptions = {};

    if (includeDate) {
      formatOptions.year = 'numeric';
      formatOptions.month = 'short';
      formatOptions.day = 'numeric';
    }

    if (includeTime) {
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
      
      if (includeSeconds) {
        formatOptions.second = '2-digit';
      }
    }

    return date.toLocaleString(locale, formatOptions);
  },

  /**
   * Format relative time (e.g., "2 minutes ago")
   * @param {string|Date} timestamp - Timestamp to format
   * @returns {string} Relative time string
   */
  formatRelativeTime(timestamp) {
    if (!timestamp) {
      return '--';
    }

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return this.formatTimestamp(timestamp, { includeTime: false });
    }
  },

  /**
   * Format connection quality for display
   * @param {Object} quality - Quality object with level and score
   * @returns {Object} Formatted quality information
   */
  formatConnectionQuality(quality) {
    if (!quality) {
      return {
        text: 'Unknown',
        color: '#666',
        icon: '❓'
      };
    }

    const qualityMap = {
      'excellent': {
        text: 'Excellent',
        color: '#4CAF50',
        icon: '🟢'
      },
      'good': {
        text: 'Good',
        color: '#8BC34A',
        icon: '🟡'
      },
      'fair': {
        text: 'Fair',
        color: '#FF9800',
        icon: '🟠'
      },
      'poor': {
        text: 'Poor',
        color: '#FF5722',
        icon: '🔴'
      },
      'very-poor': {
        text: 'Very Poor',
        color: '#F44336',
        icon: '🔴'
      }
    };

    return qualityMap[quality.level] || qualityMap['fair'];
  },

  /**
   * Format test progress for display
   * @param {number} progress - Progress percentage (0-100)
   * @returns {string} Formatted progress string
   */
  formatProgress(progress) {
    if (progress === null || progress === undefined || isNaN(progress)) {
      return '0%';
    }

    return `${Math.round(Math.max(0, Math.min(100, progress)))}%`;
  },

  /**
   * Format network type for display
   * @param {string} type - Network type
   * @returns {string} Formatted network type
   */
  formatNetworkType(type) {
    if (!type || type === 'unknown') {
      return 'Unknown';
    }

    const typeMap = {
      'wifi': 'Wi-Fi',
      'cellular': 'Cellular',
      'ethernet': 'Ethernet',
      'bluetooth': 'Bluetooth',
      'wimax': 'WiMAX',
      'other': 'Other',
      '4g': '4G',
      '3g': '3G',
      '2g': '2G',
      'slow-2g': 'Slow 2G'
    };

    return typeMap[type.toLowerCase()] || type;
  },

  /**
   * Format device type for display
   * @param {Object} deviceInfo - Device information
   * @returns {string} Formatted device string
   */
  formatDeviceType(deviceInfo) {
    if (!deviceInfo) {
      return 'Unknown Device';
    }

    // Handle both full deviceInfo object and deviceInfo.type object
    const typeInfo = deviceInfo.type || deviceInfo;
    const { category, isIOS, isAndroid, isWindows, isMac, isLinux } = typeInfo;

    if (!category) {
      return 'Unknown Device';
    }

    let platform = 'Unknown';
    if (isIOS) platform = 'iOS';
    else if (isAndroid) platform = 'Android';
    else if (isWindows) platform = 'Windows';
    else if (isMac) platform = 'macOS';
    else if (isLinux) platform = 'Linux';

    const deviceType = category.charAt(0).toUpperCase() + category.slice(1);

    return `${deviceType} (${platform})`;
  },

  /**
   * Format test results summary
   * @param {Object} results - Test results
   * @returns {Object} Formatted summary
   */
  formatTestSummary(results) {
    if (!results) {
      return {
        download: '--',
        upload: '--',
        latency: '--',
        quality: 'Unknown'
      };
    }

    return {
      download: this.formatSpeed(results.speed?.download?.speed),
      upload: this.formatSpeed(results.speed?.upload?.speed),
      latency: this.formatLatency(results.latency?.avg),
      quality: this.formatConnectionQuality(results.connection?.quality).text,
      timestamp: this.formatRelativeTime(results.timestamp)
    };
  },

  /**
   * Format number with thousands separator
   * @param {number} number - Number to format
   * @param {string} locale - Locale for formatting
   * @returns {string} Formatted number
   */
  formatNumber(number, locale = 'en-US') {
    if (number === null || number === undefined || isNaN(number)) {
      return '--';
    }

    return number.toLocaleString(locale);
  },

  /**
   * Format data transfer rate
   * @param {number} bytesPerSecond - Bytes per second
   * @returns {string} Formatted transfer rate
   */
  formatTransferRate(bytesPerSecond) {
    if (bytesPerSecond === null || bytesPerSecond === undefined || isNaN(bytesPerSecond)) {
      return '-- B/s';
    }

    const mbps = MathUtils.bpsToMbps(MathUtils.bytesToBits(bytesPerSecond));
    return this.formatSpeed(mbps);
  },

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @param {string} suffix - Suffix to add when truncated
   * @returns {string} Truncated text
   */
  truncateText(text, maxLength = 50, suffix = '...') {
    if (!text || text.length <= maxLength) {
      return text || '';
    }

    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  /**
   * Format error message for display
   * @param {Object} error - Error object
   * @returns {string} User-friendly error message
   */
  formatError(error) {
    if (!error) {
      return 'Unknown error occurred';
    }

    if (typeof error === 'string') {
      return error;
    }

    return error.message || error.userMessage || 'An error occurred';
  },

  /**
   * Format test configuration for display
   * @param {Object} config - Configuration object
   * @returns {Object} Formatted configuration
   */
  formatTestConfig(config) {
    if (!config) {
      return {};
    }

    return {
      latencySamples: config.latency?.samples || '--',
      speedDuration: this.formatDuration(config.speed?.downloadDuration / 1000),
      connections: config.speed?.parallelConnections || '--',
      timeout: this.formatDuration(config.latency?.timeout / 1000)
    };
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Formatters;
} else {
  window.Formatters = Formatters;
}
