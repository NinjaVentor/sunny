// Local dev server for SunnyToolsPro — serves static files and routes /api/*
// to the same serverless handlers that run in production (api/*.js on Vercel).
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const api = {
  "/api/fx": require("./api/fx"),
  "/api/weather": require("./api/weather"),
  "/api/geocode": require("./api/geocode"),
  "/api/gold": require("./api/gold"),
};

function sendJSON(res, obj, status) {
  res.writeHead(status || 200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.startsWith("/api/")) {
      const handler = api[url.pathname];
      if (handler) return handler(req, res);
      return sendJSON(res, { error: "unknown endpoint" }, 404);
    }
    let filePath = path.join(ROOT, path.normalize(decodeURIComponent(url.pathname)));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    // Never expose server internals: block server.js, manifests, dotfiles/dirs.
    var rel = path.relative(ROOT, filePath);
    var parts = rel.split(path.sep);
    var blocked = ["server.js", "package.json", "package-lock.json"];
    if (parts.some(function (s) { return s.startsWith(".") || blocked.indexOf(s) !== -1; })) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    if (url.pathname === "/" || url.pathname === "") filePath = path.join(ROOT, "index.html");
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Server error");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  process.stdout.write("SunnyToolsPro demo running at http://localhost:" + PORT + "\n");
});
