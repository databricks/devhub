import { describe, expect, test } from "vitest";
import middleware from "../middleware";

function withSiteUrl<T>(siteUrl: string | undefined, run: () => T): T {
  const previous = process.env.SITE_URL;
  if (siteUrl === undefined) {
    delete process.env.SITE_URL;
  } else {
    process.env.SITE_URL = siteUrl;
  }

  try {
    return run();
  } finally {
    if (previous === undefined) {
      delete process.env.SITE_URL;
    } else {
      process.env.SITE_URL = previous;
    }
  }
}

describe("middleware root redirect", () => {
  test("redirects root requests to SITE_URL when SITE_URL includes a path", () => {
    withSiteUrl("https://stage.databricks.com/devhub", () => {
      const response = middleware(
        new Request("https://dev-databricks.vercel.app/"),
      );

      expect(response?.status).toBe(307);
      expect(response?.headers.get("location")).toBe(
        "https://stage.databricks.com/devhub",
      );
    });
  });

  test("preserves query strings when redirecting root requests", () => {
    withSiteUrl("https://stage.databricks.com/devhub", () => {
      const response = middleware(
        new Request("https://dev-databricks.vercel.app/?utm_source=test"),
      );

      expect(response?.status).toBe(307);
      expect(response?.headers.get("location")).toBe(
        "https://stage.databricks.com/devhub?utm_source=test",
      );
    });
  });

  test("does not redirect root requests when SITE_URL has no path", () => {
    withSiteUrl("https://dev.databricks.com", () => {
      expect(
        middleware(new Request("https://dev.databricks.com/")),
      ).toBeUndefined();
    });
  });

  test("does not redirect requests already under the configured base path", () => {
    withSiteUrl("https://stage.databricks.com/devhub", () => {
      expect(
        middleware(new Request("https://dev-databricks.vercel.app/devhub")),
      ).toBeUndefined();
    });
  });
});
