/* Y Soft — caché de la versión publicada después de corregir la entrada PWA y el arranque offline. */
const CACHE_NAME = 'ysoft-pwa-v7-boot-fallback';
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
const EXTERNAL_SHELL = [
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js',
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => Promise.all([
    cache.addAll(APP_SHELL),
    ...EXTERNAL_SHELL.map((url) => fetch(url, { mode:'cors' }).then((response) => response.ok ? cache.put(url, response) : null).catch(() => null)),
  ])));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const isLocal = event.request.url.startsWith(self.location.origin);
  const isExternalShell = EXTERNAL_SHELL.includes(event.request.url);
  if (!isLocal && !isExternalShell) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
