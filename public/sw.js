const CACHE_NAME = "assets_v1";
const ASSETS = [
  "/favicon.svg",
  // HTML files
  "/",
  "/ask",
  "/new",
  "/show",
  "/submit",
  "/item",
  // CSS files
  "/_astro/ask.css",
  // JS files
  "/_astro/client.js",
  "/_astro/index.js",
  "/_astro/jsx-runtime.js",
  "/_astro/StoriesListContainer.js",
  "/_astro/StorySubmissionForm.js",
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

function cacheOnly(event) {
  return caches.match(event.request).then((cachedResponse) => {
    return cachedResponse || fetch(event.request);
  });
}

self.addEventListener("fetch", (event) => {
  let response = cacheOnly(event);

  event.respondWith(response);
});
