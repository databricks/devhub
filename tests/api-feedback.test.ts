import { describe, expect, test, vi } from "vitest";

import { MAX_FEEDBACK_BODY_BYTES } from "../src/lib/feedback/feedback";
import { createFeedbackPostHandler } from "../src/lib/feedback/feedback-route";

function createHandler({
  insertError,
}: {
  insertError?: Error;
} = {}) {
  const insertFeedback = vi.fn(async () => {
    if (insertError) throw insertError;
  });
  const logInsertFailure = vi.fn();
  const handler = createFeedbackPostHandler({
    insertFeedback,
    logInsertFailure,
  });
  return { handler, insertFeedback, logInsertFailure };
}

function feedbackRequest(
  body: BodyInit,
  headers: Record<string, string> = {},
): Request {
  return new Request("https://developers.databricks.com/api/feedback", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "devhub-test-agent",
      ...headers,
    },
    body,
  });
}

describe("POST /api/feedback", () => {
  test("accepts feedback and keeps additional context in raw", async () => {
    const { handler, insertFeedback } = createHandler();
    const response = await handler(
      feedbackRequest(
        JSON.stringify({
          feedback: "  The setup command failed.  ",
          path: "/templates/lakebase-off-platform",
          command: "databricks aitools version",
        }),
      ),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(insertFeedback).toHaveBeenCalledWith({
      feedback: "The setup command failed.",
      path: "/templates/lakebase-off-platform",
      userAgent: "devhub-test-agent",
      raw: {
        feedback: "The setup command failed.",
        path: "/templates/lakebase-off-platform",
        command: "databricks aitools version",
      },
    });
  });

  test("rejects non-JSON content", async () => {
    const { handler, insertFeedback } = createHandler();
    const response = await handler(
      feedbackRequest("feedback", { "content-type": "text/plain" }),
    );

    expect(response.status).toBe(415);
    expect(insertFeedback).not.toHaveBeenCalled();
  });

  test("rejects invalid JSON and invalid feedback", async () => {
    const { handler } = createHandler();

    const invalidJson = await handler(feedbackRequest("{"));
    const invalidFeedback = await handler(
      feedbackRequest(JSON.stringify({ feedback: " " })),
    );

    expect(invalidJson.status).toBe(400);
    expect(invalidFeedback.status).toBe(400);
  });

  test("rejects a declared request body over the size limit", async () => {
    const { handler, insertFeedback } = createHandler();
    const response = await handler(
      feedbackRequest("{}", {
        "content-length": String(MAX_FEEDBACK_BODY_BYTES + 1),
      }),
    );

    expect(response.status).toBe(413);
    expect(insertFeedback).not.toHaveBeenCalled();
  });

  test("rejects a streamed request body over the size limit", async () => {
    const { handler, insertFeedback } = createHandler();
    const request = feedbackRequest("x".repeat(MAX_FEEDBACK_BODY_BYTES + 1));

    expect(request.headers.has("content-length")).toBe(false);

    const response = await handler(request);

    expect(response.status).toBe(413);
    expect(insertFeedback).not.toHaveBeenCalled();
  });

  test("does not expose database errors", async () => {
    const { handler, logInsertFailure } = createHandler({
      insertError: new Error("secret database details"),
    });
    const response = await handler(
      feedbackRequest(JSON.stringify({ feedback: "An issue" })),
    );

    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("secret database details");
    expect(logInsertFailure).toHaveBeenCalledOnce();
    expect(logInsertFailure).toHaveBeenCalledWith();
  });
});
