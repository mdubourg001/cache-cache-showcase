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

function networkFirst(event) {
  return caches.match(event.request).then((cachedResponse) => {
    const networkResponse = fetch(event.request)
      .then((response) => {
        const cloned = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, cloned);
        });

        return response;
      })
      .catch(() => {
        console.log(
          `Could not serve ${event.request.url} from network, serving from cache`
        );

        return cachedResponse;
      });

    return networkResponse || cachedResponse;
  });
}

function staleWhileRevalidate(event) {
  return caches.match(event.request).then((cachedResponse) => {
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
  });
}

self.addEventListener("fetch", (event) => {
  let response;
  const url = new URL(event.request.url);

  if (url.origin.includes("hacker-news")) {
    response = networkFirst(event);
  } else if (ASSETS.includes(url.pathname)) {
    response = staleWhileRevalidate(event);
  } else {
    return;
  }

  event.respondWith(response);
});
