// @ts-nocheck

// ===================== Cache-Control basic =====================

res.setHeader("Cache-Control", "max-age=20");

// ===================== Cache-Control must-revalidate =====================

const etag = md5(file);

// res.setHeader("Cache-Control", "max-age=10");
res.setHeader("Cache-Control", "max-age=0, must-revalidate");
res.setHeader("Etag", etag);

const ifNoneMatch = req.headers["if-none-match"];
if (ifNoneMatch === etag) {
  res.statusCode = 304;
  res.end();
} else {
  res.statusCode = 200;
  res.end(file);
}

// ===================== CacheStorage Setup (Cache Only) =====================

// server.js

const NO_STORE = ["/sw.js"];

if (NO_STORE.includes(url.pathname)) {
  res.setHeader("Cache-Control", "no-cache, no-store");
} else {
  // ...
}

// Layout.astro

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(() => {
    console.log("Service Worker registered.");
  });
}

// sw.js

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

// ===================== CacheStorage+ (SWR) =====================

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

// ===================== Notify offline mode =====================

// sw.js

async function postMessage(message) {
  const clients = await self.clients.matchAll({ type: "window" });
  for (const client of clients) {
    client.postMessage(message);
  }
}

// ... in SWR fn catch callback
console.error(`Could not revalidate ${event.request.url}: `, reason);
postMessage("OFFLINE");

// Layout.astro

navigator.serviceWorker.onmessage = (event) => {
  if (event.data === "OFFLINE") {
    document.getElementById("offline-warning").classList.remove("hidden");
  }
};

// ===================== Offline submit =====================

importScripts("https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js");

function storeSubmission(event) {
  return event.request
    .json()
    .then((story) => {
      return idbKeyval.update("submissions", (submissions) =>
        submissions ? [...submissions, story] : [story]
      );
    })
    .then(() => new Response(undefined, { status: 201 }));
}

function getSubmissions() {
  return idbKeyval
    .get("submissions")
    .then((stories) => new Response(JSON.stringify(stories ?? [])));
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  let response;

  if (url.pathname === "/submit.json") {
    response = storeSubmission(event);
  } else if (url.pathname === "/submissions.json") {
    response = getSubmissions();
  } else if (url.origin.includes("hacker-news")) {
    response = networkFirst(event);
  } else {
    response = staleWhileRevalidate(event);
  }

  event.respondWith(response);
});
