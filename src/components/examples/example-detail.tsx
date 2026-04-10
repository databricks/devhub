import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import { MDXProvider } from "@mdx-js/react";
import { useRef, type ReactNode } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { AIExportMenu } from "@/components/ai-export-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecipePre } from "@/components/templates/recipe-code-block";
import { RecipeToc } from "@/components/templates/recipe-toc";
import type { Example } from "@/lib/recipes/recipes";
import { templates, recipes } from "@/lib/recipes/recipes";

const mdxComponents = { pre: RecipePre };

const GITHUB_BASE = "https://github.com/databricks/devhub/tree/main";

type ExampleDetailProps = {
  example: Example;
  rawMarkdown: string;
  children: ReactNode;
};

function CopyCommand({ command }: { command: string }) {
  function handleCopy() {
    navigator.clipboard.writeText(command);
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-black/4 px-4 py-3 font-mono text-sm dark:border-white/10 dark:bg-white/4">
      <code className="flex-1 overflow-x-auto">{command}</code>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-black/8 hover:text-foreground dark:hover:bg-white/8"
        aria-label="Copy command"
      >
        <Copy className="size-4" />
      </button>
    </div>
  );
}

function IncludedResourceCard({
  name,
  description,
  href,
}: {
  name: string;
  description: string;
  href: string;
}) {
  return (
    <Card className="flex h-full flex-col border-black/10 bg-[#f7f6f4] dark:border-white/10 dark:bg-[#182a32]">
      <CardHeader className="pb-2">
        <Badge
          variant="secondary"
          className="mb-1 w-fit rounded-md border border-black/10 bg-black/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-black/60 uppercase dark:border-white/10 dark:bg-white/8 dark:text-white/60"
        >
          Guide
        </Badge>
        <CardTitle className="text-base leading-tight font-medium">
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <Link
          to={href}
          className="text-xs font-medium text-db-lava no-underline hover:underline"
        >
          View
        </Link>
      </CardFooter>
    </Card>
  );
}

export function ExampleDetail({
  example,
  rawMarkdown,
  children,
}: ExampleDetailProps): ReactNode {
  const contentRef = useRef<HTMLDivElement>(null);
  const heroImageUrl = useBaseUrl(example.image);
  const permalink = `/resources/${example.id}`;
  const githubUrl = `${GITHUB_BASE}/${example.githubPath}`;

  const includedTemplates = example.templateIds
    .map((id) => templates.find((t) => t.id === id))
    .filter(Boolean);

  const includedRecipes = example.recipeIds
    .map((id) => recipes.find((r) => r.id === id))
    .filter(Boolean);

  return (
    <Layout title={example.name} description={example.description}>
      <main>
        <div className="container px-4 py-8 md:py-12">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="min-w-0">
                <Link
                  to="/resources"
                  className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-foreground"
                >
                  <span aria-hidden="true">&larr;</span>
                  All resources
                </Link>

                <div className="mb-3 flex justify-end">
                  <AIExportMenu
                    rawMarkdown={rawMarkdown}
                    title={example.name}
                    description={example.description}
                    permalink={permalink}
                  />
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="rounded-md border border-db-lava/20 bg-db-lava/8 px-2.5 py-0.5 text-xs font-semibold text-db-lava"
                  >
                    Example
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    {example.name}
                  </h1>
                </div>
                <p className="mb-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {example.description}
                </p>
                <div className="mb-6 flex flex-wrap gap-2">
                  {example.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="rounded-sm border border-black/10 bg-black/4 px-2 py-0.5 text-xs font-medium text-black/78 dark:border-white/10 dark:bg-white/8 dark:text-white/78"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mb-8 overflow-hidden rounded-xl">
                  <img
                    src={heroImageUrl}
                    alt={`${example.name} architecture`}
                    className="h-auto w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 no-underline"
                    >
                      <ExternalLink className="size-3.5" />
                      View on GitHub
                    </a>
                  </Button>
                </div>

                <div className="mb-8">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Get started
                  </p>
                  <CopyCommand command={example.initCommand} />
                </div>

                <div className="recipe-content-card" ref={contentRef}>
                  <MDXProvider components={mdxComponents}>
                    <div className="prose-solution">{children}</div>
                  </MDXProvider>
                </div>

                {(includedTemplates.length > 0 ||
                  includedRecipes.length > 0) && (
                  <div className="mt-12">
                    <h2 className="mb-6 text-xl font-semibold tracking-tight">
                      Included Resources
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {includedTemplates.map((t) => (
                        <IncludedResourceCard
                          key={t.id}
                          name={t.name}
                          description={t.description}
                          href={`/resources/${t.id}`}
                        />
                      ))}
                      {includedRecipes.map((r) => (
                        <IncludedResourceCard
                          key={r.id}
                          name={r.name}
                          description={r.description}
                          href={`/resources/${r.id}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
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
