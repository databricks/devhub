import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { MDXProvider } from "@mdx-js/react";
import { useRef, type ReactNode } from "react";
import { TemplateUsageBanner } from "@/components/template-usage-banner";
import { RecipePre } from "@/components/cookbooks/recipe-code-block";
import { RecipeToc } from "@/components/cookbooks/recipe-toc";
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
  const contentRef = useRef<HTMLDivElement>(null);
  const recipe = recipes.find((item) => item.id === recipeId);
  const rawMarkdown = useRawRecipeMarkdown(recipeId);

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

                <div className="relative mb-12 aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                  <TemplatePreviewImage
                    lightUrl={recipe.previewImageLightUrl}
                    darkUrl={recipe.previewImageDarkUrl}
                    alt={`${recipe.name} preview`}
                    fallback={<FallbackCardArt index={0} />}
                  />
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
