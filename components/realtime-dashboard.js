/**
 * Real-time Dashboard Component
 * Displays live network monitoring data with charts and metrics
 */

class RealtimeDashboard {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.getElementById(container) : container;
    this.options = {
      updateInterval: options.updateInterval || 1000,
      maxDataPoints: options.maxDataPoints || 50,
      showAlerts: options.showAlerts !== false,
      showTrends: options.showTrends !== false,
      chartHeight: options.chartHeight || 120,
      ...options
    };

    // Chart instances
    this.charts = {
      latency: null,
      downloadSpeed: null,
      uploadSpeed: null,
      jitter: null
    };

    // Current data
    this.currentData = {
      latency: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      jitter: 0,
      packetLoss: 0
    };

    // Previous data for smooth transitions
    this.previousData = {
      latency: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      jitter: 0,
      packetLoss: 0
    };

    // Animation state
    this.animationFrames = {};

    // Alert system
    this.alerts = [];
    this.maxAlerts = 5;

    this.init();
  }

  /**
   * Initialize the dashboard
   */
  init() {
    this.createDashboardStructure();
    this.createCharts();
    this.setupEventListeners();
  }

  /**
   * Create dashboard HTML structure
   */
  createDashboardStructure() {
    this.container.innerHTML = `
      <div class="realtime-dashboard">
        <!-- Live Metrics Cards -->
        <div class="dashboard-metrics">
          <div class="metric-card" id="latency-card">
            <div class="metric-header">
              <h3 class="metric-title">Latency</h3>
              <div class="metric-status" id="latency-status"></div>
            </div>
            <div class="metric-value" id="latency-value">-- ms</div>
            <div class="metric-trend" id="latency-trend"></div>
          </div>

          <div class="metric-card" id="download-card">
            <div class="metric-header">
              <h3 class="metric-title">Download</h3>
              <div class="metric-status" id="download-status"></div>
            </div>
            <div class="metric-value" id="download-value">-- Mbps</div>
            <div class="metric-trend" id="download-trend"></div>
          </div>

          <div class="metric-card" id="upload-card">
            <div class="metric-header">
              <h3 class="metric-title">Upload</h3>
              <div class="metric-status" id="upload-status"></div>
            </div>
            <div class="metric-value" id="upload-value">-- Mbps</div>
            <div class="metric-trend" id="upload-trend"></div>
          </div>

          <div class="metric-card" id="jitter-card">
            <div class="metric-header">
              <h3 class="metric-title">Jitter</h3>
              <div class="metric-status" id="jitter-status"></div>
            </div>
            <div class="metric-value" id="jitter-value">-- ms</div>
            <div class="metric-trend" id="jitter-trend"></div>
          </div>
        </div>

        <!-- Real-time Charts -->
        <div class="dashboard-charts">
          <div class="chart-container">
            <h4 class="chart-title">Latency Over Time</h4>
            <div id="latency-chart" class="chart"></div>
          </div>

          <div class="chart-container">
            <h4 class="chart-title">Speed Over Time</h4>
            <div id="speed-chart" class="chart"></div>
          </div>

          <div class="chart-container">
            <h4 class="chart-title">Connection Stability</h4>
            <div id="stability-chart" class="chart"></div>
          </div>
        </div>

        <!-- Alerts Panel -->
        <div class="dashboard-alerts" id="alerts-panel" style="display: none;">
          <h4 class="alerts-title">Network Alerts</h4>
          <div id="alerts-list" class="alerts-list"></div>
        </div>

        <!-- Statistics Summary -->
        <div class="dashboard-stats">
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Avg Latency</span>
              <span class="stat-value" id="avg-latency">-- ms</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Avg Download</span>
              <span class="stat-value" id="avg-download">-- Mbps</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Avg Upload</span>
              <span class="stat-value" id="avg-upload">-- Mbps</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Uptime</span>
              <span class="stat-value" id="uptime">--</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Tests Run</span>
              <span class="stat-value" id="tests-run">--</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Success Rate</span>
              <span class="stat-value" id="success-rate">--%</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create chart instances
   */
  createCharts() {
    // Latency chart - simplified without LatencyGraph component
    const latencyContainer = this.container.querySelector('#latency-chart');
    if (latencyContainer) {
      this.charts.latency = this.createSimpleLatencyChart(latencyContainer);
    }

    // Speed chart (combined download/upload)
    const speedContainer = this.container.querySelector('#speed-chart');
    if (speedContainer) {
      this.charts.speed = this.createSpeedChart(speedContainer);
    }

    // Stability chart (jitter and packet loss)
    const stabilityContainer = this.container.querySelector('#stability-chart');
    if (stabilityContainer) {
      this.charts.stability = this.createStabilityChart(stabilityContainer);
    }
  }

  /**
   * Create simple latency chart without LatencyGraph dependency
   * @param {HTMLElement} container - Chart container
   * @returns {Object} Chart object with update method
   */
  createSimpleLatencyChart(container) {
    const data = [];
    const maxDataPoints = this.options.maxDataPoints;

    // Create simple visual representation
    container.innerHTML = `
      <div class="simple-latency-chart">
        <div class="chart-line" id="latency-line"></div>
        <div class="chart-info">
          <span class="current-value">-- ms</span>
          <span class="trend-indicator"></span>
        </div>
      </div>
    `;

    return {
      data: data,
      addDataPoint: (latency) => {
        data.push(latency);
        if (data.length > maxDataPoints) {
          data.shift();
        }

        // Update visual representation
        const currentValue = container.querySelector('.current-value');
        const trendIndicator = container.querySelector('.trend-indicator');

        if (currentValue) {
          currentValue.textContent = `${Math.round(latency)} ms`;
        }

        // Simple trend calculation
        if (data.length >= 2) {
          const trend = latency - data[data.length - 2];
          if (trendIndicator) {
            if (trend > 0) {
              trendIndicator.textContent = '↗';
              trendIndicator.className = 'trend-indicator trend-up';
            } else if (trend < 0) {
              trendIndicator.textContent = '↘';
              trendIndicator.className = 'trend-indicator trend-down';
            } else {
              trendIndicator.textContent = '→';
              trendIndicator.className = 'trend-indicator trend-stable';
            }
          }
        }
      }
    };
  }

  /**
   * Create speed chart (download/upload combined)
   * @param {HTMLElement} container - Chart container
   * @returns {Object} Chart instance
   */
  createSpeedChart(container) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', container.offsetWidth || 400);
    svg.setAttribute('height', this.options.chartHeight);
    svg.classList.add('speed-chart');

    // Create chart elements
    const downloadPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    downloadPath.setAttribute('fill', 'none');
    downloadPath.setAttribute('stroke', '#667eea');
    downloadPath.setAttribute('stroke-width', '2');

    const uploadPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    uploadPath.setAttribute('fill', 'none');
    uploadPath.setAttribute('stroke', '#764ba2');
    uploadPath.setAttribute('stroke-width', '2');

    svg.appendChild(downloadPath);
    svg.appendChild(uploadPath);
    container.appendChild(svg);

    return {
      svg,
      downloadPath,
      uploadPath,
      downloadData: [],
      uploadData: [],
      updateChart: (downloadSpeed, uploadSpeed) => {
        // Add new data points
        this.charts.speed.downloadData.push(downloadSpeed);
        this.charts.speed.uploadData.push(uploadSpeed);

        // Limit data points
        if (this.charts.speed.downloadData.length > this.options.maxDataPoints) {
          this.charts.speed.downloadData.shift();
          this.charts.speed.uploadData.shift();
        }

        // Update paths
        this.updateSpeedChartPaths();
      }
    };
  }

  /**
   * Create stability chart (jitter and packet loss)
   * @param {HTMLElement} container - Chart container
   * @returns {Object} Chart instance
   */
  createStabilityChart(container) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', container.offsetWidth || 400);
    svg.setAttribute('height', this.options.chartHeight);
    svg.classList.add('stability-chart');

    // Create chart elements for jitter
    const jitterPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    jitterPath.setAttribute('fill', 'none');
    jitterPath.setAttribute('stroke', '#ff9800');
    jitterPath.setAttribute('stroke-width', '2');

    svg.appendChild(jitterPath);
    container.appendChild(svg);

    return {
      svg,
      jitterPath,
      jitterData: [],
      updateChart: (jitter) => {
        // Add new data point
        this.charts.stability.jitterData.push(jitter);

        // Limit data points
        if (this.charts.stability.jitterData.length > this.options.maxDataPoints) {
          this.charts.stability.jitterData.shift();
        }

        // Update path
        this.updateStabilityChartPath();
      }
    };
  }

  /**
   * Update speed chart paths
   */
  updateSpeedChartPaths() {
    const chart = this.charts.speed;
    const width = chart.svg.getAttribute('width');
    const height = chart.svg.getAttribute('height');
    
    // Calculate scales
    const maxSpeed = Math.max(
      ...chart.downloadData,
      ...chart.uploadData,
      10 // Minimum scale
    );
    
    const xScale = (index) => (index / (this.options.maxDataPoints - 1)) * width;
    const yScale = (value) => height - (value / maxSpeed) * height;

    // Generate download path
    let downloadPath = '';
    chart.downloadData.forEach((speed, index) => {
      const x = xScale(index);
      const y = yScale(speed);
      downloadPath += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });

    // Generate upload path
    let uploadPath = '';
    chart.uploadData.forEach((speed, index) => {
      const x = xScale(index);
      const y = yScale(speed);
      uploadPath += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });

    chart.downloadPath.setAttribute('d', downloadPath);
    chart.uploadPath.setAttribute('d', uploadPath);
  }

  /**
   * Update stability chart path
   */
  updateStabilityChartPath() {
    const chart = this.charts.stability;
    const width = chart.svg.getAttribute('width');
    const height = chart.svg.getAttribute('height');
    
    // Calculate scales
    const maxJitter = Math.max(...chart.jitterData, 50); // Minimum scale of 50ms
    
    const xScale = (index) => (index / (this.options.maxDataPoints - 1)) * width;
    const yScale = (value) => height - (value / maxJitter) * height;

    // Generate jitter path
    let jitterPath = '';
    chart.jitterData.forEach((jitter, index) => {
      const x = xScale(index);
      const y = yScale(jitter);
      jitterPath += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });

    chart.jitterPath.setAttribute('d', jitterPath);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Recreate charts with new dimensions
    setTimeout(() => {
      this.createCharts();
    }, 100);
  }

  /**
   * Update dashboard with new data
   * @param {Object} data - Monitoring data
   */
  updateData(data) {
    const { latest, stats, status } = data;

    // Update current values
    if (latest) {
      this.currentData = {
        latency: latest.latency || 0,
        downloadSpeed: latest.downloadSpeed || 0,
        uploadSpeed: latest.uploadSpeed || 0,
        jitter: latest.jitter || 0,
        packetLoss: latest.packetLoss || 0
      };

      // Update metric cards
      this.updateMetricCards();

      // Update charts
      this.updateCharts();
    }

    // Update statistics
    if (stats) {
      this.updateStatistics(stats);
    }

    // Update status indicators
    if (status) {
      this.updateStatusIndicators(status);
    }
  }

  /**
   * Update metric cards
   */
  updateMetricCards() {
    // Latency
    this.updateMetricCard('latency', this.currentData.latency, 'ms', {
      excellent: 50,
      good: 100,
      fair: 200
    });

    // Download speed
    this.updateMetricCard('download', this.currentData.downloadSpeed, 'Mbps', {
      excellent: 50,
      good: 25,
      fair: 10
    });

    // Upload speed
    this.updateMetricCard('upload', this.currentData.uploadSpeed, 'Mbps', {
      excellent: 25,
      good: 10,
      fair: 5
    });

    // Jitter
    this.updateMetricCard('jitter', this.currentData.jitter, 'ms', {
      excellent: 10,
      good: 25,
      fair: 50
    });
  }

  /**
   * Update individual metric card
   * @param {string} metric - Metric name
   * @param {number} value - Current value
   * @param {string} unit - Unit of measurement
   * @param {Object} thresholds - Quality thresholds
   */
  updateMetricCard(metric, value, unit, thresholds) {
    const valueElement = this.container.querySelector(`#${metric}-value`);
    const statusElement = this.container.querySelector(`#${metric}-status`);
    const cardElement = this.container.querySelector(`#${metric}-card`);

    if (valueElement && value !== null && value !== undefined) {
      // Animate number change smoothly
      this.animateNumber(valueElement, this.previousData[metric] || 0, value, unit);
      this.previousData[metric] = value;
    }

    if (statusElement && value !== null && value !== undefined) {
      const quality = this.getQualityLevel(value, thresholds, metric === 'latency' || metric === 'jitter');
      statusElement.className = `metric-status status-${quality}`;
      statusElement.textContent = quality.charAt(0).toUpperCase() + quality.slice(1);
    }

    if (cardElement && value !== null && value !== undefined) {
      const quality = this.getQualityLevel(value, thresholds, metric === 'latency' || metric === 'jitter');
      cardElement.className = `metric-card card-${quality}`;
    }
  }

  /**
   * Animate number change smoothly
   * @param {HTMLElement} element - Element to animate
   * @param {number} fromValue - Starting value
   * @param {number} toValue - Target value
   * @param {string} unit - Unit of measurement
   */
  animateNumber(element, fromValue, toValue, unit) {
    // Cancel any existing animation for this element
    if (this.animationFrames[element.id]) {
      cancelAnimationFrame(this.animationFrames[element.id]);
    }

    const duration = 800; // Animation duration in ms
    const startTime = performance.now();
    const difference = toValue - fromValue;

    // If the difference is small, just update directly
    if (Math.abs(difference) < 0.1) {
      element.textContent = `${toValue.toFixed(1)} ${unit}`;
      return;
    }

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Use easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = fromValue + (difference * easeOutQuart);

      element.textContent = `${currentValue.toFixed(1)} ${unit}`;

      if (progress < 1) {
        this.animationFrames[element.id] = requestAnimationFrame(animate);
      } else {
        delete this.animationFrames[element.id];
      }
    };

    this.animationFrames[element.id] = requestAnimationFrame(animate);
  }

  /**
   * Get quality level based on value and thresholds
   * @param {number} value - Current value
   * @param {Object} thresholds - Quality thresholds
   * @param {boolean} lowerIsBetter - Whether lower values are better
   * @returns {string} Quality level
   */
  getQualityLevel(value, thresholds, lowerIsBetter = false) {
    if (lowerIsBetter) {
      if (value <= thresholds.excellent) return 'excellent';
      if (value <= thresholds.good) return 'good';
      if (value <= thresholds.fair) return 'fair';
      return 'poor';
    } else {
      if (value >= thresholds.excellent) return 'excellent';
      if (value >= thresholds.good) return 'good';
      if (value >= thresholds.fair) return 'fair';
      return 'poor';
    }
  }

  /**
   * Update charts with current data
   */
  updateCharts() {
    // Update latency chart
    if (this.charts.latency && this.currentData.latency !== null) {
      this.charts.latency.addDataPoint(this.currentData.latency);
    }

    // Update speed chart
    if (this.charts.speed && this.currentData.downloadSpeed !== null && this.currentData.uploadSpeed !== null) {
      this.charts.speed.updateChart(this.currentData.downloadSpeed, this.currentData.uploadSpeed);
    }

    // Update stability chart
    if (this.charts.stability && this.currentData.jitter !== null) {
      this.charts.stability.updateChart(this.currentData.jitter);
    }
  }

  /**
   * Update statistics display
   * @param {Object} stats - Statistics data
   */
  updateStatistics(stats) {
    this.updateElement('avg-latency', `${stats.averageLatency?.toFixed(1) || '--'} ms`);
    this.updateElement('avg-download', `${stats.averageDownloadSpeed?.toFixed(1) || '--'} Mbps`);
    this.updateElement('avg-upload', `${stats.averageUploadSpeed?.toFixed(1) || '--'} Mbps`);
    this.updateElement('tests-run', stats.totalTests || '--');

    const successRate = stats.totalTests > 0 ?
      ((stats.successfulTests / stats.totalTests) * 100).toFixed(1) : '--';
    this.updateElement('success-rate', `${successRate}%`);
  }

  /**
   * Update status indicators
   * @param {Object} status - Status data
   */
  updateStatusIndicators(status) {
    if (status.uptime) {
      const uptime = this.formatUptime(status.uptime);
      this.updateElement('uptime', uptime);
    }
  }

  /**
   * Format uptime duration
   * @param {number} milliseconds - Uptime in milliseconds
   * @returns {string} Formatted uptime
   */
  formatUptime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Add alert to dashboard
   * @param {Object} alert - Alert data
   */
  addAlert(alert) {
    this.alerts.unshift({
      ...alert,
      timestamp: Date.now(),
      id: Math.random().toString(36).substring(2, 11)
    });

    // Limit number of alerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts);
    }

    this.updateAlertsDisplay();
  }

  /**
   * Update alerts display
   */
  updateAlertsDisplay() {
    const alertsPanel = this.container.querySelector('#alerts-panel');
    const alertsList = this.container.querySelector('#alerts-list');

    if (!alertsPanel || !alertsList) return;

    if (this.alerts.length === 0) {
      alertsPanel.style.display = 'none';
      return;
    }

    alertsPanel.style.display = 'block';
    alertsList.innerHTML = this.alerts.map(alert => `
      <div class="alert-item alert-${alert.severity}" data-alert-id="${alert.id}">
        <div class="alert-content">
          <div class="alert-message">${alert.message}</div>
          <div class="alert-time">${this.formatAlertTime(alert.timestamp)}</div>
        </div>
        <button class="alert-dismiss" onclick="this.parentElement.remove()">×</button>
      </div>
    `).join('');
  }

  /**
   * Format alert timestamp
   * @param {number} timestamp - Alert timestamp
   * @returns {string} Formatted time
   */
  formatAlertTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }

  /**
   * Clear all alerts
   */
  clearAlerts() {
    this.alerts = [];
    this.updateAlertsDisplay();
  }

  /**
   * Update element content safely
   * @param {string} id - Element ID
   * @param {string} content - Content to set
   */
  updateElement(id, content) {
    const element = this.container.querySelector(`#${id}`);
    if (element) {
      element.textContent = content;
    }
  }

  /**
   * Destroy the dashboard
   */
  destroy() {
    // Clear any intervals or timeouts
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    // Cancel any running animations
    Object.values(this.animationFrames).forEach(frameId => {
      cancelAnimationFrame(frameId);
    });
    this.animationFrames = {};

    // Destroy chart instances
    Object.values(this.charts).forEach(chart => {
      if (chart && chart.destroy) {
        chart.destroy();
      }
    });

    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RealtimeDashboard;
} else {
  window.RealtimeDashboard = RealtimeDashboard;
}
