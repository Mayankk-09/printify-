const CACHE = "printify-static-v1";

const ASSETS = [
  "/",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.url.includes("/api/")) {
    event.respondWith(networkFirst(event.request));
  } else {
    event.respondWith(cacheFirst(event.request));
  }
});

function cacheFirst(request) {
  return caches.match(request).then((cached) => cached || fetch(request));
}

function networkFirst(request) {
  return fetch(request)
    .then((res) => {
      const clone = res.clone();
      caches.open(CACHE).then((cache) => cache.put(request, clone));
      return res;
    })
    .catch(() => caches.match(request));
}
