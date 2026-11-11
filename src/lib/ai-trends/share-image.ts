"use client";

import { Chart } from "chart.js";

import { CHART_GRID } from "./chart-setup";

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  for (const word of words) {
    const testLine = line ? line + " " + word : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      currentY += lineHeight;
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, currentY);
}

function renderChartImage(chartIds: string[], title: string): Promise<Blob> {
  const canvases = chartIds
    .map((id) => {
      const chart = Chart.getChart(id);
      if (chart) return chart.canvas;
      return document.getElementById(id) as HTMLCanvasElement | null;
    })
    .filter((c): c is HTMLCanvasElement => c !== null);

  if (canvases.length === 0) return Promise.reject(new Error("No chart"));

  const PAD = 24;
  const TITLE_H = 54;
  const FOOTER_H = 72;
  const GAP = 8;
  const siteFont = getComputedStyle(document.body).fontFamily;

  const srcW = canvases[0].width;
  const chartTotalH = canvases.reduce((sum, c) => sum + c.height, 0);
  const gapH = canvases.length > 1 ? GAP * (canvases.length - 1) : 0;
  const W = srcW + PAD * 2;
  const H = TITLE_H + chartTotalH + gapH + FOOTER_H;

  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  const ctx = out.getContext("2d");
  if (!ctx) return Promise.reject(new Error("No canvas context"));

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#0C0C0C";
  ctx.font = `600 20px ${siteFont}`;
  ctx.textBaseline = "top";
  ctx.fillText(title, PAD, 16);

  ctx.strokeStyle = CHART_GRID;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, 46);
  ctx.lineTo(W - PAD, 46);
  ctx.stroke();

  let y = TITLE_H;
  canvases.forEach((src, i) => {
    if (i > 0) y += GAP;
    ctx.drawImage(src, PAD, y, srcW, src.height);
    y += src.height;
  });

  ctx.fillStyle = "#6B6B6B";
  ctx.font = `14px ${siteFont}`;
  ctx.textBaseline = "top";
  wrapText(ctx, title, PAD, y + 12, srcW, 19);

  ctx.fillStyle = "#ABABAB";
  ctx.font = `11px ${siteFont}`;
  ctx.textBaseline = "bottom";
  const footerText = location.host + location.pathname;
  ctx.fillText(footerText, PAD, H - 10);

  return new Promise((resolve, reject) => {
    out.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Image encoding failed"));
    }, "image/png");
  });
}

export async function copyChartImage(
  chartIds: string[],
  title: string,
): Promise<void> {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    throw new Error("Clipboard image write unsupported");
  }
  const item = new ClipboardItem({
    "image/png": renderChartImage(chartIds, title),
  });
  await navigator.clipboard.write([item]);
}
