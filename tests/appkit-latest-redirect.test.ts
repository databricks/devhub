import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

const REPO_ROOT = resolve(__dirname, "..");

type RouteManifestRedirect = {
  destination: string;
  source: string;
  statusCode: number;
};

function installedAppkitDocsChannel(): string {
  const pkg = JSON.parse(
    readFileSync(
      resolve(
        REPO_ROOT,
        "node_modules",
        "@databricks",
        "appkit-ui",
        "package.json",
      ),
      "utf-8",
    ),
  ) as { version: unknown };

  if (typeof pkg.version !== "string" || pkg.version.length === 0) {
    throw new Error(
      `Invalid @databricks/appkit-ui version: ${JSON.stringify(pkg.version)}`,
    );
  }

  const major = pkg.version.split(".")[0];
  if (!/^\d+$/.test(major)) {
    throw new Error(`Invalid @databricks/appkit-ui version: ${pkg.version}`);
  }

  return `v${major}`;
}

function readRedirects(): RouteManifestRedirect[] {
  const manifest = JSON.parse(
    readFileSync(resolve(REPO_ROOT, ".next", "routes-manifest.json"), "utf-8"),
  ) as { redirects: RouteManifestRedirect[] };

  return manifest.redirects;
}

describe("/appkit latest-docs redirect", () => {
  test("build emits a temporary redirect to the installed AppKit docs major", () => {
    const destination = `/docs/appkit/${installedAppkitDocsChannel()}`;
    const redirects = readRedirects();

    for (const source of ["/appkit", "/appkit/"]) {
      expect(redirects).toContainEqual(
        expect.objectContaining({
          source,
          destination,
          statusCode: 307,
        }),
      );
    }
  });
});
