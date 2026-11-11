import type { ReactNode } from "react";

import type { ContentData } from "@/lib/ai-trends/schema";

import { RichText } from "./rich-text";

export function TrendsHeader({
  header,
}: {
  header: ContentData["header"];
}): ReactNode {
  return (
    <header className="mx-auto grid w-full max-w-360 grid-cols-1 gap-y-3 px-5 pt-10 pb-3 md:px-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-x-16 lg:gap-y-2">
      <h1 className="font-heading text-foreground text-[2.5rem] leading-none font-normal tracking-[-0.035em] md:text-5xl lg:self-end xl:text-[3.5rem]">
        <span>{header.title_lead}</span>{" "}
        <span className="text-db-lava">{header.title_accent}</span>
      </h1>
      <div className="flex max-w-2xl flex-col gap-2 lg:row-span-2 lg:max-w-xl lg:self-center lg:justify-self-end xl:max-w-2xl">
        <p className="text-foreground/75 text-sm leading-normal text-pretty">
          <RichText text={header.intro} />
        </p>
      </div>
      <nav
        aria-label="On this page"
        className="grid grid-cols-2 gap-x-6 md:flex md:gap-4"
      >
        {[
          ["01", "Usage", "usage"],
          ["02", "Multi-AI", "multi-ai"],
          ["03", "Spend", "spend-trends"],
          ["04", "Coding Frontier", "benchmark"],
          ["05", "Publications", "publications"],
        ].map(([number, label, id]) => (
          <a
            key={id}
            href={`#${id}`}
            className="hover:text-db-lava focus-visible:outline-db-lava text-foreground/75 inline-flex min-h-11 items-center gap-2.5 text-sm whitespace-nowrap transition-colors md:min-h-9 pointer-coarse:min-h-11"
          >
            <span className="text-db-lava font-mono text-xs">{number}</span>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
