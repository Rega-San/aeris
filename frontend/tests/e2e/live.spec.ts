import { test, expect, type Page } from "@playwright/test";

async function openLiveWeather(page: Page) {
  const responsePromise = page.waitForResponse(response =>
    response.url().includes("/api/weather?city=Marseille"),
  );
  await page.goto("/");
  const response = await responsePromise;
  const body = await response.json();
  console.log(JSON.stringify({ endpoint: "weather", status: response.status(), city: body.location?.name, historySaved: body.historySaved, error: body.error }));
  expect(response.status(), JSON.stringify(body)).toBe(200);
  expect(body.historySaved).toBe(true);
}

test("real weather, search, map and errors on desktop", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openLiveWeather(page);
  await expect(
    page.getByRole("heading", { name: "Marseille", exact: true }),
  ).toBeVisible({ timeout: 25000 });
  await expect(page.locator(".forecast-card")).toHaveCount(5);
  await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible({
    timeout: 20000,
  });
  await page.locator(".leaflet-marker-icon").click();
  await expect(page.locator(".leaflet-popup-content")).toContainText(
    "Marseille",
  );
  await page.getByRole("button", { name: "Zoom in" }).click();
  await page.locator(".weather-map").dragTo(page.locator(".weather-map"), {
    sourcePosition: { x: 230, y: 150 },
    targetPosition: { x: 330, y: 190 },
  });
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.screenshot({
    path: "test-results/aeris-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("textbox", { name: "Rechercher une ville" })
    .fill("Tokyo");
  await page
    .getByRole("textbox", { name: "Rechercher une ville" })
    .press("Enter");
  await expect(
    page.getByRole("heading", { name: "Tokyo", exact: true }),
  ).toBeVisible({ timeout: 25000 });
  await page.locator(".leaflet-marker-icon").click();
  await expect(page.locator(".leaflet-popup-content")).toContainText("Tokyo");
  await page
    .getByRole("textbox", { name: "Rechercher une ville" })
    .fill("zzzxqvnotacityxx");
  await page
    .getByRole("textbox", { name: "Rechercher une ville" })
    .press("Enter");
  await expect(page.locator(".error-state")).toContainText(
    "Ville introuvable",
    { timeout: 20000 },
  );
  await page.getByRole("textbox", { name: "Rechercher une ville" }).fill("");
  await page
    .getByRole("textbox", { name: "Rechercher une ville" })
    .press("Enter");
  await expect(page.locator(".error-state")).toContainText(
    "au moins deux caractères",
  );
  expect(errors).toEqual([]);
});

test("mobile navigation, responsive layout and successive searches", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openLiveWeather(page);
  await expect(
    page.getByRole("heading", { name: "Marseille", exact: true }),
  ).toBeVisible({ timeout: 25000 });
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await expect(
    page.getByRole("navigation", { name: "Navigation mobile" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Navigation mobile" })
    .getByRole("link", { name: "Prévisions" })
    .click();
  await expect(
    page.getByRole("navigation", { name: "Navigation mobile" }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible({
    timeout: 20000,
  });
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.screenshot({
    path: "test-results/aeris-mobile.png",
    fullPage: true,
  });
  await page
    .locator(".popular")
    .getByRole("button", { name: "Paris", exact: true })
    .click();
  await page
    .locator(".popular")
    .getByRole("button", { name: "Londres", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Londres", exact: true }),
  ).toBeVisible({ timeout: 25000 });
  await expect(page.locator(".forecast-card")).toHaveCount(5);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
