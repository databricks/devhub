import { describe, expect, test } from "vitest";
import {
  buildFullPrompt,
  buildAdditionalMarkdown,
  buildExportGetStartedSection,
  buildIncludedGuidesPreamble,
} from "../src/lib/examples/build-example-markdown";
import type { ExampleMarkdownOptions } from "../src/lib/examples/build-example-markdown";
import type { Example } from "../src/lib/recipes/recipes";

const minimalExample: Example = {
  id: "test-example",
  name: "Test Example",
  description: "A test example for unit tests.",
  image: "/img/examples/test.svg",
  githubPath: "examples/test-example",
  initCommand:
    "git clone --depth 1 https://github.com/databricks/devhub.git\ncd devhub/examples/test-example/template",
  templateIds: [],
  recipeIds: [],
  tags: [],
  services: [],
};

const githubUrl =
  "https://github.com/databricks/devhub/tree/main/examples/test-example";

const baseUrl = "https://example.com";

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
  { id: "tmpl-a", name: "Template A", description: "First template." },
];

const sampleRecipes = [
  { id: "recipe-b", name: "Recipe B", description: "First recipe." },
];

const baseOpts: ExampleMarkdownOptions = {
  example: minimalExample,
  githubUrl,
  includedTemplates: [],
  includedRecipes: [],
  baseUrl,
};

describe("buildIncludedGuidesPreamble", () => {
  test("explains guides mirror the template and points to DevHub for extra context", () => {
    const text = buildIncludedGuidesPreamble();
    expect(text).toContain("**guides**");
    expect(text).toContain("cookbooks");
    expect(text).toContain("**recipes**");
    expect(text).toContain("template code");
    expect(text).toContain("`template/README.md`");
    expect(text).toContain("DevHub");
  });
});

describe("buildExportGetStartedSection", () => {
  test("includes bash init command and README runbook with source-of-truth line", () => {
    const section = buildExportGetStartedSection(minimalExample);
    expect(section.startsWith("## Get started\n")).toBe(true);
    expect(section).toContain("Run the command below");
    expect(section).toContain("```bash");
    expect(section).toContain(minimalExample.initCommand);
    expect(section).toContain("**`template/README.md`**");
    expect(section).toContain("source of truth");
  });
});

describe("buildFullPrompt", () => {
  test("includes example name and description", () => {
    const prompt = buildFullPrompt({ ...baseOpts, rawMarkdown: "" });
    expect(prompt).toContain("# Test Example");
    expect(prompt).toContain("A test example for unit tests.");
  });

  test("includes get started steps", () => {
    const prompt = buildFullPrompt({ ...baseOpts, rawMarkdown: "" });
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
    const prompt = buildFullPrompt({
      ...baseOpts,
      rawMarkdown: sampleRawMarkdown,
    });
    expect(prompt).toContain("This is the example overview");
    expect(prompt).toContain("### Data Flow");
    expect(prompt).toContain("1. Step one");
  });

  test("rawMarkdown appears after get started and before source code", () => {
    const prompt = buildFullPrompt({
      ...baseOpts,
      rawMarkdown: sampleRawMarkdown,
    });
    const getStartedIdx = prompt.indexOf("### 1. Clone locally");
    const rawIdx = prompt.indexOf("This is the example overview");
    const sourceIdx = prompt.indexOf("## Source Code");
    expect(getStartedIdx).toBeLessThan(rawIdx);
    expect(rawIdx).toBeLessThan(sourceIdx);
  });

  test("includes github link", () => {
    const prompt = buildFullPrompt({ ...baseOpts, rawMarkdown: "" });
    expect(prompt).toContain("## Source Code");
    expect(prompt).toContain(githubUrl);
  });

  test("includes guides from templates and recipes", () => {
    const prompt = buildFullPrompt({
      ...baseOpts,
      rawMarkdown: "",
      includedTemplates: sampleTemplates,
      includedRecipes: sampleRecipes,
    });
    expect(prompt).toContain("## Included guides");
    expect(prompt).toContain(buildIncludedGuidesPreamble());
    expect(prompt).toContain(
      "[Template A](https://example.com/resources/tmpl-a.md) - First template.",
    );
    expect(prompt).toContain(
      "[Recipe B](https://example.com/resources/recipe-b.md) - First recipe.",
    );
  });

  test("omits guides section when no templates or recipes", () => {
    const prompt = buildFullPrompt({ ...baseOpts, rawMarkdown: "" });
    expect(prompt).not.toContain("## Included guides");
  });

  test("omits rawMarkdown section when empty string", () => {
    const prompt = buildFullPrompt({ ...baseOpts, rawMarkdown: "" });
    expect(prompt).not.toContain("This is the example overview");
    expect(prompt).toContain("## Source Code");
  });
});

describe("buildAdditionalMarkdown", () => {
  test("includes get started with clone command and template README pointer", () => {
    const md = buildAdditionalMarkdown(baseOpts);
    expect(md).toContain("## Get started");
    expect(md).toContain("Run the command below");
    expect(md).toContain("```bash");
    expect(md).toContain(minimalExample.initCommand);
    expect(md).toContain("**`template/README.md`**");
    expect(md).not.toContain("### 1. Clone locally");
  });

  test("includes source code link", () => {
    const md = buildAdditionalMarkdown(baseOpts);
    expect(md).toContain("## Source Code");
    expect(md).toContain(githubUrl);
  });

  test("includes resource links", () => {
    const md = buildAdditionalMarkdown({
      ...baseOpts,
      includedTemplates: sampleTemplates,
      includedRecipes: sampleRecipes,
    });
    expect(md).toContain("## Included guides");
    expect(md).toContain(buildIncludedGuidesPreamble());
    expect(md).toContain(
      "[Template A](https://example.com/resources/tmpl-a.md)",
    );
    expect(md).toContain(
      "[Recipe B](https://example.com/resources/recipe-b.md)",
    );
  });

  test("omits guides section when no templates or recipes", () => {
    const md = buildAdditionalMarkdown(baseOpts);
    expect(md).not.toContain("## Included guides");
  });
});

describe("buildFullPrompt matches Copy as Markdown content", () => {
  test("full prompt includes same rawMarkdown as Copy as Markdown would", () => {
    const prompt = buildFullPrompt({
      ...baseOpts,
      rawMarkdown: sampleRawMarkdown,
      includedTemplates: sampleTemplates,
      includedRecipes: sampleRecipes,
    });
    for (const line of sampleRawMarkdown.split("\n").filter(Boolean)) {
      expect(prompt).toContain(line);
    }
  });
});

describe("example Get started: full prompt (Copy prompt) vs export markdown (Copy as Markdown)", () => {
  test("full prompt uses ### substeps; export uses ## Get started without ### clone substep", () => {
    const full = buildFullPrompt({ ...baseOpts, rawMarkdown: "" });
    const exportMd = buildAdditionalMarkdown(baseOpts);

    expect(full).toContain(
      "### 1. Clone locally and follow `template/README.md`",
    );
    expect(full).toContain("```bash");
    expect(full).toContain(minimalExample.initCommand);

    expect(exportMd).toContain(buildExportGetStartedSection(minimalExample));
    expect(exportMd).not.toContain("### 1. Clone locally");
    expect(exportMd).toContain("```bash");
    expect(exportMd).toContain(minimalExample.initCommand);
  });

  test("export markdown never embeds full-prompt subheadings in the appended section", () => {
    const exportMd = buildAdditionalMarkdown({
      ...baseOpts,
      includedTemplates: sampleTemplates,
      includedRecipes: sampleRecipes,
    });
    expect(exportMd).not.toContain("### 2.");
  });
});
