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
   * Update real-time metrics during test
   * @param {Object} data - Metric data
   */
  updateRealTimeMetrics(data) {
    const { type, speed, latency, jitter } = data;

    // Update speed displays
    if ((type === CONFIG.TEST_TYPES.DOWNLOAD || type === CONFIG.TEST_TYPES.UPLOAD) && speed !== undefined) {
      const elementId = type === CONFIG.TEST_TYPES.DOWNLOAD ? 
        CONFIG.ELEMENTS.REALTIME_DOWNLOAD : CONFIG.ELEMENTS.REALTIME_UPLOAD;
      
      const element = DOMHelpers.getElementById(elementId);
      if (element) {
        const formattedSpeed = Formatters.formatSpeed(speed).replace(` ${CONSTANTS.UNITS.SPEED.MBPS}`, '');
        DOMHelpers.updateText(element, formattedSpeed);
        this.addPulseEffect(element);
      }
    }

    // Update latency display
    if (type === CONFIG.TEST_TYPES.LATENCY && latency !== undefined) {
      const element = DOMHelpers.getElementById(CONFIG.ELEMENTS.REALTIME_LATENCY);
      if (element) {
        DOMHelpers.updateText(element, Math.round(latency));
        this.addPulseEffect(element);
      }

      // Update jitter display if available
      if (jitter !== undefined) {
        const jitterElement = DOMHelpers.getElementById(CONFIG.ELEMENTS.REALTIME_JITTER);
        if (jitterElement) {
          DOMHelpers.updateText(jitterElement, Math.round(jitter));
          this.addPulseEffect(jitterElement);
        }
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

    // Update final metrics
    const downloadSpeed = Formatters.formatSpeed(speed?.download?.speed).replace(` ${CONSTANTS.UNITS.SPEED.MBPS}`, '');
    const uploadSpeed = Formatters.formatSpeed(speed?.upload?.speed).replace(` ${CONSTANTS.UNITS.SPEED.MBPS}`, '');
    const latencyValue = Math.round(latency?.avg || 0);
    const jitterValue = Math.round(latency?.jitter || 0);

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
   * Show quick stats on home view
   * @param {Object} results - Test results
   */
  showQuickStats(results) {
    if (!results) return;

    const quickStats = DOMHelpers.getElementById(CONFIG.ELEMENTS.QUICK_STATS);
    if (quickStats) {
      DOMHelpers.removeClass(quickStats, CONFIG.CSS_CLASSES.HIDDEN);

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
