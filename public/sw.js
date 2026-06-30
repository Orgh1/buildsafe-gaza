/* BuildSafe Gaza — service worker
   Strategy: network-first (always serve the latest when online), fall back to
   cache when offline. Keeps the app fully usable offline without ever serving
   a stale page while connected. */
const VERSION = 'bsg-v5';

const APP_SHELL = [
  '/', '/index.html', '/login.html', '/register.html', '/dashboard.html',
  '/assessment.html', '/view.html', '/history.html', '/profile.html', '/contact.html',
  '/report.html', '/offline.html',
  '/css/style.css',
  '/js/config.js', '/js/i18n.js', '/js/api.js', '/js/idb.js', '/js/ui.js', '/js/sync.js',
  '/js/dashboard.js', '/js/assessment.js', '/js/view.js', '/js/history.js', '/js/profile.js', '/js/report.js',
  '/vendor/bootstrap/bootstrap.min.css', '/vendor/bootstrap/bootstrap.rtl.min.css', '/vendor/bootstrap/bootstrap.bundle.min.js',
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
  // API is network-only — EXCEPT media files, which we cache so photos show offline.
  if (url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/media/')) return;

  // Network-first: latest content when online, cached copy when offline.
  event.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (res && res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy));
      }
      return res;
    } catch (err) {
      const cached = await caches.match(req);
      if (cached) return cached;
      if (req.mode === 'navigate') return caches.match('/offline.html');
      throw err;
    }
  })());
});
