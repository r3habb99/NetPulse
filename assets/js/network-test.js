/**
 * Network Testing Controller
 * Main controller for coordinating network tests and managing results
 */

class NetworkTest {
  constructor(config = {}) {
    this.config = {
      autoDetectConnection: config.autoDetectConnection !== false,
      saveResults: config.saveResults !== false,
      maxHistoryEntries: config.maxHistoryEntries || 50,
      ...config
    };

    // Initialize test services
    this.latencyTest = new LatencyTest(config.latency);
    this.speedTest = new SpeedTest(config.speed);
    
    // Test state
    this.isRunning = false;
    this.currentTest = null;
    this.results = {
      latency: null,
      speed: null,
      connection: null
    };

    // Event callbacks
    this.callbacks = {
      onTestStart: null,
      onTestProgress: null,
      onTestComplete: null,
      onTestError: null
    };

    // Initialize connection detection
    this.connectionInfo = this.detectConnection();
  }

  /**
   * Start comprehensive network test
   * @param {Object} options - Test options
   * @param {Object} callbacks - Event callbacks
   * @returns {Promise} Complete test results
   */
  async startCompleteTest(options = {}, callbacks = {}) {
    if (this.isRunning) {
      throw new Error('Network test is already running');
    }

    this.callbacks = { ...this.callbacks, ...callbacks };
    this.isRunning = true;
    this.currentTest = 'complete';

    try {
      ErrorHandler.log(ErrorHandler.LogLevels.INFO, 'Starting complete network test');

      if (this.callbacks.onTestStart) {
        this.callbacks.onTestStart({ type: 'complete' });
      }

      // Step 1: Test latency
      const latencyResult = await this.runLatencyTest();
      
      if (!this.isRunning) {
        return null; // Test was stopped
      }

      // Step 2: Test speed
      const speedResult = await this.runSpeedTest();

      // Step 3: Analyze connection
      const connectionAnalysis = this.analyzeConnection(latencyResult, speedResult);

      const completeResults = {
        latency: latencyResult,
        speed: speedResult,
        connection: connectionAnalysis,
        timestamp: new Date().toISOString(),
        testDuration: this.getTestDuration()
      };

      // Save results
      if (this.config.saveResults) {
        this.saveTestResults(completeResults);
      }

      this.results = completeResults;

      ErrorHandler.log(ErrorHandler.LogLevels.INFO, 'Complete network test finished', completeResults);

      if (this.callbacks.onTestComplete) {
        this.callbacks.onTestComplete(completeResults);
      }

      return completeResults;

    } catch (error) {
      const errorInfo = ErrorHandler.handleError(error, 'NetworkTest');
      
      if (this.callbacks.onTestError) {
        this.callbacks.onTestError(errorInfo);
      }
      
      throw errorInfo;
    } finally {
      this.isRunning = false;
      this.currentTest = null;
    }
  }

  /**
   * Run latency test only
   * @returns {Promise} Latency test results
   */
  async runLatencyTest() {
    this.currentTest = 'latency';
    
    return new Promise((resolve, reject) => {
      this.latencyTest.start({
        onProgress: (progress) => {
          if (this.callbacks.onTestProgress) {
            this.callbacks.onTestProgress({
              type: 'latency',
              ...progress
            });
          }
        },
        onComplete: (results) => {
          resolve(results);
        },
        onError: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * Run speed test only
   * @returns {Promise} Speed test results
   */
  async runSpeedTest() {
    this.currentTest = 'speed';
    
    return new Promise((resolve, reject) => {
      this.speedTest.start({
        onProgress: (progress) => {
          if (this.callbacks.onTestProgress) {
            // Pass through speed test progress directly (already has type: 'download' or 'upload')
            this.callbacks.onTestProgress(progress);
          }
        },
        onComplete: (results) => {
          resolve(results);
        },
        onError: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * Analyze connection quality and characteristics
   * @param {Object} latencyResult - Latency test results
   * @param {Object} speedResult - Speed test results
   * @returns {Object} Connection analysis
   */
  analyzeConnection(latencyResult, speedResult) {
    const analysis = {
      type: this.connectionInfo.type,
      effectiveType: this.connectionInfo.effectiveType,
      quality: this.determineOverallQuality(latencyResult, speedResult),
      characteristics: this.analyzeCharacteristics(latencyResult, speedResult),
      recommendations: this.generateRecommendations(latencyResult, speedResult)
    };

    return analysis;
  }

  /**
   * Determine overall connection quality
   * @param {Object} latencyResult - Latency results
   * @param {Object} speedResult - Speed results
   * @returns {Object} Quality assessment
   */
  determineOverallQuality(latencyResult, speedResult) {
    const latencyScore = latencyResult.quality.score;
    const downloadSpeed = speedResult.download.speed;
    const uploadSpeed = speedResult.upload.speed;

    // Calculate speed scores (simplified scoring)
    const downloadScore = Math.min(5, Math.floor(downloadSpeed / 10) + 1);
    const uploadScore = Math.min(5, Math.floor(uploadSpeed / 5) + 1);

    // Weighted average (latency 40%, download 40%, upload 20%)
    const overallScore = Math.round(
      (latencyScore * 0.4) + (downloadScore * 0.4) + (uploadScore * 0.2)
    );

    const qualityLevels = {
      5: { level: 'excellent', description: 'Excellent connection quality' },
      4: { level: 'good', description: 'Good connection quality' },
      3: { level: 'fair', description: 'Fair connection quality' },
      2: { level: 'poor', description: 'Poor connection quality' },
      1: { level: 'very-poor', description: 'Very poor connection quality' }
    };

    return {
      score: overallScore,
      ...qualityLevels[overallScore],
      components: {
        latency: latencyScore,
        download: downloadScore,
        upload: uploadScore
      }
    };
  }

  /**
   * Analyze connection characteristics
   * @param {Object} latencyResult - Latency results
   * @param {Object} speedResult - Speed results
   * @returns {Object} Connection characteristics
   */
  analyzeCharacteristics(latencyResult, speedResult) {
    return {
      latency: {
        avg: latencyResult.avg,
        stability: latencyResult.jitter < 10 ? 'stable' : 'unstable',
        packetLoss: latencyResult.packetLoss
      },
      speed: {
        download: speedResult.download.speed,
        upload: speedResult.upload.speed,
        ratio: MathUtils.round(speedResult.download.speed / speedResult.upload.speed, 2)
      },
      suitability: this.assessSuitability(latencyResult, speedResult)
    };
  }

  /**
   * Assess connection suitability for different activities
   * @param {Object} latencyResult - Latency results
   * @param {Object} speedResult - Speed results
   * @returns {Object} Suitability assessment
   */
  assessSuitability(latencyResult, speedResult) {
    const latency = latencyResult.avg;
    const downloadSpeed = speedResult.download.speed;
    const uploadSpeed = speedResult.upload.speed;

    return {
      browsing: downloadSpeed > 1 && latency < 500,
      streaming: downloadSpeed > 5 && latency < 200,
      gaming: latency < 50 && downloadSpeed > 3,
      videoCall: uploadSpeed > 1 && downloadSpeed > 1 && latency < 150,
      fileTransfer: downloadSpeed > 10 || uploadSpeed > 5
    };
  }

  /**
   * Generate recommendations based on test results
   * @param {Object} latencyResult - Latency results
   * @param {Object} speedResult - Speed results
   * @returns {Array} Array of recommendations
   */
  generateRecommendations(latencyResult, speedResult) {
    const recommendations = [];

    if (latencyResult.avg > 100) {
      recommendations.push({
        type: 'latency',
        message: 'High latency detected. Consider moving closer to your router or using a wired connection.',
        priority: 'high'
      });
    }

    if (speedResult.download.speed < 5) {
      recommendations.push({
        type: 'speed',
        message: 'Low download speed. Contact your ISP or consider upgrading your plan.',
        priority: 'medium'
      });
    }

    if (latencyResult.jitter > 20) {
      recommendations.push({
        type: 'stability',
        message: 'Connection instability detected. Check for interference or network congestion.',
        priority: 'medium'
      });
    }

    if (latencyResult.packetLoss > 1) {
      recommendations.push({
        type: 'reliability',
        message: 'Packet loss detected. Check your network equipment and connections.',
        priority: 'high'
      });
    }

    return recommendations;
  }

  /**
   * Detect connection information
   * @returns {Object} Connection information
   */
  detectConnection() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    return {
      type: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null,
      saveData: connection?.saveData || false
    };
  }

  /**
   * Save test results to local storage
   * @param {Object} results - Test results to save
   */
  saveTestResults(results) {
    try {
      const history = this.getTestHistory();
      history.unshift(results);
      
      // Limit history size
      if (history.length > this.config.maxHistoryEntries) {
        history.splice(this.config.maxHistoryEntries);
      }
      
      localStorage.setItem('netpulse_test_history', JSON.stringify(history));
      
      ErrorHandler.log(ErrorHandler.LogLevels.INFO, 'Test results saved to history');
    } catch (error) {
      ErrorHandler.log(ErrorHandler.LogLevels.WARN, 'Failed to save test results', error);
    }
  }

  /**
   * Get test history from local storage
   * @returns {Array} Array of historical test results
   */
  getTestHistory() {
    try {
      const history = localStorage.getItem('netpulse_test_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      ErrorHandler.log(ErrorHandler.LogLevels.WARN, 'Failed to load test history', error);
      return [];
    }
  }

  /**
   * Clear test history
   */
  clearTestHistory() {
    try {
      localStorage.removeItem('netpulse_test_history');
      ErrorHandler.log(ErrorHandler.LogLevels.INFO, 'Test history cleared');
    } catch (error) {
      ErrorHandler.log(ErrorHandler.LogLevels.WARN, 'Failed to clear test history', error);
    }
  }

  /**
   * Stop all running tests
   */
  stop() {
    this.isRunning = false;
    
    if (this.latencyTest.isTestRunning()) {
      this.latencyTest.stop();
    }
    
    if (this.speedTest.isTestRunning()) {
      this.speedTest.stop();
    }
    
    ErrorHandler.log(ErrorHandler.LogLevels.INFO, 'All network tests stopped');
  }

  /**
   * Get current test status
   * @returns {Object} Current status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentTest: this.currentTest,
      latencyRunning: this.latencyTest.isTestRunning(),
      speedRunning: this.speedTest.isTestRunning()
    };
  }

  /**
   * Get last test results
   * @returns {Object|null} Last test results
   */
  getLastResults() {
    return this.results;
  }

  /**
   * Calculate test duration (placeholder)
   * @returns {number} Duration in seconds
   */
  getTestDuration() {
    // This would be calculated based on actual test timing
    return 30; // Placeholder
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NetworkTest;
} else {
  window.NetworkTest = NetworkTest;
}
