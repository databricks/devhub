import { describe, expect, test } from "vitest";
import handler from "../api/markdown";
import { resolveSiteUrlForRequest } from "../src/lib/site-url";

type RawHeaders = Record<string, string | undefined>;

type RawResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

function fakeReq({
  section,
  slug,
  host = "dev.databricks.com",
}: {
  section: string;
  slug?: string;
  host?: string;
}): Parameters<typeof handler>[0] {
  const query: Record<string, string> = { section };
  if (slug !== undefined) query.slug = slug;
  return {
    method: "GET",
    query,
    headers: { host } satisfies RawHeaders,
  } as unknown as Parameters<typeof handler>[0];
}

function fakeRes(): Parameters<typeof handler>[1] & { _result: RawResponse } {
  const result: RawResponse = { statusCode: 200, headers: {}, body: "" };
  const res = {
    _result: result,
    setHeader(key: string, value: string) {
      result.headers[key.toLowerCase()] = value;
      return this;
    },
    status(code: number) {
      result.statusCode = code;
      return this;
    },
    send(body: string) {
      result.body = body;
      return this;
    },
    json(payload: unknown) {
      result.body = JSON.stringify(payload);
      result.headers["content-type"] ??= "application/json";
      return this;
    },
  };
  return res as unknown as Parameters<typeof handler>[1] & {
    _result: RawResponse;
  };
}

function call(args: { section: string; slug?: string; host?: string }) {
  const res = fakeRes();
  handler(fakeReq(args), res);
  return res._result;
}

function withSiteUrl<T>(siteUrl: string, run: () => T): T {
  const previous = process.env.SITE_URL;
  process.env.SITE_URL = siteUrl;
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

describe("/api/markdown about-devhub preamble policy", () => {
  test("docs responses do NOT include the About DevHub preamble", () => {
    const result = call({ section: "docs", slug: "start-here" });
    expect(result.statusCode).toBe(200);
    expect(result.body).not.toContain("# About DevHub");
    expect(result.body).not.toContain("/llms.txt");
    expect(result.body).toMatch(/^---/);
  });

  test("nested docs responses (appkit/v0) do NOT include the preamble", () => {
    const result = call({ section: "docs", slug: "appkit/v0" });
    expect(result.statusCode).toBe(200);
    expect(result.body).not.toContain("# About DevHub");
  });

  test("docs lakebase quickstart does NOT include the preamble", () => {
    const result = call({ section: "docs", slug: "lakebase/quickstart" });
    expect(result.statusCode).toBe(200);
    expect(result.body).not.toContain("# About DevHub");
    expect(result.body).toContain("Quickstart");
  });

  test("docs MCP install commands use the configured site URL", () => {
    withSiteUrl("https://stage.databricks.com/devhub", () => {
      const result = call({
        section: "docs",
        slug: "tools/ai-tools/docs-mcp-server",
      });

      expect(result.statusCode).toBe(200);
      expect(result.body).toContain(
        "npx add-mcp https://stage.databricks.com/devhub/api/mcp --name devhub-docs -g",
      );
      expect(result.body).not.toContain("https://dev.databricks.com/api/mcp");
    });
  });

  test("solution responses do NOT include the About DevHub preamble", () => {
    const result = call({ section: "solutions", slug: "devhub-launch" });
    expect(result.statusCode).toBe(200);
    expect(result.body).not.toContain("# About DevHub");
    expect(result.body).not.toContain("/llms.txt");
    expect(result.body).toContain("Introducing dev.databricks.com");
  });

  test("solution frontmatter url is absolute and reflects the request host", () => {
    const host = "localhost:3001";
    const result = call({
      section: "solutions",
      slug: "devhub-launch",
      host,
    });
    expect(result.statusCode).toBe(200);
    expect(result.body).toContain(
      `url: ${resolveSiteUrlForRequest(host)}/solutions/devhub-launch`,
    );
    expect(result.body).not.toMatch(/^url:\s+\/solutions\//m);
  });

  test("solution frontmatter is built from solutions.ts, not the .md file", () => {
    const result = call({
      section: "solutions",
      slug: "devhub-launch",
      host: "dev.databricks.com",
    });
    expect(result.body).toMatch(
      /^title:\s+"Introducing dev\.databricks\.com"$/m,
    );
    expect(result.body).toMatch(/^summary:\s+".+"$/m);
    expect(result.body).toMatch(/^publishedAt:\s*2026-05-04$/m);
    expect(result.body).toMatch(/^authors:$/m);
  });

  test("solutions index does NOT include the preamble", () => {
    const result = call({ section: "solutions", slug: "" });
    expect(result.statusCode).toBe(200);
    expect(result.body).not.toContain("# About DevHub");
    expect(result.body).toContain("# Solutions");
  });

  test("recipe responses DO include the About DevHub preamble", () => {
    const result = call({
      section: "recipes",
      slug: "set-up-your-local-dev-environment",
    });
    expect(result.statusCode).toBe(200);
    expect(result.body.startsWith("# About DevHub")).toBe(true);
    expect(result.body).toContain(
      `${resolveSiteUrlForRequest("dev.databricks.com")}/llms.txt`,
    );
  });

  test("template responses DO include the About DevHub preamble", () => {
    const result = call({ section: "templates", slug: "ai-chat-app" });
    expect(result.statusCode).toBe(200);
    expect(result.body.startsWith("# About DevHub")).toBe(true);
    expect(result.body).toContain("# AI Chat App");
  });

  test("example responses DO include the About DevHub preamble", () => {
    const result = call({
      section: "examples",
      slug: "agentic-support-console",
    });
    expect(result.statusCode).toBe(200);
    expect(result.body.startsWith("# About DevHub")).toBe(true);
    expect(result.body).toContain("## Agentic Support Console");
  });

  test("templates index does NOT include the preamble", () => {
    const result = call({ section: "templates", slug: "" });
    expect(result.statusCode).toBe(200);
    expect(result.body).not.toContain("# About DevHub");
    expect(result.body).toContain("# Templates");
    expect(result.body).toContain("/templates/ai-chat-app.md");
    expect(result.body).not.toContain("/templates/hello-world-app.md");
  });

  test("preamble URL reflects the request Host header", () => {
    const host = "localhost:3001";
    const result = call({
      section: "templates",
      slug: "ai-chat-app",
      host,
    });
    expect(result.body).toContain(`${resolveSiteUrlForRequest(host)}/llms.txt`);
    expect(result.body).not.toContain("https://dev.databricks.com/llms.txt");
  });

  test("request-host URLs include configured SITE_URL base path", () => {
    withSiteUrl("https://stage.databricks.com/devhub", () => {
      const host = "localhost:3001";

      const solution = call({
        section: "solutions",
        slug: "devhub-launch",
        host,
      });
      expect(solution.body).toContain(
        "url: https://stage.databricks.com/devhub/solutions/devhub-launch",
      );

      const template = call({
        section: "templates",
        slug: "ai-chat-app",
        host,
      });
      expect(template.body).toContain(
        "https://stage.databricks.com/devhub/llms.txt",
      );
      expect(template.body).toContain(
        "https://stage.databricks.com/devhub/templates/ai-chat-app",
      );
      expect(template.body).not.toContain("](/docs/");
      expect(template.body).not.toContain("](/templates/");
    });
  });

  test("not-found markdown links include configured SITE_URL base path", () => {
    withSiteUrl("https://stage.databricks.com/devhub", () => {
      const result = call({
        section: "docs",
        slug: "not-a-real-doc",
        host: "localhost:3001",
      });

      expect(result.statusCode).toBe(404);
      expect(result.body).toContain(
        "https://stage.databricks.com/devhub/llms.txt",
      );
      expect(result.body).toContain(
        "https://stage.databricks.com/devhub/templates.md",
      );
      expect(result.body).not.toContain("](/llms.txt)");
    });
  });

  test("invalid section returns 400-level error JSON", () => {
    const result = call({ section: "nope" });
    expect([400, 404, 500]).toContain(result.statusCode);
  });
});
