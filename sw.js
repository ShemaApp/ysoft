/* Y Soft — caché mínima para una PWA estática. */
const CACHE_NAME = 'ysoft-pwa-v4-home-reference';
const APP_SHELL = ['./', './index.html', './styles.css', './firebase-init.js', './config.js', './data.js', './components.js', './screens.js', './screens-more.js', './app.js', './manifest.webmanifest', './ysoft-mark.svg'];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
