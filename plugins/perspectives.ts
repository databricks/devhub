import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import type { LoadContext, Plugin } from "@docusaurus/types";
import {
  PERSPECTIVES_PLUGIN_NAME,
  parsePerspectiveMarkdown,
  slugFromFilename,
  type PerspectivesGlobalData,
} from "../src/lib/perspectives/perspectives";
import { routePathWithBaseUrl } from "../src/lib/site-paths";

export default function perspectivesPlugin(context: LoadContext): Plugin<void> {
  return {
    name: PERSPECTIVES_PLUGIN_NAME,
    async contentLoaded({ actions }) {
      const dir = resolve(context.siteDir, "content", "perspectives");
      if (!existsSync(dir)) {
        actions.setGlobalData({
          entries: [],
        } satisfies PerspectivesGlobalData);
        return;
      }

      const entries = readdirSync(dir)
        .filter((file) => file.endsWith(".md"))
        .map((file) => {
          const raw = readFileSync(resolve(dir, file), "utf-8");
          const { question, body } = parsePerspectiveMarkdown(raw);
          return {
            slug: slugFromFilename(file),
            question: question || file.replace(/\.md$/i, ""),
            body,
          };
        })
        .sort((a, b) => a.question.localeCompare(b.question));

      const seenSlugs = new Map<string, string>();
      for (const entry of entries) {
        const existing = seenSlugs.get(entry.slug);
        if (existing) {
          throw new Error(
            `Duplicate perspectives slug "${entry.slug}" generated from two files. Rename one of: ${existing}, ${entry.question}.`,
          );
        }
        seenSlugs.set(entry.slug, entry.question);
      }

      actions.setGlobalData({
        entries: entries.map(({ slug, question }) => ({ slug, question })),
      } satisfies PerspectivesGlobalData);

      const indexModulePath = await actions.createData(
        "perspectives-index.tsx",
        `import { PerspectivesIndex } from "@/components/perspectives/perspectives-index";

export default function PerspectivesIndexRoute() {
  return <PerspectivesIndex />;
}
`,
      );

      actions.addRoute({
        path: routePathWithBaseUrl(context.siteConfig.baseUrl, "/perspectives"),
        component: indexModulePath,
        exact: true,
      });

      for (const entry of entries) {
        const source = `import { PerspectivePage } from "@/components/perspectives/perspective-page";

const QUESTION = ${JSON.stringify(entry.question)};
const BODY = ${JSON.stringify(entry.body)};

export default function PerspectiveRoute() {
  return <PerspectivePage question={QUESTION} body={BODY} />;
}
`;
        const modulePath = await actions.createData(
          `perspective-${entry.slug}.tsx`,
          source,
        );
        actions.addRoute({
          path: routePathWithBaseUrl(
            context.siteConfig.baseUrl,
            `/perspectives/${entry.slug}`,
          ),
          component: modulePath,
          exact: true,
        });
      }
    },
  };
}
