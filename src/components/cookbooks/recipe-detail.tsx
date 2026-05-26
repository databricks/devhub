import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { MDXProvider } from "@mdx-js/react";
import type { ReactNode } from "react";
import { CopyPromptButton } from "@/components/copy-prompt-button";
import { Badge } from "@/components/ui/badge";
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

            <div className="mb-10 text-center">
              <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {recipe.name}
              </h1>
              <p className="mx-auto mb-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                {recipe.description}
              </p>
              {recipe.services.length > 0 && (
                <div className="mb-6 flex flex-wrap justify-center gap-2">
                  {recipe.services.map((service) => (
                    <Badge key={service} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              )}
              <CopyPromptButton
                kind="recipe"
                rawMarkdown={rawMarkdown}
                title={recipe.name}
                description={recipe.description}
                permalink={`/templates/${recipe.id}`}
                label="Copy prompt for your agent"
                className="h-10 rounded-full px-6 text-sm"
              />
            </div>

            <div className="border-t border-border/60 pt-8">
              <MDXProvider components={recipeComponents}>
                <div className="prose-solution">{children}</div>
              </MDXProvider>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
