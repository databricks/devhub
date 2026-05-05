import type { ReactNode } from "react";
import Head from "@docusaurus/Head";
import { useLocation } from "@docusaurus/router";
import BrowserOnly from "@docusaurus/BrowserOnly";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";

// Keep in sync with middleware.ts matcher and vercel.json rewrites
// TODO: centralize content section definitions into a shared module
const MD_PREFIXES = ["/docs/", "/templates", "/solutions"];

/** Injects <link rel="alternate" type="text/markdown"> so agents discover the .md variant. */
function MarkdownAlternate(): ReactNode {
  const { pathname } = useLocation();
  const { siteConfig } = useDocusaurusContext();
  const sitePath = toSiteRelativePath(pathname, siteConfig.baseUrl);
  const hasMarkdown = MD_PREFIXES.some((p) => sitePath.startsWith(p));
  const mdHref = useBaseUrl(sitePath.replace(/\/$/, "") + ".md");
  if (!hasMarkdown) return null;
  return (
    <Head>
      <link rel="alternate" type="text/markdown" href={mdHref} />
    </Head>
  );
}

function toSiteRelativePath(pathname: string, baseUrl: string): string {
  const basePath = baseUrl.replace(/\/$/, "");
  if (
    basePath !== "" &&
    (pathname === basePath || pathname.startsWith(`${basePath}/`))
  ) {
    const withoutBasePath = pathname.slice(basePath.length);
    return withoutBasePath === "" ? "/" : withoutBasePath;
  }
  return pathname;
}

function SonnerToaster() {
  const theme =
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";

  return (
    <Toaster
      position="top-right"
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
    />
  );
}

export default function Root({ children }: { children: ReactNode }): ReactNode {
  return (
    <>
      <Analytics />
      <MarkdownAlternate />
      {children}
      <BrowserOnly>{() => <SonnerToaster />}</BrowserOnly>
    </>
  );
}
