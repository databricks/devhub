import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/docs-verify/**/*.test.ts"],
  },
});
