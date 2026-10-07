/* TempWise service worker: keeps the site working offline.
 * Pages: network first, falling back to the cache.
 * Everything else: cache first, refreshed in the background.
 * Bump VERSION when you publish changes so visitors get fresh files. */
const VERSION = 'tempwise-v1.2';
const CORE = [
  './', './index.html', './app/', './app/index.html', './manifest.webmanifest',
  './css/site.css', './css/app.css',
  './js/config.js', './js/site.js', './js/sync.js', './js/app.js', './js/pwa.js',
  './assets/favicon.svg', './assets/icon-192.png', './assets/icon-512.png',
  './assets/fonts/manrope-latin-400-normal.woff2', './assets/fonts/manrope-latin-500-normal.woff2',
  './assets/fonts/manrope-latin-600-normal.woff2', './assets/fonts/manrope-latin-700-normal.woff2',
  './assets/fonts/manrope-latin-800-normal.woff2', './assets/fonts/unbounded-latin-500-normal.woff2',
  './assets/fonts/unbounded-latin-600-normal.woff2', './assets/fonts/unbounded-latin-700-normal.woff2',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
