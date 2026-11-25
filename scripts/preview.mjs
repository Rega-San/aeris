// Serveur de vérification locale de l'export ; l'image de production utilise Nginx.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(
  fileURLToPath(new URL("../frontend/out/", import.meta.url)),
);
const backend = new URL(process.env.BACKEND_URL || "http://127.0.0.1:4000");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".txt": "text/plain",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};
const server = http.createServer(async (req, res) => {
  if (req.url?.startsWith("/api/")) {
    const upstream = http.request(
      new URL(req.url, backend),
      { method: req.method, headers: { ...req.headers, host: backend.host } },
      (reply) => {
        res.writeHead(reply.statusCode || 502, reply.headers);
        reply.pipe(res);
      },
    );
    upstream.setTimeout(25000, () => upstream.destroy());
    upstream.on("error", () => {
      if (!res.headersSent)
        res.writeHead(503, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ error: "API inaccessible. Vérifiez le backend." }),
      );
    });
    req.pipe(upstream);
    return;
  }
  if (!["GET", "HEAD"].includes(req.method || "")) {
    res.writeHead(405);
    res.end();
    return;
  }
  try {
    const path = decodeURIComponent(
      new URL(req.url || "/", "http://localhost").pathname,
    );
    let file = resolve(root, `.${path}`);
    if (file !== root && !file.startsWith(`${root}/`)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
    });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
const port = Number(process.env.PREVIEW_PORT || 3001);
server.listen(port, "127.0.0.1", () =>
  console.log(`Export statique servi sur http://localhost:${port}`),
);
process.on("SIGTERM", () => server.close());
process.on("SIGINT", () => server.close());
