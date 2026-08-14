/* Y Soft — caché de la versión publicada después de catálogo e inventario. */
const CACHE_NAME = 'ysoft-pwa-v6-catalogo-inventario';
const APP_SHELL = [
  './',
  './index.html',
  './404.html',
  './styles.css',
  './firebase-init.js',
  './config.js',
  './data.js',
  './firestore-service.js',
  './components.js',
  './screens.js',
  './screens-more.js',
  './app.js',
  './auth.js',
  './permisos.js',
  './manifest.webmanifest',
  './ysoft-mark.svg',
];
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
