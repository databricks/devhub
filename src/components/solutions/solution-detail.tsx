import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { MDXProvider } from "@mdx-js/react";
import { useRef, type ReactNode } from "react";
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

  return (
    <Layout title={solution.title} description={solution.description}>
      <main className="border-t border-db-cyan/30 bg-[#edf6fa] dark:border-db-cyan/25 dark:bg-[#0d1a1f]">
        <div className="container px-4 py-12 md:py-16">
          <div className="mx-auto max-w-5xl">
            <Link
              to="/solutions"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-foreground"
            >
              <span aria-hidden="true">&larr;</span>
              All solutions
            </Link>

            <div className="mb-8">
              <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {solution.title}
              </h1>
              <p className="mb-4 max-w-2xl text-lg text-muted-foreground">
                {solution.description}
              </p>
              <div className="flex flex-wrap gap-2">
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
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_220px]">
              <div
                className="recipe-content-card rounded-2xl border border-db-border bg-db-card px-5 py-8 shadow-sm md:px-10 md:py-10"
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
