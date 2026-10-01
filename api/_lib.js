// Shared helpers for the SunnyToolsPro API endpoints.
// Runs as a Vercel Serverless Function (Node.js runtime) and inside the local dev server.
const TTL_MS = 60 * 1000;

const cache = new Map();

function cached(key, loader) {
  const hit = cache.get(key);
  const now = Date.now();
  if (hit && now - hit.at < TTL_MS) return Promise.resolve(hit.data);
  return loader().then((data) => {
    cache.set(key, { at: now, data });
    if (cache.size > 200) cache.clear();
    return data;
  });
}

function upstream(url) {
  return fetch(url, { headers: { "user-agent": "sunnytoolspro/1.0" } }).then((res) => {
    if (!res.ok) throw new Error("upstream " + res.status);
    return res.json();
  });
}

function sendJSON(res, obj, status) {
  res.writeHead(status || 200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(obj));
}

function query(req) {
  return new URL(req.url, "http://localhost").searchParams;
}

module.exports = { cached, upstream, sendJSON, query };
