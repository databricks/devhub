import Link from "next/link";

import type { HackathonEvent } from "@/components/hackathon/hackathon-event-page";

/**
 * Apps & Agents for Good Hackathon at Data + AI Summit 2026.
 *
 * Served at `/hackathon/apps-agents-for-good-2026`. Content is hardcoded here
 * so it can be edited without touching other events or shared schema.
 */

const hackathonDatasetUrl =
  "https://login.databricks.com/signin?intent=SIGN_IN&auto_login=true&destination_url=%2Fmarketplace%2Fconsumer%2Flistings%2F19326b3d-db63-4627-abc0-cf4e8131a305&utm_source=open-in-databricks&utm_medium=marketplace&utm_campaign=dais-devrel-hackathon";

export const appsAgentsForGood2026Event: HackathonEvent = {
  name: "Apps & Agents for Good Hackathon",
  description:
    "The Databricks Apps & Agents for Good Hackathon 2026 is a multi-day competition hosted in partnership with OpenAI, bringing developers together to drive meaningful change.",
  metaTitle:
    "Apps & Agents for Good Hackathon — Databricks Data + AI Summit 2026",
  metaDescription:
    "Databricks Apps & Agents for Good Hackathon at Data + AI Summit 2026 — schedule, resources, and how to apply.",
  applyUrl:
    "https://events.mlh.com/events/13878-databricks-apps-agents-hackathon-for-good",
  registrationClosed: true,
  applyNote:
    "Registration is now closed. The hackathon is open only to Data + AI Summit 2026 attendees.",
  facts: [
    {
      title: "Data + AI Summit",
      detail: "Partnering with OpenAI",
    },
    {
      title: "When",
      detail: "June 15 – June 16, 2026",
    },
    {
      title: "Where",
      detail: "Marriott Marquis, San Francisco",
    },
  ],
  about: (
    <>
      <p className="m-0">
        This year's hackathon challenges teams to build powerful agentic data
        apps for social impact using Lakebase, Agent Bricks, and Databricks
        Apps.
      </p>
      <p className="m-0">
        The event culminates in live judging, a showcase of standout projects,
        and cash prizes for the most impactful and imaginative solutions. The
        hackathon is part of Data + AI Summit 2026 — you and every teammate must
        be registered for the summit to participate.
      </p>
    </>
  ),
  resources: [
    {
      label: "Checklist",
      title: "Quick start checklist",
      href: "/hackathon/quick-start-checklist",
      description:
        "Follow the step-by-step checklist to get set up and start coding.",
      wide: true,
    },
    {
      label: "Challenge",
      title: "The challenge",
      href: "/hackathon/challenge",
      description:
        "Read the full challenge prompt, dataset overview, and the four tracks you can pick from.",
    },
    {
      label: "Setup guide",
      title: "Set up Free Edition",
      href: "/hackathon/free-edition-setup",
      description:
        "Create a Databricks Free Edition workspace and get your whole team ready to build and demo.",
    },
    {
      label: "Dataset",
      title: "Hackathon dataset",
      href: hackathonDatasetUrl,
      external: true,
      description:
        "Add the hackathon dataset to your Databricks workspace to start building with it.",
    },
    {
      label: "Template",
      title: "Hackathon starter template",
      href: "/templates/hackathon-app-with-synced-dataset",
      description:
        "Scaffold a Databricks App backed by Lakebase with the hackathon dataset automatically synced in.",
    },
    {
      label: "Discord community",
      title: "Ask questions",
      href: "https://discord.com/invite/bedRGCjFq",
      external: true,
      description:
        "Stuck on something during the build? Join our hackathon Discord server to ask questions anytime.",
    },
    {
      label: "PDF",
      title: "Official rules",
      href: "https://bit.ly/4d0Gj7w",
      external: true,
      description:
        "Read the eligibility, team requirements, IP terms, and judging rules before you start building anything.",
    },
    {
      label: "Docs",
      title: "Read the Docs",
      wide: true,
      description: (
        <>
          <p className="m-0">
            Read the docs to learn how to set up your coding environment and
            start building your app. We highly suggest reading the following
            pages before you start hacking:
          </p>
        </>
      ),
      links: [
        { label: "Start here", href: "/docs/start-here" },
        { label: "Platform overview", href: "/docs/platform-overview" },
        { label: "Databricks CLI", href: "/docs/tools/databricks-cli" },
        { label: "Agent skills", href: "/docs/tools/ai-tools/agent-skills" },
        { label: "What are templates?", href: "/docs/templates" },
      ],
    },
  ],
  timeline: [
    {
      date: "May 31, 2026 · 11:59pm PT",
      label: "Applications close",
      detail: "Apply on MLH in teams of 2–4.",
    },
    {
      date: "June 15, 2026 · 8:00am–4:00pm PT",
      label: "Opening + hacking begins",
      detail:
        "A full day of hacking, kicking off with the opening ceremony at Marriott Marquis, San Francisco.",
    },
    {
      date: "June 16, 2026 · 11:00am–5:00pm PT",
      label: "Hacker's Corner (optional)",
      detail: "Open collaboration space with mentors on hand to help.",
    },
    {
      date: "June 16, 2026 · 6:00pm–9:00pm PT",
      label: "Judging + awards",
      detail: "Live judging, followed by the awards ceremony.",
    },
  ],
  submission:
    "Submit a Git repo and project description. Be ready to give a three-minute demo.",
  submissionUrl: "https://dais-for-good-2026.devpost.com/",
  judgingIntro: "Submissions will be judged on four dimensions:",
  judgingCriteria: [
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
      detail:
        "Did the team go beyond the minimum workflow in a meaningful way?",
    },
  ],
  faq: [
    {
      question: "Do I need to be registered for Data + AI Summit 2026?",
      answer:
        "Yes. The hackathon is part of Data + AI Summit 2026, and every participant — including all teammates — must be registered for the summit to take part.",
    },
    {
      question: "When do applications close?",
      answer:
        "Sunday, May 31, 2026 at 11:59pm PT. Apply through the MLH event page; if you've applied, hold off on booking Monday activities in the DAIS attendee portal until you hear back.",
    },
    {
      question: "Where is the hackathon?",
      answer:
        "In-person only at the Marriott Marquis in San Francisco, alongside Data + AI Summit 2026.",
    },
    {
      question: "How big can my team be?",
      answer:
        "Teams of 2 to 4 people. Every teammate must also be registered for Data + AI Summit 2026.",
    },
    {
      question: "What if I'm new to Databricks?",
      answer:
        'Start with the "Start here" docs and copy one of the templates as a prompt for your coding agent — it will scaffold a working app and walk you through the rest.',
    },
    {
      question: "What if I can't run a coding agent on my laptop?",
      answer: (
        <>
          <p>
            Some participants may be using corporate laptops where local
            installs, IDE extensions, or coding agents are restricted.
            That&rsquo;s okay — you can still participate. You can follow the
            manual AppKit quick start to scaffold and deploy a Databricks App
            with the CLI:{" "}
            <Link
              href="/docs/appkit/v0#manual-quick-start"
              className="text-db-lava hover:text-db-lava-dark font-medium underline underline-offset-2"
            >
              Getting started with AppKit
            </Link>
            .
          </p>
          <p>
            If possible, try to form a team with at least one person who has a
            local coding-agent setup and can iterate on the app. Not everyone on
            the team needs to work on the app code at the same time — other
            teammates can focus on data exploration, product direction,
            evaluation, storytelling, the final demo, and other areas where a
            local coding agent is less valuable.
          </p>
          <p>
            You can also use agentic tools that don&rsquo;t require local setup:
          </p>
          <ul className="m-0 flex list-disc flex-col gap-y-2 pl-5">
            <li>
              <strong>Databricks Genie Code</strong> — use Genie Code inside
              Databricks for help understanding the dataset, writing SQL,
              exploring tables, shaping the data work that powers your app, and
              creating and managing the app.
            </li>
            <li>
              <strong>Browser-based development tools</strong> — tools like
              Replit can be useful when your laptop can&rsquo;t install a local
              coding environment. Check your company policies before connecting
              accounts, repos, or data.
            </li>
          </ul>
          <p>
            If your team is blocked by laptop restrictions, don&rsquo;t spend
            the whole hackathon fighting the machine. Shift work to the teammate
            or environment that can run the app, and use Databricks itself for
            as much data exploration and prototyping as possible. Ask hackathon
            mentors for help and ideas.
          </p>
        </>
      ),
    },
    {
      question: "Which Databricks account should I use?",
      answer: (
        <p>
          Use a personal Databricks Free Edition account, not your work or
          enterprise account. Building and demoing on Free Edition keeps every
          team on the same playing field — see the{" "}
          <Link
            href="/hackathon/free-edition-setup"
            className="text-db-lava hover:text-db-lava-dark font-medium underline underline-offset-2"
          >
            Free Edition setup guide
          </Link>{" "}
          to get set up.
        </p>
      ),
    },
  ],
};
