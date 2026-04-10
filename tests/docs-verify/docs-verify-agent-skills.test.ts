import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, test, expect } from "vitest";

const DOCS_DIR = resolve(__dirname, "..", "..", "docs");
const AGENT_SKILLS_MD = resolve(
  DOCS_DIR,
  "tools",
  "ai-tools",
  "agent-skills.md",
);
const MANIFEST_URL =
  "https://raw.githubusercontent.com/databricks/databricks-agent-skills/main/manifest.json";

const SKILL_NAME_PATTERN = /`(databricks-[\w-]+)`/g;

describe("agent-skills page stays in sync with upstream", () => {
  let manifest: Record<string, { experimental?: boolean }>;
  let manifestSkills: string[];
  let page: string;

  test("fetch manifest and read page", async () => {
    page = readFileSync(AGENT_SKILLS_MD, "utf-8");

    const res = await fetch(MANIFEST_URL);
    expect(res.ok).toBe(true);

    const data = (await res.json()) as {
      skills: Record<string, { experimental?: boolean }>;
    };
    manifest = data.skills;
    manifestSkills = Object.keys(manifest);
    expect(manifestSkills.length).toBeGreaterThan(0);
    console.log(
      `[agent-skills] manifest has ${manifestSkills.length} skills:`,
      manifestSkills.join(", "),
    );
  });

  test("page mentions every skill from the manifest", () => {
    for (const name of manifestSkills) {
      expect(page).toContain(name);
      console.log(`[agent-skills] found in page: ${name}`);
    }
  });

  test("page does not list skills removed from the manifest", () => {
    const skillsInPage = [
      ...new Set(
        Array.from(page.matchAll(SKILL_NAME_PATTERN), (m) => m[1]).filter(
          (name) => name !== "databricks-agent-skills",
        ),
      ),
    ];
    console.log(
      `[agent-skills] page references ${skillsInPage.length} skills:`,
      skillsInPage.join(", "),
    );

    for (const name of skillsInPage) {
      expect(manifestSkills).toContain(name);
      console.log(`[agent-skills] still in manifest: ${name}`);
    }
  });

  test("experimental flags match the manifest", () => {
    for (const name of manifestSkills) {
      const isExperimental = manifest[name].experimental === true;
      const lineWithSkill = page
        .split("\n")
        .find((line) => line.includes(`\`${name}\``));
      if (!lineWithSkill) continue;

      const markedExperimental = lineWithSkill.includes("experimental");

      if (isExperimental) {
        expect(markedExperimental).toBe(true);
        console.log(`[agent-skills] ${name} correctly marked experimental`);
      } else {
        expect(markedExperimental).toBe(false);
        console.log(`[agent-skills] ${name} correctly not marked experimental`);
      }
    }
  });
});
