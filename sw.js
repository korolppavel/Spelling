// Кэширует тренажёр, чтобы он открывался без интернета.
const CACHE = "spelling-v2";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "./index.html"])));
  self.skipWaiting();
});
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // сначала сеть (чтобы приходили обновления), при ошибке — кэш
  e.respondWith(
    fetch(e.request).then(r => {
      const u = new URL(e.request.url);
      if ((r.ok || r.type === "opaque") && (u.origin === location.origin || /arasaac\.org$/.test(u.hostname))) {
        const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return r;
    }).catch(() => caches.match(e.request).then(m => m || caches.match("./index.html")))
  );
});
