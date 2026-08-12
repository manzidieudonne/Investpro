const CACHE_NAME = 'investpro-cache-v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => caches.delete(cache))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.status === 404 && (event.request.url.endsWith('.js') || event.request.url.endsWith('.css'))) {
        // If a hashed chunk returns 404, purge caches so browser reloads fresh assets
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});
