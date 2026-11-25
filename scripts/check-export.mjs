import assert from "node:assert/strict";
import { readFile, access, readdir } from "node:fs/promises";
const root = new URL("../frontend/out/", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
assert.match(html, /Explorez le monde/);
await access(new URL("_next/static/", root));
assert.equal((await readdir(root)).includes("api"), false);
console.log(
  "VALIDÉ : frontend/out/index.html et assets statiques présents ; aucune route API dans l’export.",
);
const base = process.env.AERIS_URL || "http://localhost:3001";
const response = await fetch(base);
assert.equal(response.status, 200);
assert.match(await response.text(), /Explorez le monde/);
console.log(
  `VALIDÉ : export servi par HTTP (${response.status}), sans serveur Next.js.`,
);
