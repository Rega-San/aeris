import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test, afterEach } from "node:test";
import ts from "typescript";
const source = await readFile(
  new URL("../src/services/weather.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { getWeather, validateCity } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);
const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});
const geo = {
  results: [
    {
      name: "Marseille",
      country: "France",
      admin1: "Provence",
      latitude: 43.3,
      longitude: 5.4,
    },
  ],
};
const forecast = {
  timezone: "Europe/Paris",
  current: {
    time: "2026-11-23T12:00",
    temperature_2m: 12,
    apparent_temperature: 10,
    relative_humidity_2m: 75,
    wind_speed_10m: 15,
    precipitation: 0,
    weather_code: 2,
    is_day: 1,
  },
  daily: {
    time: [
      "2026-11-23",
      "2026-11-24",
      "2026-11-25",
      "2026-11-26",
      "2026-11-27",
      "2026-11-28",
    ],
    temperature_2m_max: [15, 16, 17, 18, 19, 20],
    temperature_2m_min: [5, 6, 7, 8, 9, 10],
    weather_code: [0, 1, 2, 3, 61, 95],
  },
};
test("validation accepts international city names and rejects invalid inputs", () => {
  for (const city of ["Tokyo", "東京", "São Paulo", "L'Haÿ-les-Roses"])
    assert.equal(validateCity(city), city);
  assert.equal(validateCity("  New   York  "), "New York");
  for (const city of [null, "", "x", "123", "<Paris>", "a".repeat(101)])
    assert.throws(() => validateCity(city), { status: 400 });
});
test("normalizes measurements and excludes today from the five-day forecast", async () => {
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(url);
    return Response.json(calls.length === 1 ? geo : forecast);
  };
  const result = await getWeather("Marseille");
  assert.equal(result.current.temperature, 12);
  assert.equal(result.forecast.length, 5);
  assert.equal(result.forecast[0].date, "2026-11-24");
  assert.equal(result.forecast[4].code, 95);
  assert.equal(calls[1].searchParams.get("timezone"), "auto");
  assert.equal(calls[1].searchParams.get("forecast_days"), "6");
});
test("unknown city produces a 404", async () => {
  globalThis.fetch = async () => Response.json({});
  await assert.rejects(getWeather("Unknown"), { status: 404 });
});
test("upstream HTTP errors produce a 502", async () => {
  globalThis.fetch = async () => new Response(null, { status: 429 });
  await assert.rejects(getWeather("Paris"), { status: 502 });
});
test("upstream timeouts produce a 504", async () => {
  globalThis.fetch = async () => {
    throw new DOMException("Timed out", "TimeoutError");
  };
  await assert.rejects(getWeather("Paris"), { status: 504 });
});
test("missing measurements are rejected instead of becoming false zero values", async () => {
  let calls = 0;
  globalThis.fetch = async () =>
    Response.json(
      ++calls === 1
        ? geo
        : {
            ...forecast,
            current: { ...forecast.current, temperature_2m: null },
          },
    );
  await assert.rejects(getWeather("Paris"), { status: 502 });
});
test("incomplete daily data is rejected", async () => {
  let calls = 0;
  globalThis.fetch = async () =>
    Response.json(
      ++calls === 1
        ? geo
        : { ...forecast, daily: { ...forecast.daily, time: ["2026-11-23"] } },
    );
  await assert.rejects(getWeather("Paris"), { status: 502 });
});
