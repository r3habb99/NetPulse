/**
 * Latency Testing Service
 * Measures network latency (ping) using HTTP requests
 */

class LatencyTest {
  constructor(config = {}) {
    this.config = {
      samples: config.samples || CONFIG.NETWORK_TEST.latency.defaultSamples,
      timeout: config.timeout || CONFIG.NETWORK_TEST.latency.timeoutMs,
      interval: config.interval || CONFIG.NETWORK_TEST.latency.intervalMs,
      endpoint: config.endpoint || window.location.origin
    };
    
    this.isRunning = false;
    this.results = [];
    this.callbacks = {
      onProgress: null,
      onComplete: null,
      onError: null
    };
  }

  /**
   * Start latency test
   * @param {Object} callbacks - Event callbacks
   * @returns {Promise} Test results
   */
  async start(callbacks = {}) {
    if (this.isRunning) {
      throw new Error('Latency test is already running');
    }

    this.callbacks = { ...this.callbacks, ...callbacks };
    this.isRunning = true;
    this.results = [];

    try {
      ErrorHandler.log(ErrorHandler.LogLevels.INFO, 'Starting latency test', {
        samples: this.config.samples,
        endpoint: this.config.endpoint
      });

      for (let i = 0; i < this.config.samples; i++) {
        if (!this.isRunning) {
          break; // Test was stopped
        }

        try {
          const latency = await this.measureSinglePing();
          this.results.push(latency);

          // Report progress
          if (this.callbacks.onProgress) {
            // Calculate current jitter if we have enough samples
            let currentJitter = 0;
            if (this.results.length >= 2) {
              const stats = MathUtils.calculateStatistics(this.results);
              currentJitter = stats.jitter;
            }

            this.callbacks.onProgress({
              current: i + 1,
              total: this.config.samples,
              latency: latency,
              jitter: currentJitter,
              progress: ((i + 1) / this.config.samples) * 100
            });
          }

          // Wait between samples (except for last sample)
          if (i < this.config.samples - 1) {
            await this.delay(this.config.interval);
          }
        } catch (error) {
          ErrorHandler.log(ErrorHandler.LogLevels.WARN, `Ping sample ${i + 1} failed`, error);
          // Continue with next sample
        }
      }

      const statistics = this.calculateStatistics();
      
      ErrorHandler.log(ErrorHandler.LogLevels.INFO, 'Latency test completed', statistics);

      if (this.callbacks.onComplete) {
        this.callbacks.onComplete(statistics);
      }

      return statistics;

    } catch (error) {
      const errorInfo = ErrorHandler.handleError(error, 'LatencyTest');
      
      if (this.callbacks.onError) {
        this.callbacks.onError(errorInfo);
      }
      
      throw errorInfo;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Stop the latency test
   */
  stop() {
    this.isRunning = false;
    ErrorHandler.log(ErrorHandler.LogLevels.INFO, 'Latency test stopped by user');
  }

  /**
   * Measure single ping latency
   * @returns {Promise<number>} Latency in milliseconds
   */
  async measureSinglePing() {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const controller = new AbortController();
      
      // Set timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error('Ping timeout'));
      }, this.config.timeout);

      // Create a unique URL to prevent caching
      const url = `${this.config.endpoint}?t=${Date.now()}&r=${Math.random()}`;

      fetch(url, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      .then(response => {
        clearTimeout(timeoutId);
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        if (response.ok) {
          resolve(latency);
        } else {
          reject(new Error(`HTTP ${response.status}: ${response.statusText}`));
        }
      })
      .catch(error => {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          reject(new Error('Ping timeout'));
        } else {
          reject(error);
        }
      });
    });
  }

  /**
   * Calculate statistics from ping results
   * @returns {Object} Statistical analysis
   */
  calculateStatistics() {
    if (this.results.length === 0) {
      return {
        samples: 0,
        min: 0,
        max: 0,
        avg: 0,
        median: 0,
        jitter: 0,
        packetLoss: 100,
        quality: MathUtils.assessConnectionQuality(0)
      };
    }

    const stats = MathUtils.calculateStatistics(this.results);
    const packetLoss = ((this.config.samples - this.results.length) / this.config.samples) * 100;
    const quality = MathUtils.assessConnectionQuality(stats.mean);

    return {
      samples: this.results.length,
      min: MathUtils.round(stats.min, 1),
      max: MathUtils.round(stats.max, 1),
      avg: MathUtils.round(stats.mean, 1),
      median: MathUtils.round(stats.median, 1),
      jitter: MathUtils.round(stats.jitter, 1),
      packetLoss: MathUtils.round(packetLoss, 1),
      quality: quality,
      rawData: this.results
    };
  }

  /**
   * Get real-time latency (single ping)
   * @returns {Promise<number>} Current latency
   */
  async getCurrentLatency() {
    try {
      return await this.measureSinglePing();
    } catch (error) {
      ErrorHandler.log(ErrorHandler.LogLevels.WARN, 'Failed to get current latency', error);
      return null;
    }
  }

  /**
   * Test connection stability over time
   * @param {number} duration - Test duration in seconds
   * @param {Function} onUpdate - Progress callback
   * @returns {Promise<Object>} Stability analysis
   */
  async testStability(duration = 30, onUpdate = null) {
    const startTime = Date.now();
    const endTime = startTime + (duration * 1000);
    const measurements = [];

    while (Date.now() < endTime && this.isRunning) {
      try {
        const latency = await this.measureSinglePing();
        measurements.push({
          timestamp: Date.now(),
          latency: latency
        });

        if (onUpdate) {
          const elapsed = (Date.now() - startTime) / 1000;
          const progress = (elapsed / duration) * 100;
          onUpdate({
            progress: Math.min(progress, 100),
            currentLatency: latency,
            measurements: measurements.length
          });
        }

        await this.delay(1000); // 1 second interval
      } catch (error) {
        ErrorHandler.log(ErrorHandler.LogLevels.WARN, 'Stability test ping failed', error);
      }
    }

    // Analyze stability
    const latencies = measurements.map(m => m.latency);
    const stats = MathUtils.calculateStatistics(latencies);
    
    return {
      duration: (Date.now() - startTime) / 1000,
      measurements: measurements.length,
      statistics: stats,
      stability: this.calculateStabilityScore(stats),
      timeline: measurements
    };
  }

  /**
   * Calculate connection stability score
   * @param {Object} stats - Statistical data
   * @returns {Object} Stability assessment
   */
  calculateStabilityScore(stats) {
    const coefficientOfVariation = stats.standardDeviation / stats.mean;
    
    let score, description;
    if (coefficientOfVariation < 0.1) {
      score = 5;
      description = 'Very stable';
    } else if (coefficientOfVariation < 0.2) {
      score = 4;
      description = 'Stable';
    } else if (coefficientOfVariation < 0.4) {
      score = 3;
      description = 'Moderately stable';
    } else if (coefficientOfVariation < 0.6) {
      score = 2;
      description = 'Unstable';
    } else {
      score = 1;
      description = 'Very unstable';
    }

    return {
      score,
      description,
      coefficientOfVariation: MathUtils.round(coefficientOfVariation, 3)
    };
  }

  /**
   * Utility function for delays
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get test configuration
   * @returns {Object} Current configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Update test configuration
   * @param {Object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Check if test is currently running
   * @returns {boolean} True if running
   */
  isTestRunning() {
    return this.isRunning;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LatencyTest;
} else {
  window.LatencyTest = LatencyTest;
}
