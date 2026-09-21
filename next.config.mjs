import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import createMDX from "@next/mdx";

const resolveLocal = (relativePath) =>
  fileURLToPath(new URL(relativePath, import.meta.url));
const resolveMdxPlugin = (file) =>
  resolveLocal(`./src/lib/mdx-plugins/${file}`);
const projectRoot = resolveLocal("./");

function appkitDocsChannel() {
  const pkgJsonPath = join(
    projectRoot,
    "node_modules",
    "@databricks",
    "appkit-ui",
    "package.json",
  );
  if (!existsSync(pkgJsonPath)) {
    throw new Error(
      "@databricks/appkit-ui is not installed. Run `pnpm install` and retry.",
    );
  }

  const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
  const version = pkg.version;
  if (typeof version !== "string" || version.length === 0) {
    throw new Error(
      `Invalid @databricks/appkit-ui version: ${JSON.stringify(version)}`,
    );
  }

  const major = version.split(".")[0];
  if (!/^\d+$/.test(major)) {
    throw new Error(`Invalid @databricks/appkit-ui version: ${version}`);
  }

  return `v${major}`;
}
const textArtifactCacheHeader = {
  key: "Cache-Control",
  value: "public, max-age=0, s-maxage=600",
};
const markdownArtifactHeaders = [
  textArtifactCacheHeader,
  {
    key: "X-Robots-Tag",
    value: "noindex",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  turbopack: {
    root: projectRoot,
    resolveAlias: {},
  },
  images: {
    formats: ["image/webp"],
    qualities: [75, 95, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    const latestAppkitDocs = `/docs/appkit/${appkitDocsChannel()}`;

    return [
      {
        source: "/docs",
        destination: "/docs/start-here",
        permanent: true,
      },
      {
        source: "/docs/",
        destination: "/docs/start-here",
        permanent: true,
      },
      {
        source: "/product/data-lakehouse",
        destination: "/product/lakebase",
        permanent: true,
      },
      // /appkit is a moving alias for the current major. A 308 would pin
      // crawlers to whatever destination this build happened to emit.
      {
        source: "/appkit",
        destination: latestAppkitDocs,
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/docs/llms.txt",
        destination: "/api/llms",
      },
      {
        source: "/templates.md",
        destination: "/api/markdown?section=templates&slug=",
      },
      {
        source: "/solutions.md",
        destination: "/api/markdown?section=solutions&slug=",
      },
      {
        source: "/docs/:slug*.md",
        destination: "/api/markdown?section=docs&slug=:slug*",
      },
      {
        source: "/templates/:slug*.md",
        destination: "/api/markdown?section=templates&slug=:slug*",
      },
      {
        source: "/solutions/:slug*.md",
        destination: "/api/markdown?section=solutions&slug=:slug*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/js/home-hero-player.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      {
        source: "/:slug*.md",
        headers: markdownArtifactHeaders,
      },
    ];
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [
      "remark-gfm",
      "remark-frontmatter",
      "remark-mdx",
      ["remark-mdx-frontmatter", { name: "metadata" }],
      resolveMdxPlugin("remark-heading.mjs"),
      [resolveMdxPlugin("remark-image.mjs"), { useImport: false }],
      resolveMdxPlugin("remark-admonition.mjs"),
      resolveMdxPlugin("remark-steps.mjs"),
      resolveMdxPlugin("remark-npm.mjs"),
      resolveMdxPlugin("remark-code-tab.mjs"),
    ],
    rehypePlugins: [resolveMdxPlugin("rehype-code.mjs")],
  },
});

export default withMDX(nextConfig);
