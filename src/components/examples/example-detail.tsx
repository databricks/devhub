import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import { MDXProvider } from "@mdx-js/react";
import { useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { ClipboardCopy, ExternalLink } from "lucide-react";
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
import {
  RecipePre,
  RecipeCodeBlock,
} from "@/components/templates/recipe-code-block";
import { RecipeToc } from "@/components/templates/recipe-toc";
import {
  buildMarkdownWithAboutDevhubLeadIn,
  useAboutDevhubBody,
} from "@/lib/copy-about-devhub";
import {
  buildFullPrompt,
  buildAdditionalMarkdown,
  EXAMPLE_AGENT_OUTCOME_BULLETS,
  EXAMPLE_AGENT_OUTCOME_BULLETS_INIT,
} from "@/lib/examples/build-example-markdown";
import type { Example } from "@/lib/recipes/recipes";
import { templates, recipes } from "@/lib/recipes/recipes";
import { useExampleSections } from "@/lib/use-raw-content-markdown";
import { joinContentSections } from "@/lib/content-sections";
import { ResourceImageCarousel } from "@/components/examples/resource-image-carousel";
import { ResourcePreviewImage } from "@/components/examples/resource-preview-image";
import { FallbackCardArt } from "@/components/examples/fallback-card-art";

const mdxComponents = { pre: RecipePre };

const GITHUB_BASE = "https://github.com/databricks/devhub/tree/main";

type ExampleDetailProps = {
  example: Example;
  children: ReactNode;
};

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

function GetStartedSteps({
  example,
  fullPrompt,
  siteUrl,
  aboutDevhubBody,
}: {
  example: Example;
  fullPrompt: string;
  siteUrl: string;
  aboutDevhubBody: string;
}) {
  const isInit = example.initCommand
    .trimStart()
    .startsWith("databricks apps init");
  const agentBullets = isInit
    ? EXAMPLE_AGENT_OUTCOME_BULLETS_INIT
    : EXAMPLE_AGENT_OUTCOME_BULLETS;

  function handleCopyPrompt() {
    const base = siteUrl.replace(/\/$/, "");
    const originForCopy =
      typeof window !== "undefined" ? window.location.origin : base;
    const text = buildMarkdownWithAboutDevhubLeadIn(
      aboutDevhubBody,
      `${originForCopy}/llms.txt`,
      fullPrompt,
    );
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Prompt copied");
    });
  }

  return (
    <section className="example-get-started mb-10 rounded-lg border border-border/80 bg-card">
      <div className="px-6 py-8 sm:px-8 sm:py-9">
        <h2 className="mt-0 text-lg font-semibold tracking-tight text-card-foreground">
          Get started
        </h2>

        <div className="mt-8 flex flex-col gap-10">
          <div>
            <div className="mb-4 font-mono text-[11px] leading-none font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Agent
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-fit gap-2 rounded-md border-border px-3 font-mono text-xs shadow-none"
                onClick={handleCopyPrompt}
                title="Copies the full prompt for Cursor, Claude Code, Codex, or similar tools"
              >
                <ClipboardCopy className="size-3.5" />
                Copy prompt
              </Button>
              <span className="font-mono text-[11px] text-muted-foreground">
                Paste into your coding agent
              </span>
            </div>
            <ul className="mt-5 space-y-2.5 border-l border-border/70 pl-4">
              {agentBullets.map((line) => (
                <li
                  key={line}
                  className="text-[13px] leading-snug text-muted-foreground"
                >
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-5 font-mono text-[11px] leading-relaxed text-muted-foreground">
              {isInit ? (
                <>
                  Use the CLI block below to scaffold the project with{" "}
                  <code className="rounded border border-border/80 bg-muted/80 px-1.5 py-px font-mono text-[12px] text-card-foreground">
                    databricks apps init
                  </code>
                  , then follow the generated{" "}
                  <code className="rounded border border-border/80 bg-muted/80 px-1.5 py-px font-mono text-[12px] text-card-foreground">
                    README.md
                  </code>{" "}
                  for configuration, seeding, and deploy. This page summarizes
                  the example; the README is the runbook.
                </>
              ) : (
                <>
                  Use the CLI block below to clone locally, then follow{" "}
                  <code className="rounded border border-border/80 bg-muted/80 px-1.5 py-px font-mono text-[12px] text-card-foreground">
                    template/README.md
                  </code>{" "}
                  in the repo for provisioning, seeding, pipelines, and deploy.
                  This page summarizes the example; the README is the runbook.
                </>
              )}
            </p>
          </div>

          <div className="border-t border-border/60 pt-10">
            <div className="mb-6 font-mono text-[11px] leading-none font-medium tracking-[0.14em] text-muted-foreground uppercase">
              CLI
            </div>
            <ol className="m-0 list-none space-y-10 p-0">
              <li className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:gap-x-4">
                <span
                  className="pt-0.5 font-mono text-xs tabular-nums text-muted-foreground/90"
                  aria-hidden
                >
                  01
                </span>
                <div className="min-w-0 space-y-3">
                  {isInit ? (
                    <>
                      <p className="m-0 text-sm font-medium text-card-foreground">
                        Scaffold with{" "}
                        <code className="rounded border border-border/80 bg-muted/80 px-1.5 py-px font-mono text-[12px] text-card-foreground">
                          databricks apps init
                        </code>
                        , then follow the generated{" "}
                        <code className="rounded border border-border/80 bg-muted/80 px-1.5 py-px font-mono text-[12px] text-card-foreground">
                          README.md
                        </code>
                      </p>
                      <RecipeCodeBlock>{example.initCommand}</RecipeCodeBlock>
                      <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">
                        The CLI prompts for required resources (e.g. Lakebase
                        branch, database), auto-resolves connection details into
                        your local{" "}
                        <code className="rounded border border-border/80 bg-muted/80 px-1 py-px font-mono text-[12px] text-card-foreground">
                          .env
                        </code>
                        , and drops you into a ready-to-run project directory.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="m-0 text-sm font-medium text-card-foreground">
                        Clone locally, then follow{" "}
                        <code className="rounded border border-border/80 bg-muted/80 px-1.5 py-px font-mono text-[12px] text-card-foreground">
                          template/README.md
                        </code>
                      </p>
                      <RecipeCodeBlock>{example.initCommand}</RecipeCodeBlock>
                      <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">
                        Provisioning (including manual steps and SQL), seeding,
                        and deployment commands live in that README alongside
                        the app and bundle code.
                      </p>
                    </>
                  )}
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ExampleDetail({
  example,
  children,
}: ExampleDetailProps): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const permalink = `/templates/${example.id}`;
  const githubUrl = `${GITHUB_BASE}/${example.githubPath}`;

  const sections = useExampleSections(example.id) ?? { content: "" };
  const rawMarkdown = joinContentSections(sections);
  const aboutDevhubBody = useAboutDevhubBody();

  const includedTemplates = example.templateIds
    .map((id) => templates.find((t) => t.id === id))
    .filter(Boolean);

  const includedRecipes = example.recipeIds
    .map((id) => recipes.find((r) => r.id === id))
    .filter(Boolean);

  const mdOpts = {
    example,
    githubUrl,
    includedTemplates,
    includedRecipes,
    baseUrl: siteConfig.url,
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
                  rawMarkdown={rawMarkdown}
                  additionalMarkdown={additionalMarkdown}
                  agentBodyAfterAbout={fullPrompt}
                  title={example.name}
                  description={example.description}
                  permalink={permalink}
                />

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

                {example.galleryImages && example.galleryImages.length > 0 ? (
                  <ResourceImageCarousel
                    images={example.galleryImages}
                    exampleName={example.name}
                  />
                ) : (
                  <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                    <ResourcePreviewImage
                      lightUrl={example.previewImageLightUrl}
                      darkUrl={example.previewImageDarkUrl}
                      alt={`${example.name} preview`}
                      fallback={<FallbackCardArt index={0} />}
                    />
                  </div>
                )}

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

                <GetStartedSteps
                  example={example}
                  fullPrompt={fullPrompt}
                  siteUrl={siteConfig.url}
                  aboutDevhubBody={aboutDevhubBody}
                />

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
                          href={`/templates/${t.id}`}
                        />
                      ))}
                      {includedRecipes.map((r) => (
                        <IncludedResourceCard
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
