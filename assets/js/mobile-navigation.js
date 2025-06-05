/**
 * NetPulse - Enhanced Mobile Navigation
 * Provides app-like navigation experience with gestures, animations, and feedback
 */

class MobileNavigation {
  constructor() {
    this.currentView = 'home';
    this.views = ['home', 'test', 'results'];
    this.isTransitioning = false;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.pullRefreshThreshold = 80;
    this.isPulling = false;
    
    this.init();
  }

  /**
   * Initialize mobile navigation
   */
  init() {
    this.bindEvents();
    this.setupGestures();
    this.setupPullToRefresh();
    this.setupFloatingActionButton();
    this.updateNavigation();
  }

  /**
   * Bind navigation events
   */
  bindEvents() {
    // Navigation item clicks
    const navItems = document.querySelectorAll('.mobile-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.dataset.view;
        this.navigateToView(view);
        this.addHapticFeedback(item, 'light');
      });
    });

    // Floating action button
    const fab = document.getElementById('mobile-fab');
    if (fab) {
      fab.addEventListener('click', () => {
        this.handleFabClick();
        this.addHapticFeedback(fab, 'medium');
      });
    }

    // Touch feedback for all mobile elements
    const touchElements = document.querySelectorAll('.mobile-touch-feedback');
    touchElements.forEach(element => {
      this.addTouchFeedback(element);
    });
  }

  /**
   * Setup swipe gestures
   */
  setupGestures() {
    const container = document.getElementById('main-content');
    if (!container) return;

    container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (this.isPulling) return;

      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = touchX - this.touchStartX;
      const deltaY = touchY - this.touchStartY;

      // Only prevent default for significant horizontal swipes that are clearly not vertical scrolling
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100 && Math.abs(deltaY) < 30) {
        e.preventDefault();
      }
    }, { passive: false });

    container.addEventListener('touchend', (e) => {
      const touchX = e.changedTouches[0].clientX;
      const deltaX = touchX - this.touchStartX;
      const deltaY = e.changedTouches[0].clientY - this.touchStartY;

      // Only process horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
        if (deltaX > 0) {
          this.navigatePrevious();
        } else {
          this.navigateNext();
        }
      }
    }, { passive: true });
  }

  /**
   * Setup pull-to-refresh functionality
   */
  setupPullToRefresh() {
    const container = document.getElementById('main-content');
    const indicator = document.getElementById('pull-refresh-indicator');
    if (!container || !indicator) return;

    let startY = 0;
    let currentY = 0;

    container.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      currentY = startY;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      const deltaX = Math.abs(e.touches[0].clientX - this.touchStartX);

      // Only allow pull-to-refresh at the top of the page and for primarily vertical movements
      if (container.scrollTop === 0 && deltaY > 20 && deltaX < 50) {
        e.preventDefault();
        this.isPulling = true;

        const pullDistance = Math.min(deltaY, this.pullRefreshThreshold * 1.5);
        const progress = pullDistance / this.pullRefreshThreshold;

        indicator.style.transform = `translateX(-50%) translateY(${pullDistance - 60}px)`;
        indicator.style.opacity = Math.min(progress, 1);

        if (pullDistance >= this.pullRefreshThreshold) {
          indicator.classList.add('pulling');
        } else {
          indicator.classList.remove('pulling');
        }
      }
    }, { passive: false });

    container.addEventListener('touchend', () => {
      if (!this.isPulling) return;
      
      const deltaY = currentY - startY;
      
      if (deltaY >= this.pullRefreshThreshold) {
        this.triggerRefresh();
      } else {
        this.resetPullRefresh();
      }
      
      this.isPulling = false;
    }, { passive: true });
  }

  /**
   * Setup floating action button behavior
   */
  setupFloatingActionButton() {
    const fab = document.getElementById('mobile-fab');
    if (!fab) return;

    // Hide/show FAB based on current view
    this.updateFabVisibility();

    // Auto-hide on scroll
    let scrollTimeout;
    const container = document.getElementById('main-content');
    if (container) {
      container.addEventListener('scroll', () => {
        fab.style.transform = 'scale(0.8) translateY(10px)';
        fab.style.opacity = '0.7';
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          fab.style.transform = '';
          fab.style.opacity = '';
        }, 150);
      });
    }
  }

  /**
   * Navigate to specific view
   */
  navigateToView(viewName) {
    if (this.isTransitioning || viewName === this.currentView) {
      return;
    }

    this.isTransitioning = true;

    // Use the existing app's switchView method if available
    if (window.NetPulseApp && typeof window.NetPulseApp.switchView === 'function') {
      window.NetPulseApp.switchView(viewName);
    } else if (window.app && typeof window.app.switchView === 'function') {
      window.app.switchView(viewName);
    } else {
      // Fallback to basic view switching
      this.basicViewSwitch(viewName);
    }

    this.currentView = viewName;
    this.updateNavigation();
    this.updateFabVisibility();

    setTimeout(() => {
      this.isTransitioning = false;
    }, 300);
  }

  /**
   * Basic view switching fallback
   */
  basicViewSwitch(viewName) {
    // Hide all views
    const views = document.querySelectorAll('.view');
    views.forEach(view => {
      view.classList.remove('active', 'fade-in');
      view.style.display = 'none';
    });

    // Show target view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
      targetView.style.display = 'block';
      targetView.classList.add('active', 'fade-in');
    }
  }

  /**
   * Navigate to next view
   */
  navigateNext() {
    const currentIndex = this.views.indexOf(this.currentView);
    const nextIndex = (currentIndex + 1) % this.views.length;
    this.navigateToView(this.views[nextIndex]);
    this.showSwipeIndicator('right');
  }

  /**
   * Navigate to previous view
   */
  navigatePrevious() {
    const currentIndex = this.views.indexOf(this.currentView);
    const prevIndex = currentIndex === 0 ? this.views.length - 1 : currentIndex - 1;
    this.navigateToView(this.views[prevIndex]);
    this.showSwipeIndicator('left');
  }



  /**
   * Update navigation state
   */
  updateNavigation() {
    const navItems = document.querySelectorAll('.mobile-nav-item');
    navItems.forEach(item => {
      if (item.dataset.view === this.currentView) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * Update FAB visibility based on current view
   */
  updateFabVisibility() {
    const fab = document.getElementById('mobile-fab');
    if (!fab) return;

    if (this.currentView === 'home') {
      fab.classList.remove('hidden');
    } else {
      fab.classList.add('hidden');
    }
  }

  /**
   * Handle FAB click
   */
  handleFabClick() {
    // Start quick test
    const startButton = document.getElementById('start-complete-test');
    if (startButton) {
      startButton.click();
    }
  }

  /**
   * Trigger refresh
   */
  triggerRefresh() {
    const indicator = document.getElementById('pull-refresh-indicator');
    if (!indicator) return;

    indicator.classList.add('loading');
    indicator.classList.remove('pulling');
    
    // Simulate refresh
    setTimeout(() => {
      this.resetPullRefresh();
      // Trigger actual refresh logic here
      window.dispatchEvent(new CustomEvent('pullRefresh'));
    }, 1500);
  }

  /**
   * Reset pull-to-refresh state
   */
  resetPullRefresh() {
    const indicator = document.getElementById('pull-refresh-indicator');
    if (!indicator) return;

    indicator.style.transform = 'translateX(-50%)';
    indicator.style.opacity = '0';
    indicator.classList.remove('loading', 'pulling');
  }

  /**
   * Show swipe indicator
   */
  showSwipeIndicator(direction) {
    const indicator = document.getElementById(`swipe-${direction}`);
    if (!indicator) return;

    indicator.style.opacity = '1';
    setTimeout(() => {
      indicator.style.opacity = '0';
    }, 1000);
  }

  /**
   * Add haptic feedback simulation
   */
  addHapticFeedback(element, intensity = 'light') {
    element.classList.add(`mobile-haptic-${intensity}`);
    setTimeout(() => {
      element.classList.remove(`mobile-haptic-${intensity}`);
    }, 200);

    // Try to trigger actual haptic feedback if available
    if (navigator.vibrate) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[intensity] || patterns.light);
    }
  }

  /**
   * Add touch feedback to element
   */
  addTouchFeedback(element) {
    element.addEventListener('touchstart', () => {
      element.style.transform = 'scale(0.98)';
    }, { passive: true });

    element.addEventListener('touchend', () => {
      element.style.transform = '';
    }, { passive: true });

    element.addEventListener('touchcancel', () => {
      element.style.transform = '';
    }, { passive: true });
  }

  /**
   * Show notification badge
   */
  showBadge(count = 1) {
    const badge = document.getElementById('results-badge');
    if (!badge) return;

    badge.textContent = count;
    badge.classList.remove('hidden');
  }

  /**
   * Hide notification badge
   */
  hideBadge() {
    const badge = document.getElementById('results-badge');
    if (!badge) return;

    badge.classList.add('hidden');
  }
}

// Initialize mobile navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.mobileNavigation = new MobileNavigation();
});

// Also initialize if DOM is already loaded
if (document.readyState !== 'loading') {
  window.mobileNavigation = new MobileNavigation();
}
