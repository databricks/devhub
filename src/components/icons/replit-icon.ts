import { createElement, type SVGProps } from "react";

/**
 * Replit brand mark from Simple Icons (CC0). The SVG inherits the current
 * text color so it adapts to light/dark themes automatically.
 *
 * Written with createElement (rather than .tsx) so this module can be
 * imported by lib code (e.g. src/lib/prompt-targets.ts) without forcing
 * JSX transforms on consumers like vitest.
 *
 * Source: https://cdn.jsdelivr.net/npm/simple-icons/icons/replit.svg
 */
const REPLIT_PATH =
  "M2 1.5A1.5 1.5 0 0 1 3.5 0h7A1.5 1.5 0 0 1 12 1.5V8H3.5A1.5 1.5 0 0 1 2 6.5ZM12 8h8.5A1.5 1.5 0 0 1 22 9.5v5a1.5 1.5 0 0 1-1.5 1.5H12ZM2 17.5A1.5 1.5 0 0 1 3.5 16H12v6.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 2 22.5Z";

export function ReplitIcon(props: SVGProps<SVGSVGElement>) {
  return createElement(
    "svg",
    {
      role: "img",
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg",
      fill: "currentColor",
      "aria-hidden": "true",
      ...props,
    },
    createElement("path", { d: REPLIT_PATH }),
  );
}
