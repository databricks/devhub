import {
  MAX_FEEDBACK_BODY_BYTES,
  parseFeedbackPayload,
  type FeedbackInsert,
} from "./feedback";

type FeedbackRouteDependencies = {
  insertFeedback: (input: FeedbackInsert) => Promise<void>;
  logInsertFailure: () => void;
};

type BodyReadResult =
  { ok: true; text: string } | { ok: false; response: Response };

function jsonResponse(body: object, status: number, headers?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

async function readLimitedBody(request: Request): Promise<BodyReadResult> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_FEEDBACK_BODY_BYTES
  ) {
    return {
      ok: false,
      response: jsonResponse({ error: "Request body is too large" }, 413),
    };
  }

  if (!request.body) return { ok: true, text: "" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > MAX_FEEDBACK_BODY_BYTES) {
      await reader.cancel();
      return {
        ok: false,
        response: jsonResponse({ error: "Request body is too large" }, 413),
      };
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { ok: true, text: new TextDecoder().decode(body) };
}

export function createFeedbackPostHandler({
  insertFeedback,
  logInsertFailure,
}: FeedbackRouteDependencies) {
  return async function POST(request: Request): Promise<Response> {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("application/json")) {
      return jsonResponse(
        { error: "Content-Type must be application/json" },
        415,
      );
    }

    const body = await readLimitedBody(request);
    if (!body.ok) return body.response;

    let value: unknown;
    try {
      value = JSON.parse(body.text);
    } catch {
      return jsonResponse({ error: "Request body must be valid JSON" }, 400);
    }

    const feedback = parseFeedbackPayload(value);
    if (!feedback) {
      return jsonResponse(
        {
          error:
            "feedback must be a non-empty string of at most 10000 characters",
        },
        400,
      );
    }

    try {
      await insertFeedback({
        ...feedback,
        userAgent: request.headers.get("user-agent")?.slice(0, 1_024),
      });
    } catch {
      logInsertFailure();
      return jsonResponse({ error: "Feedback service is unavailable" }, 503);
    }

    return jsonResponse({ ok: true }, 201);
  };
}
