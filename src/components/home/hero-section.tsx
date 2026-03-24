import type { ReactNode } from "react";
import { useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/code/copy-button";
import { getBootstrapPromptApiPath } from "@/lib/bootstrap-prompt";

function fallbackCopyTextToClipboard(text: string): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.top = "-9999px";
  textArea.style.left = "-9999px";
  document.body.append(textArea);
  textArea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textArea.remove();
  }
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy copy.
    }
  }

  return fallbackCopyTextToClipboard(text);
}

async function getBootstrapPrompt(): Promise<string> {
  const response = await fetch(getBootstrapPromptApiPath());
  if (!response.ok) {
    throw new Error(`Failed to fetch markdown: ${response.status}`);
  }

  const bootstrapPrompt = await response.text();
  if (!bootstrapPrompt.trim()) {
    throw new Error("Bootstrap prompt markdown is empty");
  }

  return bootstrapPrompt;
}

export function HeroSection(): ReactNode {
  const handleCopyBootstrapPrompt = useCallback(async () => {
    try {
      const bootstrapPrompt = await getBootstrapPrompt();
      const copied = await copyTextToClipboard(bootstrapPrompt);

      if (!copied) {
        throw new Error("Clipboard copy failed");
      }

      toast.success("Bootstrap prompt copied to clipboard");
    } catch {
      toast.error("Failed to copy bootstrap prompt");
    }
  }, []);

  return (
    <section className="relative bg-db-oat-medium text-black dark:bg-db-navy dark:text-white">
      <div className="container px-4 py-10 md:py-14">
        <div className="grid min-h-0 grid-cols-1 md:min-h-[560px] md:grid-cols-2">
          <div className="flex max-w-xl flex-col justify-center gap-8 md:py-8">
            <div className="space-y-7">
              <h1 className="text-5xl leading-tight font-medium tracking-tight md:text-6xl">
                Build agentic applications in minutes, not months.
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex h-10 items-stretch overflow-hidden rounded-full border border-black/22 bg-white pl-4 font-mono text-sm text-black dark:border-white/24 dark:bg-db-navy dark:text-white">
                  <code className="m-0 flex items-center bg-transparent p-0 pr-2 text-inherit dark:text-white">
                    $ databricks apps init
                  </code>
                  <CopyButton
                    text="databricks apps init"
                    label="Copy command"
                    variant="segment"
                    className="!h-full !w-11 !rounded-none !rounded-r-full !border-l !border-black/16 !bg-transparent !text-black hover:!bg-black/10 hover:!text-black dark:!border-white/18 dark:!bg-transparent dark:!text-white dark:hover:!bg-white/16 dark:hover:!text-white"
                  />
                </div>
                <Button
                  className="h-10 rounded-full px-6 font-medium"
                  onClick={handleCopyBootstrapPrompt}
                >
                  Copy Prompt
                </Button>
              </div>
            </div>
            <p className="max-w-md text-base leading-relaxed text-black/68 dark:text-white/72">
              Lakebase for your data. AgentBricks for your AI. Databricks Apps
              for your deployment. One platform, one command, production-ready.
            </p>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="block h-full w-auto max-w-full object-contain dark:hidden"
            >
              <source
                src="/videos/hero-animation-bg-light.mp4"
                type="video/mp4"
              />
            </video>
            <video
              autoPlay
              muted
              loop
              playsInline
              className="hidden h-full w-auto max-w-full object-contain dark:block"
            >
              <source
                src="/videos/hero-animation-bg-dark.mp4"
                type="video/mp4"
              />
            </video>
          </div>
        </div>
      </div>
      <div className="h-3 w-full bg-db-lava" />
    </section>
  );
}
