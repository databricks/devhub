import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import { MDXProvider } from "@mdx-js/react";
import { useRef, type ReactNode } from "react";
import { AIExportMenu } from "@/components/ai-export-menu";
import { Badge } from "@/components/ui/badge";
import { RecipePre } from "@/components/cookbooks/recipe-code-block";
import { RecipeToc } from "@/components/cookbooks/recipe-toc";
import { solutions } from "@/lib/solutions/solutions";
import { useRawSolutionMarkdown } from "@/lib/use-raw-content-markdown";

const recipeComponents = { pre: RecipePre };

type SolutionDetailProps = {
  solutionId: string;
  children: ReactNode;
};

export function SolutionDetail({
  solutionId,
  children,
}: SolutionDetailProps): ReactNode {
  const solution = solutions.find((entry) => entry.id === solutionId);
  const contentRef = useRef<HTMLDivElement>(null);
  const heroImageUrl = useBaseUrl("/img/solution-detail-hero.svg");
  const rawMarkdown = useRawSolutionMarkdown(solutionId);
  if (!solution) {
    throw new Error(`Solution not found: ${solutionId}`);
  }
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
                    rawMarkdown={rawMarkdown}
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
