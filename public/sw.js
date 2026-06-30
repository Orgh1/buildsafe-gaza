/* BuildSafe Gaza — service worker (app-shell precache + offline fallback) */
const VERSION = 'bsg-v1';

const APP_SHELL = [
  '/', '/index.html', '/login.html', '/register.html', '/dashboard.html',
  '/assessment.html', '/view.html', '/history.html', '/profile.html', '/contact.html',
  '/offline.html',
  '/css/style.css',
  '/js/config.js', '/js/api.js', '/js/idb.js', '/js/ui.js', '/js/sync.js',
  '/js/dashboard.js', '/js/assessment.js', '/js/view.js', '/js/history.js', '/js/profile.js',
  '/vendor/bootstrap/bootstrap.min.css', '/vendor/bootstrap/bootstrap.bundle.min.js',
  '/vendor/icons/bootstrap-icons.min.css',
  '/vendor/icons/fonts/bootstrap-icons.woff2', '/vendor/icons/fonts/bootstrap-icons.woff',
  '/manifest.webmanifest', '/img/icon.svg', '/img/icon-192.png', '/img/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // ignore cross-origin
  if (url.pathname.startsWith('/api/')) return;     // API is network-only; offline data lives in IndexedDB

  // Navigation requests: cache-first for the app shell, fall back to network, then offline page
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached || fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        }).catch(() => caches.match('/offline.html'))
      )
    );
    return;
  }

  // Static assets: cache-first, then network (and cache the result)
  event.respondWith(
    caches.match(req).then((cached) =>
      cached || fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached)
    )
  );
});
