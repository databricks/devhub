import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

type FooterItem = {
  label: string;
  to?: string;
  href?: string;
};

type FooterSection = {
  title: string;
  items: FooterItem[];
};

const FOOTER_SECTIONS: FooterSection[] = [
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
      { label: "Agents", to: "/docs/agents/quickstart" },
      { label: "AppKit", to: "/docs/apps/appkit" },
      { label: "Lakebase", to: "/docs/lakebase/quickstart" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Guides", to: "/resources" },
      { label: "Solutions", to: "/solutions" },
    ],
  },
  {
    title: "More",
    items: [
      { label: "Databricks", href: "https://databricks.com" },
      { label: "Sign Up", href: "https://login.databricks.com/signup" },
      {
        label: "Privacy Policy",
        href: "https://www.databricks.com/legal/privacynotice",
      },
      {
        label: "Terms of Use",
        href: "https://www.databricks.com/legal/terms-of-use",
      },
      { label: "Support", href: "https://help.databricks.com" },
    ],
  },
];

function FooterLinkItem({ item }: { item: FooterItem }): ReactNode {
  if (item.to) {
    return (
      <Link
        to={item.to}
        className="inline-flex items-center rounded-sm text-xs text-white/88 no-underline transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-db-cyan"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-sm text-xs text-white/88 no-underline transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-db-cyan"
    >
      {item.label}
      <ExternalLink className="size-2.5 opacity-50" />
    </a>
  );
}

export default function Footer(): ReactNode {
  const logoSrc = useBaseUrl("/img/databricks-logo.svg");

  return (
    <footer className="border-t border-white/12 bg-black text-white">
      <div className="container px-4 py-4 md:py-5">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr] md:items-start">
          <div>
            <Link to="/" className="inline-flex items-center no-underline">
              <img src={logoSrc} alt="Databricks" className="h-5 w-auto" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-7 gap-y-6 md:grid-cols-4">
            {FOOTER_SECTIONS.map((section) => (
              <section key={section.title}>
                <h3 className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-white/64 uppercase">
                  {section.title}
                </h3>
                <ul className="m-0 list-none space-y-1.5 p-0">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <FooterLinkItem item={item} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <Separator className="my-4 bg-white/10" />

        <p className="m-0 text-[11px] text-white/55">
          Copyright © {new Date().getFullYear()} Databricks, Inc.
        </p>
      </div>
    </footer>
  );
}
