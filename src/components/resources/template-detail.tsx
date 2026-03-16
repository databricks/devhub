import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { MDXProvider } from "@mdx-js/react";
import { useRef, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { RecipePre } from "@/components/resources/recipe-code-block";
import { RecipeList } from "@/components/resources/recipe-list";
import { RecipeToc } from "@/components/resources/recipe-toc";
import type { Template } from "@/lib/recipes/recipes";
import { recipes } from "@/lib/recipes/recipes";

const recipeComponents = { pre: RecipePre };

type TemplateDetailProps = {
  template: Template;
  children: ReactNode;
};

export function TemplateDetail({
  template,
  children,
}: TemplateDetailProps): ReactNode {
  const contentRef = useRef<HTMLDivElement>(null);

  const templateRecipes = template.recipeIds
    .map((id) => recipes.find((r) => r.id === id))
    .filter(Boolean);

  return (
    <Layout title={template.name} description={template.description}>
      <main className="container px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/resources"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-foreground"
          >
            <span aria-hidden="true">&larr;</span>
            All resources
          </Link>

          <div className="mb-8">
            <div className="mb-3 flex items-center gap-3">
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
            <p className="mb-4 max-w-2xl text-lg text-muted-foreground">
              {template.description}
            </p>
            <div className="flex flex-wrap gap-2">
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
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_220px]">
            <div>
              <RecipeList recipes={templateRecipes} />
              <div
                className="recipe-content-card rounded-2xl border border-db-border bg-db-card px-5 py-8 shadow-sm md:px-10 md:py-10"
                ref={contentRef}
              >
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
      </main>
    </Layout>
  );
}
