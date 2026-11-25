import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const base = process.env.AERIS_URL || "http://localhost:4000";
const before = JSON.parse(
  await readFile(".local/persistence-proof.json", "utf8"),
);
const response = await fetch(`${base}/api/searches`);
assert.equal(response.status, 200);
const after = (await response.json()).searches.find(
  (row) => row.id === before.id,
);
assert.deepEqual(after, before);
console.log(JSON.stringify({ persisted: after }));
console.log(
  "VALIDÉ : la même ligne existe après le redémarrage effectué séparément.",
);
