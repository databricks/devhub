import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "tests/critical",
  outputDir: "test-results/critical",
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  timeout: 45_000,
  reporter: isCI
    ? [
        ["list"],
        [
          "html",
          {
            open: "never",
            outputFolder: "playwright-report/critical",
          },
        ],
      ]
    : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        permissions: ["clipboard-read", "clipboard-write"],
      },
    },
    {
      name: "emulated-pixel-chromium",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "desktop-webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "emulated-iphone-webkit",
      use: { ...devices["iPhone 15"] },
    },
  ],
  webServer: {
    command: `pnpm exec next start -p ${PORT}`,
    port: PORT,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
