import assert from "node:assert/strict";
const base = process.env.AERIS_URL || "http://localhost:4000";
for (const endpoint of ["health/db", "searches"]) {
  const response = await fetch(`${base}/api/${endpoint}`);
  assert.equal(response.status, 503);
  console.log(
    JSON.stringify({
      endpoint,
      status: response.status,
      body: await response.json(),
    }),
  );
}
const response = await fetch(`${base}/api/weather?city=Marseille`);
const data = await response.json();
assert.equal(response.status, 200);
assert.equal(data.historySaved, false);
console.log(
  JSON.stringify({
    endpoint: "weather",
    status: response.status,
    historySaved: data.historySaved,
  }),
);
