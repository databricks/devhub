import type { ReactNode } from "react";
import { MarkdownBody } from "@/components/perspectives/markdown-body";
import { PerspectivesShell } from "@/components/perspectives/perspectives-shell";

type PerspectivePageProps = {
  question: string;
  body: string;
};

export function PerspectivePage({
  question,
  body,
}: PerspectivePageProps): ReactNode {
  return (
    <PerspectivesShell title={question}>
      <p className="mb-8 text-sm tracking-tight text-db-navy/55 dark:text-white/55">
        Perspectives
      </p>
      <h1 className="mb-10 text-2xl font-medium leading-snug tracking-tight text-db-navy md:text-3xl dark:text-white">
        {question}
      </h1>
      <MarkdownBody source={body} />
    </PerspectivesShell>
  );
}
