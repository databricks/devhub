import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/docs-verify/**/*.test.ts"],
    // These suites make real CLI calls and deploys against a live workspace. Run
    // them serially so concurrent suites don't contend on the workspace API (that
    // contention caused transient failures like a bare `Error:` from
    // serving-endpoints list), and retry to absorb any remaining transient blips.
    fileParallelism: false,
    retry: 2,
  },
});
