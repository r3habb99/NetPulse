/**
 * Continuous Network Monitoring Service
 * Provides real-time continuous monitoring of network performance
 */

class ContinuousMonitor {
  constructor(config = {}) {
    // Configuration
    this.config = {
      ...CONFIG.CONTINUOUS_MONITOR,
      ...config
    };

    // Monitoring state
    this.isMonitoring = false;
    this.isPaused = false;
    this.startTime = null;

    // Test services
    this.latencyTest = new LatencyTest();
    this.speedTest = new SpeedTest();

    // Data storage
    this.data = {
      latency: [],
      downloadSpeed: [],
      uploadSpeed: [],
      jitter: [],
      packetLoss: [],
      timestamps: []
    };

    // Smoothed values for stable display
    this.smoothedValues = {
      latency: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      jitter: 0,
      packetLoss: 0
    };

    // Smoothing configuration
    this.smoothingConfig = {
      alpha: 0.3, // Smoothing factor (0-1, lower = more smoothing)
      minSamples: 3, // Minimum samples before showing smoothed values
      stabilityThreshold: 0.1 // Threshold for considering values stable
    };

    // Timers
    this.timers = {
      latency: null,
      speedTest: null,
      dataUpdate: null
    };

    // Event callbacks
    this.callbacks = {
      onDataUpdate: null,
      onAlert: null,
      onStatusChange: null,
      onError: null
    };

    // Performance tracking
    this.stats = {
      totalTests: 0,
      successfulTests: 0,
      failedTests: 0,
      averageLatency: 0,
      averageDownloadSpeed: 0,
      averageUploadSpeed: 0
    };
  }

  /**
   * Start continuous monitoring
   * @param {Object} callbacks - Event callbacks
   */
  async start(callbacks = {}) {
    if (this.isMonitoring) {
      throw new Error('Continuous monitoring is already running');
    }

    this.callbacks = { ...this.callbacks, ...callbacks };
    this.isMonitoring = true;
    this.isPaused = false;
    this.startTime = Date.now();
    
    try {
      ErrorHandler.log(ErrorHandler.LogLevels.INFO, 'Starting continuous monitoring');
      
      // Initialize data arrays
      this.clearData();
      
      // Start monitoring timers
      this.startLatencyMonitoring();
      this.startSpeedMonitoring();
      this.startDataUpdateTimer();
      
      // Notify status change
      this.notifyStatusChange('started');
      
    } catch (error) {
      this.isMonitoring = false;
      const errorInfo = ErrorHandler.handleError(error, 'ContinuousMonitor');
      this.notifyError(errorInfo);
      throw errorInfo;
    }
  }

  /**
   * Stop continuous monitoring
   */
  stop() {
    if (!this.isMonitoring) {
      return;
    }

    ErrorHandler.log(ErrorHandler.LogLevels.INFO, 'Stopping continuous monitoring');
    
    this.isMonitoring = false;
    this.isPaused = false;
    
    // Clear all timers
    this.clearTimers();
    
    // Stop any running tests
    if (this.latencyTest.isTestRunning()) {
      this.latencyTest.stop();
    }
    if (this.speedTest.isTestRunning()) {
      this.speedTest.stop();
    }
    
    // Notify status change
    this.notifyStatusChange('stopped');
  }

  /**
   * Pause monitoring
   */
  pause() {
    if (!this.isMonitoring || this.isPaused) {
      return;
    }

    this.isPaused = true;
    this.clearTimers();
    
    ErrorHandler.log(ErrorHandler.LogLevels.INFO, 'Continuous monitoring paused');
    this.notifyStatusChange('paused');
  }

  /**
   * Resume monitoring
   */
  resume() {
    if (!this.isMonitoring || !this.isPaused) {
      return;
    }

    this.isPaused = false;
    
    // Restart timers
    this.startLatencyMonitoring();
    this.startSpeedMonitoring();
    this.startDataUpdateTimer();
    
    ErrorHandler.log(ErrorHandler.LogLevels.INFO, 'Continuous monitoring resumed');
    this.notifyStatusChange('resumed');
  }

  /**
   * Start latency monitoring
   */
  startLatencyMonitoring() {
    const runLatencyTest = async () => {
      if (!this.isMonitoring || this.isPaused) {
        return;
      }

      try {
        const result = await this.latencyTest.start({
          samples: this.config.lightweightTest.latencySamples,
          onComplete: (data) => {
            this.addLatencyData(data);
            this.stats.totalTests++;
            this.stats.successfulTests++;
            this.updateAverages();
            this.checkAlerts(data);
          },
          onError: (error) => {
            this.stats.totalTests++;
            this.stats.failedTests++;
            ErrorHandler.log(ErrorHandler.LogLevels.WARN, 'Latency test failed', error);
          }
        });
      } catch (error) {
        ErrorHandler.log(ErrorHandler.LogLevels.WARN, 'Latency monitoring error', error);
      }
    };

    // Run initial test
    runLatencyTest();
    
    // Schedule recurring tests
    this.timers.latency = setInterval(runLatencyTest, this.config.intervals.latency);
  }

  /**
   * Start speed monitoring
   */
  startSpeedMonitoring() {
    const runSpeedTest = async () => {
      if (!this.isMonitoring || this.isPaused) {
        return;
      }

      try {
        ErrorHandler.log(ErrorHandler.LogLevels.INFO, 'Starting speed test for continuous monitoring');

        // Create a lightweight speed test instance for continuous monitoring
        const lightweightSpeedTest = new SpeedTest(this.config.lightweightTest);

        const result = await lightweightSpeedTest.start({
          onProgress: (data) => {
            // Update real-time data during the test
            if (data.type === 'download' && data.speed !== undefined) {
              this.updateRealtimeSpeed('download', data.speed);
            }
            if (data.type === 'upload' && data.speed !== undefined) {
              this.updateRealtimeSpeed('upload', data.speed);
            }
          },
          onComplete: (data) => {
            ErrorHandler.log(ErrorHandler.LogLevels.INFO, 'Speed test completed', {
              download: data.download.speed,
              upload: data.upload.speed
            });
            this.addSpeedData(data);
            this.stats.totalTests++;
            this.stats.successfulTests++;
            this.updateAverages();
            this.checkSpeedAlerts(data);
          },
          onError: (error) => {
            this.stats.totalTests++;
            this.stats.failedTests++;
            ErrorHandler.log(ErrorHandler.LogLevels.WARN, 'Speed test failed', error);
          }
        });
      } catch (error) {
        ErrorHandler.log(ErrorHandler.LogLevels.WARN, 'Speed monitoring error', error);
      }
    };

    // Run initial speed test immediately
    runSpeedTest();

    // Schedule recurring speed tests
    this.timers.speedTest = setInterval(runSpeedTest, this.config.intervals.speedTest);
  }

  /**
   * Start data update timer for UI updates
   */
  startDataUpdateTimer() {
    this.timers.dataUpdate = setInterval(() => {
      if (this.isMonitoring && !this.isPaused) {
        this.notifyDataUpdate();
      }
    }, this.config.intervals.dataUpdate);
  }

  /**
   * Add latency data point
   * @param {Object} data - Latency test results
   */
  addLatencyData(data) {
    const timestamp = Date.now();

    this.data.latency.push(data.avg);
    this.data.jitter.push(data.jitter);
    this.data.packetLoss.push(data.packetLoss || 0);
    this.data.timestamps.push(timestamp);

    // Update smoothed values
    this.updateSmoothedValue('latency', data.avg);
    this.updateSmoothedValue('jitter', data.jitter);
    this.updateSmoothedValue('packetLoss', data.packetLoss || 0);

    // Maintain data size limits
    this.trimDataArrays();
  }

  /**
   * Add speed data point
   * @param {Object} data - Speed test results
   */
  addSpeedData(data) {
    const timestamp = Date.now();

    this.data.downloadSpeed.push(data.download.speed);
    this.data.uploadSpeed.push(data.upload.speed);

    // Update smoothed values
    this.updateSmoothedValue('downloadSpeed', data.download.speed);
    this.updateSmoothedValue('uploadSpeed', data.upload.speed);

    // Ensure timestamps array is in sync
    if (this.data.timestamps.length === 0 ||
        this.data.timestamps[this.data.timestamps.length - 1] !== timestamp) {
      this.data.timestamps.push(timestamp);
    }

    // Maintain data size limits
    this.trimDataArrays();
  }

  /**
   * Update real-time speed data during tests
   * @param {string} type - 'download' or 'upload'
   * @param {number} speed - Current speed in Mbps
   */
  updateRealtimeSpeed(type, speed) {
    // Store the latest real-time values for immediate UI updates
    if (!this.realtimeData) {
      this.realtimeData = {
        downloadSpeed: 0,
        uploadSpeed: 0,
        lastUpdate: Date.now()
      };
    }

    if (type === 'download') {
      this.realtimeData.downloadSpeed = speed;
      // Apply light smoothing to real-time values too
      this.updateSmoothedValue('downloadSpeed', speed, 0.5); // Higher alpha for more responsiveness
    } else if (type === 'upload') {
      this.realtimeData.uploadSpeed = speed;
      this.updateSmoothedValue('uploadSpeed', speed, 0.5);
    }

    this.realtimeData.lastUpdate = Date.now();

    // Trigger immediate UI update for real-time feedback
    this.notifyDataUpdate();
  }

  /**
   * Update smoothed value using exponential moving average
   * @param {string} metric - Metric name
   * @param {number} newValue - New value to incorporate
   * @param {number} customAlpha - Custom smoothing factor (optional)
   */
  updateSmoothedValue(metric, newValue, customAlpha = null) {
    const alpha = customAlpha || this.smoothingConfig.alpha;
    const currentSmoothed = this.smoothedValues[metric];

    if (currentSmoothed === 0 || this.data[metric]?.length < this.smoothingConfig.minSamples) {
      // Initialize with first value or use raw value until we have enough samples
      this.smoothedValues[metric] = newValue;
    } else {
      // Apply exponential moving average: smoothed = alpha * new + (1 - alpha) * smoothed
      this.smoothedValues[metric] = alpha * newValue + (1 - alpha) * currentSmoothed;
    }
  }

  /**
   * Get stable display values (smoothed)
   * @returns {Object} Smoothed values for display
   */
  getStableValues() {
    return {
      latency: this.smoothedValues.latency,
      downloadSpeed: this.smoothedValues.downloadSpeed,
      uploadSpeed: this.smoothedValues.uploadSpeed,
      jitter: this.smoothedValues.jitter,
      packetLoss: this.smoothedValues.packetLoss
    };
  }

  /**
   * Trim data arrays to maintain size limits
   */
  trimDataArrays() {
    const maxPoints = this.config.dataRetention.maxDataPoints;
    
    Object.keys(this.data).forEach(key => {
      if (this.data[key].length > maxPoints) {
        this.data[key] = this.data[key].slice(-maxPoints);
      }
    });
  }

  /**
   * Clear all monitoring timers
   */
  clearTimers() {
    Object.keys(this.timers).forEach(key => {
      if (this.timers[key]) {
        clearInterval(this.timers[key]);
        this.timers[key] = null;
      }
    });
  }

  /**
   * Clear all data
   */
  clearData() {
    Object.keys(this.data).forEach(key => {
      this.data[key] = [];
    });

    // Reset stats
    this.stats = {
      totalTests: 0,
      successfulTests: 0,
      failedTests: 0,
      averageLatency: 0,
      averageDownloadSpeed: 0,
      averageUploadSpeed: 0
    };
  }

  /**
   * Update running averages
   */
  updateAverages() {
    if (this.data.latency.length > 0) {
      this.stats.averageLatency = MathUtils.mean(this.data.latency);
    }
    if (this.data.downloadSpeed.length > 0) {
      this.stats.averageDownloadSpeed = MathUtils.mean(this.data.downloadSpeed);
    }
    if (this.data.uploadSpeed.length > 0) {
      this.stats.averageUploadSpeed = MathUtils.mean(this.data.uploadSpeed);
    }
  }

  /**
   * Check for latency-based alerts
   * @param {Object} data - Latency test data
   */
  checkAlerts(data) {
    const alerts = [];

    if (data.avg > this.config.alerts.highLatencyThreshold) {
      alerts.push({
        type: 'high-latency',
        severity: 'warning',
        message: `High latency detected: ${Math.round(data.avg)}ms`,
        value: data.avg,
        threshold: this.config.alerts.highLatencyThreshold
      });
    }

    if (data.jitter > this.config.alerts.jitterThreshold) {
      alerts.push({
        type: 'high-jitter',
        severity: 'warning',
        message: `High jitter detected: ${Math.round(data.jitter)}ms`,
        value: data.jitter,
        threshold: this.config.alerts.jitterThreshold
      });
    }

    if (data.packetLoss > this.config.alerts.packetLossThreshold) {
      alerts.push({
        type: 'packet-loss',
        severity: 'error',
        message: `Packet loss detected: ${data.packetLoss.toFixed(1)}%`,
        value: data.packetLoss,
        threshold: this.config.alerts.packetLossThreshold
      });
    }

    alerts.forEach(alert => this.notifyAlert(alert));
  }

  /**
   * Check for speed-based alerts
   * @param {Object} data - Speed test data
   */
  checkSpeedAlerts(data) {
    const alerts = [];

    if (data.download.speed < this.config.alerts.lowSpeedThreshold) {
      alerts.push({
        type: 'low-download-speed',
        severity: 'warning',
        message: `Low download speed: ${data.download.speed.toFixed(1)} Mbps`,
        value: data.download.speed,
        threshold: this.config.alerts.lowSpeedThreshold
      });
    }

    if (data.upload.speed < this.config.alerts.lowSpeedThreshold / 2) {
      alerts.push({
        type: 'low-upload-speed',
        severity: 'warning',
        message: `Low upload speed: ${data.upload.speed.toFixed(1)} Mbps`,
        value: data.upload.speed,
        threshold: this.config.alerts.lowSpeedThreshold / 2
      });
    }

    alerts.forEach(alert => this.notifyAlert(alert));
  }

  /**
   * Get current monitoring data
   * @returns {Object} Current data and statistics
   */
  getCurrentData() {
    return {
      data: { ...this.data },
      stats: { ...this.stats },
      status: {
        isMonitoring: this.isMonitoring,
        isPaused: this.isPaused,
        startTime: this.startTime,
        uptime: this.startTime ? Date.now() - this.startTime : 0
      },
      latest: this.getLatestValues()
    };
  }

  /**
   * Get latest values from each metric
   * @returns {Object} Latest values (smoothed for stability)
   */
  getLatestValues() {
    const stableValues = this.getStableValues();

    // Check if we have enough data for stable values
    const hasEnoughData = this.data.latency.length >= this.smoothingConfig.minSamples;

    return {
      latency: hasEnoughData ? stableValues.latency :
        (this.data.latency.length > 0 ? this.data.latency[this.data.latency.length - 1] : null),
      downloadSpeed: hasEnoughData ? stableValues.downloadSpeed :
        (this.data.downloadSpeed.length > 0 ? this.data.downloadSpeed[this.data.downloadSpeed.length - 1] : null),
      uploadSpeed: hasEnoughData ? stableValues.uploadSpeed :
        (this.data.uploadSpeed.length > 0 ? this.data.uploadSpeed[this.data.uploadSpeed.length - 1] : null),
      jitter: hasEnoughData ? stableValues.jitter :
        (this.data.jitter.length > 0 ? this.data.jitter[this.data.jitter.length - 1] : null),
      packetLoss: hasEnoughData ? stableValues.packetLoss :
        (this.data.packetLoss.length > 0 ? this.data.packetLoss[this.data.packetLoss.length - 1] : null),
      timestamp: this.data.timestamps.length > 0 ? this.data.timestamps[this.data.timestamps.length - 1] : null,
      isSmoothed: hasEnoughData
    };
  }

  /**
   * Get data for time range
   * @param {number} startTime - Start timestamp
   * @param {number} endTime - End timestamp
   * @returns {Object} Filtered data
   */
  getDataForTimeRange(startTime, endTime) {
    const filteredData = {};
    const timeIndices = [];

    // Find indices within time range
    this.data.timestamps.forEach((timestamp, index) => {
      if (timestamp >= startTime && timestamp <= endTime) {
        timeIndices.push(index);
      }
    });

    // Extract data for those indices
    Object.keys(this.data).forEach(key => {
      filteredData[key] = timeIndices.map(index => this.data[key][index]);
    });

    return filteredData;
  }

  /**
   * Export monitoring data
   * @returns {Object} Exportable data
   */
  exportData() {
    return {
      metadata: {
        exportTime: new Date().toISOString(),
        monitoringStartTime: this.startTime ? new Date(this.startTime).toISOString() : null,
        dataPoints: this.data.timestamps.length,
        config: this.config
      },
      data: this.data,
      stats: this.stats
    };
  }

  /**
   * Notify data update
   */
  notifyDataUpdate() {
    if (this.callbacks.onDataUpdate) {
      this.callbacks.onDataUpdate(this.getCurrentData());
    }
  }

  /**
   * Notify alert
   * @param {Object} alert - Alert information
   */
  notifyAlert(alert) {
    if (this.callbacks.onAlert) {
      this.callbacks.onAlert(alert);
    }
  }

  /**
   * Notify status change
   * @param {string} status - New status
   */
  notifyStatusChange(status) {
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange(status, this.getCurrentData().status);
    }
  }

  /**
   * Notify error
   * @param {Object} error - Error information
   */
  notifyError(error) {
    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }
  }

  /**
   * Get monitoring status
   * @returns {Object} Current status
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      isPaused: this.isPaused,
      startTime: this.startTime,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      dataPoints: this.data.timestamps.length,
      successRate: this.stats.totalTests > 0 ?
        (this.stats.successfulTests / this.stats.totalTests) * 100 : 0
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContinuousMonitor;
} else {
  window.ContinuousMonitor = ContinuousMonitor;
}
