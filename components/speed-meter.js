/**
 * Speed Meter Component
 * SVG-based speed visualization with animated progress
 */

class SpeedMeter {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.getElementById(container) : container;
    this.options = {
      size: options.size || 200,
      strokeWidth: options.strokeWidth || 8,
      maxSpeed: options.maxSpeed || 100,
      unit: options.unit || 'Mbps',
      label: options.label || 'Speed',
      color: options.color || '#667eea',
      backgroundColor: options.backgroundColor || '#e0e0e0',
      animated: options.animated !== false,
      showValue: options.showValue !== false,
      showLabel: options.showLabel !== false,
      ...options
    };

    this.currentSpeed = 0;
    this.targetSpeed = 0;
    this.animationFrame = null;

    this.init();
  }

  /**
   * Initialize the speed meter
   */
  init() {
    this.createSVG();
    this.createElements();
    this.setupContainer();
  }

  /**
   * Create the SVG element
   */
  createSVG() {
    const { size } = this.options;
    
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', size);
    this.svg.setAttribute('height', size);
    this.svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    this.svg.classList.add('speed-meter-svg');

    // Create gradient definitions
    this.createGradients();
  }

  /**
   * Create gradient definitions
   */
  createGradients() {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Speed gradient
    const speedGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    speedGradient.setAttribute('id', `speedGradient-${this.getId()}`);
    speedGradient.setAttribute('x1', '0%');
    speedGradient.setAttribute('y1', '0%');
    speedGradient.setAttribute('x2', '100%');
    speedGradient.setAttribute('y2', '0%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', this.options.color);

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#764ba2');

    speedGradient.appendChild(stop1);
    speedGradient.appendChild(stop2);
    defs.appendChild(speedGradient);

    this.svg.appendChild(defs);
  }

  /**
   * Create meter elements
   */
  createElements() {
    const { size, strokeWidth } = this.options;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Background circle
    this.backgroundCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this.backgroundCircle.setAttribute('cx', center);
    this.backgroundCircle.setAttribute('cy', center);
    this.backgroundCircle.setAttribute('r', radius);
    this.backgroundCircle.setAttribute('fill', 'none');
    this.backgroundCircle.setAttribute('stroke', this.options.backgroundColor);
    this.backgroundCircle.setAttribute('stroke-width', strokeWidth);
    this.backgroundCircle.classList.add('speed-meter-track');

    // Progress circle
    this.progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this.progressCircle.setAttribute('cx', center);
    this.progressCircle.setAttribute('cy', center);
    this.progressCircle.setAttribute('r', radius);
    this.progressCircle.setAttribute('fill', 'none');
    this.progressCircle.setAttribute('stroke', `url(#speedGradient-${this.getId()})`);
    this.progressCircle.setAttribute('stroke-width', strokeWidth);
    this.progressCircle.setAttribute('stroke-linecap', 'round');
    this.progressCircle.setAttribute('stroke-dasharray', circumference);
    this.progressCircle.setAttribute('stroke-dashoffset', circumference);
    this.progressCircle.classList.add('speed-meter-progress');

    // Add elements to SVG
    this.svg.appendChild(this.backgroundCircle);
    this.svg.appendChild(this.progressCircle);

    // Store circumference for calculations
    this.circumference = circumference;
  }

  /**
   * Setup container and add center content
   */
  setupContainer() {
    this.container.classList.add('speed-meter');
    this.container.style.position = 'relative';
    this.container.style.width = this.options.size + 'px';
    this.container.style.height = this.options.size + 'px';

    // Add SVG to container
    this.container.appendChild(this.svg);

    // Create center content
    this.createCenterContent();
  }

  /**
   * Create center content (value, unit, label)
   */
  createCenterContent() {
    this.centerDiv = document.createElement('div');
    this.centerDiv.classList.add('speed-meter-center');

    if (this.options.showValue) {
      this.valueElement = document.createElement('div');
      this.valueElement.classList.add('speed-meter-value');
      this.valueElement.textContent = '0';
      this.centerDiv.appendChild(this.valueElement);

      this.unitElement = document.createElement('div');
      this.unitElement.classList.add('speed-meter-unit');
      this.unitElement.textContent = this.options.unit;
      this.centerDiv.appendChild(this.unitElement);
    }

    if (this.options.showLabel) {
      this.labelElement = document.createElement('div');
      this.labelElement.classList.add('speed-meter-label');
      this.labelElement.textContent = this.options.label;
      this.centerDiv.appendChild(this.labelElement);
    }

    this.container.appendChild(this.centerDiv);
  }

  /**
   * Update speed value with animation
   * @param {number} speed - New speed value
   */
  updateSpeed(speed) {
    this.targetSpeed = Math.max(0, Math.min(speed, this.options.maxSpeed));
    
    if (this.options.animated) {
      this.animateToTarget();
    } else {
      this.currentSpeed = this.targetSpeed;
      this.render();
    }
  }

  /**
   * Animate to target speed
   */
  animateToTarget() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const animate = () => {
      const diff = this.targetSpeed - this.currentSpeed;
      const step = diff * 0.1; // Smooth easing

      if (Math.abs(diff) < 0.1) {
        this.currentSpeed = this.targetSpeed;
        this.render();
        return;
      }

      this.currentSpeed += step;
      this.render();
      this.animationFrame = requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Render the current state
   */
  render() {
    // Update progress circle
    const progress = this.currentSpeed / this.options.maxSpeed;
    const offset = this.circumference - (progress * this.circumference);
    this.progressCircle.setAttribute('stroke-dashoffset', offset);

    // Update center value
    if (this.valueElement) {
      const displayValue = this.currentSpeed < 0.1 ? '0.0' : this.currentSpeed.toFixed(1);
      this.valueElement.textContent = displayValue;
    }

    // Update color based on speed
    this.updateColor();
  }

  /**
   * Update color based on speed
   */
  updateColor() {
    const progress = this.currentSpeed / this.options.maxSpeed;
    
    // Color transitions based on speed
    let color = this.options.color;
    if (progress > 0.8) {
      color = '#4caf50'; // Green for high speed
    } else if (progress > 0.5) {
      color = '#ff9800'; // Orange for medium speed
    } else if (progress > 0.2) {
      color = '#2196f3'; // Blue for low speed
    } else {
      color = '#f44336'; // Red for very low speed
    }

    // Update gradient
    const gradient = this.svg.querySelector(`#speedGradient-${this.getId()}`);
    if (gradient) {
      const stop1 = gradient.querySelector('stop:first-child');
      if (stop1) {
        stop1.setAttribute('stop-color', color);
      }
    }
  }

  /**
   * Set maximum speed
   * @param {number} maxSpeed - New maximum speed
   */
  setMaxSpeed(maxSpeed) {
    this.options.maxSpeed = maxSpeed;
    this.render();
  }

  /**
   * Set label text
   * @param {string} label - New label text
   */
  setLabel(label) {
    this.options.label = label;
    if (this.labelElement) {
      this.labelElement.textContent = label;
    }
  }

  /**
   * Set unit text
   * @param {string} unit - New unit text
   */
  setUnit(unit) {
    this.options.unit = unit;
    if (this.unitElement) {
      this.unitElement.textContent = unit;
    }
  }

  /**
   * Reset meter to zero
   */
  reset() {
    this.updateSpeed(0);
  }

  /**
   * Start pulsing animation
   */
  startPulse() {
    this.container.classList.add('scale-pulse');
  }

  /**
   * Stop pulsing animation
   */
  stopPulse() {
    this.container.classList.remove('scale-pulse');
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.container.classList.add('loading');
    if (this.valueElement) {
      this.valueElement.textContent = '...';
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    this.container.classList.remove('loading');
    this.render();
  }

  /**
   * Destroy the speed meter
   */
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    if (this.container) {
      this.container.innerHTML = '';
      this.container.classList.remove('speed-meter');
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

  /**
   * Get current speed value
   * @returns {number} Current speed
   */
  getCurrentSpeed() {
    return this.currentSpeed;
  }

  /**
   * Get target speed value
   * @returns {number} Target speed
   */
  getTargetSpeed() {
    return this.targetSpeed;
  }

  /**
   * Check if animation is running
   * @returns {boolean} True if animating
   */
  isAnimating() {
    return this.animationFrame !== null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpeedMeter;
} else {
  window.SpeedMeter = SpeedMeter;
}
