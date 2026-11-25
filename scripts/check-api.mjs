import assert from "node:assert/strict";
const base = process.env.AERIS_URL || "http://localhost:4000";
for (const city of [
  "Marseille",
  "Paris",
  "Londres",
  "Tokyo",
  "New York",
  "zzzxqvnotacityxx",
  "",
  "x",
]) {
  const response = await fetch(
    `${base}/api/weather?city=${encodeURIComponent(city)}`,
  );
  const body = await response.json();
  const expected = ["", "x"].includes(city)
    ? 400
    : city === "zzzxqvnotacityxx"
      ? 404
      : 200;
  console.log(
    JSON.stringify({
      city,
      status: response.status,
      location: body.location?.name,
      days: body.forecast?.length,
      error: body.error,
    }),
  );
  assert.equal(response.status, expected);
  if (expected === 200) {
    assert.equal(body.forecast.length, 5);
    assert.equal(typeof body.current.temperature, "number");
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(typeof body.historySaved, "boolean");
  }
}
