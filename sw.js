const CACHE_NAME = 'dnd-toolkit-v3.3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.jpg',
  './icon.jpg',
  './tools/combat-tracker.html',
  './tools/monster-creator.html',
  './tools/character-creator.html',
  './tools/asset-library.html',
  './data/library.json',
  './data/index.json',
  './data/monsters/Summer_Eladrin.json',
  './data/monsters/Winter_Eladrin.json',
  './data/monsters/Elven_Lost_Soul_CR2.json',
  './data/monsters/Elven_Lost_Soul_CR4.json',
  './data/monsters/basilisk.json',
  './data/monsters/bearded_devil.json',
  './data/monsters/Celentan.json',
  './data/monsters/displacer_beast.json',
  './data/monsters/Elanvirel.json',
  './data/monsters/guard_captain.json',
  './data/monsters/guard.json',
  './data/monsters/hobgoblin_captain.json',
  './data/monsters/hobgoblin_warrior.json',
  './data/monsters/knight.json',
  './data/monsters/kobold_warrior.json',
  './data/monsters/mage.json',
  './data/monsters/manticore.json',
  './data/monsters/medusa.json',
  './data/monsters/minotaur_of_baphomet.json',
  './data/monsters/oni.json',
  './data/monsters/scout_captain.json',
  './data/monsters/Silent_Knight.json',
  './data/monsters/tough_boss.json',
  './data/monsters/troll.json',
  './data/monsters/werebear.json',
  './data/monsters/wight.json',
  './data/monsters/Zur_Et.json',
  './data/players/Eyo-Pett.json',
  './data/players/German.json',
  './data/players/Isir.json',
  './data/players/Ja_Liss.json',
  "./data/players/Ja'Liss.json",
  './data/players/Krusko.json',
  './data/players/Ofis_Altamont.json',
  './data/players/Selene.json'
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
