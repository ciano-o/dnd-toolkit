const CACHE_NAME = 'dnd-toolkit-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './tools/combat-tracker.html',
  './tools/monster-creator.html',
  './tools/character-creator.html',
  './data/index.json',
  './data/monsters/Summer_Eladrin.json',
  './data/monsters/Winter_Eladrin.json',
  './data/monsters/Elven_Lost_Soul_CR2.json',
  './data/monsters/Elven_Lost_Soul_CR4.json',
  './data/players/Ja_Liss.json'
];

// Install: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network first for data files, cache first for everything else
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Data files: network first (so new JSONs are picked up), fallback to cache
  if (url.pathname.includes('/data/')) {
    event.respondWith(
      fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Everything else: cache first, fallback to network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
