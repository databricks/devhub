import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { MDXProvider } from "@mdx-js/react";
import { useRef, type ReactNode } from "react";
import { TemplateUsageBanner } from "@/components/template-usage-banner";
import { RecipePre } from "@/components/cookbooks/recipe-code-block";
import { RecipeToc } from "@/components/cookbooks/recipe-toc";
import { TemplatePreviewImage } from "@/components/examples/template-preview-image";
import { FallbackCardArt } from "@/components/examples/fallback-card-art";
import type { Cookbook } from "@/lib/recipes/recipes";
import { BaseUrlAnchor } from "@/components/base-url-anchor";

const recipeComponents = { a: BaseUrlAnchor, pre: RecipePre };

type CookbookDetailProps = {
  cookbook: Cookbook;
  rawMarkdown: string;
  children: ReactNode;
};

export function CookbookDetail({
  cookbook,
  rawMarkdown,
  children,
}: CookbookDetailProps): ReactNode {
  const contentRef = useRef<HTMLDivElement>(null);
  const permalink = `/templates/${cookbook.id}`;

  return (
    <Layout title={cookbook.name} description={cookbook.description}>
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
                  kind="cookbook"
                  rawMarkdown={rawMarkdown}
                  title={cookbook.name}
                  description={cookbook.description}
                  permalink={permalink}
                />

                <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {cookbook.name}
                </h1>
                <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {cookbook.description}
                </p>

                <div className="relative mb-12 aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                  <TemplatePreviewImage
                    lightUrl={cookbook.previewImageLightUrl}
                    darkUrl={cookbook.previewImageDarkUrl}
                    alt={`${cookbook.name} preview`}
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
