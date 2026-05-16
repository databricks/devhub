import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import { useColorMode } from "@docusaurus/theme-common";
import Layout from "@theme/Layout";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { COPYRIGHT_LINE, LEGAL_LINKS } from "@/lib/legal-links";

type PerspectivesShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

function ThemeToggle() {
  const { colorMode, setColorMode } = useColorMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = colorMode === "dark";

  return (
    <button
      type="button"
      onClick={() => setColorMode(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex size-8 items-center justify-center rounded-md text-db-navy/65 transition-colors hover:bg-black/5 hover:text-db-navy dark:text-white/65 dark:hover:bg-white/10 dark:hover:text-white"
    >
      {mounted && isDark ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}

export function PerspectivesShell({
  title,
  description,
  children,
}: PerspectivesShellProps): ReactNode {
  return (
    <Layout title={title} description={description} noFooter>
      <Head>
        <body className="perspectives-page" />
      </Head>
      <div className="perspectives-root flex min-h-screen flex-col bg-white text-db-navy dark:bg-[#0d1518] dark:text-white">
        <header className="border-b border-black/8 dark:border-white/10">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
            <Link
              to="/"
              className="text-sm font-medium tracking-tight text-db-navy/85 no-underline transition-colors hover:text-db-lava dark:text-white/85 dark:hover:text-db-lava-light"
            >
              Databricks DevHub
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:py-16">
          {children}
        </main>
        <footer className="border-t border-black/8 dark:border-white/10">
          <div className="mx-auto max-w-3xl space-y-4 px-6 py-6 text-muted-foreground">
            <div>
              <p className="m-0 text-xs">{COPYRIGHT_LINE}</p>
              <ul className="mt-2 flex list-none flex-wrap gap-x-2 gap-y-1 p-0 text-xs">
                {LEGAL_LINKS.map((link) => (
                  <li
                    key={link.label}
                    className="flex items-center gap-x-2 before:opacity-50 before:content-['|'] first:before:content-none"
                  >
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="perspectives-legal-link rounded-sm no-underline transition-colors"
                      aria-label={`${link.label} (opens in a new tab)`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2 border-t border-black/8 pt-4 text-xs leading-relaxed dark:border-white/10">
              <p className="m-0">
                This site contains AI-generated content, which may have errors,
                omissions or inaccuracies. Verify information before relying on
                it. Use at your own risk.
              </p>
              <p className="m-0">
                The AI-generated content may contain materials that others own.
                Except as permitted for agentic workflow assistance, do not
                copy, modify, distribute, display, license, or sell it without
                the owner&apos;s consent.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
}
