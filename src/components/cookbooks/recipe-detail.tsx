import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { MDXProvider } from "@mdx-js/react";
import type { ReactNode } from "react";
import { TemplateUsageBanner } from "@/components/template-usage-banner";
import { RecipePre } from "@/components/cookbooks/recipe-code-block";
import { recipes } from "@/lib/recipes/recipes";
import { useRawRecipeMarkdown } from "@/lib/use-raw-content-markdown";
import { BaseUrlAnchor } from "@/components/base-url-anchor";

const recipeComponents = { a: BaseUrlAnchor, pre: RecipePre };

type RecipeDetailProps = {
  recipeId: string;
  children: ReactNode;
};

export function RecipeDetail({
  recipeId,
  children,
}: RecipeDetailProps): ReactNode {
  const recipe = recipes.find((item) => item.id === recipeId);
  const rawMarkdown = useRawRecipeMarkdown(recipeId);

  if (!recipe) {
    throw new Error(`Recipe ${recipeId} not found`);
  }

  return (
    <Layout title={recipe.name} description={recipe.description}>
      <main>
        <div className="container px-4 py-8 md:py-12">
          <div className="mx-auto max-w-3xl">
            <Link
              to="/templates"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-foreground"
            >
              <span aria-hidden="true">&larr;</span>
              All templates
            </Link>

            <TemplateUsageBanner
              kind="recipe"
              rawMarkdown={rawMarkdown}
              title={recipe.name}
              description={recipe.description}
              permalink={`/templates/${recipe.id}`}
            />

            <div className="mb-3 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {recipe.name}
              </h1>
            </div>
            <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {recipe.description}
            </p>

            <MDXProvider components={recipeComponents}>
              <div className="prose-solution">{children}</div>
            </MDXProvider>
          </div>
        </div>
      </main>
    </Layout>
  );
}
