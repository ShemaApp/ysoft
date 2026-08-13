/* Y Soft — caché mínima para una PWA estática. */
const CACHE_NAME = 'ysoft-pwa-v1';
const APP_SHELL = ['./', './index.html', './styles.css', './firebase-init.js', './auth.js', './permisos.js', './servicios/productos-servicio.js', './servicios/inventario-servicio.js', './servicios/ventas-servicio.js', './servicios/creditos-servicio.js', './servicios/caja-servicio.js', './servicios/auditoria-servicio.js', './componentes/botones.js', './componentes/modales.js', './componentes/tablas.js', './componentes/estados.js', './pantallas/dashboard.js', './pantallas/productos.js', './pantallas/inventario.js', './pantallas/ventas.js', './pantallas/clientes.js', './pantallas/creditos.js', './pantallas/caja.js', './pantallas/reportes.js', './app.js', './manifest.webmanifest', './ysoft-mark.svg'];
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
