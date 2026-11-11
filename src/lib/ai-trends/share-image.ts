const PAPER = "#f9f7f4";
const INK = "#0b2026";
const MUTED = "#5b6a70";
const SITE_LABEL = "developers.databricks.com/ai-index";

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * PNG of a live chart canvas under a title, for views the server-rendered
 * share cards can't show (a filtered scatter). Chart.js sizes the canvas
 * backing store by devicePixelRatio, so every other dimension is scaled to
 * match it.
 */
export function renderCanvasImage(
  canvas: HTMLCanvasElement,
  title: string,
): Promise<Blob> {
  const scale = canvas.width / canvas.getBoundingClientRect().width;
  const pad = 24 * scale;
  const titleSize = 20 * scale;
  const titleLineHeight = 26 * scale;
  const metaSize = 13 * scale;
  const footerHeight = 40 * scale;
  const titleFont = `600 ${titleSize}px ${getComputedStyle(document.body).fontFamily}`;
  const metaFont = `${metaSize}px ${getComputedStyle(document.body).fontFamily}`;

  const out = document.createElement("canvas");
  const ctx = out.getContext("2d");
  if (!ctx) return Promise.reject(new Error("No 2D canvas context"));
  ctx.font = titleFont;
  const titleLines = wrapLines(ctx, title, canvas.width);
  const metaTop = pad + titleLines.length * titleLineHeight + 4 * scale;
  const chartTop = metaTop + metaSize + 20 * scale;

  // Resizing a canvas resets its context state, so fonts are set after this.
  out.width = canvas.width + pad * 2;
  out.height = chartTop + canvas.height + pad + footerHeight;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.textBaseline = "top";
  ctx.fillStyle = INK;
  ctx.font = titleFont;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, pad, pad + i * titleLineHeight);
  });
  ctx.fillStyle = MUTED;
  ctx.font = metaFont;
  ctx.fillText("Databricks AI Index", pad, metaTop);

  // The chart draws white discs behind its logos, so it sits on white as on the page.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(pad, chartTop, canvas.width, canvas.height);
  ctx.drawImage(canvas, pad, chartTop);

  ctx.textBaseline = "middle";
  ctx.fillStyle = MUTED;
  ctx.fillText(SITE_LABEL, pad, out.height - footerHeight / 2);

  return new Promise((resolve, reject) => {
    out.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG encoding failed"));
    }, "image/png");
  });
}
