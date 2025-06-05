/**
 * NetPulse Configuration
 * Central configuration file for the network monitoring application
 */

const CONFIG = {
  // Application Information
  APP: {
    name: 'NetPulse',
    version: '1.0.0',
    description: 'Mobile Network Monitoring Application'
  },

  // Network Testing Configuration
  NETWORK_TEST: {
    // Latency Testing
    latency: {
      defaultSamples: 10,
      maxSamples: 50,
      timeoutMs: 5000,
      intervalMs: 100
    },

    // Speed Testing
    speed: {
      downloadDuration: 10000, // 10 seconds
      uploadDuration: 10000,   // 10 seconds
      parallelConnections: 6,
      overheadCompensation: 0.04, // 4% overhead compensation
      testFiles: {
        small: 'assets/test-files/1mb.bin',
        medium: 'assets/test-files/5mb.bin',
        large: 'assets/test-files/10mb.bin'
      }
    },

    // Connection Quality
    quality: {
      excellentThreshold: 50,  // ms
      goodThreshold: 100,      // ms
      fairThreshold: 200,      // ms
      poorThreshold: 500       // ms
    }
  },

  // Continuous Monitoring Configuration
  CONTINUOUS_MONITOR: {
    // Monitoring intervals
    intervals: {
      latency: 5000,      // 5 seconds
      speedTest: 15000,   // 15 seconds (more frequent for real-time feel)
      quickTest: 10000,   // 10 seconds (lightweight)
      dataUpdate: 500     // 0.5 seconds for smoother UI updates
    },

    // Lightweight testing for continuous mode
    lightweightTest: {
      downloadDuration: 2000,  // 2 seconds for faster tests
      uploadDuration: 2000,    // 2 seconds for faster tests
      parallelConnections: 2,  // Fewer connections
      latencySamples: 5        // Fewer samples
    },

    // Data retention
    dataRetention: {
      maxDataPoints: 100,      // Maximum data points to keep
      maxHistoryHours: 24,     // Keep 24 hours of data
      compressionThreshold: 50 // Compress data after 50 points
    },

    // Performance thresholds for alerts
    alerts: {
      lowSpeedThreshold: 5,    // Mbps
      highLatencyThreshold: 200, // ms
      packetLossThreshold: 2,  // %
      jitterThreshold: 50      // ms
    }
  },

  // UI Configuration
  UI: {
    // Animation durations
    animations: {
      fast: 200,
      normal: 400,
      slow: 800
    },

    // Chart configuration
    charts: {
      maxDataPoints: 50,
      updateInterval: 100
    },

    // Responsive breakpoints
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    }
  },

  // PWA Configuration
  PWA: {
    cacheName: 'netpulse-v1',
    cacheUrls: [
      '/',
      '/index.html',
      '/manifest.json',
      '/assets/css/main.css',
      '/assets/css/mobile.css',
      '/assets/js/app.js',
      '/assets/js/network-test.js',
      '/assets/js/speed-test.js',
      '/assets/js/latency-test.js'
    ]
  },

  // DOM Element IDs - Centralized element selectors
  ELEMENTS: {
    // Navigation
    NAV_ITEMS: '.mobile-nav-item',
    MOBILE_FAB: 'mobile-fab',
    RESULTS_BADGE: 'results-badge',

    // Views
    HOME_VIEW: 'home-view',
    TEST_VIEW: 'test-view',
    DASHBOARD_VIEW: 'dashboard-view',
    RESULTS_VIEW: 'results-view',

    // Test Controls
    START_COMPLETE_TEST: 'start-complete-test',
    START_TEST: 'start-test',
    STOP_TEST: 'stop-test',
    TEST_AGAIN: 'test-again',
    SHARE_RESULTS: 'share-results',

    // Monitoring Controls
    START_MONITORING: 'start-monitoring',
    PAUSE_MONITORING: 'pause-monitoring',
    STOP_MONITORING: 'stop-monitoring',

    // Progress Elements
    PROGRESS_BAR: 'progress-bar',
    PROGRESS_TEXT: 'progress-text',
    PROGRESS_PERCENTAGE: 'progress-percentage',
    PROGRESS_INDICATOR: 'progress-indicator',

    // Real-time Metrics
    REALTIME_DOWNLOAD: 'realtime-download',
    REALTIME_UPLOAD: 'realtime-upload',
    REALTIME_LATENCY: 'realtime-latency',
    REALTIME_JITTER: 'realtime-jitter',

    // Final Results
    FINAL_DOWNLOAD: 'final-download',
    FINAL_UPLOAD: 'final-upload',
    FINAL_LATENCY: 'final-latency',
    FINAL_JITTER: 'final-jitter',

    // Quick Stats
    QUICK_STATS: 'quick-stats',
    QUICK_DOWNLOAD: 'quick-download',
    QUICK_UPLOAD: 'quick-upload',
    QUICK_LATENCY: 'quick-latency',
    LAST_TEST_TIME: 'last-test-time',

    // Status Elements
    TEST_STATUS: 'test-status',
    TEST_STATUS_TEXT: 'test-status-text',
    MONITORING_STATUS: 'monitoring-status',
    MONITORING_STATUS_TEXT: 'monitoring-status-text',
    CONNECTION_STATUS: 'connection-status',
    CONNECTION_TEXT: 'connection-text',

    // Quality Assessment
    QUALITY_SCORE: 'quality-score',
    QUALITY_DESCRIPTION: 'quality-description',
    QUALITY_ASSESSMENT: 'quality-assessment',

    // Containers
    MAIN_CONTENT: 'main-content',
    REALTIME_DASHBOARD_CONTAINER: 'realtime-dashboard-container',
    DEVICE_INFO_DISPLAY: 'device-info-display',
    LOADING_OVERLAY: 'loading-overlay',

    // Pull to Refresh
    PULL_REFRESH_INDICATOR: 'pull-refresh-indicator',

    // Swipe Indicators
    SWIPE_LEFT: 'swipe-left',
    SWIPE_RIGHT: 'swipe-right',

    // Results
    RESULTS_TIMESTAMP: 'results-timestamp'
  },

  // CSS Classes - Centralized class names
  CSS_CLASSES: {
    // State Classes
    ACTIVE: 'active',
    HIDDEN: 'hidden',
    LOADING: 'loading',
    PULLING: 'pulling',
    FADE_IN: 'fade-in',
    SCALE_PULSE: 'scale-pulse',

    // Navigation Classes
    MOBILE_NAV_ITEM: 'mobile-nav-item',
    MOBILE_TOUCH_FEEDBACK: 'mobile-touch-feedback',

    // Status Classes
    CONNECTION_STATUS_GOOD: 'connection-status-good',
    CONNECTION_STATUS_POOR: 'connection-status-poor',
    CONNECTION_STATUS_OFFLINE: 'connection-status-offline',

    // Mobile Status Classes
    MOBILE_STATUS_INFO: 'mobile-status-info',
    MOBILE_STATUS_SUCCESS: 'mobile-status-success',
    MOBILE_STATUS_WARNING: 'mobile-status-warning',
    MOBILE_STATUS_ERROR: 'mobile-status-error',

    // Button Classes
    MOBILE_BTN: 'mobile-btn',
    MOBILE_BTN_PRIMARY: 'mobile-btn-primary',
    MOBILE_BTN_SECONDARY: 'mobile-btn-secondary',
    MOBILE_BTN_DANGER: 'mobile-btn-danger',
    MOBILE_BTN_COMPACT: 'mobile-btn-compact',

    // Haptic Feedback Classes
    MOBILE_HAPTIC_LIGHT: 'mobile-haptic-light',
    MOBILE_HAPTIC_MEDIUM: 'mobile-haptic-medium',
    MOBILE_HAPTIC_HEAVY: 'mobile-haptic-heavy'
  },

  // Event Names - Centralized event constants
  EVENTS: {
    // Custom Events
    PULL_REFRESH: 'pullRefresh',
    TEST_START: 'testStart',
    TEST_PROGRESS: 'testProgress',
    TEST_COMPLETE: 'testComplete',
    TEST_ERROR: 'testError',
    MONITORING_START: 'monitoringStart',
    MONITORING_STOP: 'monitoringStop',
    MONITORING_DATA: 'monitoringData',
    VIEW_CHANGE: 'viewChange',

    // DOM Events
    CLICK: 'click',
    TOUCH_START: 'touchstart',
    TOUCH_MOVE: 'touchmove',
    TOUCH_END: 'touchend',
    TOUCH_CANCEL: 'touchcancel',
    RESIZE: 'resize',
    SCROLL: 'scroll',
    BEFORE_UNLOAD: 'beforeunload',
    DOM_CONTENT_LOADED: 'DOMContentLoaded',
    KEYDOWN: 'keydown'
  },

  // Error Messages
  ERRORS: {
    NETWORK_UNAVAILABLE: 'Network connection unavailable',
    TIMEOUT: 'Request timed out',
    INVALID_RESPONSE: 'Invalid server response',
    BROWSER_UNSUPPORTED: 'Browser not supported',
    PERMISSION_DENIED: 'Permission denied',
    INITIALIZATION_FAILED: 'Failed to initialize application',
    TEST_FAILED: 'Network test failed',
    MONITORING_FAILED: 'Monitoring failed to start',
    INVALID_CONFIGURATION: 'Invalid configuration provided',
    DEVICE_NOT_SUPPORTED: 'Device not supported'
  },

  // Success Messages
  MESSAGES: {
    TEST_STARTED: 'Network test started',
    TEST_COMPLETED: 'Network test completed',
    TEST_STOPPED: 'Test stopped by user',
    MONITORING_STARTED: 'Continuous monitoring started',
    MONITORING_STOPPED: 'Monitoring stopped',
    MONITORING_PAUSED: 'Monitoring paused',
    CONNECTING: 'Connecting to server...',
    MEASURING: 'Measuring network performance...',
    INITIALIZING: 'Initializing network test...',
    READY: 'Ready to start monitoring',
    CONNECTED: 'Connected'
  },

  // Progress Messages
  PROGRESS_MESSAGES: {
    INITIALIZING: 'Initializing...',
    TESTING_LATENCY: 'Testing latency...',
    TESTING_DOWNLOAD: 'Testing download speed...',
    TESTING_UPLOAD: 'Testing upload speed...',
    ANALYZING: 'Analyzing results...',
    COMPLETING: 'Completing test...'
  },

  // View Names - Centralized view identifiers
  VIEWS: {
    HOME: 'home',
    TEST: 'test',
    DASHBOARD: 'dashboard',
    RESULTS: 'results'
  },

  // Test Types
  TEST_TYPES: {
    LATENCY: 'latency',
    DOWNLOAD: 'download',
    UPLOAD: 'upload',
    COMPLETE: 'complete',
    QUICK: 'quick'
  },

  // Connection Quality Levels
  QUALITY_LEVELS: {
    EXCELLENT: 'excellent',
    GOOD: 'good',
    FAIR: 'fair',
    POOR: 'poor',
    VERY_POOR: 'very-poor'
  },

  // Network Types
  NETWORK_TYPES: {
    WIFI: 'wifi',
    CELLULAR: 'cellular',
    ETHERNET: 'ethernet',
    BLUETOOTH: 'bluetooth',
    WIMAX: 'wimax',
    OTHER: 'other',
    UNKNOWN: 'unknown'
  },

  // Device Categories
  DEVICE_CATEGORIES: {
    MOBILE: 'mobile',
    TABLET: 'tablet',
    DESKTOP: 'desktop'
  }
};

// Export configuration for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else {
  window.CONFIG = CONFIG;
}
