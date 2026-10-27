// Hagrid's Hut Service Worker - The Sorted Club
const CACHE_NAME = "hagrids-hut-v2";
const STATIC_ASSETS = [
  "/favicon.svg",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

self.addEventListener("install", (event) => {
  // Pre-cache only fundamental static icons (NOT index.html or app shell)
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Delete all older caches immediately
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and sensitive / dynamic endpoints (API, auth, groq, analytics)
  if (
    event.request.method !== "GET" ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/auth") ||
    url.pathname.includes("groq")
  ) {
    return;
  }

  // 1. NETWORK-FIRST STRATEGY FOR HTML & NAVIGATION REQUESTS
  // Always fetch fresh HTML from the server so Vercel deployments take effect immediately!
  if (event.request.mode === "navigate" || event.request.destination === "document" || url.pathname.endsWith(".html")) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback: try cache only if network completely fails
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          const fallback = await caches.match("/");
          if (fallback) return fallback;
          return new Response("Offline - Please connect to the internet to enter Hagrid's Hut.", {
            headers: { "Content-Type": "text/plain" }
          });
        })
    );
    return;
  }

  // 2. STALE-WHILE-REVALIDATE / CACHE-FIRST FOR HASHED STATIC ASSETS & IMAGES
  if (
    url.pathname.match(/\.(js|css|svg|png|jpg|jpeg|webp|woff2|woff)$/) ||
    event.request.destination === "image" ||
    event.request.destination === "font"
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});
