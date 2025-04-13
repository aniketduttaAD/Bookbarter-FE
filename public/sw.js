const CACHE_NAME = 'p2p-book-exchange-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/offline.html'
];

// API routes to cache with network-first strategy
const API_ROUTES = [
    '/api/books',
    '/api/auth/profile'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            );
        })
            .then(() => self.clients.claim())
    );
});

// Fetch event - handle different caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Handle API requests with network-first strategy
    if (API_ROUTES.some(route => url.pathname.includes(route))) {
        event.respondWith(networkFirstStrategy(request));
        return;
    }

    // Handle static assets with cache-first strategy
    if (url.origin === self.location.origin) {
        if (
            url.pathname.endsWith('.js') ||
            url.pathname.endsWith('.css') ||
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.jpg') ||
            url.pathname.endsWith('.jpeg') ||
            url.pathname.endsWith('.svg') ||
            url.pathname.endsWith('.webp') ||
            url.pathname.endsWith('.json')
        ) {
            event.respondWith(cacheFirstStrategy(request));
            return;
        }
    }

    // Handle page navigations with network-first strategy
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .catch(() => {
                    // If navigation fails, show offline page
                    return caches.match('/offline.html');
                })
        );
        return;
    }

    // Default: network-first for everything else
    event.respondWith(networkFirstStrategy(request));
});

// Cache-first strategy
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    // Not in cache, fetch from network
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache the new response
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Network error, try to serve from cache
        return caches.match(request);
    }
}

// Network-first strategy
async function networkFirstStrategy(request) {
    try {
        // Try to get from network first
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache the new response
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Network error, fall back to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Nothing in cache, return generic offline response
        if (request.headers.get('Accept').includes('application/json')) {
            return new Response(JSON.stringify({ error: 'You are offline' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return caches.match('/offline.html');
    }
}

// Sync event - handle background sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-offline-actions') {
        event.waitUntil(syncOfflineActions());
    }
});

// Function to sync offline actions
async function syncOfflineActions() {
    try {
        // Send a message to the client to perform the sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_OFFLINE_ACTIONS'
            });
        });
    } catch (error) {
        console.error('Background sync error:', error);
    }
}