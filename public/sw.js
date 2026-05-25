/* DaanSetu service worker — offline-first, runtime caching, background sync, push */
const VERSION = "daansetu-v1";
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const IMAGE_CACHE = `${VERSION}-images`;

const APP_SHELL = ["/", "/manifest.webmanifest", "/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Ignore non-http/https protocols (e.g. chrome-extension://)
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Ignore localhost assets, dev JS/CSS chunks, and Next.js internal assets
  if (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "[::1]" ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.includes("webpack-hmr") ||
    url.pathname.endsWith(".hot-update.json") ||
    url.pathname.endsWith(".hot-update.js")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const cachedRoot = await caches.match("/");
          if (cachedRoot) return cachedRoot;
          const cachedOffline = await caches.match("/offline.html");
          if (cachedOffline) return cachedOffline;
          return new Response("Offline — Connection lost", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        })
    );
    return;
  }

  if (request.destination === "image") {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const res = await fetch(request);
          if (res.ok) cache.put(request, res.clone());
          return res;
        } catch {
          return cached || new Response("", { status: 404 });
        }
      })
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        try {
          const res = await fetch(request);
          if (res.ok) cache.put(request, res.clone());
          return res;
        } catch {
          const cached = await cache.match(request);
          if (cached) return cached;
          return new Response("Resource unavailable", {
            status: 404,
            headers: { "Content-Type": "text/plain" },
          });
        }
      })
    );
  }
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-drafts") event.waitUntil(broadcast({ type: "FLUSH_DRAFTS" }));
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "refresh-impact") event.waitUntil(broadcast({ type: "REFRESH_IMPACT" }));
});

async function broadcast(msg) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach((c) => c.postMessage(msg));
}

self.addEventListener("push", (event) => {
  let payload = { title: "DaanSetu", body: "You have a new update.", url: "/" };
  try { if (event.data) payload = Object.assign(payload, event.data.json()); } catch {}
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-72.png",
      tag: payload.tag || "daansetu",
      data: { url: payload.url },
      vibrate: [80, 40, 80],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const c of clients) {
        if ("focus" in c) { if (c.navigate) c.navigate(target); return c.focus(); }
      }
      return self.clients.openWindow(target);
    })
  );
});
