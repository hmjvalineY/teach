/**
 * Service Worker — 離線快取策略
 * 採用 Cache First + Network Fallback 模式
 * 讓互動模擬頁面在離線時也能使用
 */

const CACHE_NAME = 'teach-v1';

// 需要預快取的核心資源
const PRECACHE_URLS = [
    './',
    './index.html',
    './courses.html',
    './learning-paths.html',
    './teacher-tools.html',
    './progress.html',
    './tokens.css',
    './nav-global.css',
    './nav-global.js',
    './style.css',
];

// === 安裝事件：預快取核心資源 ===
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// === 啟動事件：清除舊快取 ===
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// === 攔截請求：Cache First 策略 ===
self.addEventListener('fetch', (event) => {
    // 只處理 GET 請求
    if (event.request.method !== 'GET') return;

    // 跳過外部資源（如 Google Fonts CDN）
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) {
                // 同時在背景更新快取（Stale-While-Revalidate）
                fetch(event.request).then(response => {
                    if (response && response.status === 200) {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, response);
                        });
                    }
                }).catch(() => {});
                return cached;
            }

            // 快取中沒有，從網路取得
            return fetch(event.request).then(response => {
                if (!response || response.status !== 200) return response;
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, clone);
                });
                return response;
            }).catch(() => {
                // 離線且無快取：返回離線頁面（如果是 HTML 請求）
                if (event.request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
