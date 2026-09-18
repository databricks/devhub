import { z } from "zod";

const externalUrl = z.url().refine((value) => {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  return (
    ["https:", "http:"].includes(url.protocol) && !url.username && !url.password
  );
}, "Use an HTTP or HTTPS URL without credentials");

const personKindSchema = z.enum(["student", "mvp"]);
export type PersonKind = z.infer<typeof personKindSchema>;

export const publicPersonSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  kind: personKindSchema,
  name: z.string().min(1),
  headline: z.string(),
  bio: z.string(),
  country: z.string(),
  city: z.string(),
  organization: z.string(),
  cohort: z.string(),
  photoUrl: z.union([
    z.literal(""),
    externalUrl,
    z
      .string()
      .regex(/^\/(?:headshots|img\/community\/mvps)\/[a-zA-Z0-9._/-]+$/),
  ]),
  links: z.object({
    linkedin: externalUrl.optional(),
    github: externalUrl.optional(),
    website: externalUrl.optional(),
    x: externalUrl.optional(),
  }),
  additionalLinks: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(80),
        url: externalUrl
          .max(2048)
          .refine(
            (value) =>
              URL.canParse(value) && new URL(value).protocol === "https:",
          ),
      }),
    )
    .max(20)
    .default([]),
  expertise: z.array(z.string()),
  highlights: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string(),
        url: externalUrl.optional(),
      }),
    )
    .default([]),
  status: z.literal("published"),
  featured: z.boolean(),
});

export type PublicPerson = z.infer<typeof publicPersonSchema>;

export const peoplePageSchema = z.object({
  items: z.array(publicPersonSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type PeoplePage = z.infer<typeof peoplePageSchema>;

const directoryQuerySchema = z.object({
  kind: personKindSchema,
  q: z.string().trim().max(200).optional(),
  country: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  cohort: z.string().trim().max(100).optional(),
  expertise: z.string().trim().max(80).optional(),
  featured: z.boolean().optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
});

export type DirectoryQuery = z.input<typeof directoryQuerySchema>;

export function directorySearchParams(query: DirectoryQuery): URLSearchParams {
  const parsed = directoryQuerySchema.parse(query);
  return new URLSearchParams(
    Object.entries(parsed)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => [key, String(value)]),
  );
}
