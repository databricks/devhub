import { describe, expect, test } from "vitest";
import {
  buildFullPrompt,
  buildAdditionalMarkdown,
  buildExportGetStartedSection,
  buildIncludedGuidesPreamble,
} from "../src/lib/examples/build-example-markdown";
import type {
  ExampleMarkdownOptions,
  ExampleSections,
} from "../src/lib/examples/build-example-markdown";
import type { Example } from "../src/lib/recipes/recipes";

const minimalExample: Example = {
  id: "test-example",
  name: "Test Example",
  description: "A test example for unit tests.",
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

const sampleContentMarkdown = [
  "## Test Example",
  "",
  "This is the example overview from content/examples/test-example/content.md.",
  "",
  "### Data Flow",
  "",
  "1. Step one",
  "2. Step two",
].join("\n");

const emptySections: ExampleSections = { content: "" };
const contentOnlySections: ExampleSections = { content: sampleContentMarkdown };

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
    const prompt = buildFullPrompt({ ...baseOpts, sections: emptySections });
    expect(prompt).toContain("# Test Example");
    expect(prompt).toContain("A test example for unit tests.");
  });

  test("includes get started steps", () => {
    const prompt = buildFullPrompt({ ...baseOpts, sections: emptySections });
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

  test("includes content section body", () => {
    const prompt = buildFullPrompt({
      ...baseOpts,
      sections: contentOnlySections,
    });
    expect(prompt).toContain("This is the example overview");
    expect(prompt).toContain("### Data Flow");
    expect(prompt).toContain("1. Step one");
  });

  test("content body appears after get started and before source code", () => {
    const prompt = buildFullPrompt({
      ...baseOpts,
      sections: contentOnlySections,
    });
    const getStartedIdx = prompt.indexOf("### 1. Clone locally");
    const rawIdx = prompt.indexOf("This is the example overview");
    const sourceIdx = prompt.indexOf("## Source Code");
    expect(getStartedIdx).toBeLessThan(rawIdx);
    expect(rawIdx).toBeLessThan(sourceIdx);
  });

  test("includes github link", () => {
    const prompt = buildFullPrompt({ ...baseOpts, sections: emptySections });
    expect(prompt).toContain("## Source Code");
    expect(prompt).toContain(githubUrl);
  });

  test("includes guides from templates and recipes", () => {
    const prompt = buildFullPrompt({
      ...baseOpts,
      sections: emptySections,
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
    const prompt = buildFullPrompt({ ...baseOpts, sections: emptySections });
    expect(prompt).not.toContain("## Included guides");
  });

  test("omits content body when section is empty", () => {
    const prompt = buildFullPrompt({ ...baseOpts, sections: emptySections });
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
  test("full prompt includes same content body as Copy as Markdown would", () => {
    const prompt = buildFullPrompt({
      ...baseOpts,
      sections: contentOnlySections,
      includedTemplates: sampleTemplates,
      includedRecipes: sampleRecipes,
    });
    for (const line of sampleContentMarkdown.split("\n").filter(Boolean)) {
      expect(prompt).toContain(line);
    }
  });
});

describe("example Get started: full prompt (Copy prompt) vs export markdown (Copy as Markdown)", () => {
  test("full prompt uses ### substeps; export uses ## Get started without ### clone substep", () => {
    const full = buildFullPrompt({ ...baseOpts, sections: emptySections });
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

describe("init-style examples (databricks apps init)", () => {
  const initExample: Example = {
    ...minimalExample,
    id: "init-example",
    initCommand:
      "databricks apps init \\\n  --template https://github.com/databricks/devhub/tree/main/examples/init-example/template \\\n  --name <app-name>",
  };
  const initOpts: ExampleMarkdownOptions = {
    example: initExample,
    githubUrl,
    includedTemplates: [],
    includedRecipes: [],
    baseUrl,
  };

  test("export section uses scaffold copy, not clone copy", () => {
    const section = buildExportGetStartedSection(initExample);
    expect(section).toContain("scaffold this example");
    expect(section).toContain("databricks apps init");
    expect(section).not.toContain("clone the DevHub repository");
    expect(section).not.toContain("**`template/README.md`**");
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

  test("full prompt has auth verification as step 1 before scaffold step 2", () => {
    const prompt = buildFullPrompt({ ...initOpts, sections: emptySections });
    expect(prompt).toContain("### 1. Verify Databricks CLI auth");
    expect(prompt).toContain(
      "### 2. Scaffold the project with `databricks apps init`",
    );
    expect(prompt).toContain("databricks auth profiles");
    expect(prompt).toContain("databricks auth login --profile");
    expect(prompt).not.toContain(
      "### 1. Clone locally and follow `template/README.md`",
    );
    expect(prompt).toContain(initExample.initCommand);
    const authIdx = prompt.indexOf("### 1. Verify Databricks CLI auth");
    const scaffoldIdx = prompt.indexOf(
      "### 2. Scaffold the project with `databricks apps init`",
    );
    expect(authIdx).toBeLessThan(scaffoldIdx);
  });

  test("prereq section is injected as step 2 and scaffold becomes step 3", () => {
    const sections: ExampleSections = {
      content: "",
      prerequisites: [
        "### 2. Create the Lakebase Postgres prerequisites",
        "",
        "```bash",
        "databricks postgres create-project my-proj",
        "```",
      ].join("\n"),
    };
    const prompt = buildFullPrompt({
      ...initOpts,
      sections,
    });
    expect(prompt).toContain("### 1. Verify Databricks CLI auth");
    expect(prompt).toContain(
      "### 2. Create the Lakebase Postgres prerequisites",
    );
    expect(prompt).toContain(
      "### 3. Scaffold the project with `databricks apps init`",
    );
    expect(prompt).toContain("databricks postgres create-project my-proj");
    const prereqIdx = prompt.indexOf(
      "### 2. Create the Lakebase Postgres prerequisites",
    );
    const scaffoldIdx = prompt.indexOf(
      "### 3. Scaffold the project with `databricks apps init`",
    );
    expect(prereqIdx).toBeLessThan(scaffoldIdx);
  });

  test("deploy section replaces the default README pointer when provided", () => {
    const sections: ExampleSections = {
      content: "",
      deployment: [
        "### 3. Install and deploy",
        "",
        "```bash",
        "npm install",
        "npm run deploy",
        "```",
      ].join("\n"),
    };
    const prompt = buildFullPrompt({
      ...initOpts,
      sections,
    });
    expect(prompt).toContain("### 3. Install and deploy");
    expect(prompt).toContain("npm run deploy");
    expect(prompt).not.toContain(
      "A **`README.md`** ships inside the scaffolded project",
    );
  });
});
