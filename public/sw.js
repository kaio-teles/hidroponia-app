const CACHE_NAME = 'hidroponia-v2';

const ARQUIVOS_BASE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/hidroponia-bg.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(ARQUIVOS_BASE);

      try {
        const resposta = await fetch('/index.html', { cache: 'no-store' });
        if (resposta.ok) {
          const html = await resposta.text();
          const assets = html.match(/\/assets\/[^"'\s>]+/g) ?? [];
          const unicos = Array.from(new Set(assets));
          if (unicos.length > 0) {
            await cache.addAll(unicos);
          }
        }
      } catch {
        // Se estiver offline durante a atualização, mantém o cache base.
      }

      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const chaves = await caches.keys();
      await Promise.all(
        chaves
          .filter((chave) => chave !== CACHE_NAME)
          .map((chave) => caches.delete(chave))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const respostaRede = await fetch(request);
          if (respostaRede.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put('/index.html', respostaRede.clone());
          }
          return respostaRede;
        } catch {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match('/index.html')) || (await cache.match('/'));
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const emCache = await caches.match(request);
      if (emCache) return emCache;

      const respostaRede = await fetch(request);
      if (respostaRede.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, respostaRede.clone());
      }
      return respostaRede;
    })()
  );
});

