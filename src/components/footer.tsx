import type { ReactNode, SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";

import { COPYRIGHT_LINE, LEGAL_LINKS } from "@/lib/legal-links";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { YourPrivacyChoicesLink } from "@/components/your-privacy-choices-link";

type FooterItem = {
  label: string;
  to?: string;
  href?: string;
  icon?: "databricks" | "github" | "reddit" | "youtube";
  externalArrow?: boolean;
};

type FooterSection = {
  title: string;
  items: FooterItem[];
};

type FooterVariant = "stacked" | "inline";

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Products",
    items: [
      { label: "Databricks Apps", to: "/product/databricks-apps" },
      { label: "Lakebase", to: "/product/lakebase" },
      { label: "Agent Bricks", to: "/product/agent-bricks" },
      { label: "Neon", href: "https://neon.com", externalArrow: true },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Docs", to: "/docs/start-here" },
      { label: "Templates", to: "/templates" },
      { label: "Solutions", to: "/solutions" },
    ],
  },
  {
    title: "COMMUNITY",
    items: [
      { label: "MVPs", to: "/mvps" },
      { label: "MVP directory", to: "/mvps/directory" },
      {
        label: "Student Fellows",
        href: "https://databricksstudentfellows.com/",
        externalArrow: true,
      },
      {
        label: "Reddit",
        href: "https://www.reddit.com/r/databricks/",
        icon: "reddit",
      },
      {
        label: "YouTube",
        href: "https://www.youtube.com/@Databricks",
        icon: "youtube",
      },
      {
        label: "GitHub",
        href: "https://github.com/databricks/devhub",
        icon: "github",
      },
      {
        label: "Databricks.com",
        href: "https://www.databricks.com",
        icon: "databricks",
      },
    ],
  },
];

function ExternalArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 20 20"
      width="14"
      height="14"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5 15L15 5M8.5 5H15V11.5"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function FooterItemIcon({ icon }: { icon?: FooterItem["icon"] }) {
  if (!icon) return null;

  const Icon = Icons[icon];
  return <Icon className="size-4" aria-hidden="true" />;
}

function FooterItemLabel({ item }: { item: FooterItem }) {
  if (item.icon) {
    return (
      <>
        <FooterItemIcon icon={item.icon} />
        <span>{item.label}</span>
      </>
    );
  }

  return (
    <>
      {item.label}
      {item.externalArrow && (
        <ExternalArrowIcon className="size-3.5 shrink-0" aria-hidden="true" />
      )}
    </>
  );
}

function FooterLinkItem({ item }: { item: FooterItem }): ReactNode {
  const className = cn(
    "inline-flex w-fit items-center rounded-sm font-sans text-[0.9375rem] leading-none tracking-tight text-grey-60 no-underline transition-colors hover:text-white hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-db-cyan",
    item.icon ? "gap-2.5 font-normal" : "gap-1.5",
  );

  if (item.to) {
    return (
      <Link className={className} href={item.to}>
        <FooterItemLabel item={item} />
      </Link>
    );
  }

  return (
    <Link
      className={className}
      rel="noopener noreferrer"
      target="_blank"
      href={item.href as string}
    >
      <FooterItemLabel item={item} />
    </Link>
  );
}

function LegalLinks({ className }: { className?: string }): ReactNode {
  return (
    <nav
      aria-label="Legal links"
      className={cn("flex flex-wrap gap-x-4 gap-y-3", className)}
    >
      {LEGAL_LINKS.map((link) => (
        <Link
          className="text-grey-60 hover:text-grey-70 focus-visible:outline-db-cyan inline-flex w-fit items-center rounded-sm text-[0.8125rem] leading-none tracking-tight no-underline transition-colors hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4"
          key={link.label}
          rel="noopener noreferrer"
          target="_blank"
          href={link.href}
        >
          {link.label}
        </Link>
      ))}
      <YourPrivacyChoicesLink className="text-grey-60 hover:text-grey-70 focus-visible:outline-db-cyan w-fit rounded-sm text-[0.8125rem] leading-none tracking-tight no-underline transition-colors hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4" />
    </nav>
  );
}

function CopyrightAndLegal({
  className,
  desktop,
}: {
  className?: string;
  desktop?: boolean;
}): ReactNode {
  return (
    <div className={className}>
      <p
        className={cn(
          "text-grey-60 mt-5 max-w-md text-sm leading-normal font-medium tracking-tight",
          desktop && "lg:text-[0.8125rem]",
        )}
      >
        {COPYRIGHT_LINE}
      </p>
      <LegalLinks className={desktop ? "mt-2.5" : "mt-4"} />
    </div>
  );
}

function Footer({
  className,
  variant = "inline",
}: {
  className?: string;
  variant?: FooterVariant;
}): ReactNode {
  const isInline = variant === "inline";

  return (
    <footer
      className={cn(
        "relative mx-auto max-w-432 bg-black py-12 text-white",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-400 px-5 md:px-8">
        <div
          className={cn(
            "flex flex-col items-start gap-y-10",
            isInline &&
              "gap-x-16 lg:flex-row lg:flex-wrap lg:justify-between xl:gap-x-20",
          )}
        >
          <div
            className={cn(
              "flex flex-col",
              isInline && "justify-between self-stretch",
            )}
          >
            <Link
              aria-label="Databricks Developer home"
              className="inline-flex max-w-48 rounded lg:mr-auto"
              href="/"
            >
              <Image
                alt=""
                className="h-7 w-auto"
                height={28}
                src="/img/databricks-logo.svg"
                width={177}
              />
            </Link>
            <CopyrightAndLegal className="hidden flex-col lg:flex" desktop />
          </div>
          <div className="grid w-full grid-cols-2 gap-12 md:grid-cols-3 md:gap-8 lg:flex lg:w-fit lg:flex-wrap xl:gap-22">
            {FOOTER_SECTIONS.map((section) => (
              <div
                className="flex min-w-0 flex-1 flex-col gap-7 md:min-w-37"
                key={section.title}
              >
                <span className="font-sans text-[0.625rem] leading-none tracking-normal text-white uppercase">
                  {section.title}
                </span>
                <div className="flex flex-col gap-5">
                  {section.items.map((item) => (
                    <FooterLinkItem item={item} key={item.label} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <CopyrightAndLegal className="mt-5 flex flex-col lg:hidden" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
