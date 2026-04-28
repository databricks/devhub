import fs from "fs";
import path from "path";
import type { LoadContext, Plugin } from "@docusaurus/types";

/**
 * Generates `robots.txt` with a sitemap URL pointing at whatever origin the
 * build resolved (see src/lib/site-url.ts → docusaurus.config.ts `url`).
 *
 * We intentionally write the file twice:
 *   - Once at plugin construction so `npm run start` (dev server) picks it up
 *     from `static/`, just like the previous static file.
 *   - Once in `postBuild` so the production build always reflects the URL the
 *     final build was actually configured with (preview/prod/SITE_URL).
 */

function buildRobotsTxt(siteUrl: string): string {
  const sitemap = `${siteUrl.replace(/\/$/, "")}/sitemap.xml`;
  return ["User-agent: *", "Allow: /", "", `Sitemap: ${sitemap}`, ""].join(
    "\n",
  );
}

export default function robotsTxtPlugin(context: LoadContext): Plugin {
  const staticDir = path.resolve(__dirname, "..", "static");
  fs.writeFileSync(
    path.join(staticDir, "robots.txt"),
    buildRobotsTxt(context.siteConfig.url),
  );

  return {
    name: "docusaurus-robots-txt",
    async postBuild({ siteConfig, outDir }) {
      fs.writeFileSync(
        path.join(outDir, "robots.txt"),
        buildRobotsTxt(siteConfig.url),
      );
    },
  };
}

export { buildRobotsTxt };
