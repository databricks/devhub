export type SolutionTag = string;

type SolutionBase = {
  id: string;
  title: string;
  description: string;
  tags: SolutionTag[];
};

/**
 * Solution authored on DevHub: content lives in `content/solutions/<id>.md`
 * and is rendered into a generated route at /solutions/<id>.
 */
export type NativeSolution = SolutionBase & {
  type: "native";
};

/**
 * Solution that links out to an article hosted elsewhere (e.g. databricks.com/blog).
 * Metadata is hard-coded here; clicking the card opens the original article.
 *
 * `previewImage` is a path relative to `static/` (served as `/<previewImage>`),
 * stored at the Open Graph aspect ratio (1.91:1). All linked-article previews
 * must share the same format so the card grid renders consistently. This is
 * enforced by `scripts/verify-resource-images.mjs`.
 */
export type LinkedSolution = SolutionBase & {
  type: "linked";
  url: string;
  source: string;
  authors: string[];
  publishedAt: string;
  previewImage: string;
  previewImageAlt: string;
};

export type Solution = NativeSolution | LinkedSolution;

export function isNativeSolution(
  solution: Solution,
): solution is NativeSolution {
  return solution.type === "native";
}

export function isLinkedSolution(
  solution: Solution,
): solution is LinkedSolution {
  return solution.type === "linked";
}

export const solutions: Solution[] = [
  {
    type: "native",
    id: "devhub-launch",
    title: "Introducing dev.databricks.com",
    description:
      "A new developer hub for building on Databricks: opinionated, copy-pasteable templates and agent-ready documentation for software engineers.",
    tags: ["Launch", "Developer Experience", "Agent-Led Development"],
  },
  {
    type: "linked",
    id: "blog-apps-lakebase-production",
    title:
      "How to Build Production-Ready Data and AI Apps with Databricks Apps and Lakebase",
    description:
      "Build full-stack data apps on Databricks Apps with Lakebase synced tables that replicate Unity Catalog data in seconds, and ship everything as code with Databricks Asset Bundles.",
    tags: ["Apps", "Lakebase", "Synced Tables", "Asset Bundles"],
    url: "https://www.databricks.com/blog/how-build-production-ready-data-and-ai-apps-databricks-apps-and-lakebase",
    source: "Databricks Blog",
    authors: ["Pascal Vogel", "Evan Pandya", "Christopher Pries"],
    publishedAt: "2025-11-19",
    previewImage: "/img/solutions/blog-apps-lakebase-production.png",
    previewImageAlt:
      "Architecture diagram for a production-ready Databricks App backed by a Lakebase synced table",
  },
  {
    type: "linked",
    id: "blog-agent-bricks-apps-business-users",
    title:
      "Ship quality enterprise AI agents to business users with Agent Bricks and Databricks Apps",
    description:
      "Build domain-specific AI agents with Agent Bricks, deploy them through a chat UI on Databricks Apps, and distribute them to business users via Databricks One.",
    tags: ["Agent Bricks", "Apps", "AI Agents", "Databricks One"],
    url: "https://www.databricks.com/blog/ship-quality-enterprise-ai-agents-business-users-agent-bricks-and-databricks-apps",
    source: "Databricks Blog",
    authors: ["Pascal Vogel", "Evan Pandya"],
    publishedAt: "2026-03-16",
    previewImage: "/img/solutions/blog-agent-bricks-apps-business-users.png",
    previewImageAlt:
      "Agent Bricks, Databricks Apps, and Databricks One delivering enterprise AI agents to business users",
  },
  {
    type: "linked",
    id: "blog-lakebase-transactional-layer",
    title:
      "How to use Lakebase as a transactional data layer for Databricks Apps",
    description:
      "Walk through a holiday request app that uses Lakebase as the operational Postgres tier behind Databricks Apps, from database setup to a fully connected frontend.",
    tags: ["Lakebase", "Apps", "Postgres", "Tutorial"],
    url: "https://www.databricks.com/blog/how-use-lakebase-transactional-data-layer-databricks-apps",
    source: "Databricks Blog",
    authors: ["Jasper Puts", "Antonio Javier Samaniego Jurado"],
    publishedAt: "2025-08-28",
    previewImage: "/img/solutions/blog-lakebase-transactional-layer.png",
    previewImageAlt:
      "Conceptual diagram of a Databricks App using Lakebase Postgres as its transactional data layer",
  },
  {
    type: "linked",
    id: "blog-lakebase-database-branching",
    title:
      "Database Branching in Postgres: Git-Style Workflows with Databricks Lakebase",
    description:
      "Use Lakebase copy-on-write branches to give every developer, pull request, and CI run an isolated Postgres environment, and power instant point-in-time recovery and ephemeral databases for AI agents.",
    tags: [
      "Lakebase",
      "Branching",
      "Developer Experience",
      "Agent-Led Development",
    ],
    url: "https://www.databricks.com/blog/database-branching-postgres-git-style-workflows-databricks-lakebase",
    source: "Databricks Blog",
    authors: ["Susan Pierce"],
    publishedAt: "2026-04-10",
    previewImage: "/img/solutions/blog-lakebase-database-branching.png",
    previewImageAlt:
      "Lakebase database branching graphic showing git-style Postgres workflows on Databricks",
  },
];

export const nativeSolutions: NativeSolution[] =
  solutions.filter(isNativeSolution);
export const linkedSolutions: LinkedSolution[] =
  solutions.filter(isLinkedSolution);
