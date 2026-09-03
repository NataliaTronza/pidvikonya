const CACHE = "pidvikonnia-v16";
const FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./mascot.png", "./bubble.png", "./sprout.png", "./nav-today.png", "./nav-plants.png", "./nav-ach.png", "./plant-alocasia.png", "./plant-anthurium.png", "./plant-cactus.png", "./plant-ficus-lyrata.png", "./plant-dracaena-fragrans.png", "./plant-philodendron.png", "./plant-ficus-elastica.png", "./plant-crassula.png", "./plant-sansevieria.png", "./plant-zamioculcas.png", "./plant-monstera.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
