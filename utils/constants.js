/**
 * NetPulse Application Constants
 * Centralized constants for consistent usage across the application
 */

const CONSTANTS = {
  // Application Information
  APP: {
    NAME: 'NetPulse',
    VERSION: '1.0.0',
    DESCRIPTION: 'Mobile Network Monitoring Application',
    AUTHOR: 'NetPulse Team'
  },

  // Timing Constants (in milliseconds)
  TIMING: {
    ANIMATION_FAST: 200,
    ANIMATION_NORMAL: 400,
    ANIMATION_SLOW: 800,
    DEBOUNCE_DEFAULT: 300,
    THROTTLE_DEFAULT: 100,
    TIMEOUT_SHORT: 5000,
    TIMEOUT_MEDIUM: 10000,
    TIMEOUT_LONG: 30000,
    RETRY_DELAY: 1000,
    HAPTIC_FEEDBACK_DURATION: 200,
    SCALE_PULSE_DURATION: 300,
    SWIPE_INDICATOR_DURATION: 1000,
    PULL_REFRESH_DURATION: 1500,
    VIEW_TRANSITION_DELAY: 1000
  },

  // Measurement Units
  UNITS: {
    SPEED: {
      BPS: 'bps',
      KBPS: 'Kbps',
      MBPS: 'Mbps',
      GBPS: 'Gbps'
    },
    LATENCY: {
      MS: 'ms',
      SECONDS: 's'
    },
    SIZE: {
      BYTES: 'B',
      KB: 'KB',
      MB: 'MB',
      GB: 'GB'
    },
    PERCENTAGE: '%'
  },

  // Thresholds and Limits
  THRESHOLDS: {
    SPEED: {
      LOW_SPEED: 5, // Mbps
      GOOD_SPEED: 25, // Mbps
      EXCELLENT_SPEED: 100 // Mbps
    },
    LATENCY: {
      EXCELLENT: 50, // ms
      GOOD: 100, // ms
      FAIR: 200, // ms
      POOR: 500 // ms
    },
    JITTER: {
      EXCELLENT: 10, // ms
      GOOD: 25, // ms
      FAIR: 50, // ms
      POOR: 100 // ms
    },
    PACKET_LOSS: {
      EXCELLENT: 0, // %
      GOOD: 1, // %
      FAIR: 2, // %
      POOR: 5 // %
    },
    PULL_REFRESH: 80, // pixels
    SWIPE_DISTANCE: 100, // pixels
    SWIPE_VELOCITY: 50 // pixels
  },

  // Default Values
  DEFAULTS: {
    LATENCY_SAMPLES: 10,
    MAX_LATENCY_SAMPLES: 50,
    SPEED_TEST_DURATION: 10000, // ms
    PARALLEL_CONNECTIONS: 6,
    OVERHEAD_COMPENSATION: 0.04, // 4%
    MAX_DATA_POINTS: 100,
    CHART_UPDATE_INTERVAL: 100, // ms
    MONITORING_INTERVAL: 5000, // ms
    DECIMAL_PLACES: 1,
    PROGRESS_STEPS: 100
  },

  // File Paths
  PATHS: {
    TEST_FILES: {
      SMALL: 'assets/test-files/1mb.bin',
      MEDIUM: 'assets/test-files/5mb.bin',
      LARGE: 'assets/test-files/10mb.bin'
    },
    ASSETS: {
      CSS: 'assets/css/',
      JS: 'assets/js/',
      IMAGES: 'assets/images/'
    }
  },

  // Responsive Breakpoints (in pixels)
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200,
    LARGE_DESKTOP: 1440
  },

  // Color Codes
  COLORS: {
    QUALITY: {
      EXCELLENT: '#4CAF50',
      GOOD: '#8BC34A',
      FAIR: '#FF9800',
      POOR: '#FF5722',
      VERY_POOR: '#F44336'
    },
    STATUS: {
      SUCCESS: '#4CAF50',
      WARNING: '#FF9800',
      ERROR: '#F44336',
      INFO: '#2196F3',
      NEUTRAL: '#666666'
    },
    THEME: {
      PRIMARY: '#667eea',
      SECONDARY: '#764ba2',
      ACCENT: '#f093fb'
    }
  },

  // Icons (emoji or unicode)
  ICONS: {
    QUALITY: {
      EXCELLENT: '🟢',
      GOOD: '🟡',
      FAIR: '🟠',
      POOR: '🔴',
      VERY_POOR: '🔴',
      UNKNOWN: '❓'
    },
    STATUS: {
      SUCCESS: '✅',
      WARNING: '⚠️',
      ERROR: '❌',
      INFO: 'ℹ️',
      LOADING: '⏳'
    },
    NETWORK: {
      WIFI: '📶',
      CELLULAR: '📱',
      ETHERNET: '🌐',
      OFFLINE: '📵'
    }
  },

  // Regular Expressions
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL: /^https?:\/\/.+/,
    IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    DOMAIN: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
  },

  // Local Storage Keys
  STORAGE_KEYS: {
    LAST_RESULTS: 'netpulse_last_results',
    USER_PREFERENCES: 'netpulse_preferences',
    DEVICE_INFO: 'netpulse_device_info',
    TEST_HISTORY: 'netpulse_test_history',
    MONITORING_DATA: 'netpulse_monitoring_data',
    APP_STATE: 'netpulse_app_state'
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TIMEOUT: 408,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },

  // Mathematical Constants
  MATH: {
    BITS_PER_BYTE: 8,
    BYTES_PER_KB: 1024,
    BYTES_PER_MB: 1048576,
    BYTES_PER_GB: 1073741824,
    MS_PER_SECOND: 1000,
    SECONDS_PER_MINUTE: 60,
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24
  },

  // Validation Rules
  VALIDATION: {
    MIN_SPEED: 0,
    MAX_SPEED: 10000, // Mbps
    MIN_LATENCY: 0,
    MAX_LATENCY: 10000, // ms
    MIN_SAMPLES: 1,
    MAX_SAMPLES: 100,
    MIN_DURATION: 1000, // ms
    MAX_DURATION: 60000, // ms
    MIN_CONNECTIONS: 1,
    MAX_CONNECTIONS: 20
  },

  // Feature Flags
  FEATURES: {
    HAPTIC_FEEDBACK: true,
    PULL_TO_REFRESH: true,
    SWIPE_NAVIGATION: true,
    NOTIFICATIONS: true,
    OFFLINE_MODE: true,
    DARK_MODE: false,
    ANALYTICS: false
  },

  // API Endpoints (if needed for future server integration)
  API: {
    BASE_URL: '',
    ENDPOINTS: {
      TEST_SERVERS: '/api/test-servers',
      SUBMIT_RESULTS: '/api/results',
      GET_HISTORY: '/api/history'
    }
  }
};

// Freeze the constants object to prevent modifications
Object.freeze(CONSTANTS);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONSTANTS;
} else {
  window.CONSTANTS = CONSTANTS;
}
