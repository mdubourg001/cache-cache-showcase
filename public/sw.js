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
    caches.open("assets").then((cache) => {
      return cache.addAll(ASSETS);
    })
  );

  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (new URL(event.request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
