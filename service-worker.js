const CACHE_NAME = 'bustime-cache-v1';
// Lista de todos os arquivos essenciais para o funcionamento offline
const urlsToCache = [
  '/',
  '/index.html',
  // O link do CDN do Tailwind CSS precisa ser cacheado para funcionar offline.
  // IMPORTANTE: O cache de CDNs pode ser problemático se o CDN mudar o arquivo.
  // Uma alternativa ideal seria baixar e hospedar o CSS localmente.
  'https://cdn.tailwindcss.com', 
  // Arquivos estáticos
  '/manifest.json',
  '/images/icon-192x192.png', 
  '/images/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap' // Cache da fonte
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache aberto e pre-cache iniciado.');
        // Adiciona todos os arquivos críticos ao cache
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Falha ao adicionar recursos ao cache:', error);
      })
  );
});

// Intercepta todas as requisições (Eventos de Fetch)
self.addEventListener('fetch', event => {
  // Estratégia Cache-First: Tenta buscar no cache primeiro, se falhar, busca na rede.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna o recurso do cache, se encontrado
        if (response) {
          return response;
        }

        // Se não estiver no cache, faz a requisição normal (rede)
        return fetch(event.request).catch(error => {
             // Caso a rede e o cache falhem, podemos retornar uma página offline aqui
             // console.log('Fetch failed; network and cache unavailable.', error);
             // return caches.match('/offline.html'); // Opcional: Crie uma página de erro
        });
      })
  );
});

// Ativação do Service Worker: Limpa caches antigos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
