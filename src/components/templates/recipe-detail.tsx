import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { MDXProvider } from "@mdx-js/react";
import { useRef, type ReactNode } from "react";
import { AIExportMenu } from "@/components/ai-export-menu";
import { Badge } from "@/components/ui/badge";
import { RecipePre } from "@/components/templates/recipe-code-block";
import { RecipeToc } from "@/components/templates/recipe-toc";
import { recipes } from "@/lib/recipes/recipes";

const recipeComponents = { pre: RecipePre };

type RecipeDetailProps = {
  recipeId: string;
  children: ReactNode;
};

export function RecipeDetail({
  recipeId,
  children,
}: RecipeDetailProps): ReactNode {
  const contentRef = useRef<HTMLDivElement>(null);
  const recipe = recipes.find((item) => item.id === recipeId);

  if (!recipe) {
    throw new Error(`Recipe ${recipeId} not found`);
  }

  return (
    <Layout title={recipe.name} description={recipe.description}>
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
                    contentRef={contentRef}
                    title={recipe.name}
                    description={recipe.description}
                    permalink={`/resources/recipes/${recipe.id}`}
                  />
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    {recipe.name}
                  </h1>
                </div>
                <p className="mb-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {recipe.description}
                </p>
                <div className="mb-8 flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="rounded-sm border border-black/10 bg-black/4 px-2 py-0.5 text-xs font-medium text-black/78 dark:border-white/10 dark:bg-white/8 dark:text-white/78"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

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
