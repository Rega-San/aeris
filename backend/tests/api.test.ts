import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createApp } from "../src/app.js";
import { WeatherError, type getWeather } from "../src/services/weather.js";
import { createCachedWeatherProvider } from "../src/services/cache.js";
import {
  createRepository,
  type SearchRepository,
} from "../src/database/repository.js";
import type { Pool } from "pg";
import type { WeatherData } from "../src/types/weather.js";
const weather: WeatherData = {
  location: {
    name: "L'Haÿ-les-Roses",
    country: "France",
    region: "",
    latitude: 48.78,
    longitude: 2.33,
    timezone: "Europe/Paris",
  },
  current: {
    time: "2026-11-23T12:00",
    temperature: 12,
    feelsLike: 10,
    humidity: 65,
    windSpeed: 15,
    precipitation: 0,
    code: 2,
    isDay: true,
  },
  forecast: Array.from({ length: 5 }, (_, i) => ({
    date: `2026-11-${24 + i}`,
    min: 5,
    max: 12,
    code: 2,
  })),
};
const healthyRepository: SearchRepository = {
  ping: async () => 1,
  recordSearch: async () => {},
  recentSearches: async () => [
    {
      id: "1",
      city: "Paris",
      country: "France",
      searchedAt: "2026-11-23T12:00:00Z",
    },
  ],
};
async function withApi(
  repository: SearchRepository,
  provider: typeof getWeather,
  run: (base: string) => Promise<void>,
) {
  const server = createApp(repository, provider).listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}
test("health API et véritable contrat de réponse DB", async () => {
  let queries = 0;
  await withApi(
    {
      ...healthyRepository,
      ping: async () => {
        queries++;
        return 1;
      },
    },
    async () => weather,
    async (base) => {
      assert.equal((await fetch(`${base}/api/health`)).status, 200);
      assert.deepEqual(await (await fetch(`${base}/api/health/db`)).json(), {
        status: "ok",
        database: "postgresql",
        result: 1,
      });
      assert.equal(queries, 1);
    },
  );
});
test("entrées invalides refusées avant tout appel fournisseur", async () => {
  let calls = 0;
  await withApi(
    healthyRepository,
    async () => {
      calls++;
      return weather;
    },
    async (base) => {
      for (const query of [
        "",
        "?city=",
        "?city=x",
        "?city=Paris&city=Tokyo",
        "?city=%3CParis%3E",
      ])
        assert.equal((await fetch(`${base}/api/weather${query}`)).status, 400);
      assert.equal(calls, 0);
    },
  );
});
test("chaque météo réussie est enregistrée avant la réponse ; pas de cache HTTP", async () => {
  const saved: string[][] = [];
  await withApi(
    {
      ...healthyRepository,
      recordSearch: async (city, country) => {
        saved.push([city, country]);
      },
    },
    async () => weather,
    async (base) => {
      for (let i = 0; i < 2; i++) {
        const response = await fetch(`${base}/api/weather?city=Paris`);
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("cache-control"), "no-store");
        const body = await response.json();
        assert.equal(body.historySaved, true);
        assert.equal(body.forecast.length, 5);
      }
      assert.deepEqual(saved, [
        ["L'Haÿ-les-Roses", "France"],
        ["L'Haÿ-les-Roses", "France"],
      ]);
    },
  );
});
test("404, 502 et 504 fournisseur conservés sans enregistrement", async () => {
  for (const status of [404, 502, 504]) {
    let saved = false;
    await withApi(
      {
        ...healthyRepository,
        recordSearch: async () => {
          saved = true;
        },
      },
      async () => {
        throw new WeatherError("Indisponible", status);
      },
      async (base) => {
        assert.equal(
          (await fetch(`${base}/api/weather?city=Paris`)).status,
          status,
        );
        assert.equal(saved, false);
      },
    );
  }
});
test("panne DB : health et historique 503, météo préservée avec avertissement", async () => {
  const fail = async () => {
    throw new Error("connection refused with secret details");
  };
  await withApi(
    { ping: fail, recordSearch: fail, recentSearches: fail },
    async () => weather,
    async (base) => {
      for (const path of ["health/db", "searches"]) {
        const response = await fetch(`${base}/api/${path}`);
        assert.equal(response.status, 503);
        assert.doesNotMatch(await response.text(), /secret/);
      }
      const response = await fetch(`${base}/api/weather?city=Paris`);
      assert.equal(response.status, 200);
      assert.equal((await response.json()).historySaved, false);
    },
  );
});
test("historique structuré et erreur inattendue sans détails internes", async () => {
  await withApi(
    healthyRepository,
    async () => {
      throw new Error("sensitive");
    },
    async (base) => {
      assert.equal(
        (await (await fetch(`${base}/api/searches`)).json()).searches[0].city,
        "Paris",
      );
      const response = await fetch(`${base}/api/weather?city=Paris`);
      assert.equal(response.status, 500);
      assert.doesNotMatch(await response.text(), /sensitive/);
    },
  );
});
test("SQL paramétré et liste limitée à 10 lignes", async () => {
  const calls: { sql: string; values: unknown[] }[] = [];
  const pool = {
    query: async (sql: string, values: unknown[] = []) => {
      calls.push({ sql, values });
      return { rows: [] };
    },
  } as unknown as Pool;
  const repo = createRepository(pool);
  await repo.recordSearch("Paris'); DROP TABLE searches;--", "France");
  await repo.recentSearches();
  assert.equal(
    calls[0].sql,
    "INSERT INTO searches (city, country) VALUES ($1, $2)",
  );
  assert.equal(calls[0].values[0], "Paris'); DROP TABLE searches;--");
  assert.match(calls[1].sql, /LIMIT \$1/);
  assert.deepEqual(calls[1].values, [10]);
});
test("cache fournisseur expirant après 5 minutes", async () => {
  let now = 0,
    calls = 0;
  const provider = createCachedWeatherProvider(
    async () => {
      calls++;
      return weather;
    },
    () => now,
  );
  await provider("Paris");
  await provider("PARIS");
  assert.equal(calls, 1);
  now = 300001;
  await provider("Paris");
  assert.equal(calls, 2);
});
