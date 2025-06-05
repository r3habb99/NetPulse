/**
 * UI Controller
 * Manages the user interface state and interactions using centralized constants and helpers
 */

class UIController {
  constructor() {
    // Check if CONFIG is available
    if (typeof CONFIG === 'undefined') {
      throw new Error('CONFIG is not defined. Make sure config.js is loaded before ui-controller.js');
    }

    this.currentView = CONFIG.VIEWS?.HOME || 'home';
    this.isTestRunning = false;
    this.isMonitoring = false;
    this.testProgress = 0;
    this.testResults = null;
    this.eventListeners = new Map();

    this.init();
  }

  /**
   * Initialize UI Controller
   */
  init() {
    try {
      this.bindEventListeners();
      this.initializeUI();
    } catch (error) {
      console.error('Failed to initialize UI Controller:', error);
      throw error;
    }
  }

  /**
   * Event emitter functionality
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  emit(event, data = null) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => callback(data));
    }
  }

  /**
   * Bind event listeners using centralized constants
   */
  bindEventListeners() {
    // Test control buttons
    DOMHelpers.addEventListener(CONFIG.ELEMENTS.START_COMPLETE_TEST, CONFIG.EVENTS.CLICK, () => {
      this.emit('startTest');
    });

    DOMHelpers.addEventListener(CONFIG.ELEMENTS.START_TEST, CONFIG.EVENTS.CLICK, () => {
      this.emit('startTest');
    });

    DOMHelpers.addEventListener(CONFIG.ELEMENTS.STOP_TEST, CONFIG.EVENTS.CLICK, () => {
      this.emit('stopTest');
    });

    DOMHelpers.addEventListener(CONFIG.ELEMENTS.TEST_AGAIN, CONFIG.EVENTS.CLICK, () => {
      this.emit('startTest');
    });

    DOMHelpers.addEventListener(CONFIG.ELEMENTS.SHARE_RESULTS, CONFIG.EVENTS.CLICK, () => {
      this.emit('shareResults');
    });

    // Monitoring controls
    DOMHelpers.addEventListener(CONFIG.ELEMENTS.START_MONITORING, CONFIG.EVENTS.CLICK, () => {
      this.emit('startMonitoring');
    });

    DOMHelpers.addEventListener(CONFIG.ELEMENTS.PAUSE_MONITORING, CONFIG.EVENTS.CLICK, () => {
      this.emit('pauseMonitoring');
    });

    DOMHelpers.addEventListener(CONFIG.ELEMENTS.STOP_MONITORING, CONFIG.EVENTS.CLICK, () => {
      this.emit('stopMonitoring');
    });

    // Navigation
    const navItems = DOMHelpers.querySelectorAll(CONFIG.ELEMENTS.NAV_ITEMS);
    navItems.forEach(item => {
      DOMHelpers.addEventListener(item, CONFIG.EVENTS.CLICK, (e) => {
        e.preventDefault();
        const view = item.dataset.view;
        this.switchView(view);
      });
    });

    // Window events
    DOMHelpers.addEventListener(window, CONFIG.EVENTS.RESIZE, 
      DOMHelpers.debounce(() => this.handleResize(), CONSTANTS.TIMING.DEBOUNCE_DEFAULT)
    );

    // Keyboard shortcuts
    DOMHelpers.addEventListener(document, CONFIG.EVENTS.KEYDOWN, (e) => {
      this.handleKeyboard(e);
    });
  }

  /**
   * Initialize UI state
   */
  initializeUI() {
    this.switchView(CONFIG.VIEWS.HOME);
    this.updateDeviceInfo();
  }

  /**
   * Switch between views
   * @param {string} viewName - Name of the view to switch to
   */
  switchView(viewName) {
    if (this.currentView === viewName) return;

    // Hide all views
    const views = DOMHelpers.querySelectorAll('.view');
    views.forEach(view => {
      DOMHelpers.removeClass(view, CONFIG.CSS_CLASSES.ACTIVE);
      DOMHelpers.removeClass(view, CONFIG.CSS_CLASSES.FADE_IN);
      DOMHelpers.hide(view);
    });

    // Show target view
    const targetView = DOMHelpers.getElementById(`${viewName}-view`);
    if (targetView) {
      DOMHelpers.show(targetView);
      DOMHelpers.addClass(targetView, CONFIG.CSS_CLASSES.ACTIVE);
      DOMHelpers.addClass(targetView, CONFIG.CSS_CLASSES.FADE_IN);
    }

    this.updateNavigation(viewName);
    this.currentView = viewName;
    
    // View-specific initialization
    this.initializeView(viewName);
    
    // Emit view change event
    this.emit('viewChange', { view: viewName });
  }

  /**
   * Update navigation state
   * @param {string} activeView - Currently active view
   */
  updateNavigation(activeView) {
    const navItems = DOMHelpers.querySelectorAll(CONFIG.ELEMENTS.NAV_ITEMS);
    navItems.forEach(item => {
      if (item.dataset.view === activeView) {
        DOMHelpers.addClass(item, CONFIG.CSS_CLASSES.ACTIVE);
      } else {
        DOMHelpers.removeClass(item, CONFIG.CSS_CLASSES.ACTIVE);
      }
    });
  }

  /**
   * Initialize view-specific functionality
   * @param {string} viewName - Name of the view
   */
  initializeView(viewName) {
    switch (viewName) {
      case CONFIG.VIEWS.HOME:
        this.initializeHomeView();
        break;
      case CONFIG.VIEWS.TEST:
        this.updateTestControls();
        break;
      case CONFIG.VIEWS.DASHBOARD:
        this.updateMonitoringControls();
        break;
      case CONFIG.VIEWS.RESULTS:
        if (window.mobileNavigation) {
          window.mobileNavigation.hideBadge();
        }
        break;
    }
  }

  /**
   * Initialize home view
   */
  initializeHomeView() {
    this.updateConnectionStatus();
    if (this.testResults) {
      this.showQuickStats(this.testResults);
    }
  }

  /**
   * Update test controls state
   */
  updateTestControls() {
    const startBtn = DOMHelpers.getElementById(CONFIG.ELEMENTS.START_COMPLETE_TEST);
    const startTestBtnInView = DOMHelpers.getElementById(CONFIG.ELEMENTS.START_TEST);
    const stopBtn = DOMHelpers.getElementById(CONFIG.ELEMENTS.STOP_TEST);
    const progressIndicator = DOMHelpers.getElementById(CONFIG.ELEMENTS.PROGRESS_INDICATOR);

    // Update buttons based on test state
    if (this.isTestRunning) {
      // Disable start buttons
      if (startBtn) startBtn.disabled = true;
      if (startTestBtnInView) DOMHelpers.hide(startTestBtnInView);
      if (stopBtn) DOMHelpers.show(stopBtn);
      if (progressIndicator) DOMHelpers.show(progressIndicator);
    } else {
      // Enable start buttons
      if (startBtn) startBtn.disabled = false;
      if (startTestBtnInView) DOMHelpers.show(startTestBtnInView);
      if (stopBtn) DOMHelpers.hide(stopBtn);
      if (progressIndicator) DOMHelpers.hide(progressIndicator);
    }
  }

  /**
   * Update monitoring controls state
   */
  updateMonitoringControls() {
    const startBtn = DOMHelpers.getElementById(CONFIG.ELEMENTS.START_MONITORING);
    const pauseBtn = DOMHelpers.getElementById(CONFIG.ELEMENTS.PAUSE_MONITORING);
    const stopBtn = DOMHelpers.getElementById(CONFIG.ELEMENTS.STOP_MONITORING);

    if (this.isMonitoring) {
      if (startBtn) DOMHelpers.hide(startBtn);
      if (pauseBtn) DOMHelpers.show(pauseBtn);
      if (stopBtn) DOMHelpers.show(stopBtn);
    } else {
      if (startBtn) DOMHelpers.show(startBtn);
      if (pauseBtn) DOMHelpers.hide(pauseBtn);
      if (stopBtn) DOMHelpers.hide(stopBtn);
    }
  }

  /**
   * Update test progress
   * @param {Object} progressData - Progress information
   */
  updateTestProgress(progressData) {
    const { type, progress, current, total } = progressData;

    // Reset real-time values when starting a new test (first progress update)
    if (progress === 0 || (type === CONFIG.TEST_TYPES.LATENCY && current === 1)) {
      this.resetRealtimeValues();
    }

    // Update progress bar
    const progressBar = DOMHelpers.getElementById(CONFIG.ELEMENTS.PROGRESS_BAR);
    if (progressBar) {
      DOMHelpers.setStyle(progressBar, 'width', `${progress}%`);
    }

    // Update progress percentage
    DOMHelpers.updateText(CONFIG.ELEMENTS.PROGRESS_PERCENTAGE, `${Math.round(progress)}%`);

    // Update progress text
    let progressText = CONFIG.PROGRESS_MESSAGES.INITIALIZING;
    if (type === CONFIG.TEST_TYPES.LATENCY) {
      progressText = `${CONFIG.PROGRESS_MESSAGES.TESTING_LATENCY} Sample ${current}/${total}`;
    } else if (type === CONFIG.TEST_TYPES.DOWNLOAD) {
      progressText = CONFIG.PROGRESS_MESSAGES.TESTING_DOWNLOAD;
    } else if (type === CONFIG.TEST_TYPES.UPLOAD) {
      progressText = CONFIG.PROGRESS_MESSAGES.TESTING_UPLOAD;
    }

    DOMHelpers.updateText(CONFIG.ELEMENTS.PROGRESS_TEXT, progressText);

    // Update real-time metrics
    this.updateRealTimeMetrics(progressData);
  }

  /**
   * Reset real-time values for new test
   */
  resetRealtimeValues() {
    this.realtimeValues = {
      downloadSpeed: undefined,
      uploadSpeed: undefined,
      latency: undefined,
      jitter: undefined
    };

    // Reset latency samples for running average calculation
    this.latencySamples = [];

    // Also clear the display values
    this.clearRealtimeDisplay();
  }

  /**
   * Clear real-time display values
   */
  clearRealtimeDisplay() {
    DOMHelpers.updateText(CONFIG.ELEMENTS.REALTIME_DOWNLOAD, '0');
    DOMHelpers.updateText(CONFIG.ELEMENTS.REALTIME_UPLOAD, '0');
    DOMHelpers.updateText(CONFIG.ELEMENTS.REALTIME_LATENCY, '0');
    DOMHelpers.updateText(CONFIG.ELEMENTS.REALTIME_JITTER, '0');
  }

  /**
   * Update real-time metrics during test
   * @param {Object} data - Metric data
   */
  updateRealTimeMetrics(data) {
    const { type, speed, latency, jitter, current } = data;

    // Store real-time values for consistency with final results
    if (!this.realtimeValues) {
      this.realtimeValues = {};
    }

    // Update speed displays
    if ((type === CONFIG.TEST_TYPES.DOWNLOAD || type === CONFIG.TEST_TYPES.UPLOAD) && speed !== undefined) {
      const elementId = type === CONFIG.TEST_TYPES.DOWNLOAD ?
        CONFIG.ELEMENTS.REALTIME_DOWNLOAD : CONFIG.ELEMENTS.REALTIME_UPLOAD;

      const element = DOMHelpers.getElementById(elementId);
      if (element) {
        const formattedSpeed = Formatters.formatSpeed(speed).replace(` ${CONSTANTS.UNITS.SPEED.MBPS}`, '');
        DOMHelpers.updateText(element, formattedSpeed);
        this.addPulseEffect(element);

        // Store for consistency
        if (type === CONFIG.TEST_TYPES.DOWNLOAD) {
          this.realtimeValues.downloadSpeed = speed;
        } else {
          this.realtimeValues.uploadSpeed = speed;
        }
      }
    }

    // Update latency display during latency testing
    if (type === CONFIG.TEST_TYPES.LATENCY && latency !== undefined) {
      // Initialize latency samples array if not exists
      if (!this.latencySamples) {
        this.latencySamples = [];
      }

      // Add current latency to samples
      this.latencySamples.push(latency);

      // Calculate running average for consistent display
      const runningAverage = this.latencySamples.reduce((sum, val) => sum + val, 0) / this.latencySamples.length;

      const element = DOMHelpers.getElementById(CONFIG.ELEMENTS.REALTIME_LATENCY);
      if (element) {
        const latencyValue = Math.round(runningAverage);
        DOMHelpers.updateText(element, latencyValue);
        this.addPulseEffect(element);

        // Store running average for consistency with final results
        this.realtimeValues.latency = runningAverage;
      }

      // Update jitter display if available (only show after we have enough samples)
      if (jitter !== undefined && current >= 2) {
        const jitterElement = DOMHelpers.getElementById(CONFIG.ELEMENTS.REALTIME_JITTER);
        if (jitterElement) {
          const jitterValue = Math.round(jitter);
          DOMHelpers.updateText(jitterElement, jitterValue);
          this.addPulseEffect(jitterElement);

          // Store for consistency
          this.realtimeValues.jitter = jitter;
        }
      }
    }

    // Also handle direct latency/jitter updates from network test
    if (data.latency !== undefined && type !== CONFIG.TEST_TYPES.LATENCY) {
      const latencyElement = DOMHelpers.getElementById(CONFIG.ELEMENTS.REALTIME_LATENCY);
      if (latencyElement) {
        const latencyValue = Math.round(data.latency);
        DOMHelpers.updateText(latencyElement, latencyValue);
        this.addPulseEffect(latencyElement);
        this.realtimeValues.latency = data.latency;
      }
    }

    if (data.jitter !== undefined && type !== CONFIG.TEST_TYPES.LATENCY) {
      const jitterElement = DOMHelpers.getElementById(CONFIG.ELEMENTS.REALTIME_JITTER);
      if (jitterElement) {
        const jitterValue = Math.round(data.jitter);
        DOMHelpers.updateText(jitterElement, jitterValue);
        this.addPulseEffect(jitterElement);
        this.realtimeValues.jitter = data.jitter;
      }
    }
  }

  /**
   * Add pulse effect to element
   * @param {HTMLElement} element - Element to animate
   */
  addPulseEffect(element) {
    DOMHelpers.addClass(element, CONFIG.CSS_CLASSES.SCALE_PULSE);
    setTimeout(() => {
      DOMHelpers.removeClass(element, CONFIG.CSS_CLASSES.SCALE_PULSE);
    }, CONSTANTS.TIMING.SCALE_PULSE_DURATION);
  }

  /**
   * Display final test results
   * @param {Object} results - Test results
   */
  displayResults(results) {
    if (!results) return;

    this.testResults = results;
    const { latency, speed, connection } = results;

    // Use consistent data sources and formatting
    // Prefer final results if available, otherwise use real-time values for consistency
    const downloadSpeed = this.getConsistentSpeedValue(speed?.download?.speed, this.realtimeValues?.downloadSpeed);
    const uploadSpeed = this.getConsistentSpeedValue(speed?.upload?.speed, this.realtimeValues?.uploadSpeed);
    const latencyValue = this.getConsistentLatencyValue(latency?.avg, this.realtimeValues?.latency);
    const jitterValue = this.getConsistentJitterValue(latency?.jitter, this.realtimeValues?.jitter);

    DOMHelpers.updateText(CONFIG.ELEMENTS.FINAL_DOWNLOAD, downloadSpeed);
    DOMHelpers.updateText(CONFIG.ELEMENTS.FINAL_UPLOAD, uploadSpeed);
    DOMHelpers.updateText(CONFIG.ELEMENTS.FINAL_LATENCY, latencyValue);
    DOMHelpers.updateText(CONFIG.ELEMENTS.FINAL_JITTER, jitterValue);

    // Update quality assessment
    if (connection?.quality) {
      const quality = Formatters.formatConnectionQuality(connection.quality);
      DOMHelpers.updateText(CONFIG.ELEMENTS.QUALITY_SCORE, quality.text);
      DOMHelpers.updateText(CONFIG.ELEMENTS.QUALITY_DESCRIPTION, connection.quality.description);

      const scoreElement = DOMHelpers.getElementById(CONFIG.ELEMENTS.QUALITY_SCORE);
      if (scoreElement) {
        DOMHelpers.setStyle(scoreElement, 'color', quality.color);
      }
    }

    // Update timestamp
    DOMHelpers.updateText(CONFIG.ELEMENTS.RESULTS_TIMESTAMP, Formatters.formatTimestamp(results.timestamp));

    // Update quick stats on home view
    this.showQuickStats(results);
  }

  /**
   * Get consistent speed value for display
   * @param {number} finalValue - Final calculated speed
   * @param {number} realtimeValue - Last real-time speed value
   * @returns {string} Formatted speed value without units
   */
  getConsistentSpeedValue(finalValue, realtimeValue) {
    // Use final value if available, otherwise use real-time value
    const value = finalValue !== undefined ? finalValue : realtimeValue;
    return value !== undefined ?
      Formatters.formatSpeed(value).replace(` ${CONSTANTS.UNITS.SPEED.MBPS}`, '') : '0';
  }

  /**
   * Get consistent latency value for display
   * @param {number} finalValue - Final calculated latency average
   * @param {number} realtimeValue - Last real-time latency value
   * @returns {string} Formatted latency value
   */
  getConsistentLatencyValue(finalValue, realtimeValue) {
    // ALWAYS prioritize final calculated average for consistency
    // Only use real-time value if final is not available
    const value = finalValue !== undefined ? finalValue : realtimeValue;
    return value !== undefined ? Math.round(value).toString() : '0';
  }

  /**
   * Get consistent jitter value for display
   * @param {number} finalValue - Final calculated jitter
   * @param {number} realtimeValue - Last real-time jitter value
   * @returns {string} Formatted jitter value
   */
  getConsistentJitterValue(finalValue, realtimeValue) {
    // ALWAYS prioritize final calculated jitter for consistency
    // Only use real-time value if final is not available
    const value = finalValue !== undefined ? finalValue : realtimeValue;
    return value !== undefined ? Math.round(value).toString() : '0';
  }

  /**
   * Show quick stats on home view
   * @param {Object} results - Test results
   */
  showQuickStats(results) {
    if (!results) return;

    const quickStats = DOMHelpers.getElementById(CONFIG.ELEMENTS.QUICK_STATS);
    if (quickStats) {
      DOMHelpers.removeClass(quickStats, CONFIG.CSS_CLASSES.HIDDEN);

      // Use consistent formatting with units for quick stats
      DOMHelpers.updateText(CONFIG.ELEMENTS.QUICK_DOWNLOAD, Formatters.formatSpeed(results.speed?.download?.speed));
      DOMHelpers.updateText(CONFIG.ELEMENTS.QUICK_UPLOAD, Formatters.formatSpeed(results.speed?.upload?.speed));
      DOMHelpers.updateText(CONFIG.ELEMENTS.QUICK_LATENCY, Formatters.formatLatency(results.latency?.avg));
      DOMHelpers.updateText(CONFIG.ELEMENTS.LAST_TEST_TIME, Formatters.formatRelativeTime(results.timestamp));
    }
  }

  /**
   * Update status display
   * @param {string} elementId - Status element ID
   * @param {string} textElementId - Status text element ID
   * @param {string} type - Status type (info, success, warning, error)
   * @param {string} message - Status message
   */
  updateStatus(elementId, textElementId, type, message) {
    const statusElement = DOMHelpers.getElementById(elementId);
    const statusText = DOMHelpers.getElementById(textElementId);

    if (statusElement) {
      statusElement.className = `mobile-status mobile-status-${type}`;
    }

    if (statusText) {
      DOMHelpers.updateText(statusText, message);
    }
  }

  /**
   * Update test status display
   * @param {string} type - Status type (info, success, warning, error)
   * @param {string} message - Status message
   */
  updateTestStatus(type, message) {
    this.updateStatus(CONFIG.ELEMENTS.TEST_STATUS, CONFIG.ELEMENTS.TEST_STATUS_TEXT, type, message);
  }

  /**
   * Update monitoring status display
   * @param {string} type - Status type (info, success, warning, error)
   * @param {string} message - Status message
   */
  updateMonitoringStatus(type, message) {
    this.updateStatus(CONFIG.ELEMENTS.MONITORING_STATUS, CONFIG.ELEMENTS.MONITORING_STATUS_TEXT, type, message);
  }

  /**
   * Update connection status
   */
  updateConnectionStatus() {
    const isOnline = navigator.onLine;
    const statusElement = DOMHelpers.getElementById(CONFIG.ELEMENTS.CONNECTION_STATUS);
    const statusText = DOMHelpers.getElementById(CONFIG.ELEMENTS.CONNECTION_TEXT);

    if (statusElement && statusText) {
      if (isOnline) {
        statusElement.className = 'connection-status connection-status-good';
        DOMHelpers.updateText(statusText, CONFIG.MESSAGES.CONNECTED);
      } else {
        statusElement.className = 'connection-status connection-status-offline';
        DOMHelpers.updateText(statusText, 'Offline');
      }
    }
  }

  /**
   * Update device information display
   */
  updateDeviceInfo() {
    try {
      const deviceInfo = DeviceDetection.getDeviceInfo();
      const deviceInfoElement = DOMHelpers.getElementById(CONFIG.ELEMENTS.DEVICE_INFO_DISPLAY);

      if (deviceInfoElement && deviceInfo) {
        const formattedInfo = Formatters.formatDeviceType(deviceInfo);
        const networkType = Formatters.formatNetworkType(deviceInfo.network?.type || 'unknown');
        const browserInfo = `${deviceInfo.browser?.name || 'Unknown'} ${deviceInfo.browser?.version || ''}`;

        DOMHelpers.updateHTML(deviceInfoElement, `
          <div class="grid grid-cols-1 gap-sm text-sm">
            <div><strong>Device:</strong> ${formattedInfo}</div>
            <div><strong>Network:</strong> ${networkType}</div>
            <div><strong>Browser:</strong> ${browserInfo}</div>
          </div>
        `);
      }
    } catch (error) {
      console.warn('Failed to update device info:', error);
      const deviceInfoElement = DOMHelpers.getElementById(CONFIG.ELEMENTS.DEVICE_INFO_DISPLAY);
      if (deviceInfoElement) {
        DOMHelpers.updateHTML(deviceInfoElement, '<div>Device information unavailable</div>');
      }
    }
  }

  /**
   * Show loading overlay
   */
  showLoadingOverlay() {
    const overlay = DOMHelpers.getElementById(CONFIG.ELEMENTS.LOADING_OVERLAY);
    if (overlay) {
      DOMHelpers.removeClass(overlay, CONFIG.CSS_CLASSES.HIDDEN);
    }
  }

  /**
   * Hide loading overlay
   */
  hideLoadingOverlay() {
    const overlay = DOMHelpers.getElementById(CONFIG.ELEMENTS.LOADING_OVERLAY);
    if (overlay) {
      DOMHelpers.addClass(overlay, CONFIG.CSS_CLASSES.HIDDEN);
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Emit resize event for components that need to respond
    this.emit('resize', {
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyboard(e) {
    // Handle common keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'r':
          e.preventDefault();
          this.emit('startTest');
          break;
        case 's':
          e.preventDefault();
          this.emit('stopTest');
          break;
      }
    }

    // Handle escape key
    if (e.key === 'Escape') {
      if (this.isTestRunning) {
        this.emit('stopTest');
      }
    }
  }

  /**
   * Set test running state
   * @param {boolean} isRunning - Test running state
   */
  setTestRunning(isRunning) {
    this.isTestRunning = isRunning;
    this.updateTestControls();
  }

  /**
   * Set monitoring state
   * @param {boolean} isMonitoring - Monitoring state
   */
  setMonitoring(isMonitoring) {
    this.isMonitoring = isMonitoring;
    this.updateMonitoringControls();
  }

  /**
   * Get current view
   * @returns {string} Current view name
   */
  getCurrentView() {
    return this.currentView;
  }

  /**
   * Get test results
   * @returns {Object|null} Test results
   */
  getTestResults() {
    return this.testResults;
  }
}
