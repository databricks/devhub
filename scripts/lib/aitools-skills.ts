// Pure rendering of the Databricks agent-skills catalog. Skill names and the
// experimental flag come from `databricks aitools list -o json`; descriptions
// come from each skill's SKILL.md frontmatter (materialized by the generator).
// No I/O here so it can be unit-tested.

export type Skill = {
  name: string;
  description: string;
  experimental: boolean;
};

// Skill descriptions are long and "pushy" (they include "Use when..." guidance
// for agent triggering). The catalog wants a one-line summary, so take the first
// sentence, matching the page's existing style.
//
// The terminator must be followed by whitespace and a capital letter (or the end
// of the string). That capital-letter lookahead is what keeps mid-sentence
// abbreviations like "e.g.", "i.e.", "etc.", and version numbers ("v1.0") from
// being mistaken for a sentence end and truncating the summary.
export function firstSentence(description: string): string {
  const trimmed = description.trim();
  const match = trimmed.match(/^.*?[.!?](?=\s+[A-Z]|\s*$)/);
  return (match ? match[0] : trimmed).trim();
}

export function renderSkillsTable(skills: Skill[]): string {
  if (skills.length === 0) return "";
  const rows = [...skills]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((skill) => {
      // Escape characters that would break a markdown table cell: `|` ends a
      // cell, and `<` can be read as the start of an HTML tag (dropping the text).
      const description = firstSentence(skill.description)
        .replace(/\|/g, "\\|")
        .replace(/</g, "&lt;");
      return `| \`${skill.name}\` | ${description} |`;
    });
  return ["| Skill | Description |", "| --- | --- |", ...rows].join("\n");
}
