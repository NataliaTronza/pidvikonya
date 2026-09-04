const CACHE = "pidvikonnia-v26";
const FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./mascot.png", "./bubble.png", "./sprout.png", "./nav-today.png", "./nav-plants.png", "./nav-ach.png", "./plant-alocasia.png", "./plant-anthurium.png", "./plant-cactus.png", "./plant-ficus-lyrata.png", "./plant-dracaena-fragrans.png", "./plant-philodendron.png", "./plant-ficus-elastica.png", "./plant-crassula.png", "./plant-sansevieria.png", "./plant-zamioculcas.png", "./plant-monstera.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(FILES.map(f => c.add(f))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// сам застосунок (html) — спершу з мережі, щоб оновлення підхоплювалось одразу;
// картинки й решта — спершу з памʼяті, бо вони майже не міняються
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const isApp = req.mode === "navigate" ||
                url.pathname.endsWith("/") ||
                url.pathname.endsWith("index.html") ||
                url.pathname.endsWith("manifest.json");

  if (isApp) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then(hit => hit || caches.match("./index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }))
  );
});
