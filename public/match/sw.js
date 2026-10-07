/* Fait fonctionner la feuille de match sans réseau au bord du terrain.
   Seule la page elle-même est mise en cache ; les appels à l'API ne le
   sont jamais (les données passent par la file d'attente de la page). */
const CACHE = "dragons-match-v1";
const SHELL = ["/match/", "/match/manifest.webmanifest", "/match/icon-192.png", "/match/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || !url.pathname.startsWith("/match/")) return;
  // Réseau d'abord (pour avoir la dernière version), cache si pas de réseau.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(url.pathname === "/match/index.html" ? "/match/" : e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("/match/")))
  );
});
