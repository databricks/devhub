import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import { MDXProvider } from "@mdx-js/react";
import { useRef, type ReactNode } from "react";
import { AIExportMenu } from "@/components/ai-export-menu";
import { Badge } from "@/components/ui/badge";
import { RecipePre } from "@/components/templates/recipe-code-block";
import { RecipeList } from "@/components/templates/recipe-list";
import { RecipeToc } from "@/components/templates/recipe-toc";
import type { Template } from "@/lib/recipes/recipes";
import { recipes } from "@/lib/recipes/recipes";

const recipeComponents = { pre: RecipePre };

type TemplateDetailProps = {
  template: Template;
  rawMarkdown: string;
  children: ReactNode;
};

export function TemplateDetail({
  template,
  rawMarkdown,
  children,
}: TemplateDetailProps): ReactNode {
  const contentRef = useRef<HTMLDivElement>(null);
  const heroImageUrl = useBaseUrl("/img/template-detail-hero.svg");
  const permalink = `/resources/${template.id}`;

  const templateRecipes = template.recipeIds
    .map((id) => recipes.find((r) => r.id === id))
    .filter(Boolean);

  return (
    <Layout title={template.name} description={template.description}>
      <main>
        <div className="container px-4 py-8 md:py-12">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="min-w-0">
                <Link
                  to="/resources"
                  className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-foreground"
                >
                  <span aria-hidden="true">&larr;</span>
                  All resources
                </Link>

                <div className="mb-3 flex justify-end">
                  <AIExportMenu
                    rawMarkdown={rawMarkdown}
                    title={template.name}
                    description={template.description}
                    permalink={permalink}
                  />
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    {template.name}
                  </h1>
                  {templateRecipes.length > 1 && (
                    <Badge
                      variant="secondary"
                      className="shrink-0 rounded-full border border-db-lava/20 bg-db-lava/8 px-2.5 py-0.5 text-xs font-semibold text-db-lava"
                    >
                      {templateRecipes.length} recipes
                    </Badge>
                  )}
                </div>
                <p className="mb-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {template.description}
                </p>
                <div className="mb-8 flex flex-wrap gap-2">
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

                <div className="mb-12 overflow-hidden rounded-xl bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
                  <img
                    src={heroImageUrl}
                    alt="Template architecture preview"
                    className="h-auto w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <RecipeList recipes={templateRecipes} />
                <div className="recipe-content-card" ref={contentRef}>
                  <MDXProvider components={recipeComponents}>
                    <div className="prose-solution">{children}</div>
                  </MDXProvider>
                </div>
              </div>

              <div className="hidden lg:block">
                <RecipeToc contentRef={contentRef} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
