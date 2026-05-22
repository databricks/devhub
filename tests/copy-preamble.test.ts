import { describe, expect, test } from "vitest";
import {
  ABOUT_DEVHUB_CANONICAL_SITE_URL,
  composeAgentPrompt,
  rewriteRelativeLinks,
  substituteAboutDevhubLlmsUrl,
  type AgentPromptParts,
} from "../src/lib/copy-preamble";

const fixtureParts: AgentPromptParts = {
  about: `# About DevHub\n\n- Website: ${ABOUT_DEVHUB_CANONICAL_SITE_URL}\n- Index: ${ABOUT_DEVHUB_CANONICAL_SITE_URL}/llms.txt\n`,
  guidelines: "# Working with DevHub prompts\n\nFollow these rules.",
  intentHero: `# Hero intent\n\nCatalog: ${ABOUT_DEVHUB_CANONICAL_SITE_URL}/llms.txt`,
  intentRecipe: "# Recipe intent {{name}} ({{url}})",
  intentCookbook: "# Cookbook intent {{name}} ({{url}})",
  intentExample: "# Example intent {{name}} ({{url}})",
  localBootstrap:
    "## Set Up Your Local Dev Environment\n\nUse [Databricks CLI](/docs/tools/databricks-cli) first.",
};

describe("substituteAboutDevhubLlmsUrl (legacy)", () => {
  test("rewrites canonical site URL to caller origin (llms.txt input)", () => {
    const body = `See <${ABOUT_DEVHUB_CANONICAL_SITE_URL}/llms.txt> for the index.`;
    const out = substituteAboutDevhubLlmsUrl(
      body,
      "http://localhost:3000/llms.txt",
    );
    expect(out).toContain("http://localhost:3000/llms.txt");
    expect(out).not.toContain(ABOUT_DEVHUB_CANONICAL_SITE_URL);
  });

  test("rewrites canonical site URL when the input is a bare origin", () => {
    const body = `Site ${ABOUT_DEVHUB_CANONICAL_SITE_URL} and index ${ABOUT_DEVHUB_CANONICAL_SITE_URL}/llms.txt`;
    const out = substituteAboutDevhubLlmsUrl(body, "http://localhost:3001");
    expect(out).toBe(
      "Site http://localhost:3001 and index http://localhost:3001/llms.txt",
    );
  });

  test("replaces every occurrence", () => {
    const body = `${ABOUT_DEVHUB_CANONICAL_SITE_URL}/llms.txt and again ${ABOUT_DEVHUB_CANONICAL_SITE_URL}/llms.txt`;
    const out = substituteAboutDevhubLlmsUrl(body, "http://example.com");
    expect(out).toBe(
      "http://example.com/llms.txt and again http://example.com/llms.txt",
    );
  });

  test("noop when caller origin matches canonical", () => {
    const body = `${ABOUT_DEVHUB_CANONICAL_SITE_URL}/llms.txt`;
    expect(
      substituteAboutDevhubLlmsUrl(body, ABOUT_DEVHUB_CANONICAL_SITE_URL),
    ).toBe(body);
  });
});

describe("composeAgentPrompt — hero", () => {
  test("emits about + guidelines + hero intent + local-bootstrap (no template body)", () => {
    const out = composeAgentPrompt({
      parts: fixtureParts,
      kind: "hero",
      siteOrigin: "http://localhost:3001",
    });

    expect(out).toContain("# About DevHub");
    expect(out).toContain("# Working with DevHub prompts");
    expect(out).toContain("# Hero intent");
    expect(out).toContain("# Verify your local Databricks dev environment");
    expect(out).toContain("## Set Up Your Local Dev Environment");
    expect(out).toContain(
      "Use [Databricks CLI](http://localhost:3001/docs/tools/databricks-cli) first.",
    );
    expect(out).not.toContain("](/docs/tools/databricks-cli)");

    expect(out.split("\n---\n").length).toBe(4);
    expect(out).not.toContain("# The recipe");
    expect(out).not.toContain("# The cookbook");
    expect(out).not.toContain("# The example");
  });

  test("rewrites the canonical site URL to the caller origin", () => {
    const out = composeAgentPrompt({
      parts: fixtureParts,
      kind: "hero",
      siteOrigin: "http://localhost:3001",
    });
    expect(out).toContain("http://localhost:3001/llms.txt");
    expect(out).toContain("- Website: http://localhost:3001");
    expect(out).not.toContain("https://developers.databricks.com");
  });

  test("does not rewrite when origin matches canonical", () => {
    const out = composeAgentPrompt({
      parts: fixtureParts,
      kind: "hero",
      siteOrigin: ABOUT_DEVHUB_CANONICAL_SITE_URL,
    });
    expect(out).toContain(`- Website: ${ABOUT_DEVHUB_CANONICAL_SITE_URL}`);
    expect(out).toContain(`${ABOUT_DEVHUB_CANONICAL_SITE_URL}/llms.txt`);
  });
});

describe("composeAgentPrompt — recipe / cookbook / example", () => {
  test("recipe: 5 blocks with template body and {{name}}/{{url}} substitution", () => {
    const out = composeAgentPrompt({
      parts: fixtureParts,
      kind: "recipe",
      siteOrigin: "https://developers.databricks.com",
      templateName: "Lakebase Agent Memory",
      templateUrl:
        "https://developers.databricks.com/templates/lakebase-agent-memory",
      templateBody: "# Lakebase Agent Memory\n\nbody body",
    });

    expect(out.split("\n---\n").length).toBe(5);
    expect(out).toContain("# About DevHub");
    expect(out).toContain("# Working with DevHub prompts");
    expect(out).toContain(
      "# Recipe intent Lakebase Agent Memory (https://developers.databricks.com/templates/lakebase-agent-memory)",
    );
    expect(out).toContain("# Verify your local Databricks dev environment");
    expect(out).toContain("# The recipe the user copied");
    expect(out).toContain("body body");
  });

  test("cookbook intent uses cookbook label", () => {
    const out = composeAgentPrompt({
      parts: fixtureParts,
      kind: "cookbook",
      siteOrigin: "https://developers.databricks.com",
      templateName: "AI Chat App",
      templateUrl: "https://developers.databricks.com/templates/ai-chat-app",
      templateBody: "# AI Chat App\n\nstuff",
    });
    expect(out).toContain("# Cookbook intent AI Chat App");
    expect(out).toContain("# The cookbook the user copied");
  });

  test("example intent uses example label", () => {
    const out = composeAgentPrompt({
      parts: fixtureParts,
      kind: "example",
      siteOrigin: "https://developers.databricks.com",
      templateName: "Vacation Rentals",
      templateUrl:
        "https://developers.databricks.com/templates/vacation-rentals",
      templateBody: "# Vacation Rentals\n\napp body",
    });
    expect(out).toContain("# Example intent Vacation Rentals");
    expect(out).toContain("# The example the user copied");
  });

  test("throws when template body missing for non-hero", () => {
    expect(() =>
      composeAgentPrompt({
        parts: fixtureParts,
        kind: "recipe",
        siteOrigin: "https://developers.databricks.com",
        templateName: "x",
        templateUrl: "https://developers.databricks.com/x",
        templateBody: "",
      }),
    ).toThrow("non-empty templateBody");
  });

  test("throws when name/url missing for non-hero", () => {
    expect(() =>
      composeAgentPrompt({
        parts: fixtureParts,
        kind: "recipe",
        siteOrigin: "https://developers.databricks.com",
        templateBody: "body",
      }),
    ).toThrow("templateName and templateUrl");
  });

  test("rewrites root-relative links inside the template body", () => {
    const out = composeAgentPrompt({
      parts: fixtureParts,
      kind: "recipe",
      siteOrigin: "http://localhost:3001",
      templateName: "Lakebase Data Persistence",
      templateUrl: "http://localhost:3001/templates/lakebase-data-persistence",
      templateBody:
        "See [Create a Lakebase Instance](/templates/lakebase-create-instance) for setup.",
    });
    expect(out).toContain(
      "[Create a Lakebase Instance](http://localhost:3001/templates/lakebase-create-instance)",
    );
    expect(out).not.toContain("](/templates/lakebase-create-instance)");
  });
});

describe("rewriteRelativeLinks", () => {
  test("rewrites inline markdown links with root-relative paths", () => {
    expect(
      rewriteRelativeLinks(
        "See [docs](/docs/start-here) for more.",
        "https://example.com",
      ),
    ).toBe("See [docs](https://example.com/docs/start-here) for more.");
  });

  test("preserves the link title when present", () => {
    expect(
      rewriteRelativeLinks('[home](/ "DevHub home")', "https://example.com"),
    ).toBe('[home](https://example.com/ "DevHub home")');
  });

  test("rewrites links pointing at .md files (used for raw markdown URLs)", () => {
    expect(
      rewriteRelativeLinks(
        "- [App with Lakebase](/templates/app-with-lakebase.md): description",
        "http://localhost:3001",
      ),
    ).toBe(
      "- [App with Lakebase](http://localhost:3001/templates/app-with-lakebase.md): description",
    );
  });

  test("rewrites bare autolinks", () => {
    expect(
      rewriteRelativeLinks("Visit </llms.txt>.", "https://example.com"),
    ).toBe("Visit <https://example.com/llms.txt>.");
  });

  test("does not rewrite closing HTML tags in code examples", () => {
    expect(
      rewriteRelativeLinks(
        "if (loading) return <p>Loading...</p>;",
        "https://example.com",
      ),
    ).toBe("if (loading) return <p>Loading...</p>;");
  });

  test("rewrites reference-style link definitions", () => {
    expect(
      rewriteRelativeLinks("[ref]: /templates/foo", "https://example.com"),
    ).toBe("[ref]: https://example.com/templates/foo");
  });

  test("leaves absolute URLs untouched", () => {
    const input =
      "[GitHub](https://github.com/databricks/devhub) and [docs](/docs/start)";
    expect(rewriteRelativeLinks(input, "https://example.com")).toBe(
      "[GitHub](https://github.com/databricks/devhub) and [docs](https://example.com/docs/start)",
    );
  });

  test("leaves anchor-only links untouched", () => {
    expect(rewriteRelativeLinks("[Top](#section)", "https://example.com")).toBe(
      "[Top](#section)",
    );
  });

  test("leaves protocol-relative links untouched", () => {
    expect(
      rewriteRelativeLinks("[cdn](//cdn.example.com/x)", "https://example.com"),
    ).toBe("[cdn](//cdn.example.com/x)");
  });

  test("leaves links with relative (non-root) paths untouched", () => {
    expect(
      rewriteRelativeLinks("[next](./other.md)", "https://example.com"),
    ).toBe("[next](./other.md)");
  });

  test("rewrites every occurrence in a single string", () => {
    const out = rewriteRelativeLinks(
      "[a](/x) [b](/y) [c](/z)",
      "https://example.com",
    );
    expect(out).toBe(
      "[a](https://example.com/x) [b](https://example.com/y) [c](https://example.com/z)",
    );
  });

  test("normalizes trailing slash on origin", () => {
    expect(rewriteRelativeLinks("[a](/x)", "https://example.com/")).toBe(
      "[a](https://example.com/x)",
    );
  });
});
