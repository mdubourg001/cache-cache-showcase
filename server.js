import http from "node:http";

import { getContentType, getFromDist, md5 } from "./helpers.server.js";

const NO_STORE = ["/sw.js"];

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  try {
    const file = getFromDist(url.pathname);
    const contentType = getContentType(url.pathname);
    const etag = md5(file);

    res.setHeader("Content-Type", contentType);

    if (NO_STORE.includes(url.pathname)) {
      res.setHeader("Cache-Control", "no-cache, no-store");
    } else {
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Etag", etag);
    }

    const ifNoneMatch = req.headers["if-none-match"];
    if (ifNoneMatch === etag) {
      res.statusCode = 304;
    } else {
      res.statusCode = 200;
    }

    res.end(file);
  } catch (error) {
    res.writeHead(error.message);
    res.end();
  }
});

server.listen(1234);
console.log("Server up at http://localhost:1234...");
