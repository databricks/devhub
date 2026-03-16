import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import { MDXProvider } from "@mdx-js/react";
import { useRef, type ReactNode } from "react";
import { AIExportMenu } from "@/components/ai-export-menu";
import { Badge } from "@/components/ui/badge";
import { RecipePre } from "@/components/resources/recipe-code-block";
import { RecipeToc } from "@/components/resources/recipe-toc";
import type { Solution } from "@/lib/solutions/solutions";

const recipeComponents = { pre: RecipePre };

type SolutionDetailProps = {
  solution: Solution;
  children: ReactNode;
};

export function SolutionDetail({
  solution,
  children,
}: SolutionDetailProps): ReactNode {
  const contentRef = useRef<HTMLDivElement>(null);
  const heroImageUrl = useBaseUrl("/img/solution-detail-hero.svg");
  const permalink = `/solutions/${solution.id}`;

  return (
    <Layout title={solution.title} description={solution.description}>
      <main className="border-t border-db-cyan/30 bg-db-bg dark:border-db-cyan/25 dark:bg-[#0d1a1f]">
        <div className="container px-4 py-12 md:py-16">
          <div className="mx-auto max-w-5xl">
            <Link
              to="/solutions"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-foreground"
            >
              <span aria-hidden="true">&larr;</span>
              All solutions
            </Link>

            <div className="mb-10 overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-white via-white to-slate-50 shadow-lg dark:border-white/10 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
              <div className="grid items-center gap-0 md:grid-cols-[1.15fr_0.85fr]">
                <div className="p-6 md:p-8">
                  <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    {solution.title}
                  </h1>
                  <p className="mb-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                    {solution.description}
                  </p>
                  <div className="mb-5 flex flex-wrap gap-2">
                    {solution.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="rounded-sm border border-black/10 bg-black/4 px-2 py-0.5 text-xs font-medium text-black/78 dark:border-white/10 dark:bg-white/8 dark:text-white/78"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <AIExportMenu
                    contentRef={contentRef}
                    title={solution.title}
                    description={solution.description}
                    permalink={permalink}
                  />
                </div>
                <div className="relative min-h-[220px] overflow-hidden bg-gradient-to-br from-[#071a21] to-[#0f2a34] md:min-h-[280px] md:rounded-r-2xl">
                  <img
                    src={heroImageUrl}
                    alt="Solution architecture overview"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_220px]">
              <div
                className="recipe-content-card px-1 py-2 md:px-2 md:py-3"
                ref={contentRef}
              >
                <MDXProvider components={recipeComponents}>
                  <article className="prose-solution">{children}</article>
                </MDXProvider>
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
