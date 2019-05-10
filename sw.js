"use strict";

const CACHE_NAME = 'mobile-start-v16';
const LOG_PREFIX = '[worker]';

console.info(LOG_PREFIX, 'starting');

const offlineFundamentals = [
    'assets/images/icon512.png',
    'assets/images/icon128.png',
    'assets/images/icon16.png',
    'assets/images/icon.svg',
    'assets/images/default.svg',
    'assets/images/landing.svg',
    'assets/scripts/app.js',
    'assets/styles/app.css',
    'index.html',
    'manifest.json',
    'sw.js',
    '.',
];

const cacheWhiteList = [
    'https://icons.duckduckgo.com/',
    'https://www.google.com/s2/favicons',
];

self.addEventListener("install", event => {
    console.info(LOG_PREFIX, 'install event in progress.');
    self.skipWaiting();

    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(cache => cache.addAll(offlineFundamentals))
            .then(_ => console.log(LOG_PREFIX, 'install completed'))
    );
});

self.addEventListener("fetch", event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches
            .match(event.request)
            .then(response => {
                // cached
                if (response) return response;

                // online - external
                for (let item of cacheWhiteList) {
                    if (event.request.url.indexOf(item) !== -1) {
                        const request = new Request(event.request.url, { mode: 'no-cors' });

                        return fetch(request).then(response => {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, responseToCache);
                                });

                            return response;
                        });
                    }
                }

                // online - internal
                return fetch(event.request)
                    .then(response => {
                        // response validation
                        const validResponse = () => {
                            if (!response) return false;
                            if (response.status !== 200) return false;
                            if (response.type !== 'basic') return false;
                        };

                        if (validResponse()) {
                            console.log(
                                LOG_PREFIX,
                                'fetch validation failed',
                                {
                                    response,
                                    url: response.url,
                                    status: response.status,
                                    type: response.type,
                                    request: event.request
                                }
                            );

                            return response || new Response('bb', { status: 503, statusText: 'Service unavailable' });
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response || new Response('aa', { status: 503, statusText: 'Service unavailable' });
                    })
                    .catch(e => console.error(LOG_PREFIX, 'fetch failed', { event, request: event.request, e }));
            })
    );
});

self.addEventListener("activate", event => {
    console.info(LOG_PREFIX, 'activate event in progress', event);

    event.waitUntil(
        caches
            .keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(_ => console.info(LOG_PREFIX, 'activate completed'))
    );
});
