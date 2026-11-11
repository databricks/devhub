import type { CSSProperties, ReactNode } from "react";

export const OG_SIZE = { width: 1200, height: 630 };
const PADDING_TOP = 40;
const FOOTER_HEIGHT = 44;
/** Height between the top padding and the footer. */
export const OG_BODY_HEIGHT = OG_SIZE.height - PADDING_TOP - FOOTER_HEIGHT;
export const CHART_WIDTH = 1104;
export const CHART_HEIGHT = 384;

// Mirrors the page palette in src/css/custom.css (--db-navy, --db-paper,
// --db-lava, --db-card); image rendering can't read Tailwind tokens.
export const INK = "#0b2026";
export const MUTED = "#5b6a70";
export const GRID = "#e4e2dd";
export const PAPER = "#f9f7f4";
export const LAVA = "#ff3621";
export const CARD = "#ffffff";

const SITE_LABEL = "developers.databricks.com/ai-index";

export function OgLabel({
  x,
  y,
  children,
  size = 16,
  color = MUTED,
  align = "left",
  weight = 400,
  width = 240,
}: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  color?: string;
  align?: "left" | "center" | "right";
  weight?: number;
  width?: number;
}): ReactNode {
  const left =
    align === "left" ? x : align === "center" ? x - width / 2 : x - width;
  const justify: CSSProperties["justifyContent"] =
    align === "left"
      ? "flex-start"
      : align === "center"
        ? "center"
        : "flex-end";
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: y - size * 0.6,
        width,
        display: "flex",
        justifyContent: justify,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
}

export function OgAccent(): ReactNode {
  return (
    <div style={{ display: "flex", width: 72, height: 6, background: LAVA }} />
  );
}

/** Paper background and the Databricks footer shared by every card. */
export function OgPage({ children }: { children: ReactNode }): ReactNode {
  return (
    <div
      style={{
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        display: "flex",
        flexDirection: "column",
        background: PAPER,
        color: INK,
        padding: `${PADDING_TOP}px 48px 0`,
        position: "relative",
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          left: 48,
          right: 48,
          bottom: 0,
          height: FOOTER_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1px solid ${GRID}`,
          fontSize: 18,
          color: MUTED,
        }}
      >
        <div style={{ display: "flex", color: LAVA, fontWeight: 700 }}>
          Databricks
        </div>
        <div style={{ display: "flex" }}>{SITE_LABEL}</div>
      </div>
    </div>
  );
}

export function OgFrame({
  title,
  updated,
  placeholder = false,
  children,
}: {
  title: string;
  updated: string;
  placeholder?: boolean;
  children: ReactNode;
}): ReactNode {
  return (
    <OgPage>
      <OgAccent />
      <div
        style={{
          display: "flex",
          marginTop: 20,
          fontSize: title.length > 50 ? 32 : 44,
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: -1.2,
        }}
      >
        {title}
      </div>
      <div
        style={{ display: "flex", marginTop: 10, fontSize: 20, color: MUTED }}
      >
        {`Databricks AI Index · Updated ${updated}${placeholder ? " · Placeholder data" : ""}`}
      </div>
      <div
        style={{
          display: "flex",
          position: "relative",
          width: CHART_WIDTH,
          height: CHART_HEIGHT,
          marginTop: 22,
        }}
      >
        {children}
      </div>
    </OgPage>
  );
}
