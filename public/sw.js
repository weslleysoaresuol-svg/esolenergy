const CACHE_NAME = 'esol-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.png',
  '/favicon.svg',
  '/robots.txt'
];

// Evento de instalação - pré-carrega assets estáticos vitais
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando Esol Energy PWA SW...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pré-carregando estáticos essenciais');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Evento de ativação - limpa caches legados
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando Esol Energy PWA SW...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Evento de busca/fetch - Estratégia de cache híbrida
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // APIs Supabase e requisições dinâmicas usam Network-First com fallback para cache
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/auth/v1/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clona a resposta para atualizar o cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Assets estáticos (fontes, logos, scripts) usam Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Silently capture fetch errors when offline for cached items
      });
      return cachedResponse || fetchPromise;
    })
  );
});
