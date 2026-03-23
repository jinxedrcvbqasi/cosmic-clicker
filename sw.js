/* ═══════════════════════════════════════
   COSMIC CLICKER v4 — Service Worker
   Handles: offline caching + push notifications
═══════════════════════════════════════ */

const CACHE_NAME = 'cosmic-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/firebase.js',
  '/i18n.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap'
];

/* ── INSTALL: cache all static assets ── */
self.addEventListener('install', event => {
  console.log('[SW] Installing Cosmic Clicker v4...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .catch(err => console.warn('[SW] Cache failed (some assets may be missing):', err))
  );
  self.skipWaiting();
});

/* ── ACTIVATE: clear old caches ── */
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      )
    )
  );
  self.clients.claim();
});

/* ── FETCH: network-first with cache fallback ── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests except fonts
  const url = new URL(event.request.url);
  const isFirebase = url.hostname.includes('firebase') || url.hostname.includes('google');
  if (isFirebase) return; // Let Firebase handle itself

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response && response.ok) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed — serve from cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // If HTML is requested and not cached, return index
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});

/* ── PUSH NOTIFICATIONS ── */
self.addEventListener('push', event => {
  let data = {
    title: '⭐ Cosmic Clicker',
    body: 'Something is happening in the galaxy!',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    url: '/'
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open',    title: '🚀 Open Game' },
      { action: 'dismiss', title: '✕ Dismiss'    }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/* ── NOTIFICATION CLICK ── */
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // If game is already open — focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        return clients.openWindow(targetUrl);
      })
  );
});

/* ── BACKGROUND SYNC (optional) ── */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-game-data') {
    console.log('[SW] Background sync triggered');
  }
});

