import fs from "fs";
import path from "path";
import type { LoadContext, Plugin } from "@docusaurus/types";
import { siteUrlFromConfig } from "../src/lib/site-url";

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
  const sitemap = `${siteUrl}/sitemap.xml`;
  return ["User-agent: *", "Allow: /", "", `Sitemap: ${sitemap}`, ""].join(
    "\n",
  );
}

export default function robotsTxtPlugin(context: LoadContext): Plugin {
  const staticDir = path.resolve(__dirname, "..", "static");
  const siteUrl = siteUrlFromConfig(
    context.siteConfig.url,
    context.siteConfig.baseUrl,
  );
  fs.writeFileSync(path.join(staticDir, "robots.txt"), buildRobotsTxt(siteUrl));

  return {
    name: "docusaurus-robots-txt",
    async postBuild({ siteConfig, outDir }) {
      const buildSiteUrl = siteUrlFromConfig(
        siteConfig.url,
        siteConfig.baseUrl,
      );
      fs.writeFileSync(
        path.join(outDir, "robots.txt"),
        buildRobotsTxt(buildSiteUrl),
      );
    },
  };
}
