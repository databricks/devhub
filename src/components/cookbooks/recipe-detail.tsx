import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { MDXProvider } from "@mdx-js/react";
import type { ReactNode } from "react";
import { AgentUsageCard } from "@/components/agent-usage-card";
import { Badge } from "@/components/ui/badge";
import { RecipePre } from "@/components/cookbooks/recipe-code-block";
import { TemplatePreviewImage } from "@/components/examples/template-preview-image";
import { FallbackCardArt } from "@/components/examples/fallback-card-art";
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

            <div className="mb-10">
              <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {recipe.name}
              </h1>
              <p className="mb-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                {recipe.description}
              </p>
              {recipe.services.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {recipe.services.map((service) => (
                    <Badge key={service} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              )}
              <AgentUsageCard
                kind="recipe"
                rawMarkdown={rawMarkdown}
                title={recipe.name}
                description={recipe.description}
                permalink={`/templates/${recipe.id}`}
              />
            </div>

            <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30">
              <TemplatePreviewImage
                lightUrl={recipe.previewImageLightUrl}
                darkUrl={recipe.previewImageDarkUrl}
                alt={`${recipe.name} preview`}
                fallback={<FallbackCardArt index={0} />}
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
