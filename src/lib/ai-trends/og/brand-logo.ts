import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { INK } from "./frame";

/**
 * The Databricks logo as a data URI for the share images. The site file has
 * a white wordmark for the dark header; on the paper card it is set in ink.
 */
export async function loadBrandLogo(): Promise<string> {
  const svg = await readFile(
    join(process.cwd(), "public", "img", "databricks-logo.svg"),
    "utf-8",
  );
  const onPaper = svg.replace("fill:#fff", `fill:${INK}`);
  if (onPaper === svg) throw new Error("databricks-logo.svg has no white fill");
  return `data:image/svg+xml;base64,${Buffer.from(onPaper).toString("base64")}`;
}
