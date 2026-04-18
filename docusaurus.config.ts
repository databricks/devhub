import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import path from "path";
import aboutDevhubPlugin from "./plugins/about-devhub";
import contentEntriesPlugin from "./plugins/content-entries";
import cookbooksPlugin from "./plugins/cookbooks";
import llmsTxtPlugin from "./plugins/llms-txt";
import remarkCliTabs from "./plugins/remark-cli-tabs";
import { examplesEnabled, showDrafts } from "./src/lib/feature-flags-server";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Databricks Developer",
  tagline: "Build intelligent data and AI applications in minutes, not months",
  favicon: "img/favicon.svg",
  customFields: {
    showDrafts: showDrafts(),
    examplesFeature: examplesEnabled(),
  },

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://dev.databricks.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "databricks", // Usually your GitHub org/user name.
  projectName: "devhub", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenAnchors: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          remarkPlugins: [remarkCliTabs],
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    function sourceAliasPlugin() {
      return {
        name: "docusaurus-source-alias",
        configureWebpack() {
          return {
            resolve: {
              alias: {
                "@": path.resolve(__dirname, "src"),
              },
            },
          };
        },
      };
    },
    function tailwindPlugin() {
      return {
        name: "docusaurus-tailwindcss",
        configurePostCss(postcssOptions) {
          postcssOptions.plugins.push(require("@tailwindcss/postcss"));
          return postcssOptions;
        },
      };
    },
    [
      contentEntriesPlugin,
      {
        id: "recipes",
        entryType: "recipe",
        routeBasePath: "/resources",
        contentSection: "recipes",
      },
    ],
    [
      contentEntriesPlugin,
      {
        id: "solutions",
        entryType: "solution",
        routeBasePath: "/solutions",
        contentSection: "solutions",
      },
    ],
    [
      contentEntriesPlugin,
      {
        id: "examples",
        entryType: "example",
        routeBasePath: "/resources",
        contentSection: "examples",
      },
    ],
    llmsTxtPlugin,
    aboutDevhubPlugin,
    cookbooksPlugin,
  ],

  themeConfig: {
    image: "img/databricks-social-card.svg",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "",
      logo: {
        alt: "Databricks Developer",
        src: "img/databricks-logo.svg",
      },
      items: [
        { to: "/solutions", label: "Solutions", position: "left" },
        { to: "/resources", label: "Resources", position: "left" },
        {
          to: "/docs/start-here",
          label: "Docs",
          position: "left",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Products",
          items: [
            {
              label: "Lakebase",
              href: "https://www.databricks.com/product/lakebase",
            },
            {
              label: "Agent Bricks",
              href: "https://www.databricks.com/product/artificial-intelligence/agent-bricks",
            },
            {
              label: "Databricks Apps",
              href: "https://www.databricks.com/product/databricks-apps",
            },
          ],
        },
        {
          title: "Docs",
          items: [
            { label: "Start Here", to: "/docs/start-here" },
            { label: "Resources", to: "/resources" },
          ],
        },
        {
          title: "More",
          items: [
            { label: "Databricks", href: "https://databricks.com" },
            { label: "Sign Up", href: "https://login.databricks.com/signup" },
            { label: "Support", href: "https://help.databricks.com" },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Databricks, Inc.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash", "diff", "json", "sql", "css"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
