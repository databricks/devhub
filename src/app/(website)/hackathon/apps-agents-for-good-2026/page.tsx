import type { ReactNode } from "react";
import type { Metadata } from "next";

import { getMetadata } from "@/lib/get-metadata";
import { appsAgentsForGood2026Event as event } from "@/components/hackathon/apps-agents-for-good-2026-event";
import {
  HackathonEventFooter,
  HackathonEventSection,
  HackathonEventSidebar,
  HackathonFaqSection,
  HackathonJudging,
  HackathonResources,
  HackathonSubmission,
  HackathonTimeline,
} from "@/components/hackathon/hackathon-event-page";

export const metadata: Metadata = getMetadata({
  title: "Apps & Agents for Good Hackathon — Databricks Data + AI Summit 2026",
  description:
    "Databricks Apps & Agents for Good Hackathon at Data + AI Summit 2026 — schedule, resources, and how to apply.",
  noIndex: true,
  pathname: "/hackathon/apps-agents-for-good-2026",
  type: "article",
});

export default function AppsAgentsForGood2026Page(): ReactNode {
  return (
    <main className="bg-black text-white">
      <div className="mx-auto grid max-w-304 grid-cols-1 gap-12 px-5 pt-18 md:px-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16 lg:pt-24">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="m-0 max-w-2xl text-3xl/[1.125] font-normal tracking-[-0.04em] text-white md:text-[3.5rem]/[1.125]">
            {event.name}
          </h1>
          <p className="text-grey-90 mt-4 text-lg/normal tracking-tight md:text-xl/snug">
            {event.description}
          </p>

          <HackathonEventSidebar event={event} className="mt-10 lg:hidden" />

          <HackathonEventSection className="mt-12 md:mt-16" title="About">
            <div className="text-grey-90 mt-3.5 flex max-w-2xl flex-col gap-y-6 text-base/normal tracking-tight md:text-lg/normal">
              {event.about}
            </div>
          </HackathonEventSection>

          <HackathonEventSection className="mt-10 md:mt-14" title="Resources">
            <HackathonResources resources={event.resources} />
          </HackathonEventSection>

          <HackathonEventSection className="mt-10 md:mt-14" title="Timeline">
            <HackathonTimeline items={event.timeline} />
          </HackathonEventSection>

          <HackathonSubmission event={event} />

          <HackathonEventSection className="mt-10 md:mt-14" title="Judging">
            <HackathonJudging event={event} />
          </HackathonEventSection>

          <HackathonFaqSection items={event.faq} />
        </div>

        <HackathonEventSidebar event={event} className="hidden lg:block" />
      </div>

      <HackathonEventFooter />
    </main>
  );
}
