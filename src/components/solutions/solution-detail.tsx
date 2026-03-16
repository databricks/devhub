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
      <main>
        <div className="container px-4 py-8 md:py-12">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_220px]">
              <div>
                <Link
                  to="/solutions"
                  className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-foreground"
                >
                  <span aria-hidden="true">&larr;</span>
                  All solutions
                </Link>

                <div className="mb-3 flex justify-end">
                  <AIExportMenu
                    contentRef={contentRef}
                    title={solution.title}
                    description={solution.description}
                    permalink={permalink}
                  />
                </div>

                <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {solution.title}
                </h1>
                <p className="mb-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {solution.description}
                </p>
                <div className="mb-8 flex flex-wrap gap-2">
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

                <div className="mb-12 overflow-hidden rounded-xl bg-gradient-to-br from-[#071a21] to-[#0f2a34]">
                  <img
                    src={heroImageUrl}
                    alt="Solution architecture overview"
                    className="h-auto w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="recipe-content-card" ref={contentRef}>
                  <MDXProvider components={recipeComponents}>
                    <article className="prose-solution">{children}</article>
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
