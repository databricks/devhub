import type { ComponentType, SVGProps } from "react";
import { compressToEncodedURIComponent } from "lz-string";
import { ReplitIcon } from "@/components/icons/replit-icon";

type PromptTarget = {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  href: string;
};

/**
 * Builds the "Open in Replit" URL per the Open in Replit protocol.
 * `stack=Build` selects Agent (Build mode); without it Replit may silently
 * fail to fill the prompt. See https://docs.replit.com/references/integrations/open-in-replit.
 */
function buildReplitUrl(prompt: string): string {
  const encoded = compressToEncodedURIComponent(prompt);
  // Action-named utm_content (rather than component-named) so analytics
  // history stays continuous if the dropdown is ever relocated.
  const utm =
    "utm_source=devhub&utm_medium=docs&utm_campaign=run-on-replit&utm_content=open-prompt-in";
  return `https://replit.com/?stack=Build&prompt=${encoded}&referrer=devhub&${utm}`;
}

export function getPromptTargets({
  replitPrompt,
}: {
  replitPrompt?: string;
}): PromptTarget[] {
  const targets: PromptTarget[] = [];
  if (replitPrompt) {
    targets.push({
      id: "replit",
      label: "Replit",
      icon: ReplitIcon,
      href: buildReplitUrl(replitPrompt),
    });
  }
  return targets;
}
