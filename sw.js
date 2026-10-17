// Bump when PRECACHE changes.
const CACHE = 'jsspim-v1';
const PRECACHE = [
    './',
    'index.html',
    'manifest.webmanifest',
    'css/bootstrap.min.css',
    'css/index.css',
    'css/xcode.css',
    'js/execution.js',
    'js/highlight.min.js',
    'js/index.js',
    'js/instruction.js',
    'js/memory-content.js',
    'js/memory.js',
    'js/register.js',
    'wasm.js',
    'wasm.wasm',
    'wasm.data',
    'Tests/fibonacci.s',
    'Tests/test_core.s',
    'Tests/test_le.s',
    'Tests/test_sys_call.s',
    'Tests/hello_world.s',
    'Tests/read_string.s',
    'Tests/timing.s',
    'Tests/timer_interrupt.s',
    'icons/icon.svg',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE)
        .then(cache => cache.addAll(PRECACHE))
        .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
    event.waitUntil(caches.keys()
        .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
        .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) {
        return;
    }

    const cachePromise = caches.open(CACHE);
    const networkResponse = cachePromise.then(async cache => {
        const response = await fetch(event.request);
        if (response.ok) {
            await cache.put(event.request, response.clone());
        }
        return response;
    });

    // A failed background refresh must not prevent cached offline use.
    event.waitUntil(networkResponse.then(() => {}, () => {}));
    event.respondWith(cachePromise.then(async cache => {
        return (await cache.match(event.request)) || networkResponse;
    }));
});
