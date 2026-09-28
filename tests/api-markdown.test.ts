import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";

import { GET } from "../src/app/api/markdown/route";
import { resolveSiteUrlForRequest } from "../src/lib/site-url";

type RawResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

async function call({
  section,
  slug,
  host = "developers.databricks.com",
}: {
  section: string;
  slug?: string;
  host?: string;
}): Promise<RawResponse> {
  const url = new URL("https://developers.databricks.com/api/markdown");
  url.searchParams.set("section", section);
  if (slug !== undefined) {
    url.searchParams.set("slug", slug);
  }

  const response = GET(new NextRequest(url, { headers: { host } }));
  return {
    statusCode: response.status,
    headers: Object.fromEntries(
      Array.from(response.headers.entries()).map(([key, value]) => [
        key.toLowerCase(),
        value,
      ]),
    ),
    body: await response.text(),
  };
}

async function withSiteUrl<T>(
  siteUrl: string,
  run: () => T | Promise<T>,
): Promise<T> {
  const previous = process.env.SITE_URL;
  process.env.SITE_URL = siteUrl;
  try {
    return await run();
  } finally {
    if (previous === undefined) {
      delete process.env.SITE_URL;
    } else {
      process.env.SITE_URL = previous;
    }
  }
}

describe("/api/markdown about-devhub preamble policy", () => {
  test("docs responses do NOT include the About DevHub preamble", async () => {
    const result = await call({ section: "docs", slug: "start-here" });
    expect(result.statusCode).toBe(200);
    expect(result.body).not.toContain("# About DevHub");
    expect(result.body).not.toContain("/llms.txt");
    expect(result.body).toMatch(/^---/);
  });

  test("nested docs responses (appkit/v0) do NOT include the preamble", async () => {
    const result = await call({ section: "docs", slug: "appkit/v0" });
    expect(result.statusCode).toBe(200);
    expect(result.body).not.toContain("# About DevHub");
  });

  test("docs lakebase quickstart does NOT include the preamble", async () => {
    const result = await call({ section: "docs", slug: "lakebase/quickstart" });
    expect(result.statusCode).toBe(200);
    expect(result.body).not.toContain("# About DevHub");
    expect(result.body).toContain("Quickstart");
  });

  test("docs MCP install commands use the configured site URL", async () => {
    await withSiteUrl("https://developers.databricks.com/docs", async () => {
      const result = await call({
        section: "docs",
        slug: "tools/ai-tools/docs-mcp-server",
      });

      expect(result.statusCode).toBe(200);
      expect(result.body).toContain(
        "npx add-mcp https://developers.databricks.com/api/mcp --name devhub-docs -g",
      );
    });
  });

  test("recipe responses DO include the About DevHub preamble", async () => {
    const result = await call({
      section: "recipes",
      slug: "set-up-your-local-dev-environment",
    });
    expect(result.statusCode).toBe(200);
    expect(result.body.startsWith("# About DevHub")).toBe(true);
    expect(result.body).toContain(
      `${resolveSiteUrlForRequest("developers.databricks.com")}/llms.txt`,
    );
  });

  test("template responses DO include the About DevHub preamble", async () => {
    const result = await call({ section: "templates", slug: "ai-chat-app" });
    expect(result.statusCode).toBe(200);
    expect(result.body.startsWith("# About DevHub")).toBe(true);
    expect(result.body).toContain('title: "AI Chat App"');
    expect(result.body).toContain(
      "url: https://developers.databricks.com/templates/ai-chat-app",
    );
    expect(result.body).not.toContain("\n# AI Chat App\n");
  });

  test("example responses DO include the About DevHub preamble", async () => {
    const result = await call({
      section: "examples",
      slug: "agentic-support-console",
    });
    expect(result.statusCode).toBe(200);
    expect(result.body.startsWith("# About DevHub")).toBe(true);
    expect(result.body).toContain("Agentic Support Console");
  });

  test("templates index does NOT include the preamble", async () => {
    const result = await call({ section: "templates", slug: "" });
    expect(result.statusCode).toBe(200);
    expect(result.body).not.toContain("# About DevHub");
    expect(result.body).toContain("# Templates");
    expect(result.body).toContain("/templates/ai-chat-app.md");
    expect(result.body).not.toContain("/templates/hello-world-app.md");
  });

  test("preamble URL reflects the request Host header", async () => {
    const host = "localhost:3001";
    const result = await call({
      section: "templates",
      slug: "ai-chat-app",
      host,
    });
    expect(result.body).toContain(`${resolveSiteUrlForRequest(host)}/llms.txt`);
    expect(result.body).not.toContain(
      "https://developers.databricks.com/llms.txt",
    );
  });

  test("request-host URLs use the configured SITE_URL origin", async () => {
    await withSiteUrl("https://developers.databricks.com/docs", async () => {
      const host = "localhost:3001";

      const template = await call({
        section: "templates",
        slug: "ai-chat-app",
        host,
      });
      expect(template.body).toContain(
        "https://developers.databricks.com/llms.txt",
      );
      expect(template.body).toContain(
        "https://developers.databricks.com/templates/ai-chat-app",
      );
      expect(template.body).not.toContain("](/docs/");
      expect(template.body).not.toContain("](/templates/");
    });
  });

  test("not-found markdown links use the configured SITE_URL origin", async () => {
    await withSiteUrl("https://developers.databricks.com/docs", async () => {
      const result = await call({
        section: "docs",
        slug: "not-a-real-doc",
        host: "localhost:3001",
      });

      expect(result.statusCode).toBe(404);
      expect(result.body).toContain(
        "https://developers.databricks.com/llms.txt",
      );
      expect(result.body).toContain(
        "https://developers.databricks.com/templates.md",
      );
      expect(result.body).not.toContain("](/llms.txt)");
    });
  });

  test("invalid section returns 400-level error JSON", async () => {
    const result = await call({ section: "nope" });
    expect([400, 404, 500]).toContain(result.statusCode);
  });
});
