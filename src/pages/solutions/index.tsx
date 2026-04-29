import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  isLinkedSolution,
  solutions,
  type LinkedSolution,
  type NativeSolution,
  type Solution,
} from "@/lib/solutions/solutions";

function NativeCardVisual(): ReactNode {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.25)_1px,transparent_0)] [background-size:8px_8px]" />
      <div className="absolute left-6 top-8 h-24 w-24 rounded-full border border-white/25" />
      <div className="absolute left-16 top-16 h-20 w-28 rounded-md bg-db-lava/95" />
      <div className="absolute right-8 bottom-7 h-14 w-20 rounded-md bg-[#0f141b] shadow-lg" />
    </div>
  );
}

const cardClasses =
  "group flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-[#f7f6f4] shadow-none transition-all duration-200 hover:border-black/20 dark:border-white/10 dark:bg-[#182a32] dark:hover:border-white/20";

function TagList({ tags }: { tags: string[] }): ReactNode {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="rounded-sm border border-black/10 bg-black/4 px-1.5 py-0 text-[11px] font-medium text-black/78 dark:border-white/10 dark:bg-white/8 dark:text-white/78"
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}

function NativeSolutionCard({
  solution,
}: {
  solution: NativeSolution;
}): ReactNode {
  return (
    <Link to={`/solutions/${solution.id}`} className="no-underline">
      <Card className={cardClasses}>
        <div className="relative aspect-[1.91/1] overflow-hidden border-b border-black/10 bg-gradient-to-br from-[#11141a] via-[#1b2028] to-[#0d0f14] dark:border-white/10">
          <NativeCardVisual />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl leading-tight font-medium text-black dark:text-white">
            {solution.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pt-0">
          <p className="m-0 text-[15px] leading-relaxed text-black/68 dark:text-white/68">
            {solution.description}
          </p>
        </CardContent>
        <CardFooter className="pt-0">
          <TagList tags={solution.tags} />
        </CardFooter>
      </Card>
    </Link>
  );
}

function LinkedSolutionCard({
  solution,
}: {
  solution: LinkedSolution;
}): ReactNode {
  const previewSrc = useBaseUrl(solution.previewImage);
  const authorLine =
    solution.authors.length === 0
      ? solution.source
      : `${solution.authors.join(", ")} · ${solution.source}`;

  return (
    <a
      href={solution.url}
      target="_blank"
      rel="noopener noreferrer"
      className="no-underline"
      aria-label={`${solution.title} on ${solution.source} (opens in new tab)`}
    >
      <Card className={cardClasses}>
        <div className="relative aspect-[1.91/1] overflow-hidden border-b border-black/10 bg-[#f1ede4] dark:border-white/10 dark:bg-[#0f1c22]">
          <img
            src={previewSrc}
            alt={solution.previewImageAlt}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            <ExternalLink aria-hidden="true" className="size-3" />
            <span>{solution.source}</span>
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl leading-tight font-medium text-black dark:text-white">
            {solution.title}
          </CardTitle>
          <p className="m-0 mt-1 text-[12px] text-black/60 dark:text-white/60">
            {authorLine}
          </p>
        </CardHeader>
        <CardContent className="flex-1 pt-0">
          <p className="m-0 text-[15px] leading-relaxed text-black/68 dark:text-white/68">
            {solution.description}
          </p>
        </CardContent>
        <CardFooter className="pt-0">
          <TagList tags={solution.tags} />
        </CardFooter>
      </Card>
    </a>
  );
}

function SolutionCard({ solution }: { solution: Solution }): ReactNode {
  if (isLinkedSolution(solution)) {
    return <LinkedSolutionCard solution={solution} />;
  }
  return <NativeSolutionCard solution={solution} />;
}

export default function SolutionsPage(): ReactNode {
  return (
    <Layout title="Solutions" description="Databricks developer solutions">
      <main className="border-t border-db-cyan/30 bg-db-bg dark:border-db-cyan/25 dark:bg-[#0d1a1f]">
        <div className="container px-4 py-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <p className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-black/60 uppercase dark:text-white/60">
              <span className="text-db-lava">&#9658;</span>
              Solutions
            </p>
            <h1 className="mb-4 max-w-3xl text-4xl leading-[1.06] font-medium tracking-tight text-black dark:text-white md:text-5xl">
              <span className="text-db-lava">Developer-first</span> guides for
              building on Databricks.
            </h1>
            <p className="mb-12 max-w-2xl text-lg text-black/68 dark:text-white/68">
              Deep-dives, launch announcements, and opinionated perspectives on
              the Databricks developer stack — both authored on DevHub and
              hand-picked from the Databricks Blog.
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {solutions.map((solution) => (
                <SolutionCard key={solution.id} solution={solution} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
