import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import type { Template } from "@/lib/recipes/recipes";
import { recipes } from "@/lib/recipes/recipes";

type TemplateDetailProps = {
  template: Template;
};

export function TemplateDetail({ template }: TemplateDetailProps): ReactNode {
  const templateRecipes = template.recipeIds
    .map((id) => recipes.find((r) => r.id === id))
    .filter((r): r is (typeof recipes)[number] => r !== undefined);

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

          <h2 className="mb-6 text-xl font-semibold text-black dark:text-white">
            Steps
          </h2>
          <ol className="mb-12 list-none space-y-4 pl-0">
            {template.steps.map((step, idx) => (
              <li
                key={step.id}
                className="rounded-lg border border-black/10 bg-[#f7f6f4] p-4 dark:border-white/10 dark:bg-[#182a32]"
              >
                <div className="mb-1 flex items-baseline gap-3">
                  <span className="shrink-0 text-sm font-semibold text-black/40 dark:text-white/40">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-black dark:text-white">
                    {step.title}
                  </span>
                </div>
                {step.details ? (
                  <p className="m-0 mt-1 pl-7 text-sm text-black/60 dark:text-white/60">
                    {step.details}
                  </p>
                ) : null}
                {step.command ? (
                  <pre className="mt-2 ml-7 overflow-x-auto rounded-md bg-black/5 px-3 py-2 text-sm dark:bg-white/5">
                    <code>{step.command}</code>
                  </pre>
                ) : null}
              </li>
            ))}
          </ol>

          {templateRecipes.some((r) => r.references?.length) ? (
            <>
              <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
                References
              </h2>
              <ul className="list-disc space-y-1 pl-5">
                {templateRecipes.flatMap(
                  (recipe) =>
                    recipe.references?.map((ref) => (
                      <li key={ref.href}>
                        <a
                          href={ref.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm"
                        >
                          {ref.label}
                        </a>
                      </li>
                    )) ?? [],
                )}
              </ul>
            </>
          ) : null}
        </div>
      </main>
    </Layout>
  );
}
