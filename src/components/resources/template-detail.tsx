import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import type { Template } from "@/lib/recipes/recipes";

type TemplateDetailProps = {
  template: Template;
  children: ReactNode;
};

export function TemplateDetail({
  template,
  children,
}: TemplateDetailProps): ReactNode {
  return (
    <Layout title={template.name} description={template.description}>
      <main className="container px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/resources"
            className="mb-6 inline-block text-sm text-black/60 no-underline hover:text-black dark:text-white/60 dark:hover:text-white"
          >
            &larr; All resources
          </Link>

          <h1 className="mb-3 text-3xl font-bold text-black dark:text-white">
            {template.name}
          </h1>
          <p className="mb-4 text-lg text-black/70 dark:text-white/70">
            {template.description}
          </p>

          <div className="mb-10 flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-sm border border-black/10 bg-black/4 px-2 py-0.5 text-xs font-medium text-black/78 dark:border-white/10 dark:bg-white/8 dark:text-white/78"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="prose-solution">{children}</div>
        </div>
      </main>
    </Layout>
  );
}
