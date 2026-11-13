// VerifyCheck — service worker du scanner.
// Objectif : l'app s'ouvre et fonctionne même sans réseau (connectivité faible).
// Les présences scannées hors ligne sont conservées côté client (localStorage)
// puis synchronisées quand le réseau revient (voir lib/api.js).

const CACHE = "verifycheck-scan-v3";

const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./lib/mock-data.js",
  "./lib/feedback.js",
  "./lib/api.js",
  "./lib/qr.js",
  "./vendor/html5-qrcode.min.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  // Stale-while-revalidate : réponse immédiate depuis le cache (utile en
  // connectivité faible), mise à jour silencieuse en arrière-plan.
  event.respondWith(
    caches.match(request).then((cached) => {
      const fromNetwork = fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(() => {
          if (cached) return cached;
          if (request.mode === "navigate") return caches.match("./index.html");
          return Response.error();
        });
      return cached || fromNetwork;
    })
  );
});
