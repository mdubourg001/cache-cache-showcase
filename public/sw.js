const CACHE_NAME = "assets_v1";
const ASSETS = [
  "favicon.svg",
  // HTML files
  "/",
  "ask",
  "new",
  "show",
  // CSS files
  "_astro/ask.css",
  // JS files
  "_astro/client.js",
  "_astro/index.js",
  "_astro/jsx-runtime.js",
  "_astro/StoriesListContainer.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );

  console.log("Installed service worker, skipping waiting...");
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (new URL(event.request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // stale-while-revalidate
      const networkFetch = fetch(event.request)
        .then((response) => {
          const clonedResponse = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });

          return response;
        })
        .catch(function (reason) {
          console.error(`Could not revalidate ${event.request.url}: `, reason);
        });

      return cachedResponse || networkFetch;
    })
  );
});
