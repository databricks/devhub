import { describe, expect, test } from "vitest";
import handler from "../api/llms";

type RawResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

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

function call(host = "dev-databricks.vercel.app") {
  const res = fakeRes();
  handler(
    {
      method: "GET",
      headers: { host },
    } as unknown as Parameters<typeof handler>[0],
    res,
  );
  return res._result;
}

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

describe("/api/llms", () => {
  test("generates the docs index", () => {
    const result = call();
    expect(result.statusCode).toBe(200);
    expect(result.headers["content-type"]).toBe("text/plain; charset=utf-8");
    expect(result.body).toContain("# Databricks Developer Hub");
    expect(result.body).toContain("/docs/start-here.md");
  });

  test("uses the configured SITE_URL base path with the request host", () => {
    withSiteUrl("https://stage.databricks.com/devhub", () => {
      const result = call("127.0.0.1:4182");
      expect(result.body).toContain(
        "https://stage.databricks.com/devhub/docs/start-here.md",
      );
      expect(result.body).toContain(
        "https://stage.databricks.com/devhub/templates/ai-chat-app.md",
      );
      expect(result.body).not.toContain(
        "https://stage.databricks.com/templates/",
      );
    });
  });
});
