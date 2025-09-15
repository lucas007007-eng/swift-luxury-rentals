// Berlin Luxe Rentals Service Worker
// Advanced caching strategy for luxury rental platform

const CACHE_NAME = 'berlin-luxe-v1.0.0';
const STATIC_CACHE = 'berlin-luxe-static-v1';
const DYNAMIC_CACHE = 'berlin-luxe-dynamic-v1';
const IMAGE_CACHE = 'berlin-luxe-images-v1';

// Critical assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/properties',
  '/contact',
  '/about',
  '/offline',
  '/favicon.ico',
  '/_next/static/css/',
  '/_next/static/js/',
];

// Property images and external assets
const IMAGE_PATTERNS = [
  /^https:\/\/images\.unsplash\.com/,
  /^https:\/\/housinganywhere\.imgix\.net/,
  /^https:\/\/listingimages\.wunderflats\.com/,
  /^https:\/\/pic\.le-cdn\.com/,
];

// Install event - cache critical assets
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker for Berlin Luxe Rentals');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).catch(err => {
      console.warn('[SW] Failed to cache some static assets:', err);
    })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== IMAGE_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim all clients immediately
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Static assets - Cache First
    if (isStaticAsset(request)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 2: Images - Cache First with fallback
    if (isImage(request)) {
      return await cacheFirst(request, IMAGE_CACHE);
    }
    
    // Strategy 3: API calls - Network First
    if (isAPICall(request)) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // Strategy 4: Pages - Stale While Revalidate
    if (isPage(request)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }
    
    // Default: Network First
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.warn('[SW] Fetch failed:', error);
    
    // Return offline fallback for pages
    if (isPage(request)) {
      const offlineResponse = await caches.match('/offline');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Last resort - return error
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Caching Strategies

async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  // Always try to update in background
  const networkResponsePromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => {
    // Ignore network errors in background
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return networkResponsePromise;
}

// Helper functions

function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/_next/static/') ||
         url.pathname.includes('/favicon') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.woff') ||
         url.pathname.endsWith('.woff2');
}

function isImage(request) {
  const url = new URL(request.url);
  return IMAGE_PATTERNS.some(pattern => pattern.test(url.href)) ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.jpeg') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.webp') ||
         url.pathname.endsWith('.svg');
}

function isAPICall(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

function isPage(request) {
  const url = new URL(request.url);
  return request.headers.get('accept')?.includes('text/html') &&
         !url.pathname.startsWith('/api/') &&
         !url.pathname.includes('.');
}

// Background sync for form submissions (future enhancement)
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'contact-form') {
    event.waitUntil(syncContactForm());
  }
});

async function syncContactForm() {
  // Implementation for offline form submission sync
  console.log('[SW] Syncing contact form submissions');
}

console.log('[SW] Berlin Luxe Rentals Service Worker loaded successfully');
