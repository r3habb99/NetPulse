/**
 * NetPulse Service Worker
 * Provides offline functionality and caching for PWA
 */

const CACHE_NAME = 'netpulse-v1.0.0';
const STATIC_CACHE_NAME = 'netpulse-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'netpulse-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/main.css',
  '/assets/css/mobile.css',
  '/assets/css/components.css',
  '/assets/css/animations.css',
  '/assets/js/config.js',
  '/assets/js/app.js',
  '/assets/js/ui-controller.js',
  '/assets/js/network-test.js',
  '/assets/js/speed-test.js',
  '/assets/js/latency-test.js',
  '/utils/math-utils.js',
  '/utils/error-handler.js',
  '/utils/device-detection.js',
  '/utils/formatters.js',
  '/components/speed-meter.js',
  '/components/latency-graph.js'
];

// Test files (don't cache these as they need to be fresh for accurate testing)
const TEST_FILES = [
  '/assets/test-files/1mb.bin',
  '/assets/test-files/5mb.bin',
  '/assets/test-files/10mb.bin'
];

/**
 * Service Worker Install Event
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static files:', error);
      })
  );
});

/**
 * Service Worker Activate Event
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('netpulse-')) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('[SW] Failed to activate service worker:', error);
      })
  );
});

/**
 * Service Worker Fetch Event
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Handle different types of requests
  if (isTestFile(request.url)) {
    // Test files: Always fetch from network (no caching)
    event.respondWith(fetchFromNetwork(request));
  } else if (isStaticFile(request.url)) {
    // Static files: Cache first, then network
    event.respondWith(cacheFirst(request));
  } else {
    // Dynamic content: Network first, then cache
    event.respondWith(networkFirst(request));
  }
});

/**
 * Check if URL is a test file
 * @param {string} url - Request URL
 * @returns {boolean} True if test file
 */
function isTestFile(url) {
  return TEST_FILES.some(testFile => url.includes(testFile));
}

/**
 * Check if URL is a static file
 * @param {string} url - Request URL
 * @returns {boolean} True if static file
 */
function isStaticFile(url) {
  return STATIC_FILES.some(staticFile => {
    if (staticFile === '/') {
      return url.endsWith('/') || url.endsWith('/index.html');
    }
    return url.includes(staticFile);
  });
}

/**
 * Cache first strategy
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} Response
 */
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    
    // Return offline fallback if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    
    throw error;
  }
}

/**
 * Network first strategy
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} Response
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Network first failed:', error);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Fetch from network only (no caching)
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} Response
 */
async function fetchFromNetwork(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('[SW] Network fetch failed:', error);
    throw error;
  }
}

/**
 * Handle background sync
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-test-sync') {
    event.waitUntil(handleBackgroundTestSync());
  }
});

/**
 * Handle background test sync
 */
async function handleBackgroundTestSync() {
  try {
    // Implement background test sync if needed
    console.log('[SW] Background test sync completed');
  } catch (error) {
    console.error('[SW] Background test sync failed:', error);
  }
}

/**
 * Handle push notifications
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'Your network test has completed',
    icon: '/assets/images/icons/icon-192x192.png',
    badge: '/assets/images/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view-results',
        title: 'View Results',
        icon: '/assets/images/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/images/icons/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('NetPulse', options)
  );
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view-results') {
    event.waitUntil(
      clients.openWindow('/?view=results')
    );
  }
});

/**
 * Handle messages from main thread
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] Service worker script loaded');
