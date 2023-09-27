import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export function SNCFNetwork() {
  return new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
}

export function getContentType(url = "") {
  const contentType = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
  }[path.extname(url)];

  if (!contentType) {
    return "text/html";
  }

  return contentType;
}

export function getFromDist(url = "", distDir = "dist") {
  if (["/", ""].includes(url)) {
    return getFromDist("index.html");
  }

  try {
    const file = fs.readFileSync(path.join(distDir, url), {
      encoding: "utf-8",
    });

    return file;
  } catch (error) {
    if (/\.html$/.test(url)) {
      console.log(`404: ${url}`);

      throw new Error(404);
    }

    return getFromDist(`${url}/index.html`);
  }
}

export function md5(content) {
  return crypto.createHash("md5").update(content).digest("hex");
}
