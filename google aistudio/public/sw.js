// Service Worker for Dcoine PWA
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clear any old caches that broke preview
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

// Pass through to network
self.addEventListener('fetch', () => {
  // Network pass-through
});
