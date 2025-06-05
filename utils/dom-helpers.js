/**
 * DOM Helper Utilities
 * Centralized DOM manipulation and element access utilities
 */

const DOMHelpers = {
  /**
   * Get element by ID with error handling
   * @param {string} id - Element ID
   * @returns {HTMLElement|null} Element or null if not found
   */
  getElementById(id) {
    try {
      return document.getElementById(id);
    } catch (error) {
      console.warn(`Element with ID '${id}' not found:`, error);
      return null;
    }
  },

  /**
   * Get elements by class name
   * @param {string} className - Class name
   * @returns {NodeList} List of elements
   */
  getElementsByClassName(className) {
    try {
      return document.getElementsByClassName(className);
    } catch (error) {
      console.warn(`Elements with class '${className}' not found:`, error);
      return [];
    }
  },

  /**
   * Query selector with error handling
   * @param {string} selector - CSS selector
   * @returns {HTMLElement|null} Element or null if not found
   */
  querySelector(selector) {
    try {
      return document.querySelector(selector);
    } catch (error) {
      console.warn(`Element with selector '${selector}' not found:`, error);
      return null;
    }
  },

  /**
   * Query all selectors with error handling
   * @param {string} selector - CSS selector
   * @returns {NodeList} List of elements
   */
  querySelectorAll(selector) {
    try {
      return document.querySelectorAll(selector);
    } catch (error) {
      console.warn(`Elements with selector '${selector}' not found:`, error);
      return [];
    }
  },

  /**
   * Update element text content safely
   * @param {string|HTMLElement} element - Element ID or element
   * @param {string} text - Text content
   */
  updateText(element, text) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.textContent = text;
    }
  },

  /**
   * Update element HTML content safely
   * @param {string|HTMLElement} element - Element ID or element
   * @param {string} html - HTML content
   */
  updateHTML(element, html) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.innerHTML = html;
    }
  },

  /**
   * Add CSS class to element
   * @param {string|HTMLElement} element - Element ID or element
   * @param {string} className - Class name to add
   */
  addClass(element, className) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el && className) {
      el.classList.add(className);
    }
  },

  /**
   * Remove CSS class from element
   * @param {string|HTMLElement} element - Element ID or element
   * @param {string} className - Class name to remove
   */
  removeClass(element, className) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el && className) {
      el.classList.remove(className);
    }
  },

  /**
   * Toggle CSS class on element
   * @param {string|HTMLElement} element - Element ID or element
   * @param {string} className - Class name to toggle
   * @returns {boolean} True if class was added, false if removed
   */
  toggleClass(element, className) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el && className) {
      return el.classList.toggle(className);
    }
    return false;
  },

  /**
   * Check if element has CSS class
   * @param {string|HTMLElement} element - Element ID or element
   * @param {string} className - Class name to check
   * @returns {boolean} True if element has class
   */
  hasClass(element, className) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    return el && className ? el.classList.contains(className) : false;
  },

  /**
   * Show element by removing hidden class
   * @param {string|HTMLElement} element - Element ID or element
   */
  show(element) {
    this.removeClass(element, CONFIG.CSS_CLASSES.HIDDEN);
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.style.display = '';
    }
  },

  /**
   * Hide element by adding hidden class
   * @param {string|HTMLElement} element - Element ID or element
   */
  hide(element) {
    this.addClass(element, CONFIG.CSS_CLASSES.HIDDEN);
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.style.display = 'none';
    }
  },

  /**
   * Set element style property
   * @param {string|HTMLElement} element - Element ID or element
   * @param {string} property - CSS property name
   * @param {string} value - CSS property value
   */
  setStyle(element, property, value) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el && property) {
      el.style[property] = value;
    }
  },

  /**
   * Set multiple style properties
   * @param {string|HTMLElement} element - Element ID or element
   * @param {Object} styles - Object with CSS properties and values
   */
  setStyles(element, styles) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el && styles) {
      Object.keys(styles).forEach(property => {
        el.style[property] = styles[property];
      });
    }
  },

  /**
   * Add event listener with error handling
   * @param {string|HTMLElement} element - Element ID or element
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Event listener options
   */
  addEventListener(element, event, handler, options = {}) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el && event && typeof handler === 'function') {
      el.addEventListener(event, handler, options);
    }
  },

  /**
   * Remove event listener
   * @param {string|HTMLElement} element - Element ID or element
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  removeEventListener(element, event, handler) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el && event && typeof handler === 'function') {
      el.removeEventListener(event, handler);
    }
  },

  /**
   * Create element with attributes and content
   * @param {string} tagName - HTML tag name
   * @param {Object} attributes - Element attributes
   * @param {string} content - Element content
   * @returns {HTMLElement} Created element
   */
  createElement(tagName, attributes = {}, content = '') {
    const element = document.createElement(tagName);
    
    Object.keys(attributes).forEach(attr => {
      if (attr === 'className') {
        element.className = attributes[attr];
      } else if (attr === 'textContent') {
        element.textContent = attributes[attr];
      } else if (attr === 'innerHTML') {
        element.innerHTML = attributes[attr];
      } else {
        element.setAttribute(attr, attributes[attr]);
      }
    });

    if (content) {
      element.textContent = content;
    }

    return element;
  },

  /**
   * Append child element
   * @param {string|HTMLElement} parent - Parent element ID or element
   * @param {HTMLElement} child - Child element to append
   */
  appendChild(parent, child) {
    const parentEl = typeof parent === 'string' ? this.getElementById(parent) : parent;
    if (parentEl && child) {
      parentEl.appendChild(child);
    }
  },

  /**
   * Remove element from DOM
   * @param {string|HTMLElement} element - Element ID or element
   */
  removeElement(element) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  },

  /**
   * Get element dimensions
   * @param {string|HTMLElement} element - Element ID or element
   * @returns {Object} Object with width and height
   */
  getDimensions(element) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      const rect = el.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right
      };
    }
    return { width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0 };
  },

  /**
   * Check if element is visible in viewport
   * @param {string|HTMLElement} element - Element ID or element
   * @returns {boolean} True if element is visible
   */
  isInViewport(element) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (!el) return false;

    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  /**
   * Scroll element into view
   * @param {string|HTMLElement} element - Element ID or element
   * @param {Object} options - Scroll options
   */
  scrollIntoView(element, options = { behavior: 'smooth', block: 'center' }) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.scrollIntoView(options);
    }
  },

  /**
   * Debounce function execution
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait = CONSTANTS.TIMING.DEBOUNCE_DEFAULT) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function execution
   * @param {Function} func - Function to throttle
   * @param {number} limit - Limit time in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, limit = CONSTANTS.TIMING.THROTTLE_DEFAULT) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOMHelpers;
} else {
  window.DOMHelpers = DOMHelpers;
}
