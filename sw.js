// Trabajador del Panel de vida: guarda una copia de la app para que abra sin conexión.
// Primero intenta la versión nueva de internet; si no hay conexión, usa la copia guardada.
const CACHE = 'panel-v6';
const ARCHIVOS = ['./panel.html', './manifest.webmanifest', './icons/icono-192.png', './icons/icono-512.png', './icons/icono-maskable-512.png', './icons/icono-apple-180.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Solo los archivos de la propia app; lo de Google (más adelante) va siempre directo.
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        if (resp.ok) { const copia = resp.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); }
        return resp;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./panel.html')))
  );
});
