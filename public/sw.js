const CACHE_NAME = 'univer-v3';

/* 설치 시 앱 셸 즉시 캐시 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        '/pirvate-univ/',
        '/pirvate-univ/index.html',
      ])
    )
  );
  self.skipWaiting();
});

/* 구 버전 캐시 정리 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Stale-while-revalidate: 캐시 우선 응답 후 백그라운드 갱신 */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  /* chrome-extension, data: 등 제외 */
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      const fetchPromise = fetch(event.request)
        .then((res) => {
          if (res.ok) cache.put(event.request, res.clone());
          return res;
        })
        .catch(() => cached); /* 오프라인이면 캐시 반환 */
      return cached ?? fetchPromise;
    })
  );
});
