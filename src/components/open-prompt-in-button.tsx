import { ChevronDown } from "lucide-react";
import { track } from "@vercel/analytics";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPromptTargets } from "@/lib/prompt-targets";

type OpenPromptInButtonProps = {
  replitPrompt?: string;
  slug: string;
  title: string;
  permalink: string;
};

export function OpenPromptInButton({
  replitPrompt,
  slug,
  title,
  permalink,
}: OpenPromptInButtonProps) {
  const targets = getPromptTargets({ replitPrompt });
  if (targets.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-10 px-5">
          Open prompt in
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        {targets.map((target) => {
          const Icon = target.icon;
          return (
            <DropdownMenuItem key={target.id} asChild>
              <a
                href={target.href}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
                onClick={() =>
                  track("open_prompt_in", {
                    target: target.id,
                    slug,
                    title,
                    permalink,
                  })
                }
              >
                <Icon />
                {target.label}
              </a>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
