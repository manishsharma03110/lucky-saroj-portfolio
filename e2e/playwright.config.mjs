import { defineConfig, devices } from "playwright/test";
const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
if (!["127.0.0.1", "localhost", "[::1]"].includes(new URL(baseURL).hostname)) {
  throw new Error("This mutation suite runs only against a disposable localhost application.");
}
export default defineConfig({
  testDir: "./tests", fullyParallel: false, workers: 1, retries: process.env.CI ? 1 : 0,
  maxFailures: 3,
  timeout: 60000, expect: { timeout: 15000 },
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "./setup.mjs",
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "firefox-audit", testMatch: /production-audit.spec.mjs/, use: { ...devices["Desktop Firefox"] } },
    { name: "webkit-audit", testMatch: /production-audit.spec.mjs/, use: { ...devices["Desktop Safari"] } }
  ],
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1",
    cwd: "..", url: baseURL, reuseExistingServer: false, timeout: 180000
  }
});
