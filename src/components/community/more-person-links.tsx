"use client";

import { useState } from "react";
import { ArrowUpRight, Ellipsis } from "lucide-react";

import type { PublicPerson } from "@/lib/community/schema";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MorePersonLinks({
  name,
  links,
  wideVisibleCount = 0,
}: {
  name: string;
  links: PublicPerson["additionalLinks"];
  wideVisibleCount?: number;
}) {
  const [menuContainer, setMenuContainer] = useState<HTMLElement | null>(null);

  return (
    <nav
      ref={setMenuContainer}
      aria-label={`Additional links for ${name}`}
      className={cn(links.length === wideVisibleCount && "xl:hidden")}
    >
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`More links for ${name}`}
            className="hover:text-db-lava focus-visible:outline-db-lava inline-flex min-h-8 min-w-6 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <Ellipsis className="size-5" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        {menuContainer && (
          <DropdownMenuContent
            align="end"
            className="border-grey-80 max-w-72 rounded-none bg-[#EEEDE9] [--accent-foreground:var(--color-black)] [--accent:var(--grey-80)]"
            portalContainer={menuContainer}
          >
            <DropdownMenuGroup>
              {links.map(({ label, url }, index) => (
                <DropdownMenuItem
                  key={`${url}-${index}`}
                  asChild
                  className={cn(
                    "rounded-none",
                    index < wideVisibleCount && "xl:hidden",
                  )}
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-10 text-black"
                  >
                    <span className="min-w-0 break-words">{label}</span>
                    <ArrowUpRight
                      className="ml-auto size-4 text-black"
                      aria-hidden="true"
                    />
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </nav>
  );
}
