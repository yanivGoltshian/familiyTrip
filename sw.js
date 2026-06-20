/* Service Worker — ספר האגדות של המשפחה · קפריסין 2026 */
const CACHE = "cyprus2026-v4";
const CORE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./data.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./hotel-aerial.jpg",
  "./hotel-beach.jpg",
  "./hotel-grounds.jpg",
  "./hotel-kids-play.jpg",
  "./hotel-kids-splash.jpg",
  "./hotel-pool.jpg",
  "./hotel-restaurant.jpg",
  "./hotel-room.jpg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  /* ניווט — נסה רשת, גיבוי למטמון/דף הבית (אופליין) */
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(() => caches.match(req).then((r) => r || caches.match("./index.html")))
    );
    return;
  }

  /* אותו מקור — cache-first */
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then((cached) =>
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        }).catch(() => cached)
      )
    );
    return;
  }

  /* חיצוני (מפות/מזג אוויר) — רשת, גיבוי למטמון אם קיים */
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});
