/**
 * NetPulse Main Application
 * Entry point and application initialization
 */

class NetPulseApp {
  constructor() {
    this.isInitialized = false;
    this.uiController = null;
    this.networkTest = null;
    this.continuousMonitor = null;
    this.realtimeDashboard = null;

    this.currentTest = null;

    // Application state
    this.state = {
      isTestRunning: false,
      isMonitoring: false,
      currentView: 'home',
      lastResults: null,
      deviceInfo: null
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      this.showLoadingOverlay();
      
      // Check browser compatibility
      await this.checkCompatibility();
      
      // Initialize core components
      await this.initializeCore();
      
      // Initialize UI
      await this.initializeUI();

      // Event listeners are now handled by UI Controller
      
      // Load saved data
      this.loadSavedData();
      
      // Mark as initialized
      this.isInitialized = true;
      
      this.hideLoadingOverlay();

      ErrorHandler.log(ErrorHandler.LogLevels.INFO, 'NetPulse application initialized successfully');
      console.log('App initialization complete, loading overlay should be hidden');
      
    } catch (error) {
      this.handleInitializationError(error);
    }
  }

  /**
   * Check browser compatibility
   */
  async checkCompatibility() {
    const compatibility = DeviceDetection.checkCompatibility();
    
    if (!compatibility.compatible) {
      throw new Error('Browser not compatible with NetPulse. Please use a modern browser.');
    }
    
    if (!compatibility.fullySupported) {
      this.showCompatibilityWarning(compatibility.missing);
    }
  }

  /**
   * Initialize core components
   */
  async initializeCore() {
    // Get device information
    this.state.deviceInfo = DeviceDetection.getDeviceInfo();

    // Initialize network test with optimal configuration
    const optimalConfig = DeviceDetection.getOptimalConfig();
    this.networkTest = new NetworkTest(optimalConfig);

    // Initialize continuous monitor
    this.continuousMonitor = new ContinuousMonitor(optimalConfig);

    // Update device info display
    this.updateDeviceInfoDisplay();
  }

  /**
   * Initialize UI controller
   */
  async initializeUI() {
    try {
      // Initialize UI Controller
      this.uiController = new UIController();

    // Bind UI Controller events
    this.uiController.on('startTest', () => this.startNetworkTest());
    this.uiController.on('stopTest', () => this.stopNetworkTest());
    this.uiController.on('startMonitoring', () => this.startContinuousMonitoring());
    this.uiController.on('pauseMonitoring', () => this.pauseContinuousMonitoring());
    this.uiController.on('stopMonitoring', () => this.stopContinuousMonitoring());
    this.uiController.on('shareResults', () => this.shareResults());
    this.uiController.on('viewChange', (data) => {
      this.state.currentView = data.view;
      this.handleViewChange(data.view);
    });

      // Initialize real-time dashboard
      const dashboardContainer = DOMHelpers.getElementById(CONFIG.ELEMENTS.REALTIME_DASHBOARD_CONTAINER);
      if (dashboardContainer) {
        this.realtimeDashboard = new RealtimeDashboard(dashboardContainer, {
          maxDataPoints: 50,
          updateInterval: 1000,
          chartHeight: this.state.deviceInfo.type.isMobile ? 100 : 120
        });
      }
    } catch (error) {
      console.error('Failed to initialize UI:', error);
      throw error;
    }
  }



  /**
   * Handle view change from UI Controller
   * @param {string} viewName - Name of the view
   */
  handleViewChange(viewName) {
    // Handle view-specific actions
    if (viewName === CONFIG.VIEWS.DASHBOARD) {
      // Request notification permission if not already granted
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }

  /**
   * Start network test
   */
  async startNetworkTest() {
    if (this.state.isTestRunning) {
      return;
    }

    try {
      this.state.isTestRunning = true;
      this.uiController.setTestRunning(true);
      this.uiController.switchView(CONFIG.VIEWS.TEST);
      this.uiController.updateTestStatus('info', CONFIG.MESSAGES.INITIALIZING);

      // Start the test
      await this.networkTest.startCompleteTest({}, {
        onTestStart: () => {
          this.uiController.updateTestStatus('info', CONFIG.MESSAGES.TEST_STARTED);
          this.uiController.resetRealtimeValues(); // Reset values for new test
        },
        onTestProgress: (data) => {
          this.uiController.updateTestProgress(data);
          // Also update real-time metrics for latency and jitter
          this.uiController.updateRealTimeMetrics(data);
        },
        onTestComplete: (data) => {
          this.state.lastResults = data;
          this.uiController.updateTestStatus('success', CONFIG.MESSAGES.TEST_COMPLETED);
          this.uiController.displayResults(data);
          this.saveResults(data);

          // Show notification badge
          if (window.mobileNavigation) {
            window.mobileNavigation.showBadge();
          }

          // Set test as not running and update controls
          this.state.isTestRunning = false;
          this.uiController.setTestRunning(false);

          setTimeout(() => this.uiController.switchView(CONFIG.VIEWS.RESULTS), CONSTANTS.TIMING.VIEW_TRANSITION_DELAY);
        },
        onTestError: (error) => {
          this.uiController.updateTestStatus('error', error.message);
          this.showError(error);
          this.state.isTestRunning = false;
          this.uiController.setTestRunning(false);
        }
      });

    } catch (error) {
      this.uiController.updateTestStatus('error', CONFIG.ERRORS.TEST_FAILED);
      this.showError(error);
      this.state.isTestRunning = false;
      this.uiController.setTestRunning(false);
    }
  }

  /**
   * Stop network test
   */
  stopNetworkTest() {
    if (!this.state.isTestRunning) {
      return;
    }

    if (this.networkTest) {
      this.networkTest.stop();
    }

    this.state.isTestRunning = false;
    this.uiController.setTestRunning(false);
    this.uiController.updateTestStatus('warning', CONFIG.MESSAGES.TEST_STOPPED);

    setTimeout(() => this.uiController.switchView(CONFIG.VIEWS.HOME), CONSTANTS.TIMING.VIEW_TRANSITION_DELAY);
  }

  /**
   * Start continuous monitoring
   */
  async startContinuousMonitoring() {
    if (this.state.isMonitoring) {
      return;
    }

    try {
      this.state.isMonitoring = true;
      this.uiController.setMonitoring(true);
      this.uiController.updateMonitoringStatus('info', CONFIG.MESSAGES.MONITORING_STARTED);

      await this.continuousMonitor.start({
        onDataUpdate: (data) => {
          this.updateDashboardData(data);
        },
        onAlert: (alert) => {
          this.handleMonitoringAlert(alert);
        },
        onStatusChange: (status) => {
          this.uiController.updateMonitoringStatus('success', `Monitoring ${status}`);
        },
        onError: (error) => {
          this.uiController.updateMonitoringStatus('error', error.message);
          this.showError(error);
        }
      });

      this.uiController.updateMonitoringStatus('success', CONFIG.MESSAGES.MONITORING_STARTED);

    } catch (error) {
      this.state.isMonitoring = false;
      this.uiController.setMonitoring(false);
      this.uiController.updateMonitoringStatus('error', CONFIG.ERRORS.MONITORING_FAILED);
      this.showError(error);
    }
  }

  /**
   * Pause continuous monitoring
   */
  pauseContinuousMonitoring() {
    if (!this.state.isMonitoring || !this.continuousMonitor) {
      return;
    }

    this.continuousMonitor.pause();
    this.uiController.updateMonitoringStatus('warning', CONFIG.MESSAGES.MONITORING_PAUSED);
    this.uiController.setMonitoring(this.state.isMonitoring);
  }

  /**
   * Stop continuous monitoring
   */
  stopContinuousMonitoring() {
    if (!this.state.isMonitoring || !this.continuousMonitor) {
      return;
    }

    this.continuousMonitor.stop();
    this.state.isMonitoring = false;
    this.uiController.setMonitoring(false);
    this.uiController.updateMonitoringStatus('info', CONFIG.MESSAGES.MONITORING_STOPPED);
  }









  /**
   * Update dashboard with monitoring data
   * @param {Object} data - Monitoring data
   */
  updateDashboardData(data) {
    if (this.realtimeDashboard) {
      this.realtimeDashboard.updateData(data);
    }
  }

  /**
   * Handle monitoring alert
   * @param {Object} alert - Alert data
   */
  handleMonitoringAlert(alert) {
    if (this.realtimeDashboard) {
      this.realtimeDashboard.addAlert(alert);
    }

    // Show system notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('NetPulse Network Alert', {
        body: alert.message,
        icon: '/favicon.ico'
      });
    }
  }



  /**
   * Update device information display
   */
  updateDeviceInfoDisplay() {
    const deviceInfo = this.state.deviceInfo;
    const compatibility = DeviceDetection.checkCompatibility();

    const deviceInfoElement = document.getElementById('device-info-display');
    if (deviceInfoElement && deviceInfo) {
      deviceInfoElement.innerHTML = `
        <div class="grid grid-cols-1 gap-sm text-sm">
          <div><strong>Device:</strong> ${Formatters.formatDeviceType(deviceInfo.type)}</div>
          <div><strong>Browser:</strong> ${deviceInfo.browser.name} ${deviceInfo.browser.version}</div>
          <div><strong>Screen:</strong> ${deviceInfo.screen.width}×${deviceInfo.screen.height}</div>
          <div><strong>Network:</strong> ${Formatters.formatNetworkType(deviceInfo.network.effectiveType)}</div>
          <div><strong>Compatibility:</strong>
            <span class="${compatibility.compatible ? 'text-success' : 'text-error'}">
              ${compatibility.compatible ? '✅ Compatible' : '❌ Not Compatible'}
            </span>
          </div>
        </div>
      `;
    }
  }

  /**
   * Save test results
   * @param {Object} results - Test results to save
   */
  saveResults(results) {
    try {
      const history = this.getTestHistory();
      history.unshift(results);

      // Keep only last 10 results
      if (history.length > 10) {
        history.splice(10);
      }

      localStorage.setItem(CONSTANTS.STORAGE_KEYS.TEST_HISTORY, JSON.stringify(history));

    } catch (error) {
      ErrorHandler.log(ErrorHandler.LogLevels.WARN, 'Failed to save test results', error);
    }
  }

  /**
   * Load saved data
   */
  loadSavedData() {
    try {
      // Load last test results
      const history = this.getTestHistory();
      if (history.length > 0) {
        this.state.lastResults = history[0];
        this.updateQuickStats(this.state.lastResults);
      }

    } catch (error) {
      ErrorHandler.log(ErrorHandler.LogLevels.WARN, 'Failed to load saved data', error);
    }
  }

  /**
   * Get test history
   * @returns {Array} Test history
   */
  getTestHistory() {
    try {
      const history = localStorage.getItem(CONSTANTS.STORAGE_KEYS.TEST_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Share test results
   */
  async shareResults() {
    if (!this.state.lastResults) {
      this.showError({ message: 'No test results to share' });
      return;
    }

    const results = this.state.lastResults;
    const shareText = `NetPulse Speed Test Results:
📥 Download: ${Formatters.formatSpeed(results.speed?.download?.speed)}
📤 Upload: ${Formatters.formatSpeed(results.speed?.upload?.speed)}
⚡ Latency: ${Formatters.formatLatency(results.latency?.avg)}
🎯 Quality: ${results.connection?.quality?.description}

Test your connection at: ${window.location.href}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'NetPulse Speed Test Results',
          text: shareText,
          url: window.location.href
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        this.showSuccess('Results copied to clipboard!');
      }
    } catch (error) {
      ErrorHandler.log(ErrorHandler.LogLevels.WARN, 'Failed to share results', error);
    }
  }

  /**
   * Show error message
   * @param {Object} error - Error object
   */
  showError(error) {
    const message = Formatters.formatError(error);
    this.showAlert('error', 'Error', message);
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccess(message) {
    this.showAlert('success', 'Success', message);
  }

  /**
   * Show alert message
   * @param {string} type - Alert type (success, error, warning, info)
   * @param {string} title - Alert title
   * @param {string} message - Alert message
   */
  showAlert(type, title, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} fade-in`;
    alert.innerHTML = `
      <div class="alert-icon">${this.getAlertIcon(type)}</div>
      <div class="alert-content">
        <div class="alert-title">${title}</div>
        <div class="alert-message">${message}</div>
      </div>
    `;

    // Add to page
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alert, container.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      alert.classList.add('fade-out');
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  }

  /**
   * Get alert icon based on type
   * @param {string} type - Alert type
   * @returns {string} Icon emoji
   */
  getAlertIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  }

  /**
   * Show compatibility warning
   * @param {Object} missing - Missing features
   */
  showCompatibilityWarning(missing) {
    const missingFeatures = [...missing.required, ...missing.recommended];
    const message = `Some features may not work properly. Missing: ${missingFeatures.join(', ')}`;
    this.showAlert('warning', 'Compatibility Warning', message);
  }

  /**
   * Show/hide loading overlay
   */
  showLoadingOverlay() {
    if (this.uiController) {
      this.uiController.showLoadingOverlay();
    } else {
      // Fallback for early initialization
      const overlay = DOMHelpers.getElementById(CONFIG.ELEMENTS.LOADING_OVERLAY);
      if (overlay) {
        DOMHelpers.removeClass(overlay, CONFIG.CSS_CLASSES.HIDDEN);
      }
    }
  }

  hideLoadingOverlay() {
    if (this.uiController) {
      this.uiController.hideLoadingOverlay();
    } else {
      // Fallback for early initialization
      const overlay = DOMHelpers.getElementById(CONFIG.ELEMENTS.LOADING_OVERLAY);
      if (overlay) {
        DOMHelpers.addClass(overlay, CONFIG.CSS_CLASSES.HIDDEN);
      }
    }
  }

  /**
   * Handle initialization error
   * @param {Error} error - Initialization error
   */
  handleInitializationError(error) {
    this.hideLoadingOverlay();

    const errorMessage = `Failed to initialize NetPulse: ${error.message}`;
    ErrorHandler.log(ErrorHandler.LogLevels.ERROR, errorMessage, error);

    // Show error to user
    document.body.innerHTML = `
      <div class="container" style="padding: 2rem; text-align: center;">
        <h1 style="color: #f44336;">NetPulse Initialization Error</h1>
        <p style="color: #666; margin: 1rem 0;">${errorMessage}</p>
        <button onclick="location.reload()" style="
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
        ">Retry</button>
      </div>
    `;
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Update real-time dashboard
    if (this.realtimeDashboard) {
      this.realtimeDashboard.handleResize();
    }
  }

  /**
   * Handle before unload
   */
  handleBeforeUnload() {
    // Stop any running tests
    if (this.state.isTestRunning && this.networkTest) {
      this.networkTest.stop();
    }
  }

  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyboard(e) {
    // Space to start/stop test
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault();
      if (this.state.isTestRunning) {
        this.stopNetworkTest();
      } else {
        this.startNetworkTest();
      }
    }

    // Number keys for navigation
    if (e.code >= 'Digit1' && e.code <= 'Digit3') {
      const viewIndex = parseInt(e.code.slice(-1)) - 1;
      const views = ['home', 'test', 'results'];
      if (views[viewIndex]) {
        this.switchView(views[viewIndex]);
      }
    }
  }



  /**
   * Get application state
   * @returns {Object} Current application state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Destroy the application
   */
  destroy() {
    // Stop any running tests
    if (this.state.isTestRunning && this.networkTest) {
      this.networkTest.stop();
    }



    // Clear state
    this.isInitialized = false;
    this.state = {
      isTestRunning: false,
      currentView: 'home',
      lastResults: null,
      deviceInfo: null
    };
  }
}

// Initialize the application
const app = new NetPulseApp();

// Export for debugging
if (typeof window !== 'undefined') {
  window.NetPulseApp = app;
}
