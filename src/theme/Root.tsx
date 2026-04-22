import type { ReactNode } from "react";
import Head from "@docusaurus/Head";
import { useLocation } from "@docusaurus/router";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";

// Keep in sync with middleware.ts matcher and vercel.json headers/rewrites
// TODO: centralize content section definitions into a shared module
const MD_PREFIXES = ["/docs/", "/resources", "/solutions", "/templates/"];

/** Injects <link rel="alternate" type="text/markdown"> so agents discover the .md variant. */
function MarkdownAlternate(): ReactNode {
  const { pathname } = useLocation();
  const hasMarkdown = MD_PREFIXES.some((p) => pathname.startsWith(p));
  if (!hasMarkdown) return null;
  const mdHref = pathname.replace(/\/$/, "") + ".md";
  return (
    <Head>
      <link rel="alternate" type="text/markdown" href={mdHref} />
    </Head>
  );
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
