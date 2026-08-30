import { createFeedbackPostHandler } from "@/lib/feedback/feedback-route";
import { insertFeedback } from "@/lib/feedback/feedback-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = createFeedbackPostHandler({
  insertFeedback,
  logInsertFailure: () => console.error("Failed to write feedback to Lakebase"),
});
