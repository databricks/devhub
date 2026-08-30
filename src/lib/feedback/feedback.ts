import { z } from "zod";

export const MAX_FEEDBACK_BODY_BYTES = 16 * 1024;

const feedbackPayloadSchema = z
  .object({
    feedback: z.string().trim().min(1).max(10_000),
    path: z.string().trim().min(1).max(2_048).optional(),
  })
  .passthrough();

export type FeedbackInsert = {
  feedback: string;
  path?: string;
  userAgent?: string;
  raw: Record<string, unknown>;
};

export function parseFeedbackPayload(
  value: unknown,
): FeedbackInsert | undefined {
  const result = feedbackPayloadSchema.safeParse(value);
  if (!result.success) return undefined;

  return {
    feedback: result.data.feedback,
    path: result.data.path,
    raw: result.data,
  };
}
