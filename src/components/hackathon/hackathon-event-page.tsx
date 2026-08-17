import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Footer from "@/components/footer";
import { Faq, type HackathonFaqItem } from "@/components/hackathon/faq";
import CTA from "@/components/home/cta";

type HackathonResourceLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type HackathonResource = {
  label: string;
  title: string;
  description: ReactNode;
  href?: string;
  external?: boolean;
  links?: HackathonResourceLink[];
  wide?: boolean;
};

type HackathonTimelineItem = {
  label: string;
  date: string;
  detail: string;
};

type HackathonJudgingCriterion = {
  title: string;
  detail: string;
};

type HackathonFact = {
  title: string;
  detail: ReactNode;
};

export type HackathonEvent = {
  name: string;
  description: ReactNode;
  about: ReactNode;
  applyUrl: string;
  applyLabel?: string;
  registrationClosed?: boolean;
  applyNote?: ReactNode;
  facts: HackathonFact[];
  resources: HackathonResource[];
  timeline: HackathonTimelineItem[];
  submission: ReactNode;
  submissionUrl?: string;
  judgingIntro: ReactNode;
  judgingCriteria: HackathonJudgingCriterion[];
  faq: HackathonFaqItem[];
  metaTitle?: string;
  metaDescription?: string;
};

function ArrowCornerIcon({ className }: { className?: string }): ReactNode {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 15L15 5M8.5 5H15V11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HackathonEventSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}): ReactNode {
  return (
    <section className={cn("flex flex-col", className)}>
      <h2 className="m-0 text-2xl/snug font-medium tracking-tight text-white md:text-3xl/snug">
        {title}
      </h2>
      {children}
    </section>
  );
}

function EventAction({
  href,
  children,
  disabled = false,
  withIcon = false,
}: {
  href: string;
  children: ReactNode;
  disabled?: boolean;
  withIcon?: boolean;
}): ReactNode {
  const className =
    "mt-3 flex h-9.5 min-w-37 w-fit items-center whitespace-nowrap justify-center bg-orange font-mono text-sm/none font-medium tracking-tight text-black uppercase no-underline transition-colors hover:bg-db-lava-light hover:text-black hover:no-underline focus-visible:ring-2 focus-visible:ring-orange/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  const content = (
    <>
      <span className="px-4.5">{children}</span>
      {withIcon ? (
        <span className="flex aspect-square h-full shrink-0 items-center justify-center border-l-2">
          <ArrowCornerIcon className="size-4" />
        </span>
      ) : null}
    </>
  );

  if (disabled) {
    return (
      <span aria-disabled="true" className={cn(className, "opacity-60")}>
        {content}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {content}
    </a>
  );
}

function ResourceCard({
  resource,
}: {
  resource: HackathonResource;
}): ReactNode {
  const cardClassName = cn(
    "group relative flex min-h-56 flex-col justify-between gap-14 border border-grey-30 bg-grey-5 p-5 text-white md:p-6",
    resource.href && "no-underline hover:no-underline",
    resource.wide && "md:col-span-2",
  );

  const content = (
    <>
      <p className="m-0 flex items-center gap-1.5 font-mono text-sm leading-none font-medium tracking-normal text-[#5e616e] uppercase">
        <span className="bg-orange size-1.5" aria-hidden="true" />[
        {resource.label}]
      </p>
      <div>
        <h3 className="m-0 text-xl leading-snug font-medium tracking-[-0.03125rem] text-white">
          {resource.title}
        </h3>
        <div className="mt-2 max-w-lg text-base leading-normal tracking-[-0.025rem] text-[#9194a1]">
          {resource.description}
        </div>
        {resource.links ? (
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
            {resource.links.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange hover:text-db-lava text-base font-medium tracking-tight no-underline hover:no-underline"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-orange hover:text-db-lava text-base font-medium tracking-tight no-underline hover:no-underline"
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>
        ) : null}
      </div>
      {resource.href ? (
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
      ) : null}
    </>
  );

  if (!resource.href) return <div className={cardClassName}>{content}</div>;

  if (resource.external) {
    return (
      <a
        href={resource.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClassName}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={resource.href} className={cardClassName}>
      {content}
    </Link>
  );
}

function EventFact({ title, detail }: HackathonFact): ReactNode {
  return (
    <div className="border-grey-20 border-t py-5 first:border-t-0 first:pt-0">
      <span className="bg-orange flex size-1.5" aria-hidden="true" />
      <h2 className="mt-4.5 text-xl/snug font-medium tracking-tight text-white md:text-2xl/snug">
        {title}
      </h2>
      <p className="text-grey-70 mt-1 text-base tracking-tight">{detail}</p>
    </div>
  );
}

export function HackathonEventSidebar({
  event,
  className,
}: {
  event: HackathonEvent;
  className?: string;
}): ReactNode {
  const applyLabel = event.applyLabel ?? "Register";

  return (
    <aside className={cn("mx-auto w-full max-w-3xl lg:pt-3", className)}>
      <div className="sticky top-24">
        {event.facts.map((fact) => (
          <EventFact key={fact.title} {...fact} />
        ))}
        {!event.registrationClosed ? (
          <EventAction href={event.applyUrl}>{applyLabel}</EventAction>
        ) : null}
        {event.applyNote ? (
          <p
            className={cn(
              "text-grey-50 mt-4 text-xs/normal tracking-tight",
              event.registrationClosed ? "mt-0" : "mt-4",
            )}
          >
            {event.applyNote}
          </p>
        ) : null}
      </div>
    </aside>
  );
}

function DateText({ value }: { value: string }): ReactNode {
  const [date, time] = value.split(" · ");
  return (
    <>
      {date}
      {time ? (
        <>
          <br />
          {time}
        </>
      ) : null}
    </>
  );
}

export function HackathonResources({
  resources,
}: {
  resources: HackathonResource[];
}): ReactNode {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
      {resources.map((resource) => (
        <ResourceCard key={resource.title} resource={resource} />
      ))}
    </div>
  );
}

export function HackathonTimeline({
  items,
}: {
  items: HackathonTimelineItem[];
}): ReactNode {
  return (
    <figure className="not-prose -mx-5 mt-5 md:mx-0">
      <ScrollArea className="w-full">
        <table className="mx-5 table w-184 border-separate border-spacing-0 text-base/snug md:mx-0 md:w-full">
          <tbody className="[&_tr:last-child_td]:border-b-0">
            {items.map((item) => (
              <tr key={`${item.date}-${item.label}`} className="bg-transparent">
                <td className="border-prose-border text-grey-90 min-w-50 border-b pt-3 pb-3 text-left align-top text-base/snug tracking-tight last:pr-0 [&_code:first-child]:ml-0">
                  <span className="font-medium text-white">
                    <DateText value={item.date} />
                  </span>
                </td>
                <td className="border-prose-border text-grey-90 min-w-36 border-b pt-3 pb-3 pl-10 text-left align-top text-base/snug tracking-tight last:pr-0 [&_code:first-child]:ml-0">
                  {item.label}
                </td>
                <td className="border-prose-border text-grey-90 min-w-36 border-b pt-3 pb-3 pl-10 text-left align-top text-base/snug tracking-tight last:pr-0 [&_code:first-child]:ml-0">
                  {item.detail}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ScrollBar className="invisible" orientation="horizontal" />
      </ScrollArea>
    </figure>
  );
}

export function HackathonSubmission({
  event,
}: {
  event: HackathonEvent;
}): ReactNode {
  return (
    <section className="border-grey-30 mt-10 border p-6 md:mt-14 md:p-8">
      <div className="flex flex-col gap-x-10 gap-y-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="m-0 text-2xl/snug font-medium tracking-tight text-white">
            Submission
          </h2>
          <p className="text-grey-90 mt-1.5 max-w-lg text-lg/normal tracking-tight text-pretty md:max-w-sm">
            {event.submission}
          </p>
        </div>
        {event.submissionUrl ? (
          <a
            href={event.submissionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange hover:bg-db-lava-light focus-visible:ring-orange/70 flex h-9.5 w-fit min-w-37 shrink-0 items-center justify-center font-mono text-sm/none font-medium tracking-tight whitespace-nowrap text-black uppercase no-underline transition-colors hover:text-black hover:no-underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span className="px-4.5">Submit your project</span>
            <span className="flex aspect-square h-full shrink-0 items-center justify-center border-l-2">
              <ArrowCornerIcon className="size-5" />
            </span>
          </a>
        ) : null}
      </div>
    </section>
  );
}

export function HackathonJudging({
  event,
}: {
  event: HackathonEvent;
}): ReactNode {
  return (
    <>
      <div className="text-grey-90 mt-4 text-base/normal tracking-tight md:text-lg/normal">
        {event.judgingIntro}
      </div>
      <ol className="text-grey-90 mt-6 flex list-decimal flex-col gap-y-2.5 pl-10 text-base/normal tracking-tight">
        {event.judgingCriteria.map((criterion) => (
          <li
            key={criterion.title}
            className="text-grey-90 pl-1 text-base/normal tracking-tight md:text-lg/normal"
          >
            <span className="font-medium text-white">{criterion.title}</span>{" "}
            &mdash; {criterion.detail}
          </li>
        ))}
      </ol>
    </>
  );
}

export function HackathonFaqSection({
  items,
}: {
  items: HackathonFaqItem[];
}): ReactNode {
  return (
    <>
      <h2 className="mt-10 mb-3 text-2xl/snug font-medium tracking-tight text-white md:mt-14 md:text-3xl/snug">
        Frequently asked questions
      </h2>
      <Faq
        className="px-0 py-0 md:py-0 lg:py-0 [&>div]:max-w-none [&>div]:px-0 md:[&>div]:px-0"
        theme="dark"
        items={items}
      />
    </>
  );
}

export function HackathonEventFooter(): ReactNode {
  return (
    <div className="border-grey-20 mx-auto mt-28 max-w-432 border-x bg-black md:mt-36 lg:mt-44 xl:mt-60">
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
