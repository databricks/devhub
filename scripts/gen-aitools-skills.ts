// Generate the agent-skills catalog in tools/ai-tools/agent-skills.md from the
// live CLI, so it can't drift.
//
//   pnpm docs:skills-sync           # refresh the catalog
//   pnpm docs:skills-sync --check   # exit 1 if the catalog is out of date
//
// Skill names + the experimental flag come from `databricks aitools list -o
// json`; the one-line descriptions come from each skill's SKILL.md frontmatter,
// materialized with `databricks aitools install --path`. Only the CLI is needed
// (locally or on a schedule); the build never runs this. Two marker regions:
//   <!-- aitools-skills -->              ... <!-- /aitools-skills -->
//   <!-- aitools-skills-experimental --> ... <!-- /aitools-skills-experimental -->

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";
import { format, resolveConfig } from "prettier";

import { renderSkillsTable, type Skill } from "./lib/aitools-skills";
import { injectNamedRegion } from "./lib/inject-options";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const doc = resolve(
  repoRoot,
  "src/content/docs/tools/ai-tools/agent-skills.md",
);
const checkOnly = process.argv.includes("--check");

function databricks(args: string[]): string {
  try {
    return execFileSync("databricks", args, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      throw new Error(
        "The `databricks` CLI is not installed or not on PATH. Install it and re-run " +
          "`pnpm docs:skills-sync`. The site build never needs the CLI; only this generator does.",
      );
    }
    throw new Error(`\`databricks ${args.join(" ")}\` failed: ${err.message}`);
  }
}

type ListEntry = { name: string; experimental?: boolean };

// Names + experimental flag from `aitools list -o json`; descriptions from each
// skill's materialized SKILL.md frontmatter (the authoritative source).
function collectSkills(): Skill[] {
  const list = JSON.parse(databricks(["aitools", "list", "-o", "json"])) as {
    skills?: ListEntry[];
  };
  const entries = list.skills ?? [];
  if (entries.length === 0) {
    // A shape change in the list output (or a transient CLI failure) would
    // otherwise blank the catalog silently. Fail loudly instead.
    throw new Error(
      "`databricks aitools list -o json` returned no skills. The output shape may have " +
        "changed; refusing to blank the skills catalog.",
    );
  }
  const skillsDir = mkdtempSync(resolve(tmpdir(), "aitools-skills-"));
  try {
    databricks(["aitools", "install", "--path", skillsDir, "--experimental"]);
    const skills: Skill[] = [];
    for (const entry of entries) {
      // Skip (with a warning) rather than crash if a listed skill did not
      // materialize a SKILL.md, e.g. the install flag or naming changes upstream.
      const skillFile = resolve(skillsDir, entry.name, "SKILL.md");
      if (!existsSync(skillFile)) {
        console.warn(
          `Warning: no SKILL.md for "${entry.name}" after install; skipping it.`,
        );
        continue;
      }
      const frontmatter = matter(readFileSync(skillFile, "utf-8")).data;
      skills.push({
        name: entry.name,
        description: String(frontmatter.description ?? ""),
        experimental: Boolean(entry.experimental),
      });
    }
    return skills;
  } finally {
    rmSync(skillsDir, { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  const skills = collectSkills();
  if (skills.length === 0) {
    throw new Error(
      "No skills had a readable SKILL.md; refusing to blank the catalog.",
    );
  }
  const stable = skills.filter((skill) => !skill.experimental);
  const experimental = skills.filter((skill) => skill.experimental);

  const text = readFileSync(doc, "utf-8");
  const afterStable = injectNamedRegion(
    text,
    "aitools-skills",
    renderSkillsTable(stable),
  );
  const afterExperimental = injectNamedRegion(
    afterStable.text,
    "aitools-skills-experimental",
    renderSkillsTable(experimental),
  );
  if (!afterStable.found) {
    throw new Error(`Marker <!-- aitools-skills --> not found in ${doc}`);
  }
  if (!afterExperimental.found) {
    throw new Error(
      `Marker <!-- aitools-skills-experimental --> not found in ${doc}`,
    );
  }

  const prettierConfig = (await resolveConfig(doc)) ?? {};
  const next = await format(afterExperimental.text, {
    ...prettierConfig,
    filepath: doc,
  });

  if (checkOnly) {
    if (next !== text) {
      console.error(
        `Skills catalog is out of date in ${doc}. Run \`pnpm docs:skills-sync\`.`,
      );
      process.exit(1);
    }
    console.log("Skills catalog is up to date.");
    return;
  }

  if (next === text) {
    console.log("Skills catalog already up to date.");
    return;
  }
  writeFileSync(doc, next);
  console.log(
    `Updated skills catalog (${stable.length} stable, ${experimental.length} experimental) in ${doc}`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
