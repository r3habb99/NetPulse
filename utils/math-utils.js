/**
 * Mathematical Utilities for Network Testing
 * Statistical calculations and data processing functions
 */

const MathUtils = {
  /**
   * Calculate statistical measures for an array of values
   * @param {number[]} values - Array of numeric values
   * @returns {Object} Statistical measures
   */
  calculateStatistics(values) {
    if (!Array.isArray(values) || values.length === 0) {
      return {
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        standardDeviation: 0,
        jitter: 0,
        count: 0
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / count;

    // Calculate median
    const median = count % 2 === 0
      ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
      : sorted[Math.floor(count / 2)];

    // Calculate standard deviation
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
    const standardDeviation = Math.sqrt(variance);

    // Calculate jitter (average deviation from mean)
    const jitter = values.reduce((acc, val) => acc + Math.abs(val - mean), 0) / count;

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      mean: mean,
      median: median,
      standardDeviation: standardDeviation,
      jitter: jitter,
      count: count
    };
  },

  /**
   * Convert bytes to human-readable format
   * @param {number} bytes - Number of bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted string
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  /**
   * Convert bits per second to Mbps
   * @param {number} bps - Bits per second
   * @returns {number} Megabits per second
   */
  bpsToMbps(bps) {
    return bps / (1000 * 1000);
  },

  /**
   * Convert bytes to bits
   * @param {number} bytes - Number of bytes
   * @returns {number} Number of bits
   */
  bytesToBits(bytes) {
    return bytes * 8;
  },

  /**
   * Calculate speed in Mbps from bytes and time
   * @param {number} bytes - Number of bytes transferred
   * @param {number} timeMs - Time in milliseconds
   * @returns {number} Speed in Mbps
   */
  calculateSpeedMbps(bytes, timeMs) {
    if (timeMs === 0) return 0;
    const bitsPerSecond = (bytes * 8) / (timeMs / 1000);
    return this.bpsToMbps(bitsPerSecond);
  },

  /**
   * Apply overhead compensation to speed measurement
   * @param {number} measuredSpeed - Measured speed in Mbps
   * @param {number} compensationFactor - Compensation factor (0-1)
   * @returns {number} Compensated speed
   */
  applyOverheadCompensation(measuredSpeed, compensationFactor = 0.04) {
    return measuredSpeed * (1 + compensationFactor);
  },

  /**
   * Calculate mean (average) of an array of values
   * @param {number[]} values - Array of numeric values
   * @returns {number} Mean value
   */
  mean(values) {
    if (!Array.isArray(values) || values.length === 0) {
      return 0;
    }
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  },

  /**
   * Calculate moving average
   * @param {number[]} values - Array of values
   * @param {number} windowSize - Size of moving window
   * @returns {number[]} Moving averages
   */
  movingAverage(values, windowSize) {
    if (windowSize <= 0 || windowSize > values.length) {
      return values;
    }

    const result = [];
    for (let i = 0; i <= values.length - windowSize; i++) {
      const window = values.slice(i, i + windowSize);
      const average = window.reduce((sum, val) => sum + val, 0) / windowSize;
      result.push(average);
    }
    return result;
  },

  /**
   * Determine connection quality based on latency
   * @param {number} latency - Latency in milliseconds
   * @returns {Object} Quality assessment
   */
  assessConnectionQuality(latency) {
    const thresholds = CONFIG.NETWORK_TEST.quality;
    
    if (latency <= thresholds.excellentThreshold) {
      return { level: 'excellent', score: 5, description: 'Excellent connection' };
    } else if (latency <= thresholds.goodThreshold) {
      return { level: 'good', score: 4, description: 'Good connection' };
    } else if (latency <= thresholds.fairThreshold) {
      return { level: 'fair', score: 3, description: 'Fair connection' };
    } else if (latency <= thresholds.poorThreshold) {
      return { level: 'poor', score: 2, description: 'Poor connection' };
    } else {
      return { level: 'very-poor', score: 1, description: 'Very poor connection' };
    }
  },

  /**
   * Round number to specified decimal places
   * @param {number} num - Number to round
   * @param {number} decimals - Number of decimal places
   * @returns {number} Rounded number
   */
  round(num, decimals = 2) {
    return Math.round((num + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  /**
   * Clamp value between min and max
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * Generate random test data for development/testing
   * @param {number} count - Number of data points
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number[]} Array of random values
   */
  generateTestData(count, min, max) {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push(Math.random() * (max - min) + min);
    }
    return data;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MathUtils;
} else {
  window.MathUtils = MathUtils;
}
