importScripts("https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js");

const CACHE_NAME = "assets_v1";
const ASSETS = [
  "favicon.svg",
  // HTML files
  "/",
  "ask",
  "new",
  "show",
  "submit",
  // CSS files
  "_astro/ask.css",
  // JS files
  "_astro/client.js",
  "_astro/index.js",
  "_astro/jsx-runtime.js",
  "_astro/StoriesListContainer.js",
  "_astro/StorySubmissionForm.js",
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

// ----- HELPERS -----

async function postMessage(message) {
  const clients = await self.clients.matchAll({ type: "window" });
  for (const client of clients) {
    client.postMessage(message);
  }
}

// ----- FETCH EVENT HANDLER -----

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
        postMessage("OFFLINE");
      });

    return cachedResponse || networkFetch;
  });
}

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
  let response;
  const url = new URL(event.request.url);

  if (url.origin === "https://hacker-news.firebaseio.com") {
    if (url.pathname.endsWith("submit.json")) {
      response = storeSubmission(event);
    } else if (url.pathname.endsWith("submissions.json")) {
      response = getSubmissions();
    } else {
      response = staleWhileRevalidate(event);
    }
  } else {
    response = staleWhileRevalidate(event);
  }

  event.respondWith(response);
});