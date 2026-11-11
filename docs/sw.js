/* NZ Trip guide – offline service worker. Version is stamped by build.mjs on every build. */
const VERSION = "566231b7ad5f";
const CACHE = "nz-trip-" + VERSION;
const CORE = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png", "./icons/favicon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith("nz-trip-") && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
    (await self.clients.matchAll()).forEach((c) => c.postMessage("cached"));
  })());
});

// Pages: try the network first (so people get updates), fall back to the saved copy after 4 s or when offline.
async function page(request) {
  const cache = await caches.open(CACHE);
  try {
    const net = await Promise.race([
      fetch(request, { cache: "no-store" }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000))
    ]);
    if (net && net.ok) { cache.put("./index.html", net.clone()); return net; }
    throw new Error("bad response");
  } catch (e) {
    return (await cache.match("./index.html")) || (await cache.match("./")) || Response.error();
  }
}

// Everything else from this site: saved copy first, refresh in the background.
async function asset(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request, { ignoreSearch: true });
  const net = fetch(request).then((r) => { if (r && r.ok) cache.put(request, r.clone()); return r; }).catch(() => null);
  return hit || (await net) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;        // weather, photo and map lookups go straight to the network
  if (req.mode === "navigate") event.respondWith(page(req));
  else event.respondWith(asset(req));
});
