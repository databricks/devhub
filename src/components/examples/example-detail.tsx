import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import { MDXProvider } from "@mdx-js/react";
import { useRef, type ReactNode } from "react";
import { Code2, ExternalLink, FolderGit2 } from "lucide-react";
import { TemplateUsageBanner } from "@/components/template-usage-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecipePre } from "@/components/cookbooks/recipe-code-block";
import { RecipeToc } from "@/components/cookbooks/recipe-toc";
import {
  buildFullPrompt,
  buildAdditionalMarkdown,
} from "@/lib/examples/build-example-markdown";
import type { Example } from "@/lib/recipes/recipes";
import { cookbooks, recipes } from "@/lib/recipes/recipes";
import { useExampleSections } from "@/lib/use-raw-content-markdown";
import { goalOnly } from "@/lib/content-sections";
import { TemplateImageCarousel } from "@/components/examples/template-image-carousel";
import { TemplatePreviewImage } from "@/components/examples/template-preview-image";
import { FallbackCardArt } from "@/components/examples/fallback-card-art";
import { siteUrlFromConfig } from "@/lib/site-url";
import { BaseUrlAnchor } from "@/components/base-url-anchor";

const mdxComponents = { a: BaseUrlAnchor, pre: RecipePre };

const GITHUB_BASE = "https://github.com/databricks/devhub/tree/main";

type ExampleDetailProps = {
  example: Example;
  children: ReactNode;
};

function StarterCodeCard({
  githubUrl,
  githubPath,
}: {
  githubUrl: string;
  githubPath: string;
}) {
  return (
    <div className="mb-8 rounded-lg border border-border/80 bg-card">
      <div className="flex items-start gap-3 px-5 pt-5 pb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background">
          <Code2 className="h-4 w-4 text-db-lava" />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="m-0 text-sm font-semibold text-card-foreground">
            Includes a working starter app
          </p>
          <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">
            Real, runnable code lives on GitHub. When you copy the prompt above,
            your coding agent clones it as the starting point and adapts it to
            your data and use case.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-border/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex min-w-0 items-center gap-2 text-[12px] text-muted-foreground">
          <FolderGit2 className="h-3.5 w-3.5 shrink-0" />
          <code className="truncate rounded bg-muted px-1.5 py-0.5 font-mono">
            {githubPath}/template/
          </code>
        </div>
        <Button asChild variant="outline" size="sm" className="sm:shrink-0">
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
    </div>
  );
}

function IncludedTemplateCard({
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
          Template
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
  children,
}: ExampleDetailProps): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const siteUrl = siteUrlFromConfig(siteConfig.url, siteConfig.baseUrl);
  const contentRef = useRef<HTMLDivElement>(null);
  const permalink = `/templates/${example.id}`;
  const githubUrl = `${GITHUB_BASE}/${example.githubPath}/template`;

  const sections = useExampleSections(example.id) ?? { content: "" };
  const rawMarkdown = goalOnly(sections);

  const includedCookbooks = example.cookbookIds
    .map((id) => cookbooks.find((c) => c.id === id))
    .filter(Boolean);

  const includedRecipes = example.recipeIds
    .map((id) => recipes.find((r) => r.id === id))
    .filter(Boolean);

  const mdOpts = {
    example,
    githubUrl,
    includedCookbooks,
    includedRecipes,
    baseUrl: siteUrl,
  };
  const additionalMarkdown = buildAdditionalMarkdown(mdOpts);
  const fullPrompt = buildFullPrompt({ ...mdOpts, sections });

  return (
    <Layout title={example.name} description={example.description}>
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
                  kind="example"
                  rawMarkdown={rawMarkdown}
                  additionalMarkdown={additionalMarkdown}
                  customTemplateBody={fullPrompt}
                  title={example.name}
                  description={example.description}
                  permalink={permalink}
                />

                <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {example.name}
                </h1>
                <p className="mb-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {example.description}
                </p>

                {example.galleryImages && example.galleryImages.length > 0 ? (
                  <TemplateImageCarousel
                    images={example.galleryImages}
                    exampleName={example.name}
                  />
                ) : (
                  <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                    <TemplatePreviewImage
                      lightUrl={example.previewImageLightUrl}
                      darkUrl={example.previewImageDarkUrl}
                      alt={`${example.name} preview`}
                      fallback={<FallbackCardArt index={0} />}
                    />
                  </div>
                )}

                <StarterCodeCard
                  githubUrl={githubUrl}
                  githubPath={example.githubPath}
                />

                <div className="recipe-content-card" ref={contentRef}>
                  <MDXProvider components={mdxComponents}>
                    <div className="prose-solution">{children}</div>
                  </MDXProvider>
                </div>

                {(includedCookbooks.length > 0 ||
                  includedRecipes.length > 0) && (
                  <div className="mt-12">
                    <h2 className="mb-2 text-xl font-semibold tracking-tight">
                      Built on these templates
                    </h2>
                    <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      This example's codebase and the agent prompt above both
                      build on top of the templates below. Open one to dive into
                      a specific technique on its own or apply it to a different
                      project.
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {includedCookbooks.map((c) => (
                        <IncludedTemplateCard
                          key={c.id}
                          name={c.name}
                          description={c.description}
                          href={`/templates/${c.id}`}
                        />
                      ))}
                      {includedRecipes.map((r) => (
                        <IncludedTemplateCard
                          key={r.id}
                          name={r.name}
                          description={r.description}
                          href={`/templates/${r.id}`}
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
