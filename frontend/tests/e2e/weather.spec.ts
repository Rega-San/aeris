import { test, expect, type Page } from "@playwright/test";
import { fixtureWeather } from "../fixtures/weather";

async function mockNetwork(page: Page) {
  await page.route("https://tile.openstreetmap.org/**", (route) =>
    route.fulfill({
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1cAAAAASUVORK5CYII=",
        "base64",
      ),
    }),
  );
  await page.route("**/api/searches", (route) =>
    route.fulfill({ json: { searches: [] } }),
  );
  await page.route("**/api/weather?*", (route) => {
    const city = new URL(route.request().url()).searchParams.get("city")!;
    return route.fulfill(
      city === "zzzxqvnotacityxx"
        ? {
            status: 404,
            json: { error: "Ville introuvable. Vérifiez l’orthographe." },
          }
        : { json: fixtureWeather(city) },
    );
  });
}
test.beforeEach(async ({ page }) => {
  await mockNetwork(page);
});

test("météo, prévisions, recherche et carte sans dépendance réseau", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Marseille", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".forecast-card")).toHaveCount(5);
  await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible();
  await page.locator(".leaflet-marker-icon").click();
  await expect(page.locator(".leaflet-popup-content")).toContainText(
    "Marseille",
  );
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Rechercher une ville" })
    .fill("Tokyo");
  await page
    .getByRole("textbox", { name: "Rechercher une ville" })
    .press("Enter");
  await expect(
    page.getByRole("heading", { name: "Tokyo", exact: true }),
  ).toBeVisible();
  await page.locator(".leaflet-marker-icon").click();
  await expect(page.locator(".leaflet-popup-content")).toContainText("Tokyo");
  expect(errors).toEqual([]);
});
test("timeout fournisseur affiché, puis nouvelle tentative réussie", async ({
  page,
}) => {
  let unavailable = true;
  await page.route("**/api/weather?*", (route) =>
    route.fulfill(
      unavailable
        ? {
            status: 504,
            json: {
              error:
                "Le service météo met trop de temps à répondre. Réessayez.",
            },
          }
        : { json: fixtureWeather() },
    ),
  );
  await page.goto("/");
  await expect(page.locator(".error-state")).toContainText("trop de temps");
  await expect(page.locator(".current-card")).toHaveCount(0);
  unavailable = false;
  await page.getByRole("button", { name: "Réessayer" }).click();
  await expect(
    page.getByRole("heading", { name: "Marseille", exact: true }),
  ).toBeVisible();
});
test("ville inconnue et champ vide", async ({ page }) => {
  await page.goto("/");
  const input = page.getByRole("textbox", { name: "Rechercher une ville" });
  await input.fill("zzzxqvnotacityxx");
  await input.press("Enter");
  await expect(page.locator(".error-state")).toContainText("Ville introuvable");
  await input.fill("");
  await input.press("Enter");
  await expect(page.locator(".error-state")).toContainText(
    "au moins deux caractères",
  );
});
test("une réponse ancienne ne remplace pas une nouvelle recherche", async ({
  page,
}) => {
  let release!: () => void;
  const delayed = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/weather?city=Paris", async (route) => {
    await delayed;
    await route.fulfill({ json: fixtureWeather("Paris") });
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Marseille", exact: true }),
  ).toBeVisible();
  const pending = page.waitForRequest("**/api/weather?city=Paris");
  await page.getByRole("button", { name: "Paris", exact: true }).click();
  await pending;
  await page.getByRole("button", { name: "Londres", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Londres", exact: true }),
  ).toBeVisible();
  release();
  await expect(
    page.getByRole("heading", { name: "Paris", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Londres", exact: true }),
  ).toBeVisible();
});
test("menu mobile et absence de débordement de 320 à 1440 px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".current-card")).toBeVisible();
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await page
    .getByRole("navigation", { name: "Navigation mobile" })
    .getByRole("link", { name: "Prévisions" })
    .click();
  await expect(
    page.getByRole("navigation", { name: "Navigation mobile" }),
  ).toHaveCount(0);
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("historique cliquable sans supprimer les fonctionnalités météo", async ({
  page,
}) => {
  await page.route("**/api/searches", (route) =>
    route.fulfill({
      json: {
        searches: [
          {
            id: "1",
            city: "Paris",
            country: "France",
            searchedAt: "2026-11-23T12:00:00Z",
          },
        ],
      },
    }),
  );
  await page.goto("/");
  const history = page.getByRole("region", {
    name: "Historique des recherches",
  });
  await expect(history.getByRole("button", { name: /Paris/ })).toBeVisible();
  await history.getByRole("button", { name: /Paris/ }).click();
  await expect(
    page.getByRole("heading", { name: "Paris", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".forecast-card")).toHaveCount(5);
  await expect(page.locator(".weather-map")).toBeVisible();
});
test("panne de base signalée sans masquer la météo", async ({ page }) => {
  await page.route("**/api/searches", (route) =>
    route.fulfill({ status: 503, json: { error: "Historique indisponible" } }),
  );
  await page.route("**/api/weather?*", (route) =>
    route.fulfill({ json: { ...fixtureWeather(), historySaved: false } }),
  );
  await page.goto("/");
  await expect(page.locator(".current-card")).toBeVisible();
  await expect(
    page.getByText("Météo chargée, mais cette recherche"),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Historique des recherches" }),
  ).toContainText("temporairement indisponible");
});
test("proxy inaccessible : message compréhensible même pour une réponse HTML", async ({
  page,
}) => {
  await page.route("**/api/weather?*", (route) =>
    route.fulfill({
      status: 502,
      contentType: "text/html",
      body: "<h1>Bad Gateway</h1>",
    }),
  );
  await page.goto("/");
  await expect(page.locator(".error-state")).toContainText(
    "Vérifiez que l’API est démarrée",
  );
});
