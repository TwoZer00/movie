const VERSION = '1.0.0';
const STATIC_CACHE = `filmdle-static-${VERSION}`;
const API_CACHE = `filmdle-api-${VERSION}`;

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(urlsToCache)),
      caches.open(API_CACHE)
    ]).then(() => {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache TMDB API requests with stale-while-revalidate
  if (url.hostname === 'api.themoviedb.org') {
    event.respondWith(
      caches.open(API_CACHE).then(cache => {
        return cache.match(request).then(response => {
          const fetchPromise = fetch(request).then(fetchResponse => {
            if (fetchResponse.ok) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          });
          return response || fetchPromise;
        });
      })
    );
    return;
  }

  // Skip non-GET requests and external URLs
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Network-first for HTML and JS/CSS files
  if (request.url.includes('.html') || request.url === self.location.origin + '/' || 
      request.url.includes('.js') || request.url.includes('.css')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            caches.open(STATIC_CACHE).then(cache => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
  
  // Cache-first for other assets (images, fonts)
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then(fetchResponse => {
          if (fetchResponse.ok) {
            caches.open(STATIC_CACHE).then(cache => cache.put(request, fetchResponse.clone()));
          }
          return fetchResponse;
        }).catch(() => {
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

