const CACHE_NAME = "tinysquares-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/tiles.json",
  "/manifest.json",
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/preview.jpg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(e.request);
      const fetchPromise = fetch(e.request)
        .then((response) => {
          if (
            response.ok &&
            (e.request.destination === "image" ||
              e.request.destination === "video")
          ) {
            cache.put(e.request, response.clone());
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
