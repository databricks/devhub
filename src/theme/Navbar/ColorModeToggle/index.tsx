import type { ReactNode } from "react";
import { useThemeConfig } from "@docusaurus/theme-common";
import type { Props } from "@theme/Navbar/ColorModeToggle";
import { ModeToggle } from "@/components/theme/mode-toggle";

export default function NavbarColorModeToggle({ className }: Props): ReactNode {
  const { disableSwitch } = useThemeConfig().colorMode;

  if (disableSwitch) {
    return null;
  }

  return <ModeToggle className={className} />;
}
