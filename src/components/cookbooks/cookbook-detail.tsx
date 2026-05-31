import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { MDXProvider } from "@mdx-js/react";
import type { ReactNode } from "react";
import { AgentUsageCard } from "@/components/agent-usage-card";
import { RecipePre } from "@/components/cookbooks/recipe-code-block";
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
  const permalink = `/templates/${cookbook.id}`;

  return (
    <Layout title={cookbook.name} description={cookbook.description}>
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
                {cookbook.name}
              </h1>
              <p className="mb-6 max-w-xl text-base leading-relaxed text-muted-foreground">
                {cookbook.description}
              </p>
              <AgentUsageCard
                kind="cookbook"
                rawMarkdown={rawMarkdown}
                title={cookbook.name}
                description={cookbook.description}
                permalink={permalink}
              />
            </div>

            <div className="relative mb-12 aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30">
              <TemplatePreviewImage
                lightUrl={cookbook.previewImageLightUrl}
                darkUrl={cookbook.previewImageDarkUrl}
                alt={`${cookbook.name} preview`}
                fallback={<FallbackCardArt index={0} />}
              />
            </div>

            <MDXProvider components={recipeComponents}>
              <div className="prose-solution">{children}</div>
            </MDXProvider>
          </div>
        </div>
      </main>
    </Layout>
  );
}
