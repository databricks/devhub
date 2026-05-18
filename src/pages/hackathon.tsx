import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Trophy,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { BootstrapCopyButton } from "@/components/home/bootstrap-copy-button";

/**
 * Always-live evergreen hackathon resources page. The home/nav don't link to
 * it; entry is via the site-wide announcement banner during the event window
 * (see `src/lib/hackathon-banner-server.ts`).
 *
 * Content is hardcoded so it can be edited per-event without touching schema
 * or env vars. Bump the dates / event name in this file before each hackathon.
 */

const EVENT_NAME = "Databricks Developer Hackathon";
const EVENT_DATES = "June 15 \u2013 June 16, 2026";
const EVENT_TAGLINE =
  "Ship an agentic app on Databricks in just 2 days. Open to all developers \u2014 students, professionals, and weekend hackers.";

type Resource = {
  title: string;
  description: string;
  href: string;
  external?: boolean;
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const RESOURCES: Resource[] = [
  {
    title: "Templates",
    description:
      "Pre-built starters for AI chat apps, Lakebase-backed apps, Genie analytics, and more. Copy as a prompt for your agent or follow the steps yourself.",
    href: "/templates",
    Icon: Sparkles,
  },
  {
    title: "Start here docs",
    description:
      "Set up your Databricks workspace, install the CLI, and ship your first app. The 60-second path from zero to deployed.",
    href: "/docs/start-here",
    Icon: BookOpen,
  },
  {
    title: "Ask questions on Reddit",
    description:
      "Stuck on a Databricks-specific issue? r/databricks is the fastest place to get unstuck during the hackathon.",
    href: "https://www.reddit.com/r/databricks",
    external: true,
    Icon: MessageSquare,
  },
];

const TIMELINE = [
  {
    label: "Registration opens",
    date: "June 14, 2026",
    detail: "Sign up on the event page \u2014 link coming soon.",
  },
  {
    label: "Hacking begins",
    date: "June 15, 2026",
    detail: "Kickoff livestream + prompts dropped.",
  },
  {
    label: "Submissions close",
    date: "June 16, 2026 \u00b7 11:59pm PT",
    detail: "Submit your repo, demo video, and one-paragraph writeup.",
  },
  {
    label: "Winners announced",
    date: "June 18, 2026",
    detail: "Judging by Databricks engineering and DevRel.",
  },
];

const JUDGING_CRITERIA = [
  {
    title: "Impact",
    detail:
      "Does it solve a real problem someone would actually use? Bonus for measurable outcomes.",
  },
  {
    title: "Technical execution",
    detail:
      "Idiomatic use of the Databricks developer stack \u2014 Lakebase, Agent Bricks, Apps, model serving.",
  },
  {
    title: "Polish",
    detail:
      "Working demo, clear README, sensible UX. We reward shipped over feature-complete.",
  },
  {
    title: "Originality",
    detail: "A fresh take beats a polished clone of an existing app.",
  },
];

const FAQ = [
  {
    q: "Do I need a Databricks account to participate?",
    a: "Yes. The free trial is enough for most submissions \u2014 sign up at databricks.com/signup.",
  },
  {
    q: "Can I work in a team?",
    a: "Teams of up to four are allowed. Solo submissions are welcome too.",
  },
  {
    q: "What if I'm new to Databricks?",
    a: 'Start with the "Start here" docs and copy one of the templates as a prompt for your coding agent \u2014 it will scaffold a working app and walk you through the rest.',
  },
  {
    q: "How are submissions judged?",
    a: "Against the criteria above by a panel of Databricks engineers and DevRel folks. Tie-breakers go to the more original entry.",
  },
];

function EyebrowLabel({ children }: { children: ReactNode }): ReactNode {
  return (
    <p className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-black/60 uppercase dark:text-white/60">
      <span className="text-db-lava">&#9658;</span>
      {children}
    </p>
  );
}

function ResourceCard({ resource }: { resource: Resource }): ReactNode {
  const { title, description, href, external, Icon } = resource;
  const cardClasses =
    "group flex h-full flex-col rounded-xl border border-black/10 bg-[#f7f6f4] p-6 no-underline transition-colors duration-200 hover:border-db-lava/50 dark:border-white/10 dark:bg-[#182a32] dark:hover:border-db-lava-light/55";
  const body = (
    <>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-db-lava" aria-hidden />
        <h3 className="m-0 text-lg font-medium text-black dark:text-white">
          {title}
        </h3>
        {external && (
          <ArrowUpRight
            aria-hidden
            className="ml-auto h-4 w-4 text-black/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-white/40"
          />
        )}
      </div>
      <p className="m-0 text-[14px] leading-relaxed text-black/68 dark:text-white/68">
        {description}
      </p>
    </>
  );
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClasses}
        aria-label={`${title} (opens in new tab)`}
      >
        {body}
      </a>
    );
  }
  return (
    <Link to={href} className={cardClasses}>
      {body}
    </Link>
  );
}

export default function HackathonPage(): ReactNode {
  return (
    <Layout
      title="Hackathon"
      description={`${EVENT_NAME} \u2014 resources, templates, timeline, and FAQ.`}
    >
      {/* Hide just the "See resources" link in the site-wide hackathon banner
          when the visitor is already on this page — the link points here, so
          showing it would be redundant. The lead text still shows so the
          event branding stays consistent across pages. */}
      <Head>
        <style>{`.theme-announcement-bar a { display: none !important; }`}</style>
      </Head>
      <main className="border-t border-db-cyan/30 bg-db-bg dark:border-db-cyan/25 dark:bg-[#0d1a1f]">
        <section className="container px-4 pt-16 pb-10 md:pt-20 md:pb-12">
          <div className="mx-auto max-w-4xl">
            <EyebrowLabel>Hackathon</EyebrowLabel>
            <h1 className="mb-4 text-4xl leading-[1.06] font-medium tracking-tight text-black dark:text-white md:text-5xl">
              <span className="text-db-lava">{EVENT_NAME}</span>
            </h1>
            <p className="m-0 mb-4 inline-flex items-center gap-2 text-sm font-medium text-black/70 dark:text-white/70">
              <CalendarDays className="h-4 w-4 text-db-lava" aria-hidden />
              {EVENT_DATES}
            </p>
            <p className="mb-8 max-w-2xl text-lg text-black/68 dark:text-white/68">
              {EVENT_TAGLINE}
            </p>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <BootstrapCopyButton source="hackathon" />
              <Link
                to="/templates"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-2 text-sm font-medium text-black/80 no-underline dark:border-white/15 dark:bg-white/8 dark:text-white/80"
              >
                Browse templates
                <ArrowUpRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-3 text-xs text-black/50 dark:text-white/50">
              Copy the prompt into Cursor, Claude Code, Codex, or any coding
              agent and it will scaffold a Databricks app for you.
            </p>
          </div>
        </section>

        <section className="container px-4 py-10 md:py-14">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-2xl font-medium text-black dark:text-white">
              Resources
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {RESOURCES.map((resource) => (
                <ResourceCard key={resource.title} resource={resource} />
              ))}
            </div>
          </div>
        </section>

        <section className="container px-4 py-10 md:py-14">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-medium text-black dark:text-white">
              <CalendarDays className="h-5 w-5 text-db-lava" aria-hidden />
              Timeline
            </h2>
            <ol className="m-0 list-none space-y-3 p-0">
              {TIMELINE.map((item) => (
                <li
                  key={item.label}
                  className="grid grid-cols-1 gap-1 rounded-xl border border-black/10 bg-[#f7f6f4] p-4 md:grid-cols-[200px_1fr] md:gap-4 dark:border-white/10 dark:bg-[#182a32]"
                >
                  <div>
                    <p className="m-0 text-sm font-semibold text-black dark:text-white">
                      {item.label}
                    </p>
                    <p className="m-0 text-xs text-db-lava">{item.date}</p>
                  </div>
                  <p className="m-0 text-sm text-black/68 dark:text-white/68">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="container px-4 py-10 md:py-14">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-medium text-black dark:text-white">
              <Trophy className="h-5 w-5 text-db-lava" aria-hidden />
              Judging criteria
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {JUDGING_CRITERIA.map((c) => (
                <div
                  key={c.title}
                  className="rounded-xl border border-black/10 bg-[#f7f6f4] p-5 dark:border-white/10 dark:bg-[#182a32]"
                >
                  <h3 className="m-0 mb-2 text-base font-medium text-black dark:text-white">
                    {c.title}
                  </h3>
                  <p className="m-0 text-sm text-black/68 dark:text-white/68">
                    {c.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container px-4 pt-10 pb-20 md:pt-14 md:pb-28">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-medium text-black dark:text-white">
              <HelpCircle className="h-5 w-5 text-db-lava" aria-hidden />
              FAQ
            </h2>
            <dl className="m-0 space-y-4">
              {FAQ.map((item) => (
                <div
                  key={item.q}
                  className="rounded-xl border border-black/10 bg-[#f7f6f4] p-5 dark:border-white/10 dark:bg-[#182a32]"
                >
                  <dt className="m-0 mb-2 text-sm font-semibold text-black dark:text-white">
                    {item.q}
                  </dt>
                  <dd className="m-0 text-sm text-black/68 dark:text-white/68">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
    </Layout>
  );
}
