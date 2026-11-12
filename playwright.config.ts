import { defineConfig } from "@playwright/test";

const PORT = 4173;
const CROSS_BROWSER = {
  testMatch: "ai-index-copy-image.spec.ts",
  grep: /@cross-browser/,
};

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
    {
      name: "firefox",
      use: { browserName: "firefox" },
      ...CROSS_BROWSER,
    },
    {
      name: "webkit",
      use: { browserName: "webkit" },
      ...CROSS_BROWSER,
    },
  ],
  webServer: {
    command: `pnpm exec next start -p ${PORT}`,
    port: PORT,
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
