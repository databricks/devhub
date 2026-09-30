import type { ComponentProps, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, GitBranch } from "lucide-react";

import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import CTA from "@/components/home/cta";
import { CopyPromptButton } from "@/components/templates/copy-prompt-button";
import { MoreTemplatesSlider } from "@/components/templates/more-templates-slider";
import { OpenPromptInButton } from "@/components/templates/open-prompt-in-button";
import {
  getTemplateCardFields,
  type TemplateItem,
} from "@/components/templates/template-card";

export type TemplateUsageProps = ComponentProps<typeof CopyPromptButton> & {
  replitPrompt?: string;
  slug: string;
};

function TemplateAiBlock({
  usage,
  className = "",
  titleClassName = "text-2xl/snug",
  showDivider = false,
}: {
  usage: TemplateUsageProps;
  className?: string;
  titleClassName?: string;
  showDivider?: boolean;
}): ReactNode {
  const { replitPrompt, slug, ...copyPromptProps } = usage;

  return (
    <div className={className}>
      {showDivider ? (
        <div className="bg-grey-20 h-px w-full" aria-hidden="true" />
      ) : (
        <span className="bg-orange block size-1.5" aria-hidden="true" />
      )}
      <h2
        className={`mt-4.5 leading-tight font-normal tracking-tight text-white ${titleClassName}`}
      >
        Build with AI
      </h2>
      <ol className="text-grey-70 marker:text-grey-60 mt-3 flex list-decimal flex-col gap-y-2 pl-4.5 text-sm/snug tracking-tight">
        <li className="pl-1">Copy the prompt below</li>
        <li className="pl-1">
          Paste into Codex, Claude Code, Cursor, or any coding agent
        </li>
        <li className="pl-1">
          Your agent builds it — asking questions along the way so the result is
          exactly what you want
        </li>
      </ol>
      <div className="mt-5 flex flex-wrap gap-2">
        <CopyPromptButton
          {...copyPromptProps}
          className="bg-orange hover:bg-primary focus-visible:ring-orange/60 h-10 gap-x-2.5 rounded-none pr-4.5 pl-4 font-mono text-sm/none font-medium tracking-tight text-black uppercase has-[>svg]:pr-4.5 has-[>svg]:pl-4 [&_svg:not([class*='size-'])]:size-4"
        />
        <OpenPromptInButton
          replitPrompt={replitPrompt}
          slug={slug}
          title={usage.title}
          permalink={usage.permalink}
          sideOffset={8}
          className="border-grey-30! text-grey-70 hover:border-grey-70! hover:text-grey-70 focus:text-grey-70 focus-visible:border-grey-70 focus-visible:ring-db-cyan data-[state=open]:border-grey-70! data-[state=open]:text-grey-70 h-10 gap-2.5 rounded-none border bg-transparent! py-0 pr-3.5 pl-4 font-mono text-sm leading-none font-medium tracking-normal uppercase shadow-none transition-colors hover:bg-transparent! focus:bg-transparent! focus-visible:ring-offset-black data-[state=open]:bg-transparent! data-[state=open]:hover:bg-transparent! [&_svg]:size-3.5 [&_svg]:text-current"
          contentClassName="rounded-none border border-grey-30 bg-black p-0 text-white shadow-none"
          itemClassName="h-10 min-h-0 cursor-pointer gap-2.5 rounded-none bg-transparent px-4 py-0 font-mono text-sm leading-none font-medium tracking-normal text-grey-70 uppercase outline-none transition-colors hover:!bg-transparent hover:!text-white focus:!bg-transparent focus:!text-white data-[highlighted]:!bg-transparent data-[highlighted]:!text-white [&_svg]:size-3.5 [&_svg]:text-current"
        />
      </div>
      <p className="text-grey-70 mt-4 text-sm tracking-tight">
        New to templates?{" "}
        <Link
          href="/docs/templates"
          className="text-orange hover:text-db-lava font-medium no-underline hover:no-underline"
        >
          Learn more here
        </Link>
      </p>
    </div>
  );
}

export function TemplateDetailRail({
  usage,
}: {
  usage: TemplateUsageProps;
}): ReactNode {
  return (
    <aside className="sticky top-24">
      <TemplateAiBlock usage={usage} />
    </aside>
  );
}

export function TemplateDetailIntro({
  afterHero,
  description,
  heroMedia,
  title,
  usage,
}: {
  afterHero?: ReactNode;
  description: string;
  heroMedia?: ReactNode;
  title: string;
  usage: TemplateUsageProps;
}): ReactNode {
  return (
    <>
      <h1 className="font-sans text-[1.75rem]/[1.125] font-normal tracking-[-0.04em] text-balance text-white md:text-4xl/[1.125] lg:text-[3.5rem]/[1.125]">
        {title}
      </h1>
      <p className="text-grey-90 mt-4 text-base/snug tracking-tight md:text-xl/snug">
        {description}
      </p>

      {heroMedia ? <div className="mt-8">{heroMedia}</div> : null}

      <TemplateAiBlock
        usage={usage}
        className="mt-5 md:mt-6 lg:hidden"
        titleClassName="text-xl/snug md:text-2xl/snug"
        showDivider
      />

      {afterHero}
    </>
  );
}

export function TemplateDetailFooter({
  relatedItems,
}: {
  relatedItems: TemplateItem[];
}): ReactNode {
  return (
    <div className="bg-[#f9f7f4] text-black">
      <div className="bg-orange h-12" aria-hidden="true" />
      <MoreTemplatesSlider items={relatedItems.map(getTemplateCardFields)} />
      <CTA
        label="Start building"
        title="Ready to ship your next agentic app in minutes?"
        className="mx-auto mt-24 max-w-432 pt-1.5 pb-16 md:mt-36 lg:mt-44 lg:pb-22 xl:mt-60"
      />
      <Footer className="mx-auto max-w-432 border-t border-white/10 lg:px-8" />
    </div>
  );
}

export function TemplateStarterCodeCard({
  templateUrl,
}: {
  templateUrl: string;
}): ReactNode {
  const displayPath =
    templateUrl
      .replace(/^https:\/\/github\.com\//, "")
      .replace(/\/tree\/[^/]+\//, "/") + "/";

  return (
    <div className="mt-10 py-2 md:mt-12">
      <div className="border-grey-30 flex flex-col gap-5 border bg-black px-6 py-6.25">
        <div className="flex flex-col gap-4">
          <p className="m-0 text-xl leading-snug font-medium tracking-tight text-white">
            Includes a working starter app
          </p>
          <p className="text-grey-90 m-0 text-lg leading-normal tracking-tight">
            Real, runnable code lives on GitHub. When you copy the prompt above,
            your coding agent clones it as the starting point and adapts it to
            your data and use case.
          </p>
        </div>
        <div className="bg-grey-30 h-px w-full" aria-hidden="true" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-grey-70 inline-flex min-w-0 items-center gap-2.5">
            <GitBranch className="size-4 shrink-0" />
            <span className="text-grey-70 min-w-0 truncate font-mono text-base leading-normal tracking-tight">
              {displayPath}
            </span>
          </div>
          <a
            href={templateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group focus-visible:outline-db-cyan inline-flex w-fit max-w-full shrink-0 items-stretch gap-x-0.5 text-white no-underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span className="bg-grey-20 group-hover:bg-grey-30 inline-flex h-9 min-w-0 items-center justify-center px-4.5 font-mono text-sm leading-none font-medium tracking-tight uppercase transition-colors">
              View on GitHub
            </span>
            <span
              className="bg-grey-20 group-hover:bg-grey-30 grid size-9 shrink-0 place-items-center transition-colors"
              aria-hidden="true"
            >
              <ArrowUpRight className="size-4" />
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

export function TemplateIncludedCard({
  description,
  href,
  name,
}: {
  description: string;
  href: string;
  name: string;
}): ReactNode {
  return (
    <Link
      href={href}
      aria-label={`View ${name}`}
      className="group border-grey-30 focus-visible:outline-db-cyan relative flex flex-col gap-14 border bg-[#0b0c0e] p-6 text-white no-underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <p className="m-0 flex items-center gap-1.5 font-mono text-sm leading-none font-medium tracking-normal text-[#5e616e] uppercase">
        <span className="size-1.5 bg-[#ff6038]" aria-hidden="true" />
        [TEMPLATES]
      </p>
      <div className="flex flex-col gap-2">
        <h3 className="m-0 text-xl leading-snug font-medium tracking-tight text-white">
          {name}
        </h3>
        <p className="m-0 text-base leading-normal tracking-tight text-[#9194a1]">
          {description}
        </p>
      </div>
      <span
        className="bg-orange absolute top-0 right-0 flex size-9 items-center justify-center text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden="true"
      >
        <Image
          className="size-5"
          src="/img/templates/arrow-right-up.svg"
          alt=""
          width={20}
          height={20}
        />
      </span>
    </Link>
  );
}

function HackathonTemplateAgentBlock({
  usage,
}: {
  usage: TemplateUsageProps;
}): ReactNode {
  const { slug: _slug, ...copyPromptProps } = usage;

  return (
    <div className="border-grey-30 mt-8 border p-5 md:mt-11 md:p-6">
      <h2 className="m-0 text-lg/snug font-medium tracking-tight text-white md:text-xl/snug">
        Use with your coding agent
      </h2>
      <ol className="text-grey-90 mt-4 flex list-decimal flex-col gap-y-2.5 pl-4 text-lg/normal tracking-tight">
        <li className="pl-2">Copy the prompt below</li>
        <li className="pl-2">
          Paste into Codex, Claude Code, Cursor, or any coding agent
        </li>
        <li className="pl-2">
          Your agent builds it — asking questions along the way so the result is
          exactly what you want
        </li>
      </ol>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3.5">
        <CopyPromptButton
          {...copyPromptProps}
          label="Copy agent prompt"
          className="bg-orange hover:bg-primary focus-visible:ring-orange/60 h-9 w-full flex-row-reverse rounded-none pr-4.5 pl-5 font-mono text-sm leading-none font-medium tracking-tight text-black uppercase has-[>svg]:px-5 sm:w-fit [&_svg:not([class*='size-'])]:size-3.5"
        />
        <Button
          className="h-9 w-full rounded-none bg-white px-7 font-mono text-sm leading-none font-medium tracking-tight text-black uppercase shadow-none hover:bg-white/90 sm:w-fit"
          asChild
        >
          <Link className="no-underline hover:no-underline" href="/templates">
            Explore templates
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function HackathonTemplateIntro({
  description,
  services,
  title,
  usage,
}: {
  description: string;
  services?: readonly string[];
  title: string;
  usage: TemplateUsageProps;
}): ReactNode {
  return (
    <>
      <h1 className="mt-6.5 text-[2rem]/[1.125] font-normal tracking-[-0.04em] wrap-break-word text-white md:text-[2.5rem]/[1.125] lg:text-5xl/[1.125] xl:text-[3.5rem]/[1.125]">
        {title}
      </h1>
      <p className="text-grey-90 mt-4 max-w-208 text-lg/snug tracking-[-0.04em] md:text-xl/snug">
        {description}
      </p>
      {services && services.length > 0 ? (
        <ul className="mt-6 flex flex-wrap gap-1" role="list">
          {services.map((service) => (
            <li
              className="bg-grey-5 border-grey-30 text-grey-80 flex h-8 items-center justify-center border px-3.5 font-mono text-sm leading-none font-medium"
              key={service}
            >
              {service}
            </li>
          ))}
        </ul>
      ) : null}

      <HackathonTemplateAgentBlock usage={usage} />
    </>
  );
}

export function HackathonTemplateFooter(): ReactNode {
  return (
    <div className="border-grey-20 mx-auto mt-24 max-w-432 border-x bg-black md:mt-36 lg:mt-44 xl:mt-60">
      <CTA
        className="pt-0 pb-16 lg:pb-22"
        theme="outline"
        label="Start building"
        title="Ready to ship your next agentic app in minutes?"
      />
      <Footer className="border-t border-white/10 bg-black lg:px-8" />
    </div>
  );
}
