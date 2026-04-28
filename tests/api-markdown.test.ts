import { describe, expect, test } from "vitest";
import handler from "../api/markdown";

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

  test("solution responses do NOT include the About DevHub preamble", () => {
    const result = call({ section: "solutions", slug: "devhub-launch" });
    expect(result.statusCode).toBe(200);
    expect(result.body).not.toContain("# About DevHub");
    expect(result.body).not.toContain("/llms.txt");
    expect(result.body).toContain("Introducing dev.databricks.com");
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
      slug: "databricks-local-bootstrap",
    });
    expect(result.statusCode).toBe(200);
    expect(result.body.startsWith("# About DevHub")).toBe(true);
    expect(result.body).toContain("https://dev.databricks.com/llms.txt");
  });

  test("template responses DO include the About DevHub preamble", () => {
    const result = call({ section: "templates", slug: "hello-world-app" });
    expect(result.statusCode).toBe(200);
    expect(result.body.startsWith("# About DevHub")).toBe(true);
    expect(result.body).toContain("# Hello World App");
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

  test("templates index DOES include the preamble", () => {
    const result = call({ section: "templates", slug: "" });
    expect(result.statusCode).toBe(200);
    expect(result.body.startsWith("# About DevHub")).toBe(true);
  });

  test("preamble URL reflects the request Host header", () => {
    const result = call({
      section: "templates",
      slug: "hello-world-app",
      host: "localhost:3001",
    });
    expect(result.body).toContain("http://localhost:3001/llms.txt");
    expect(result.body).not.toContain("https://dev.databricks.com/llms.txt");
  });

  test("invalid section returns 400-level error JSON", () => {
    const result = call({ section: "nope" });
    expect([400, 404, 500]).toContain(result.statusCode);
  });
});
