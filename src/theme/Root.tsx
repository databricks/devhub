import type { ReactNode } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { Toaster } from "sonner";

function SonnerToaster() {
  const theme =
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";

  return (
    <Toaster
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
    />
  );
}

export default function Root({ children }: { children: ReactNode }): ReactNode {
  return (
    <>
      {children}
      <BrowserOnly>{() => <SonnerToaster />}</BrowserOnly>
    </>
  );
}
