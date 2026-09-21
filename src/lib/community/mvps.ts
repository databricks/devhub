import { z } from "zod";

import mvpData from "./data/mvps.json";
import { directoryPerson } from "./directory";
import { publicPersonSchema } from "./schema";

const mvpDirectoryDataSchema = z.object({
  source: z.literal("https://www.databricks.com/discover/mvps"),
  verifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  people: z.array(publicPersonSchema.extend({ kind: z.literal("mvp") })).min(1),
});

const parsedMvpData = mvpDirectoryDataSchema.parse(mvpData);
const mvpDirectory = parsedMvpData.people.map(directoryPerson);

if (
  new Set(mvpDirectory.map(({ id }) => id)).size !== mvpDirectory.length ||
  new Set(mvpDirectory.map(({ slug }) => slug)).size !== mvpDirectory.length ||
  new Set(mvpDirectory.map(({ name }) => name)).size !== mvpDirectory.length
)
  throw new Error("Static MVP records must have unique IDs, slugs, and names");

export const MVP_DIRECTORY_SOURCE = parsedMvpData.source;
export const MVP_DIRECTORY_VERIFIED_AT = parsedMvpData.verifiedAt;

export function getMvpDirectory() {
  return mvpDirectory;
}
