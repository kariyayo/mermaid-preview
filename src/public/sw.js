const CACHE_NAME = "mermaid-preview-v1";

const PRECACHE_URLS = [
  "/",
  "/app.js",
  "/style.css",
  "/manifest.json",
];

const CDN_CACHE_NAME = "mermaid-cdn-v1";

// Install: precache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== CDN_CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for app, cache-first for CDN
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // CDN resources (mermaid.js): cache-first
  if (url.hostname.includes("cdn.jsdelivr.net") || url.hostname.includes("esm.sh")) {
    event.respondWith(
      caches.open(CDN_CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // Skip API calls — always go to network
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // App shell: network-first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
