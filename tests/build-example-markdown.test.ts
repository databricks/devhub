import { describe, expect, test } from "vitest";
import {
  buildFullPrompt,
  buildAdditionalMarkdown,
  buildExportGetStartedOutline,
} from "../src/lib/examples/build-example-markdown";
import type { Example } from "../src/lib/recipes/recipes";

const minimalExample: Example = {
  id: "test-example",
  name: "Test Example",
  description: "A test example for unit tests.",
  image: "/img/examples/test.svg",
  githubPath: "examples/test-example",
  initCommand:
    "databricks apps init --template https://example.com --name test",
  templateIds: [],
  recipeIds: [],
  tags: [],
  services: [],
};

const githubUrl =
  "https://github.com/databricks/devhub/tree/main/examples/test-example";

const sampleRawMarkdown = [
  "## Test Example",
  "",
  "This is the example overview from content/examples/test-example.md.",
  "",
  "### Data Flow",
  "",
  "1. Step one",
  "2. Step two",
].join("\n");

const sampleTemplates = [
  {
    id: "tmpl-a",
    name: "Template A",
    description: "First template.",
  },
];

const sampleRecipes = [
  {
    id: "recipe-b",
    name: "Recipe B",
    description: "First recipe.",
  },
];

describe("buildFullPrompt", () => {
  test("includes example name and description", () => {
    const prompt = buildFullPrompt(minimalExample, githubUrl, "", [], []);
    expect(prompt).toContain("# Test Example");
    expect(prompt).toContain("A test example for unit tests.");
  });

  test("includes get started steps", () => {
    const prompt = buildFullPrompt(minimalExample, githubUrl, "", [], []);
    expect(prompt).toContain("## Get started");
    expect(prompt).toContain(
      "### 1. Clone locally and follow `template/README.md`",
    );
    expect(prompt).toContain(minimalExample.initCommand);
    expect(prompt).toContain("template/README.md");
    expect(prompt).toContain(
      "databricks apps init --template https://github.com/databricks/devhub/tree/main/examples/test-example",
    );
    expect(prompt).not.toContain(
      "### 2. Provision or link existing Databricks resources",
    );
    expect(prompt).not.toContain("### 3. Deploy the application");
  });

  test("includes rawMarkdown content", () => {
    const prompt = buildFullPrompt(
      minimalExample,
      githubUrl,
      sampleRawMarkdown,
      [],
      [],
    );
    expect(prompt).toContain("This is the example overview");
    expect(prompt).toContain("### Data Flow");
    expect(prompt).toContain("1. Step one");
  });

  test("rawMarkdown appears after get started and before source code", () => {
    const prompt = buildFullPrompt(
      minimalExample,
      githubUrl,
      sampleRawMarkdown,
      [],
      [],
    );
    const getStartedIdx = prompt.indexOf("### 1. Clone locally");
    const rawIdx = prompt.indexOf("This is the example overview");
    const sourceIdx = prompt.indexOf("## Source Code");
    expect(getStartedIdx).toBeLessThan(rawIdx);
    expect(rawIdx).toBeLessThan(sourceIdx);
  });

  test("includes github link", () => {
    const prompt = buildFullPrompt(minimalExample, githubUrl, "", [], []);
    expect(prompt).toContain("## Source Code");
    expect(prompt).toContain(githubUrl);
  });

  test("includes guides from templates and recipes", () => {
    const prompt = buildFullPrompt(
      minimalExample,
      githubUrl,
      "",
      sampleTemplates,
      sampleRecipes,
    );
    expect(prompt).toContain("## Included Guides");
    expect(prompt).toContain(
      "[Template A](https://dev.databricks.com/resources/tmpl-a) - First template.",
    );
    expect(prompt).toContain(
      "[Recipe B](https://dev.databricks.com/resources/recipe-b) - First recipe.",
    );
  });

  test("omits guides section when no templates or recipes", () => {
    const prompt = buildFullPrompt(minimalExample, githubUrl, "", [], []);
    expect(prompt).not.toContain("## Included Guides");
  });

  test("omits rawMarkdown section when empty string", () => {
    const prompt = buildFullPrompt(minimalExample, githubUrl, "", [], []);
    expect(prompt).not.toContain("This is the example overview");
    expect(prompt).toContain("## Source Code");
  });
});

describe("buildAdditionalMarkdown", () => {
  test("includes compact get started outline for exports", () => {
    const md = buildAdditionalMarkdown(minimalExample, githubUrl, [], []);
    expect(md).toContain("## Get started");
    expect(md).toContain(
      "1) Clone the repository locally and open examples/<example-id>/template/README.md",
    );
    expect(md).toContain(
      "2) Follow that README for all manual steps, SQL, seeding, and deployment",
    );
    expect(md).not.toContain("```bash");
    expect(md).not.toContain(minimalExample.initCommand);
  });

  test("includes source code link", () => {
    const md = buildAdditionalMarkdown(minimalExample, githubUrl, [], []);
    expect(md).toContain("## Source Code");
    expect(md).toContain(githubUrl);
  });

  test("includes resource links", () => {
    const md = buildAdditionalMarkdown(
      minimalExample,
      githubUrl,
      sampleTemplates,
      sampleRecipes,
    );
    expect(md).toContain("## Included Resources");
    expect(md).toContain(
      "[Template A](https://dev.databricks.com/resources/tmpl-a)",
    );
    expect(md).toContain(
      "[Recipe B](https://dev.databricks.com/resources/recipe-b)",
    );
  });

  test("omits resources section when no templates or recipes", () => {
    const md = buildAdditionalMarkdown(minimalExample, githubUrl, [], []);
    expect(md).not.toContain("## Included Resources");
  });
});

describe("buildFullPrompt matches Copy as Markdown content", () => {
  test("full prompt includes same rawMarkdown as Copy as Markdown would", () => {
    const prompt = buildFullPrompt(
      minimalExample,
      githubUrl,
      sampleRawMarkdown,
      sampleTemplates,
      sampleRecipes,
    );
    for (const line of sampleRawMarkdown.split("\n").filter(Boolean)) {
      expect(prompt).toContain(line);
    }
  });
});

describe("example Get started: full prompt (Copy prompt) vs export markdown (Copy as Markdown)", () => {
  test("full prompt uses ### substeps and bash fences; export uses compact 1) outline only", () => {
    const full = buildFullPrompt(minimalExample, githubUrl, "", [], []);
    const exportMd = buildAdditionalMarkdown(minimalExample, githubUrl, [], []);

    expect(full).toContain(
      "### 1. Clone locally and follow `template/README.md`",
    );
    expect(full).toContain("```bash");
    expect(full).toContain(minimalExample.initCommand);
    expect(full).not.toContain("1) Clone the repository locally");

    expect(exportMd).toContain(buildExportGetStartedOutline());
    expect(exportMd).not.toContain("### 1. Clone locally");
    expect(exportMd).not.toContain("```bash");
    expect(exportMd).not.toContain(minimalExample.initCommand);
  });

  test("export markdown never embeds full-prompt subheadings in the appended section", () => {
    const exportMd = buildAdditionalMarkdown(
      minimalExample,
      githubUrl,
      sampleTemplates,
      sampleRecipes,
    );
    expect(exportMd).not.toContain("### 2.");
  });
});
