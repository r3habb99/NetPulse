/**
 * Device Detection Utilities
 * Detect device type, browser, and capabilities
 */

const DeviceDetection = {
  /**
   * Get comprehensive device information
   * @returns {Object} Device information
   */
  getDeviceInfo() {
    try {
      return {
        type: this.getDeviceType(),
        browser: this.getBrowserInfo(),
        screen: this.getScreenInfo(),
        network: this.getNetworkInfo(),
        capabilities: this.getCapabilities(),
        userAgent: navigator.userAgent || 'Unknown'
      };
    } catch (error) {
      console.warn('Error getting device info:', error);
      // Return fallback device info
      return {
        type: {
          isMobile: false,
          isTablet: false,
          isDesktop: true,
          isIOS: false,
          isAndroid: false,
          isWindows: true,
          isMac: false,
          isLinux: false,
          category: 'desktop'
        },
        browser: {
          name: 'Unknown',
          version: 'Unknown',
          userAgent: navigator.userAgent || 'Unknown',
          language: 'en-US',
          languages: ['en-US']
        },
        screen: {
          width: 1920,
          height: 1080,
          availWidth: 1920,
          availHeight: 1080,
          colorDepth: 24,
          pixelDepth: 24,
          orientation: 'landscape',
          devicePixelRatio: 1,
          viewport: {
            width: window.innerWidth || 1920,
            height: window.innerHeight || 1080
          }
        },
        network: {
          supported: false,
          type: 'unknown',
          effectiveType: 'unknown'
        },
        capabilities: {
          localStorage: true,
          sessionStorage: true,
          indexedDB: true,
          fetch: true,
          xhr: true,
          serviceWorker: false,
          performance: true,
          performanceObserver: false,
          webWorkers: true,
          webAssembly: false,
          webRTC: false,
          touch: false,
          deviceMotion: false,
          deviceOrientation: false,
          permissions: false,
          notifications: false
        },
        userAgent: navigator.userAgent || 'Unknown'
      };
    }
  },

  /**
   * Detect device type
   * @returns {Object} Device type information
   */
  getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Mobile detection
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    // Tablet detection
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent) || 
                    (window.screen.width >= 768 && window.screen.width <= 1024);
    
    // Desktop detection
    const isDesktop = !isMobile && !isTablet;
    
    // Specific device detection
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);
    const isWindows = /windows/i.test(userAgent);
    const isMac = /macintosh|mac os x/i.test(userAgent);
    const isLinux = /linux/i.test(userAgent);

    return {
      isMobile,
      isTablet,
      isDesktop,
      isIOS,
      isAndroid,
      isWindows,
      isMac,
      isLinux,
      category: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
    };
  },

  /**
   * Get browser information
   * @returns {Object} Browser information
   */
  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';

    // Chrome
    if (userAgent.indexOf('Chrome') > -1) {
      browser = 'Chrome';
      version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    }
    // Firefox
    else if (userAgent.indexOf('Firefox') > -1) {
      browser = 'Firefox';
      version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    }
    // Safari
    else if (userAgent.indexOf('Safari') > -1) {
      browser = 'Safari';
      version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    }
    // Edge
    else if (userAgent.indexOf('Edg') > -1) {
      browser = 'Edge';
      version = userAgent.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
    }
    // Internet Explorer
    else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) {
      browser = 'Internet Explorer';
      version = userAgent.match(/(?:MSIE |rv:)(\d+)/)?.[1] || 'Unknown';
    }

    return {
      name: browser,
      version: version,
      userAgent: userAgent,
      language: navigator.language,
      languages: navigator.languages || [navigator.language]
    };
  },

  /**
   * Get screen information
   * @returns {Object} Screen information
   */
  getScreenInfo() {
    return {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
      orientation: this.getOrientation(),
      devicePixelRatio: window.devicePixelRatio || 1,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  },

  /**
   * Get screen orientation
   * @returns {string} Orientation
   */
  getOrientation() {
    if (screen.orientation) {
      return screen.orientation.type;
    } else if (window.orientation !== undefined) {
      return Math.abs(window.orientation) === 90 ? 'landscape' : 'portrait';
    } else {
      return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }
  },

  /**
   * Get network information
   * @returns {Object} Network information
   */
  getNetworkInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!connection) {
      return {
        supported: false,
        type: 'unknown',
        effectiveType: 'unknown'
      };
    }

    return {
      supported: true,
      type: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || null,
      downlinkMax: connection.downlinkMax || null,
      rtt: connection.rtt || null,
      saveData: connection.saveData || false
    };
  },

  /**
   * Get browser capabilities
   * @returns {Object} Capabilities information
   */
  getCapabilities() {
    return {
      // Storage
      localStorage: this.supportsLocalStorage(),
      sessionStorage: this.supportsSessionStorage(),
      indexedDB: this.supportsIndexedDB(),
      
      // Network APIs
      fetch: typeof fetch !== 'undefined',
      xhr: typeof XMLHttpRequest !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator,
      
      // Performance APIs
      performance: typeof performance !== 'undefined',
      performanceObserver: typeof PerformanceObserver !== 'undefined',
      
      // Modern features
      webWorkers: typeof Worker !== 'undefined',
      webAssembly: typeof WebAssembly !== 'undefined',
      
      // Media
      webRTC: this.supportsWebRTC(),
      
      // Touch
      touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      
      // Sensors
      deviceMotion: 'DeviceMotionEvent' in window,
      deviceOrientation: 'DeviceOrientationEvent' in window,
      
      // Permissions
      permissions: 'permissions' in navigator,
      
      // Notifications
      notifications: 'Notification' in window
    };
  },

  /**
   * Check localStorage support
   * @returns {boolean} True if supported
   */
  supportsLocalStorage() {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Check sessionStorage support
   * @returns {boolean} True if supported
   */
  supportsSessionStorage() {
    try {
      const test = 'test';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Check IndexedDB support
   * @returns {boolean} True if supported
   */
  supportsIndexedDB() {
    return 'indexedDB' in window;
  },

  /**
   * Check WebRTC support
   * @returns {boolean} True if supported
   */
  supportsWebRTC() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ||
           !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia);
  },

  /**
   * Check if device is mobile
   * @returns {boolean} True if mobile
   */
  isMobile() {
    return this.getDeviceType().isMobile;
  },

  /**
   * Check if device is tablet
   * @returns {boolean} True if tablet
   */
  isTablet() {
    return this.getDeviceType().isTablet;
  },

  /**
   * Check if device is desktop
   * @returns {boolean} True if desktop
   */
  isDesktop() {
    return this.getDeviceType().isDesktop;
  },

  /**
   * Check if browser supports required features for the app
   * @returns {Object} Compatibility check results
   */
  checkCompatibility() {
    const capabilities = this.getCapabilities();
    const required = {
      fetch: capabilities.fetch,
      performance: capabilities.performance,
      localStorage: capabilities.localStorage
    };

    const recommended = {
      serviceWorker: capabilities.serviceWorker,
      performanceObserver: capabilities.performanceObserver,
      webWorkers: capabilities.webWorkers
    };

    const allRequired = Object.values(required).every(Boolean);
    const allRecommended = Object.values(recommended).every(Boolean);

    return {
      compatible: allRequired,
      fullySupported: allRequired && allRecommended,
      required,
      recommended,
      missing: {
        required: Object.keys(required).filter(key => !required[key]),
        recommended: Object.keys(recommended).filter(key => !recommended[key])
      }
    };
  },

  /**
   * Get optimal test configuration based on device
   * @returns {Object} Recommended configuration
   */
  getOptimalConfig() {
    const deviceType = this.getDeviceType();
    const networkInfo = this.getNetworkInfo();
    
    let config = {
      latency: {
        samples: 10,
        timeout: 5000
      },
      speed: {
        duration: 10000,
        connections: 4
      }
    };

    // Adjust for mobile devices
    if (deviceType.isMobile) {
      config.latency.samples = 8;
      config.speed.connections = 3;
      
      // Reduce for slower connections
      if (networkInfo.effectiveType === '2g' || networkInfo.effectiveType === 'slow-2g') {
        config.speed.duration = 15000;
        config.speed.connections = 2;
      }
    }

    // Adjust for tablets
    if (deviceType.isTablet) {
      config.speed.connections = 5;
    }

    return config;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DeviceDetection;
} else {
  window.DeviceDetection = DeviceDetection;
}
