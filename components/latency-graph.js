/**
 * Latency Graph Component
 * Real-time latency visualization with SVG line chart
 */

class LatencyGraph {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.getElementById(container) : container;
    this.options = {
      width: options.width || 400,
      height: options.height || 150,
      maxDataPoints: options.maxDataPoints || 50,
      maxLatency: options.maxLatency || 200,
      minLatency: options.minLatency || 0,
      showGrid: options.showGrid !== false,
      showAxis: options.showAxis !== false,
      animated: options.animated !== false,
      color: options.color || '#667eea',
      backgroundColor: options.backgroundColor || '#f5f5f5',
      gridColor: options.gridColor || '#e0e0e0',
      ...options
    };

    this.data = [];
    this.animationFrame = null;
    this.isAnimating = false;

    this.init();
  }

  /**
   * Initialize the latency graph
   */
  init() {
    this.createSVG();
    this.createElements();
    this.setupContainer();
    this.createScales();
  }

  /**
   * Create the SVG element
   */
  createSVG() {
    const { width, height } = this.options;
    
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', width);
    this.svg.setAttribute('height', height);
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.classList.add('latency-graph-svg');

    // Create gradient definitions
    this.createGradients();
  }

  /**
   * Create gradient definitions
   */
  createGradients() {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Area gradient
    const areaGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    areaGradient.setAttribute('id', `latencyGradient-${this.getId()}`);
    areaGradient.setAttribute('x1', '0%');
    areaGradient.setAttribute('y1', '0%');
    areaGradient.setAttribute('x2', '0%');
    areaGradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', this.options.color);
    stop1.setAttribute('stop-opacity', '0.3');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', this.options.color);
    stop2.setAttribute('stop-opacity', '0');

    areaGradient.appendChild(stop1);
    areaGradient.appendChild(stop2);
    defs.appendChild(areaGradient);

    this.svg.appendChild(defs);
  }

  /**
   * Create graph elements
   */
  createElements() {
    // Create grid if enabled
    if (this.options.showGrid) {
      this.createGrid();
    }

    // Create axis if enabled
    if (this.options.showAxis) {
      this.createAxis();
    }

    // Create area path
    this.areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.areaPath.setAttribute('fill', `url(#latencyGradient-${this.getId()})`);
    this.areaPath.classList.add('latency-graph-area');
    this.svg.appendChild(this.areaPath);

    // Create line path
    this.linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.linePath.setAttribute('fill', 'none');
    this.linePath.setAttribute('stroke', this.options.color);
    this.linePath.setAttribute('stroke-width', '2');
    this.linePath.setAttribute('stroke-linecap', 'round');
    this.linePath.setAttribute('stroke-linejoin', 'round');
    this.linePath.classList.add('latency-graph-line');
    this.svg.appendChild(this.linePath);
  }

  /**
   * Create grid lines
   */
  createGrid() {
    this.gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.gridGroup.classList.add('latency-graph-grid');

    // Horizontal grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = (this.options.height / gridLines) * i;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', y);
      line.setAttribute('x2', this.options.width);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', this.options.gridColor);
      line.setAttribute('stroke-width', '1');
      line.setAttribute('opacity', '0.5');
      this.gridGroup.appendChild(line);
    }

    this.svg.appendChild(this.gridGroup);
  }

  /**
   * Create axis
   */
  createAxis() {
    this.axisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.axisGroup.classList.add('latency-graph-axis');

    // Y-axis
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', '0');
    yAxis.setAttribute('y1', '0');
    yAxis.setAttribute('x2', '0');
    yAxis.setAttribute('y2', this.options.height);
    yAxis.setAttribute('stroke', '#666');
    yAxis.setAttribute('stroke-width', '1');
    this.axisGroup.appendChild(yAxis);

    // X-axis
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', '0');
    xAxis.setAttribute('y1', this.options.height);
    xAxis.setAttribute('x2', this.options.width);
    xAxis.setAttribute('y2', this.options.height);
    xAxis.setAttribute('stroke', '#666');
    xAxis.setAttribute('stroke-width', '1');
    this.axisGroup.appendChild(xAxis);

    // Y-axis labels
    this.createYAxisLabels();

    this.svg.appendChild(this.axisGroup);
  }

  /**
   * Create Y-axis labels
   */
  createYAxisLabels() {
    const labelCount = 5;
    for (let i = 0; i <= labelCount; i++) {
      const value = this.options.maxLatency - (this.options.maxLatency / labelCount) * i;
      const y = (this.options.height / labelCount) * i;

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '-5');
      text.setAttribute('y', y + 4);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('font-size', '10');
      text.setAttribute('font-family', 'Arial, sans-serif');
      text.setAttribute('fill', '#666');
      text.textContent = Math.round(value) + 'ms';
      text.classList.add('latency-graph-label');
      this.axisGroup.appendChild(text);
    }
  }

  /**
   * Setup container
   */
  setupContainer() {
    this.container.classList.add('latency-graph');
    this.container.style.background = this.options.backgroundColor;
    this.container.style.borderRadius = '8px';
    this.container.style.padding = '16px';
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';

    // Add SVG to container
    this.container.appendChild(this.svg);
  }

  /**
   * Create scales for data mapping
   */
  createScales() {
    this.xScale = (index) => {
      return (index / (this.options.maxDataPoints - 1)) * this.options.width;
    };

    this.yScale = (value) => {
      const normalized = (value - this.options.minLatency) / (this.options.maxLatency - this.options.minLatency);
      return this.options.height - (normalized * this.options.height);
    };
  }

  /**
   * Add new data point
   * @param {number} latency - Latency value in milliseconds
   */
  addDataPoint(latency) {
    this.data.push(latency);

    // Remove old data points if exceeding max
    if (this.data.length > this.options.maxDataPoints) {
      this.data.shift();
    }

    // Update the graph
    this.updateGraph();
  }

  /**
   * Set multiple data points at once
   * @param {number[]} dataPoints - Array of latency values
   */
  setData(dataPoints) {
    this.data = dataPoints.slice(-this.options.maxDataPoints);
    this.updateGraph();
  }

  /**
   * Update the graph visualization
   */
  updateGraph() {
    if (this.data.length === 0) {
      this.linePath.setAttribute('d', '');
      this.areaPath.setAttribute('d', '');
      return;
    }

    const linePath = this.generateLinePath();
    const areaPath = this.generateAreaPath();

    if (this.options.animated && !this.isAnimating) {
      this.animatePathUpdate(linePath, areaPath);
    } else {
      this.linePath.setAttribute('d', linePath);
      this.areaPath.setAttribute('d', areaPath);
    }
  }

  /**
   * Generate SVG path for the line
   * @returns {string} SVG path string
   */
  generateLinePath() {
    if (this.data.length === 0) return '';

    let path = '';
    
    this.data.forEach((value, index) => {
      const x = this.xScale(index);
      const y = this.yScale(value);
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });

    return path;
  }

  /**
   * Generate SVG path for the area
   * @returns {string} SVG path string
   */
  generateAreaPath() {
    if (this.data.length === 0) return '';

    let path = '';
    
    // Start from bottom left
    const firstX = this.xScale(0);
    const bottomY = this.options.height;
    path += `M ${firstX} ${bottomY}`;
    
    // Draw line to first data point
    const firstY = this.yScale(this.data[0]);
    path += ` L ${firstX} ${firstY}`;
    
    // Draw through all data points
    this.data.forEach((value, index) => {
      if (index > 0) {
        const x = this.xScale(index);
        const y = this.yScale(value);
        path += ` L ${x} ${y}`;
      }
    });
    
    // Close the area by going to bottom right and back to start
    const lastX = this.xScale(this.data.length - 1);
    path += ` L ${lastX} ${bottomY}`;
    path += ` L ${firstX} ${bottomY}`;
    path += ' Z';

    return path;
  }

  /**
   * Animate path updates
   * @param {string} newLinePath - New line path
   * @param {string} newAreaPath - New area path
   */
  animatePathUpdate(newLinePath, newAreaPath) {
    this.isAnimating = true;
    
    // Simple path update with transition
    this.linePath.style.transition = 'all 0.3s ease';
    this.areaPath.style.transition = 'all 0.3s ease';
    
    this.linePath.setAttribute('d', newLinePath);
    this.areaPath.setAttribute('d', newAreaPath);
    
    setTimeout(() => {
      this.isAnimating = false;
      this.linePath.style.transition = '';
      this.areaPath.style.transition = '';
    }, 300);
  }

  /**
   * Clear all data
   */
  clear() {
    this.data = [];
    this.updateGraph();
  }

  /**
   * Set maximum latency for scaling
   * @param {number} maxLatency - New maximum latency
   */
  setMaxLatency(maxLatency) {
    this.options.maxLatency = maxLatency;
    this.createScales();
    this.updateGraph();
    
    // Update Y-axis labels if they exist
    if (this.axisGroup) {
      this.axisGroup.remove();
      this.createAxis();
    }
  }

  /**
   * Get current data
   * @returns {number[]} Current data array
   */
  getData() {
    return [...this.data];
  }

  /**
   * Get statistics for current data
   * @returns {Object} Statistics object
   */
  getStatistics() {
    if (this.data.length === 0) {
      return { min: 0, max: 0, avg: 0, count: 0 };
    }

    return MathUtils.calculateStatistics(this.data);
  }

  /**
   * Destroy the graph
   */
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    if (this.container) {
      this.container.innerHTML = '';
      this.container.classList.remove('latency-graph');
    }
  }

  /**
   * Get unique ID for this instance
   * @returns {string} Unique ID
   */
  getId() {
    if (!this._id) {
      this._id = Math.random().toString(36).substr(2, 9);
    }
    return this._id;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LatencyGraph;
} else {
  window.LatencyGraph = LatencyGraph;
}
