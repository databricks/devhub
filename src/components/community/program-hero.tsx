import Image from "next/image";
import Link from "next/link";

import type { PersonKind } from "@/lib/community/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  MVP_NOMINATION_URL,
  STUDENT_APPLICATION_URL,
} from "@/components/community/community-cta";

export function ProgramHero({ kind }: { kind: PersonKind }) {
  const mvp = kind === "mvp";
  return (
    <section
      className={cn(
        "mx-auto max-w-7xl px-5 pt-12 md:px-8 md:pt-18",
        mvp ? "xl:pt-21.75" : "xl:pt-21",
      )}
    >
      <Image
        src={
          mvp
            ? "/img/community/mvp-badge.svg"
            : "/img/community/student-badge.svg"
        }
        alt={mvp ? "Databricks MVP" : "Databricks Student Fellows"}
        width={116}
        height={mvp ? 135 : 138}
        priority
        loading="eager"
        className="mb-8 h-auto w-29 object-contain"
      />
      <h1 className="font-heading max-w-3xl text-4xl/none font-normal tracking-normal text-pretty md:text-5xl/none xl:max-w-241.5 xl:text-[3.5rem]/none">
        <span className="text-db-lava">
          {mvp ? "Databricks MVPs." : "Student fellows."}
        </span>{" "}
        {mvp
          ? "How Databricks recognizes and supports experts in the Data + AI community."
          : "Turn your data expertise into a career in AI."}
      </h1>
      <div
        className={cn(
          "mt-4.5 flex flex-col justify-between gap-6 border-t border-white/16 pt-4.5",
          mvp ? "lg:flex-row lg:items-start" : "xl:flex-row xl:items-start",
        )}
      >
        <div
          className={cn(
            "flex",
            mvp ? "flex-col gap-4" : "flex-wrap items-center gap-3 sm:gap-5",
          )}
        >
          <div
            className={cn(
              "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-5",
              !mvp && "w-full sm:w-auto",
            )}
          >
            <Button
              asChild
              size="xl"
              className={cn(
                "bg-white px-5 font-mono text-sm font-medium tracking-tight text-black uppercase hover:bg-white/90 md:text-base",
                !mvp && "leading-none tracking-[-0.02em] md:min-w-61.25",
              )}
            >
              <Link
                href={mvp ? MVP_NOMINATION_URL : "/student-fellows/fellows"}
              >
                {mvp ? "Nominate a Peer" : "Browse fellow profiles"}
              </Link>
            </Button>
            {mvp ? (
              <Button
                asChild
                size="xl"
                className="bg-grey-20 hover:bg-grey-30 font-mono text-sm font-medium tracking-tight text-white uppercase md:text-base"
              >
                <Link href="/mvps/directory">Browse MVP profiles</Link>
              </Button>
            ) : (
              <Button
                asChild
                size="xl"
                className="bg-grey-20 hover:bg-grey-30 font-mono text-sm leading-none font-medium tracking-[-0.02em] text-white uppercase md:min-w-45.75 md:text-base"
              >
                <a href="https://databricksstudentfellows.com/signin">
                  Fellow sign in
                </a>
              </Button>
            )}
          </div>
          {!mvp && (
            <p className="text-grey-80 flex shrink-0 flex-wrap items-center gap-x-1.5 text-base/5">
              <span>Not a fellow yet?</span>
              <a
                href={STUDENT_APPLICATION_URL}
                className="text-orange focus-visible:outline-orange inline-flex min-h-11 items-center gap-1 underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                Apply today
                <Image
                  src="/img/community/apply-arrow.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="size-4 shrink-0"
                />
              </a>
            </p>
          )}
        </div>
        <p
          className={cn(
            "max-w-80 shrink-0 text-base/5 text-pretty",
            mvp ? "text-grey-70 lg:pt-1" : "text-grey-80 xl:pt-1",
          )}
        >
          {mvp
            ? "Recognizing those who share knowledge and grow the community."
            : "Learn from Databricks experts and build real-world data and AI skills."}
        </p>
      </div>
    </section>
  );
}
