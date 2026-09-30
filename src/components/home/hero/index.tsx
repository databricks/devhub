"use client";

import { useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { Check, LoaderCircle } from "lucide-react";

import { getBootstrapPromptApiPath } from "@/lib/bootstrap-prompt";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TitleCross } from "@/components/home/title-cross";
import { Icons } from "@/components/icons";

import { DbHeroAnimation } from "./animation";

interface HeroProps {
  className?: string;
}

function HeroCopyPromptButton() {
  const apiPath = getBootstrapPromptApiPath();
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied">(
    "idle",
  );

  async function handleCopy() {
    setCopyState("copying");

    try {
      const response = await fetch(apiPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch bootstrap prompt: ${response.status}`);
      }

      const prompt = await response.text();
      await navigator.clipboard.writeText(prompt);
      setCopyState("copied");
      track("copy_bootstrap_prompt", { source: "hero" });
    } catch {
      setCopyState("idle");
    }
  }

  return (
    <Button
      className="h-10 gap-x-4.5 font-mono text-base leading-none tracking-tight text-black uppercase shadow-none lg:h-11"
      onClick={handleCopy}
      disabled={copyState === "copying"}
      title="Copy agent prompt"
      size="xl"
      variant="orange"
    >
      {copyState === "copied" ? "Copied" : "Copy agent prompt"}
      {copyState === "copying" ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : copyState === "copied" ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <Icons.copy className="size-3.5" aria-hidden="true" />
      )}
    </Button>
  );
}

function HeroTitleHighlight({ children }: { children: string }) {
  return (
    <span className="text-db-lava relative inline-block md:whitespace-nowrap">
      <span
        className="border-grey-20 pointer-events-none absolute -inset-x-1.5 inset-y-0 hidden border md:block"
        aria-hidden="true"
      />
      <TitleCross className="-top-2 -left-3.5" />
      <TitleCross className="-top-2 -right-3.5" />
      <TitleCross className="-bottom-2 -left-3.5" />
      <TitleCross className="-right-3.5 -bottom-2" />
      <span className="relative">{children}</span>
    </span>
  );
}

function Hero({ className }: HeroProps) {
  return (
    <section
      className={cn(
        "hero border-grey-20 relative -mt-16 block border-b bg-black text-white",
        className,
      )}
    >
      <div className="relative flex min-h-[max(125vw,41.25rem)] w-full flex-col justify-end overflow-hidden pb-16 sm:min-h-[max(100vw,43.75rem)] md:min-h-200 md:pb-20 lg:min-h-[max(min(calc(100vh-2rem),62.5rem),43.75rem)] lg:pb-[min(5vh,6.5rem)] xl:min-h-[max(min(calc(100vh-2rem),62.5rem),43.75rem)] 2xl:min-h-[max(min(calc(100vh-2rem),75rem),50rem)]">
        <div className="absolute top-8 bottom-0 left-1/2 w-full max-w-400 -translate-x-1/2 px-5 md:top-8 md:px-8 lg:top-0">
          <div
            className="absolute top-0 left-[-20%] aspect-2300/1144 w-[150vw] sm:left-[-23%] md:-left-38 md:w-5xl lg:left-0 lg:h-[max(min(85vh,50rem),40rem)] lg:w-auto lg:translate-x-[-14.5%] xl:h-[max(min(90vh,64rem),40rem)] 2xl:h-[max(min(95vh,71.5rem),40rem)]"
            aria-hidden="true"
          >
            <DbHeroAnimation />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-t from-transparent to-black lg:h-24" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-b from-transparent to-black" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/7 bg-linear-to-l from-transparent via-black/90 via-80% to-black" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/7 bg-linear-to-r from-transparent via-black/90 via-80% to-black" />
          </div>
        </div>
        <div
          className="block h-14 md:h-16 lg:h-10 xl:hidden"
          aria-hidden="true"
        />
        <header className="pointer-events-none relative z-10 flex flex-col justify-end">
          <div className="pointer-events-auto mx-auto grid w-full max-w-400 grid-cols-1 px-5 md:px-8 xl:grid-cols-[1fr_auto] xl:items-end xl:gap-7">
            <h1 className="font-heading max-w-md pb-1 text-4xl/none tracking-normal text-white md:max-w-4xl md:text-5xl/none lg:text-[4rem]/none 2xl:text-7xl/none">
              <span className="relative z-10">Build </span>
              <HeroTitleHighlight>agentic applications</HeroTitleHighlight>
              <br />
              <span className="relative z-10">
                in&nbsp;minutes, not months.
              </span>
            </h1>
            <p className="text-grey-80 order-last mt-4 max-w-sm text-base/tight tracking-normal xl:order-0 xl:row-span-2 xl:mt-0">
              Copy the prompt into Codex, Claude Code, Cursor, or any coding
              agent — it will walk you through building a complete app, step by
              step.
            </p>
            <div className="mt-4.5 flex flex-col gap-x-5 gap-y-3 sm:flex-row md:mt-5 lg:mt-6 xl:mt-0">
              <Button
                className="h-10 rounded-none bg-white px-7 font-mono text-base leading-none font-medium tracking-tight text-black uppercase shadow-none hover:bg-white/90 lg:h-11"
                asChild
              >
                <Link
                  className="no-underline hover:no-underline"
                  href="/docs/start-here"
                >
                  Read the docs
                </Link>
              </Button>
              <HeroCopyPromptButton />
            </div>
          </div>
        </header>
      </div>
    </section>
  );
}

export default Hero;
