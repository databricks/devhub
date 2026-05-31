import { describe, expect, test } from "vitest";
import {
  buildFullPrompt,
  buildAdditionalMarkdown,
  buildExportGetStartedSection,
  buildIncludedTemplatesPreamble,
} from "../src/lib/examples/build-example-markdown";
import type { ExampleMarkdownOptions } from "../src/lib/examples/build-example-markdown";
import type { ContentSections } from "../src/lib/content-sections";
import type { Example } from "../src/lib/recipes/recipes";

const minimalExample: Example = {
  id: "test-example",
  name: "Test Example",
  description: "A test example for unit tests.",
  templateUrl:
    "https://github.com/databricks/app-templates/tree/main/test-example",
  initCommand:
    "git clone --depth 1 https://github.com/databricks/app-templates.git\ncd app-templates/test-example",
  cookbookIds: [],
  recipeIds: [],
  tags: [],
  services: [],
};

const githubUrl =
  "https://github.com/databricks/app-templates/tree/main/test-example";

const baseUrl = "https://example.com";

const emptySections: ContentSections = {};
const goalSections: ContentSections = {
  goal: "Build a test example that demonstrates the pattern.",
};

const sampleTemplates = [
  { id: "tmpl-a", name: "Template A", description: "First template." },
];

const sampleRecipes = [
  { id: "recipe-b", name: "Recipe B", description: "First recipe." },
];

const baseOpts: ExampleMarkdownOptions = {
  example: minimalExample,
  githubUrl,
  includedCookbooks: [],
  includedRecipes: [],
  baseUrl,
};

describe("buildIncludedTemplatesPreamble", () => {
  test("explains templates mirror the code and points to DevHub for extra context", () => {
    const text = buildIncludedTemplatesPreamble();
    expect(text).toContain("**templates**");
    expect(text).toContain("template code");
    expect(text).toContain("`README.md`");
    expect(text).toContain("DevHub");
    expect(text).not.toMatch(/\b[Rr]ecipes?\b/);
    expect(text).not.toMatch(/\b[Cc]ookbooks?\b/);
  });
});

describe("buildExportGetStartedSection", () => {
  test("includes bash init command and README runbook with source-of-truth line", () => {
    const section = buildExportGetStartedSection(minimalExample);
    expect(section.startsWith("## Get started\n")).toBe(true);
    expect(section).toContain("Run the command below");
    expect(section).toContain("```bash");
    expect(section).toContain(minimalExample.initCommand);
    expect(section).toContain("**`README.md`**");
    expect(section).toContain("source of truth");
  });
});

describe("buildFullPrompt", () => {
  test("includes example name and description", () => {
    const prompt = buildFullPrompt({ ...baseOpts, sections: emptySections });
    expect(prompt).toContain("# Test Example");
    expect(prompt).toContain("A test example for unit tests.");
  });

  test("includes get started steps", () => {
    const prompt = buildFullPrompt({ ...baseOpts, sections: emptySections });
    expect(prompt).toContain("## Get started");
    expect(prompt).toContain("### Clone and follow `README.md`");
    expect(prompt).toContain(minimalExample.initCommand);
    expect(prompt).toContain("README.md");
    expect(prompt).toContain(
      "databricks apps init --template https://github.com/databricks/app-templates/tree/main/test-example",
    );
  });

  test("includes goal section body", () => {
    const prompt = buildFullPrompt({
      ...baseOpts,
      sections: goalSections,
    });
    expect(prompt).toContain(
      "Build a test example that demonstrates the pattern.",
    );
  });

  test("includes github link", () => {
    const prompt = buildFullPrompt({ ...baseOpts, sections: emptySections });
    expect(prompt).toContain("## Source Code");
    expect(prompt).toContain(githubUrl);
  });

  test("includes templates from cookbooks and recipes", () => {
    const prompt = buildFullPrompt({
      ...baseOpts,
      sections: emptySections,
      includedCookbooks: sampleTemplates,
      includedRecipes: sampleRecipes,
    });
    expect(prompt).toContain("## Included templates");
    expect(prompt).toContain(buildIncludedTemplatesPreamble());
    expect(prompt).toContain(
      "[Template A](https://example.com/templates/tmpl-a.md) - First template.",
    );
    expect(prompt).toContain(
      "[Recipe B](https://example.com/templates/recipe-b.md) - First recipe.",
    );
  });

  test("includes configured site path in included template links", () => {
    const prompt = buildFullPrompt({
      ...baseOpts,
      baseUrl: "https://stage.databricks.com/devhub",
      sections: emptySections,
      includedCookbooks: sampleTemplates,
      includedRecipes: sampleRecipes,
    });

    expect(prompt).toContain(
      "[Template A](https://stage.databricks.com/devhub/templates/tmpl-a.md)",
    );
    expect(prompt).toContain(
      "[Recipe B](https://stage.databricks.com/devhub/templates/recipe-b.md)",
    );
    expect(prompt).not.toContain("https://stage.databricks.com/templates/");
  });

  test("omits included templates section when no cookbooks or recipes", () => {
    const prompt = buildFullPrompt({ ...baseOpts, sections: emptySections });
    expect(prompt).not.toContain("## Included templates");
  });
});

describe("buildAdditionalMarkdown", () => {
  test("includes get started with clone command and template README pointer", () => {
    const md = buildAdditionalMarkdown(baseOpts);
    expect(md).toContain("## Get started");
    expect(md).toContain("Run the command below");
    expect(md).toContain("```bash");
    expect(md).toContain(minimalExample.initCommand);
    expect(md).toContain("**`README.md`**");
    expect(md).not.toContain("### 1. Clone locally");
  });

  test("includes source code link", () => {
    const md = buildAdditionalMarkdown(baseOpts);
    expect(md).toContain("## Source Code");
    expect(md).toContain(githubUrl);
  });

  test("includes template links", () => {
    const md = buildAdditionalMarkdown({
      ...baseOpts,
      includedCookbooks: sampleTemplates,
      includedRecipes: sampleRecipes,
    });
    expect(md).toContain("## Included templates");
    expect(md).toContain(buildIncludedTemplatesPreamble());
    expect(md).toContain(
      "[Template A](https://example.com/templates/tmpl-a.md)",
    );
    expect(md).toContain(
      "[Recipe B](https://example.com/templates/recipe-b.md)",
    );
  });

  test("includes configured site path in additional template links", () => {
    const md = buildAdditionalMarkdown({
      ...baseOpts,
      baseUrl: "https://stage.databricks.com/devhub",
      includedCookbooks: sampleTemplates,
      includedRecipes: sampleRecipes,
    });

    expect(md).toContain(
      "[Template A](https://stage.databricks.com/devhub/templates/tmpl-a.md)",
    );
    expect(md).toContain(
      "[Recipe B](https://stage.databricks.com/devhub/templates/recipe-b.md)",
    );
    expect(md).not.toContain("https://stage.databricks.com/templates/");
  });

  test("omits included templates section when no cookbooks or recipes", () => {
    const md = buildAdditionalMarkdown(baseOpts);
    expect(md).not.toContain("## Included templates");
  });
});

describe("init-style examples (databricks apps init)", () => {
  const initExample: Example = {
    ...minimalExample,
    id: "init-example",
    initCommand:
      "databricks apps init \\\n  --template https://github.com/databricks/app-templates/tree/main/init-example \\\n  --name <app-name>",
  };
  const initOpts: ExampleMarkdownOptions = {
    example: initExample,
    githubUrl,
    includedCookbooks: [],
    includedRecipes: [],
    baseUrl,
  };

  test("export section uses scaffold copy, not clone copy", () => {
    const section = buildExportGetStartedSection(initExample);
    expect(section).toContain("scaffold this example");
    expect(section).toContain("databricks apps init");
    expect(section).not.toContain("clone the app-templates repository");
    expect(section).not.toContain("at the root of that folder when you clone");
    expect(section).toContain(initExample.initCommand);
  });

  test("export section surfaces auth prereq before init command", () => {
    const section = buildExportGetStartedSection(initExample);
    expect(section).toContain("databricks auth profiles");
    expect(section).toContain("--profile");
    const authIdx = section.indexOf("databricks auth profiles");
    const initIdx = section.indexOf("```bash");
    expect(authIdx).toBeLessThan(initIdx);
  });

  test("full prompt has scaffold section without duplicate auth verification", () => {
    const prompt = buildFullPrompt({ ...initOpts, sections: emptySections });
    expect(prompt).toContain("### Scaffold the project");
    expect(prompt).not.toContain("Verify Databricks CLI auth");
    expect(prompt).not.toContain("databricks auth profiles");
    expect(prompt).not.toContain("databricks auth login --profile");
    expect(prompt).not.toContain("### Clone and follow `README.md`");
    expect(prompt).toContain(initExample.initCommand);
  });
});
