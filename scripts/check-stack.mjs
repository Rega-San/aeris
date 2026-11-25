import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.AERIS_URL || "http://localhost:4000";
for (const path of ["health", "health/db"]) {
  const response = await fetch(`${base}/api/${path}`);
  const data = await response.json();
  assert.equal(response.status, 200);
  if (path === "health/db") assert.equal(data.result, 1);
  console.log(
    JSON.stringify({ endpoint: `/api/${path}`, status: response.status, data }),
  );
}
const response = await fetch(`${base}/api/weather?city=Marseille`);
const weather = await response.json();
assert.equal(response.status, 200);
assert.equal(weather.historySaved, true);
assert.equal(weather.forecast.length, 5);
const history = await (await fetch(`${base}/api/searches`)).json();
assert.ok(history.searches.length > 0 && history.searches.length <= 10);
assert.equal(history.searches[0].city, weather.location.name);
console.log(
  JSON.stringify({
    weather: weather.location.name,
    historySaved: weather.historySaved,
    historyRow: history.searches[0],
  }),
);
await mkdir(".local", { recursive: true });
await writeFile(
  ".local/persistence-proof.json",
  JSON.stringify(history.searches[0]),
);
console.log(
  "VALIDÉ : API -> Open-Meteo ; API -> PostgreSQL ; lecture de la recherche enregistrée.",
);
