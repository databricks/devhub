import { useColorMode } from "@docusaurus/theme-common";
import { Monitor, Moon, Sun } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ModeToggleProps = {
  className?: string;
};

export function ModeToggle({ className }: ModeToggleProps): ReactNode {
  const { colorMode, colorModeChoice, setColorMode } = useColorMode();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const selectedTheme = colorModeChoice ?? "system";

  const triggerIcon =
    selectedTheme === "system" ? (
      <Monitor className="size-[1.05rem]" />
    ) : colorMode === "dark" ? (
      <Moon className="size-[1.05rem]" />
    ) : (
      <Sun className="size-[1.05rem]" />
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={[
            "size-8 rounded-md text-white/78 hover:bg-white/8 hover:text-white",
            className ?? "",
          ].join(" ")}
          aria-label="Theme options"
        >
          {isMounted ? triggerIcon : <Sun className="size-[1.05rem]" />}
          <span className="sr-only">Theme options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="z-[250] w-40 text-white shadow-xl"
        style={{
          backgroundColor:
            colorMode === "dark"
              ? "var(--db-dark-surface)"
              : "var(--db-navy-light)",
          borderColor: "rgb(255 255 255 / 0.15)",
        }}
      >
        <DropdownMenuItem
          className="text-white/90 focus:bg-white/10 focus:text-white"
          onClick={() => setColorMode("light")}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-white/90 focus:bg-white/10 focus:text-white"
          onClick={() => setColorMode("dark")}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-white/90 focus:bg-white/10 focus:text-white"
          onClick={() => setColorMode(null)}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
