import type { CSSProperties, ReactNode } from "react";

export const OG_SIZE = { width: 1200, height: 630 };
export const CHART_WIDTH = 1104;
export const CHART_HEIGHT = 384;
/** Room a chart leaves under its plot for an `OgLegend` row. */
export const OG_LEGEND_HEIGHT = 40;

// Mirrors the page palette in src/css/custom.css (--db-navy, --db-paper,
// --db-lava); image rendering can't read Tailwind tokens.
export const INK = "#0b2026";
export const MUTED = "#5b6a70";
export const GRID = "#e4e2dd";
export const PAPER = "#f9f7f4";
export const LAVA = "#ff3621";

const SITE_LABEL = "developers.databricks.com/ai-index";
const FOOTER_HEIGHT = 58;
// The logo file's own proportions (viewBox 712.77 x 112.97).
const LOGO_HEIGHT = 22;
const LOGO_WIDTH = Math.round((LOGO_HEIGHT * 712.77) / 112.97);

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

export type OgLegendData = {
  /** Names what the series are, when the chart title doesn't. */
  heading?: string;
  items: { label: string; value: string; color: string }[];
};

/** The page's chart legend: a row of series, each with its latest value. */
export function OgLegend({ heading, items }: OgLegendData): ReactNode {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        height: OG_LEGEND_HEIGHT,
        fontSize: 17,
        lineHeight: 1,
        color: INK,
      }}
    >
      {heading ? (
        <div
          style={{
            display: "flex",
            marginRight: 20,
            fontSize: 14,
            letterSpacing: 0.8,
            color: MUTED,
          }}
        >
          {`${heading.toUpperCase()}:`}
        </div>
      ) : null}
      {items.map(({ label, value, color }) => (
        <div
          key={label}
          style={{ display: "flex", alignItems: "center", marginRight: 30 }}
        >
          <div
            style={{
              display: "flex",
              width: 12,
              height: 12,
              marginRight: 8,
              background: color,
            }}
          />
          {label}
          <div style={{ display: "flex", marginLeft: 8, color: MUTED }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Paper background and the Databricks footer shared by every card. `logo` is
 * the Databricks logo as an image source (see `loadBrandLogo`).
 */
export function OgPage({
  logo,
  children,
}: {
  logo: string;
  children: ReactNode;
}): ReactNode {
  return (
    <div
      style={{
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        display: "flex",
        flexDirection: "column",
        background: PAPER,
        color: INK,
        padding: "44px 48px 0",
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
        <img src={logo} alt="" width={LOGO_WIDTH} height={LOGO_HEIGHT} />
        <div style={{ display: "flex" }}>{SITE_LABEL}</div>
      </div>
    </div>
  );
}

export function OgFrame({
  title,
  updated,
  logo,
  placeholder = false,
  children,
}: {
  title: string;
  updated: string;
  logo: string;
  placeholder?: boolean;
  children: ReactNode;
}): ReactNode {
  return (
    <OgPage logo={logo}>
      <div
        style={{
          display: "flex",
          fontSize: title.length > 50 ? 38 : 44,
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
          marginTop: 24,
        }}
      >
        {children}
      </div>
    </OgPage>
  );
}
