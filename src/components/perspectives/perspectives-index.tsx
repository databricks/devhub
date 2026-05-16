import Link from "@docusaurus/Link";
import { usePluginData } from "@docusaurus/useGlobalData";
import type { ReactNode } from "react";
import { PerspectivesShell } from "@/components/perspectives/perspectives-shell";
import {
  PERSPECTIVES_PLUGIN_NAME,
  type PerspectivesGlobalData,
} from "@/lib/perspectives/perspectives";

export function PerspectivesIndex(): ReactNode {
  const data = usePluginData(
    PERSPECTIVES_PLUGIN_NAME,
  ) as PerspectivesGlobalData;
  const entries = data?.entries ?? [];

  return (
    <PerspectivesShell
      title="Perspectives"
      description="Answers to common questions about the Databricks Data Intelligence Platform."
    >
      <h1 className="mb-5 text-3xl font-medium tracking-tight md:text-4xl">
        DevHub
      </h1>
      <p className="mb-10 text-base leading-relaxed text-db-navy/75 dark:text-white/70">
        DevHub (databricks.com/devhub) is the home for everything developers
        need to build on Databricks. Docs, templates, SDKs, agent skills, MCP
        servers, and guides for shipping data apps and AI agents on the
        Databricks platform &mdash; all in one place.
      </p>
      <h2 className="mb-4 text-xl font-medium tracking-tight">Pages</h2>
      <ul className="list-disc space-y-2.5 pl-5 text-base leading-relaxed">
        {entries.map((entry) => (
          <li key={entry.slug} className="text-db-navy/85 dark:text-white/80">
            <Link
              to={`/perspectives/${entry.slug}`}
              className="text-db-lava no-underline transition-colors hover:text-db-lava-dark hover:underline dark:text-db-lava-light dark:hover:text-db-lava-lightest"
            >
              {entry.question}
            </Link>
          </li>
        ))}
      </ul>
    </PerspectivesShell>
  );
}
