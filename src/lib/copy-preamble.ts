const SITE_NAME = "dev.databricks.com";
const SITE_DESCRIPTION =
  "DevHub: the Developer Resources Hub for building data apps and AI agents on Databricks.";

export function buildCopyPreamble(llmsUrl: string): string {
  return [
    `> Source: [${SITE_NAME}](https://${SITE_NAME}). ${SITE_DESCRIPTION}`,
    `> Full resource index: ${llmsUrl}`,
    ">",
    "> **How to use this guide:** Read through the entire content before executing any steps. Guides may contain overlapping setup commands across sections; later sections often include more complete versions. When provisioning Databricks resources, always confirm whether to create new ones or reuse existing.",
  ].join("\n");
}
