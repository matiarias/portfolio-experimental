import { defineConfig, devices } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ? Number(process.env.PLAYWRIGHT_PORT) : 3100;
const local = `http://127.0.0.1:${port}`;
const preview = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  use: {
    baseURL: preview ?? local,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: preview ? undefined : {
    command: `npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: local,
    reuseExistingServer: !process.env.CI,
  },
});
