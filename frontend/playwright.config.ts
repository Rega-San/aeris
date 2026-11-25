import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch:
    process.env.AERIS_LIVE === "1" ? "**/live.spec.ts" : "**/weather.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: process.env.AERIS_URL || "http://localhost:3000",
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: process.env.AERIS_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 60000,
      },
});
