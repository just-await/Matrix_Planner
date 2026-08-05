// public/sw.js
const CACHE_NAME = "matrix-planner-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Простая стратегия кэширования для работы PWA
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});