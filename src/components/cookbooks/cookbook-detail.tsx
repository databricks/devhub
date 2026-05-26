import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import { MDXProvider } from "@mdx-js/react";
import type { ReactNode } from "react";
import { CopyPromptButton } from "@/components/copy-prompt-button";
import { RecipePre } from "@/components/cookbooks/recipe-code-block";
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
  const heroImageUrl = useBaseUrl("/img/template-detail-hero.svg");
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

            <div className="mb-10 text-center">
              <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {cookbook.name}
              </h1>
              <p className="mx-auto mb-6 max-w-xl text-base leading-relaxed text-muted-foreground">
                {cookbook.description}
              </p>
              <CopyPromptButton
                kind="cookbook"
                rawMarkdown={rawMarkdown}
                title={cookbook.name}
                description={cookbook.description}
                permalink={permalink}
                label="Copy prompt for your agent"
                className="h-10 rounded-full px-6 text-sm"
              />
            </div>

            <div className="mb-12 overflow-hidden rounded-xl bg-gradient-to-br from-db-navy to-db-navy-light">
              <img
                src={heroImageUrl}
                alt="Template architecture preview"
                className="h-auto w-full object-cover"
                loading="lazy"
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
