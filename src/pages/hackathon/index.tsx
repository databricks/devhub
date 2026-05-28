import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  FileText,
  HelpCircle,
  LayoutTemplate,
  MapPin,
  MessageSquare,
  Sparkles,
  Trophy,
  Upload,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

/**
 * Always-live evergreen hackathon resources page. The home/nav don't link to
 * it; entry is via the site-wide announcement banner during the event window
 * (see `src/lib/hackathon-banner-server.ts`).
 *
 * Content is hardcoded so it can be edited per-event without touching schema
 * or env vars. Bump the dates / event name in this file before each hackathon.
 */

const EVENT_NAME = "Apps & Agents for Good Hackathon";
const EVENT_DATES = "June 15 \u2013 June 16, 2026";
const EVENT_LOCATION = "Marriott Marquis, San Francisco";
const APPLY_URL =
  "https://events.mlh.com/events/13878-databricks-apps-agents-hackathon-for-good";
const APPLICATION_DEADLINE = "Sunday, May 31, 2026 \u00b7 11:59pm PT";
const EVENT_TAGLINE =
  "The Databricks Apps & Agents for Good Hackathon 2026 is a multi-day competition hosted in partnership with OpenAI, bringing developers together to drive meaningful change. This year's hackathon challenges teams to build powerful agentic data apps for social impact using Lakebase, Agent Bricks, and Databricks Apps.";
const EVENT_TAGLINE_SECONDARY =
  "The event culminates in live judging, a showcase of standout projects, and cash prizes for the most impactful and imaginative solutions. The hackathon is part of Data + AI Summit 2026 \u2014 you and every teammate must be registered for the summit to participate.";

type Resource = {
  title: string;
  description: ReactNode;
  href: string;
  external?: boolean;
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const RESOURCES: Resource[] = [
  {
    title: "Get started",
    description: (
      <>
        <p className="m-0">
          Read the docs to learn how to set up your coding environment and start
          building your app.
        </p>
        <p className="mt-2 mb-1">
          We suggest reading the following pages before you start hacking:
        </p>
        <ul className="m-0 list-disc pl-5">
          <li>
            <strong className="font-semibold text-black dark:text-white">
              Start here
            </strong>
          </li>
          <li>
            <strong className="font-semibold text-black dark:text-white">
              Platform overview
            </strong>
          </li>
          <li>
            <strong className="font-semibold text-black dark:text-white">
              Set up your environment
            </strong>
          </li>
        </ul>
      </>
    ),
    href: "/docs/start-here",
    Icon: BookOpen,
  },
  {
    title: "App with Lakebase template",
    description:
      "Scaffold a Databricks app wired up to Lakebase from this template and start hacking right away \u2014 then adapt it to fit your project.",
    href: "/templates/app-with-lakebase",
    Icon: LayoutTemplate,
  },
  {
    title: "Ask questions",
    description:
      "Stuck? Join our hackathon Discord server to ask questions and get help!",
    href: "#",
    external: true,
    Icon: MessageSquare,
  },
  {
    title: "Official rules",
    description:
      "Eligibility, team requirements, IP, and judging rules for the hackathon.",
    href: "#",
    external: true,
    Icon: FileText,
  },
];

const TIMELINE = [
  {
    label: "Applications close",
    date: "May 31, 2026 \u00b7 11:59pm PT",
    detail: "Apply on MLH in teams of 2\u20134.",
  },
  {
    label: "Opening + hacking begins",
    date: "June 15, 2026 \u00b7 8:00am\u20134:00pm PT",
    detail: "Opening ceremony and kickoff at Marriott Marquis, San Francisco.",
  },
  {
    label: "Hacker's Corner (optional)",
    date: "June 16, 2026 \u00b7 11:00am\u20135:00pm PT",
    detail: "Open collaboration space.",
  },
  {
    label: "Judging + awards",
    date: "June 16, 2026 \u00b7 6:00pm\u20139:00pm PT",
    detail: "Live judging, followed by the awards ceremony.",
  },
  {
    label: "Winners showcase",
    date: "June 17, 2026",
    detail:
      "Winning teams and selected projects presented at Hacker's Corner for Data + AI Summit attendees.",
  },
];

const JUDGING_CRITERIA = [
  {
    title: "Product judgment",
    detail: "Is the user clear? Are the workflow and tradeoffs thoughtful?",
  },
  {
    title: "Evidence and uncertainty",
    detail:
      "Are outputs grounded in citations? Is uncertainty handled honestly?",
  },
  {
    title: "Technical execution",
    detail:
      "Does the app work reliably in a live demo? Are Databricks capabilities used well?",
  },
  {
    title: "Ambition",
    detail: "Did the team go beyond the minimum workflow in a meaningful way?",
  },
];

const FAQ = [
  {
    q: "Do I need to be registered for Data + AI Summit 2026?",
    a: "Yes. The hackathon is part of Data + AI Summit 2026, and every participant \u2014 including all teammates \u2014 must be registered for the summit to take part.",
  },
  {
    q: "When do applications close?",
    a: "Sunday, May 31, 2026 at 11:59pm PT. Apply through the MLH event page; if you've applied, hold off on booking Monday activities in the DAIS attendee portal until you hear back.",
  },
  {
    q: "Where is the hackathon?",
    a: "In-person only at the Marriott Marquis in San Francisco, alongside Data + AI Summit 2026.",
  },
  {
    q: "How big can my team be?",
    a: "Teams of 2 to 4 people. Every teammate must also be registered for Data + AI Summit 2026.",
  },
  {
    q: "What if I'm new to Databricks?",
    a: 'Start with the "Start here" docs and copy one of the templates as a prompt for your coding agent \u2014 it will scaffold a working app and walk you through the rest.',
  },
];

function DatabricksLogo({ className }: { className?: string }): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 712.77 112.97"
      aria-hidden
      focusable={false}
      className={className}
    >
      <polygon
        fill="#ff3621"
        points="0 29.44 0 32.84 52.13 62.25 98.69 35.96 98.7 46.58 52.13 73.04 2.62 44.91 0 46.37 0 66.72 52.13 96.06 98.69 69.86 98.7 80.4 52.13 106.86 2.62 78.73 0 80.19 0 83.64 52.13 112.97 104.26 83.64 104.26 63.27 101.63 61.82 52.13 89.95 5.56 63.49 5.56 53 52.13 79.17 104.26 49.83 104.26 29.76 101.63 28.3 52.13 56.44 7.95 31.33 52.13 6.38 88.52 26.94 91.7 25.15 91.7 22.35 52.13 0 0 29.44"
      />
      <g fill="currentColor">
        <path d="M202.16,96.24V6.4H188.32V40a1.19,1.19,0,0,1-2.09.77c-4.68-5.49-12-8.64-20-8.64-17.11,0-30.5,14.43-30.5,32.84a34.07,34.07,0,0,0,8.8,23.43,29.33,29.33,0,0,0,21.7,9.41,26,26,0,0,0,20-9,1.19,1.19,0,0,1,2.1.77v6.69Zm-32.84-11c-11,0-19.64-8.92-19.64-20.3s8.63-20.3,19.64-20.3S189,53.58,189,65s-8.63,20.3-19.65,20.3" />
        <path d="M276,96.24V33.68H262.33V40a1.2,1.2,0,0,1-.79,1.12,1.17,1.17,0,0,1-1.31-.36c-4.65-5.54-11.75-8.6-20-8.6-17.1,0-30.5,14.43-30.5,32.84s13.4,32.84,30.5,32.84a25.75,25.75,0,0,0,20-9.11,1.18,1.18,0,0,1,1.32-.36,1.2,1.2,0,0,1,.79,1.12v6.79Zm-32.71-11c-11,0-19.65-8.92-19.65-20.3s8.63-20.3,19.65-20.3S263,53.58,263,65s-8.63,20.3-19.65,20.3" />
        <path d="M393.28,96.24V33.68H379.56V40a1.19,1.19,0,0,1-2.1.76c-4.64-5.54-11.75-8.6-20-8.6C340.35,32.12,327,46.55,327,65s13.4,32.84,30.5,32.84a25.75,25.75,0,0,0,20-9.11,1.19,1.19,0,0,1,2.1.76v6.79Zm-32.71-11c-11,0-19.65-8.92-19.65-20.3s8.63-20.3,19.65-20.3,19.64,8.92,19.64,20.3-8.63,20.3-19.64,20.3" />
        <path d="M418.41,88.81a1.14,1.14,0,0,1,.41-.07,1.21,1.21,0,0,1,.91.41c4.68,5.5,12,8.64,20,8.64,17.1,0,30.5-14.42,30.5-32.83a34.12,34.12,0,0,0-8.8-23.43,29.33,29.33,0,0,0-21.7-9.41,26,26,0,0,0-20,9,1.19,1.19,0,0,1-2.1-.76l0-34H403.82l0,89.84h13.84V89.93a1.2,1.2,0,0,1,.78-1.12M417,65c0-11.38,8.63-20.3,19.64-20.3s19.65,8.92,19.65,20.3-8.63,20.29-19.65,20.29S417,76.34,417,65" />
        <path d="M510.07,46.48a16.07,16.07,0,0,1,3.34.31V32.61a11.84,11.84,0,0,0-2.3-.23A20.05,20.05,0,0,0,493.8,42a1.19,1.19,0,0,1-2.21-.61V33.68H477.88V96.24h13.84V68.73c0-13.73,7-22.25,18.35-22.25" />
        <rect x="522.08" y="33.68" width="13.97" height="62.56" />
        <path d="M528.9,6.46a8.48,8.48,0,1,0,8.48,8.47,8.48,8.48,0,0,0-8.48-8.47" />
        <path d="M577.1,32.12C557.93,32.12,544,45.93,544,65c0,9.25,3.26,17.62,9.19,23.56S567.6,97.8,577,97.8c7.76,0,13.81-1.54,25.21-9.91l-7.86-8.29c-5.6,3.72-10.81,5.53-15.92,5.53-11.57,0-20.3-8.67-20.3-20.17s8.73-20.17,20.3-20.17a25.63,25.63,0,0,1,15.65,5.53L602.83,42c-10.2-8.86-19.56-9.89-25.73-9.89" />
        <path d="M626.49,68.65a1.2,1.2,0,0,1,.8-.31h.08a1.24,1.24,0,0,1,.85.44l22.13,27.44,17,0L638.74,61.6a1.19,1.19,0,0,1,.08-1.6l26.32-26.32H648.26L625.59,56.46a1.18,1.18,0,0,1-2-.84l0-49.22H609.73V96.24h13.84V71.86A1.15,1.15,0,0,1,624,71Z" />
        <path d="M689.94,97.8c11.35,0,22.83-6.87,22.83-20,0-8.56-5.35-14.46-16.37-18l-7.54-2.47c-5.06-1.69-7.53-4.11-7.53-7.41,0-3.77,3.38-6.4,8.22-6.4,4.6,0,8.7,3,11.29,8.24l11.11-6a24.44,24.44,0,0,0-22.4-13.63c-12.4,0-21.41,8-21.41,18.94,0,8.67,5.19,14.53,15.86,17.92l7.67,2.47c5.43,1.72,7.65,3.86,7.65,7.41,0,5.29-4.91,7.17-9.12,7.17-5.62,0-10.58-3.64-13-9.52L666,82.36c3.71,9.53,12.87,15.44,24,15.44" />
        <path d="M314.38,97.16a73.68,73.68,0,0,0,10.51-.73v-12a64.56,64.56,0,0,1-6.94.45c-5.62,0-9.91-1-9.91-13.06V46.14A1.18,1.18,0,0,1,309.22,45h13.47V33.67H309.22A1.19,1.19,0,0,1,308,32.49V14.35H294.28V32.49a1.19,1.19,0,0,1-1.19,1.19h-9.64V45h9.63a1.18,1.18,0,0,1,1.19,1.18V75.28c0,21.88,14.6,21.88,20.1,21.88" />
      </g>
    </svg>
  );
}

function SummitEyebrow(): ReactNode {
  return (
    <p className="mb-4 flex items-center gap-3 text-black/70 dark:text-white/70">
      <DatabricksLogo className="h-4 w-auto" />
      <span className="sr-only">Databricks </span>
      <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">
        Data + AI Summit
      </span>
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
      <div className="text-[14px] leading-relaxed text-black/68 dark:text-white/68">
        {description}
      </div>
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
      title={`${EVENT_NAME} \u2014 Databricks Data + AI Summit 2026`}
      description={`Databricks ${EVENT_NAME} at Data + AI Summit 2026 \u2014 schedule, resources, and how to apply.`}
    >
      {/* Hide just the "See resources" link in the site-wide hackathon banner
          when the visitor is already on this page — the link points here, so
          showing it would be redundant. The lead text still shows so the
          event branding stays consistent across pages. */}
      <Head>
        <meta name="robots" content="noindex, nofollow" />
        <style>{`.theme-announcement-bar a { display: none !important; }`}</style>
      </Head>
      <main className="border-t border-db-cyan/30 bg-db-bg dark:border-db-cyan/25 dark:bg-[#0d1a1f]">
        <section className="container px-4 pt-16 pb-10 md:pt-20 md:pb-12">
          <div className="mx-auto max-w-4xl">
            <SummitEyebrow />
            <h1 className="mb-4 text-4xl leading-[1.06] font-medium tracking-tight text-black dark:text-white md:text-5xl">
              <span className="text-db-lava">{EVENT_NAME}</span>
            </h1>
            <p className="m-0 flex items-center gap-2 text-sm font-medium text-black/70 dark:text-white/70">
              <CalendarDays className="h-4 w-4 text-db-lava" aria-hidden />
              {EVENT_DATES}
            </p>
            <p className="m-0 mt-2 flex items-center gap-2 text-sm font-medium text-black/70 dark:text-white/70">
              <MapPin className="h-4 w-4 text-db-lava" aria-hidden />
              {EVENT_LOCATION}
            </p>
            <p className="m-0 mt-3 mb-4 text-sm font-medium text-black/70 dark:text-white/70">
              Partnering with{" "}
              <span className="text-base font-semibold text-black dark:text-white">
                OpenAI
              </span>
            </p>
            <p className="mb-4 max-w-2xl text-lg text-black/68 dark:text-white/68">
              {EVENT_TAGLINE}
            </p>
            <p className="mb-8 max-w-2xl text-base text-black/68 dark:text-white/68">
              {EVENT_TAGLINE_SECONDARY}
            </p>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <a
                href={APPLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-db-lava px-5 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-db-lava/90"
              >
                Apply on MLH
                <ArrowUpRight aria-hidden className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-3 text-xs text-black/50 dark:text-white/50">
              Applications close {APPLICATION_DEADLINE}. Apply in teams of
              2&ndash;4 &mdash; every teammate must be registered for Data + AI
              Summit 2026.
            </p>
          </div>
        </section>

        <section className="container px-4 py-10 md:py-14">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-2xl font-medium text-black dark:text-white">
              Resources
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            <h2 className="mb-3 flex items-center gap-2 text-2xl font-medium text-black dark:text-white">
              <Upload className="h-5 w-5 text-db-lava" aria-hidden />
              Submission
            </h2>
            <p className="m-0 text-base text-black/68 dark:text-white/68">
              Submit a Git repo and a live Databricks App. Be prepared to give a
              three-minute demo explaining the user, workflow, technical
              approach, and key tradeoffs.
            </p>
          </div>
        </section>

        <section className="container px-4 py-10 md:py-14">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-3 flex items-center gap-2 text-2xl font-medium text-black dark:text-white">
              <Trophy className="h-5 w-5 text-db-lava" aria-hidden />
              Judging
            </h2>
            <p className="mb-6 text-base text-black/68 dark:text-white/68">
              Submissions will be judged on four dimensions:
            </p>
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
