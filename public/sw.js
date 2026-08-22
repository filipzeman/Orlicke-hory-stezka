const CACHE_PREFIX = "stezka-app-shell";
const CACHE_VERSION = "v2";
const CACHE_NAME = `${CACHE_PREFIX}-${CACHE_VERSION}`;

const APP_SHELL = [
  "/",
  "/itinerar",
  "/o-projektu",
  "/caste-dotazy",
  "/mapa-etapy",
  "/blog",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/favicon.ico",
];

if (self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1") {
  self.addEventListener("fetch", () => {});
  self.addEventListener("install", (event) => event.waitUntil(self.skipWaiting()));
  self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
  self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
      self.skipWaiting();
    }
  });
}

function shouldBypassServiceWorker(url) {
  return (
    url.pathname.startsWith("/@vite/") ||
    url.pathname.startsWith("/@fs/") ||
    url.pathname.startsWith("/src/") ||
    url.pathname.startsWith("/lib/") ||
    url.pathname.includes("/node_modules/")
  );
}

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      for (const url of APP_SHELL) {
        try {
          const response = await fetch(url, { cache: "no-store" });
          if (response.ok) {
            await cache.put(url, response.clone());
          }
        } catch (error) {
          console.warn(`Unable to cache app shell asset: ${url}`, error);
        }
      }
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      self.clients.claim();
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (shouldBypassServiceWorker(url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(request, { ignoreSearch: true });
          if (cached) {
            return cached;
          }

          const detailMatch = url.pathname.startsWith("/bod/")
            ? await cache.match(url.pathname, { ignoreSearch: true })
            : null;

          if (detailMatch) {
            return detailMatch;
          }

          const fallback = await cache.match("/");
          if (fallback) {
            return fallback;
          }

          return new Response("Offline", { status: 503, statusText: "Offline" });
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request, { ignoreSearch: true });

      try {
        const response = await fetch(request);

        if (
          response.ok &&
          (url.pathname.startsWith("/_astro/") ||
            url.pathname.startsWith("/images/") ||
            url.pathname.startsWith("/icons/") ||
            url.pathname.endsWith(".svg") ||
            APP_SHELL.includes(url.pathname))
        ) {
          await cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        if (cached) {
          return cached;
        }

        return new Response("", { status: 503, statusText: "Offline" });
      }
    })(),
  );
});