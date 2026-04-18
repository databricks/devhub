---
name: resource-image-generator
description: Generate on-brand 16:9 placeholder preview images for DevHub resources (recipes, cookbooks, examples) when a real app screenshot is not available. Use when you need to add, regenerate, or improve a resource's previewImageLightUrl / previewImageDarkUrl. Produces a light and a dark PNG at 1920x1080 that passes `npm run verify:images`, wires the images into `src/lib/recipes/recipes.ts`, and verifies them with agent-browser.
---

# Resource Image Generator

## Overview

This skill produces light/dark placeholder preview images that:

- Pass the DevHub image contract: 16:9 aspect, ≥ 1600×900 px, PNG/JPEG/WEBP (see `CONTRIBUTING.md`, section "Image Requirements").
- Use the Databricks brand palette (navy / cream / white / lava).
- Show a **low-fidelity skeleton of the kind of UI the resource produces** — no titles, no subtitles, no body copy, no glyphs — just the shape of the app (chat bubbles, a table, a dashboard, a code editor, a pipeline). A reader should glance at the image and think "oh, that's a chat app" without any words on the frame.
- Render deterministically via HTML → Playwright screenshot (no external AI image service, no brittle generation).

The output is always a pair of PNGs (`-light.png` + `-dark.png`) at 1920×1080, saved under:

- `static/img/guides/<id>-preview-{light,dark}.png` — for **recipes** and **cookbooks** (UI label: "Guide")
- `static/img/examples/<id>-preview-{light,dark}.png` — for **examples**

Pick the directory based on the resource's tier in `src/lib/recipes/recipes.ts` (`recipes`, `templates`, or `examples`).

**Generate one resource at a time.** When a new resource is added, run this skill for that one id — the full-bulk batch generator is intentionally not kept in the repo; images are a small, focused per-resource artifact.

## The One Big Rule: No Text

The only characters that may appear on the image are glyphs that are part of a real UI (a dot, a bar, a cursor caret). Everything else — titles, taglines, service names, badges with words — is forbidden. If you feel the image needs a word to be understood, the skeleton itself is not doing its job; iterate on the skeleton shape instead.

This keeps images:

- Consistent with the rest of DevHub (the resource name is already the card title; repeating it on the image is noise).
- Locale-neutral (no copy to translate or edit).
- Clean and modern (lo-fi app skeletons look like the UI mockups designers share in Figma, not like slide decks).

## When To Use

- A recipe, cookbook, or example has no `previewImageLightUrl` / `previewImageDarkUrl` set.
- An existing image looks generic or fails `npm run verify:images`.
- A new resource ships without real screenshots yet and you want better than the default `FallbackCardArt`.

Skip this skill when a real app screenshot is available — real screenshots always beat mockups.

## Workflow

### 1. Pick The Resource And Identify The UI It Produces

Read the resource metadata from `src/lib/recipes/recipes.ts`:

- `name`, `description`, `tags`, `services` — signal what UI the resource builds or acts on.
- `kind` — recipe / template / example.

Ask: "**If this ran to completion, what would the developer be looking at?**" That's the UI to sketch. See the mapping table below.

### 2. Compose The HTML

Create a temp HTML file (e.g. `/tmp/devhub-image/<id>-light.html`). Use the base template below and drop the appropriate skeleton into `.app-frame`.

Rules:

- **Canvas = one app window.** The whole 1920×1080 frame is the "app", with a subtle outer padding (margins) and rounded-corner surface so it reads as a mock, not a full-screen screenshot.
- **No text characters at all.** Use `<rect>`s, circles, and lines to stand in for labels, text, chips, and icons. If you find yourself reaching for `<text>`, stop and replace it with a bar.
- **Three surfaces max:** page background, app surface (card), accent (lava). Everything else is a skeleton bar (same fill as text color at low opacity).
- **One pop of lava.** A single highlighted row, a primary button, a single chart bar, or one badge pill. Avoid painting whole regions orange.
- **Clean, not busy.** Ample whitespace inside the frame. Rounded corners ≥ 10px for surfaces, 4–6px for skeleton bars. No heavy drop shadows, no borders except 1px at very low opacity for row dividers.
- **Identical layouts between light and dark.** The only difference between the two files is `data-theme` on `<html>`.

### 3. Render Both Themes

Generate the dark variant from the light one by flipping **only** the `<html>` tag's `data-theme`. Do **not** do a global find/replace — CSS selectors `[data-theme="light"] ...` / `[data-theme="dark"] ...` must stay intact.

```bash
sed 's/<html lang="en" data-theme="light">/<html lang="en" data-theme="dark">/' \
  /tmp/devhub-image/<id>-light.html > /tmp/devhub-image/<id>-dark.html

# recipes + cookbooks → static/img/guides/
# examples          → static/img/examples/
OUT_DIR=static/img/guides

node scripts/render-resource-image.mjs \
  --input /tmp/devhub-image/<id>-light.html \
  --output $OUT_DIR/<id>-preview-light.png

node scripts/render-resource-image.mjs \
  --input /tmp/devhub-image/<id>-dark.html \
  --output $OUT_DIR/<id>-preview-dark.png
```

### 4. Verify The Contract

```bash
npm run verify:images
```

Must pass. If it fails the error tells you the ratio / size mismatch — almost always a canvas-size typo in the HTML.

### 5. Wire The Image Into `recipes.ts`

Add the paths to the resource's entry in `src/lib/recipes/recipes.ts`. Use the URL prefix that matches the folder you saved to:

```ts
// recipes + cookbooks → /img/guides/
previewImageLightUrl: "/img/guides/<id>-preview-light.png",
previewImageDarkUrl:  "/img/guides/<id>-preview-dark.png",

// examples → /img/examples/
previewImageLightUrl: "/img/examples/<id>-preview-light.png",
previewImageDarkUrl:  "/img/examples/<id>-preview-dark.png",
```

For recipes, the preview fields live on the `recipes[n]` entry. For cookbooks, on the `templates[n]` `createTemplate({ ... })` call. For examples, on the `createExample({ ... })` call.

Do NOT set `galleryImages` from this skill — galleries are for real screenshots of a live app. Placeholders go in the single preview slot only.

### 6. Visually Verify With agent-browser

Make sure the dev server is running (`npm run dev` — set `EXAMPLES_FEATURE=true` in `.env.local` if the resource is an example).

```bash
# Resources list (card-sized view)
agent-browser open http://localhost:3000/resources
agent-browser eval "window.scrollTo(0, 300); 'done'"
agent-browser screenshot /tmp/devhub-audit/<id>-list.png

# Detail page (full-width view)
agent-browser open http://localhost:3000/resources/<id>
agent-browser screenshot /tmp/devhub-audit/<id>-detail-light.png

# Dark mode
agent-browser eval "document.documentElement.setAttribute('data-theme', 'dark'); 'done'"
agent-browser screenshot /tmp/devhub-audit/<id>-detail-dark.png
```

Read each screenshot and evaluate against the checklist below. If any answer is "no", iterate on the HTML and re-render.

### 7. Visual Checklist

- **Zero text.** No letters. No digits. No glyphs. Not even a favicon-ish "D".
- **Reads as a UI at a glance.** Chat looks like chat. A table looks like a table. A dashboard looks like cards + chart. Don't make the viewer guess.
- **Card-size legibility.** The card on `/resources` is ~380px wide. The dominant UI shape (bubbles, rows, sidebar) must still be recognizable at that size, not a mush of tiny rectangles.
- **On brand.** Surfaces navy/cream/white, single lava accent, muted bars use the text color at 18–65% opacity — not stray colors.
- **Light and dark pair matches.** Same composition, only surface colors differ.
- **Doesn't scream for attention.** The image must sit visually next to adjacent fallback-art cards without dominating or clashing.

If any check fails, tweak the HTML and re-render — don't "fix" by changing layout in CSS at runtime.

### 8. Commit

Once the pair passes both `npm run verify:images` and the visual checklist, commit:

- `static/img/examples/<id>-preview-light.png`
- `static/img/examples/<id>-preview-dark.png`
- The updated entry in `src/lib/recipes/recipes.ts`

## Brand Palette (Canonical)

Pulled from `src/css/custom.css`. Do not deviate.

| Token             | Hex       | Role                                                       |
| ----------------- | --------- | ---------------------------------------------------------- |
| `--db-navy`       | `#0b2026` | Dark page background, dark body text                       |
| `--db-navy-light` | `#1b3139` | Dark-mode card / app-surface                               |
| `--db-lava`       | `#ff3621` | Brand orange (primary accent in light mode)                |
| `--db-lava-light` | `#ff5542` | Brand orange (primary accent in dark mode)                 |
| `--db-oat-medium` | `#eeede9` | Cream accent (light-mode header/row highlight)             |
| `--db-bg`         | `#f9f7f4` | Light page bg                                              |
| `--db-card`       | `#ffffff` | Light-mode card / app-surface                              |
| Body fg (light)   | `#0b2026` | All skeleton bars use this at 18–65% opacity in light mode |
| Body fg (dark)    | `#f3eee7` | All skeleton bars use this at 22–70% opacity in dark mode  |

## Base HTML Template

Copy this into `/tmp/devhub-image/<id>-light.html` and replace `<!-- SKELETON -->` with one of the skeletons from the library below. The only value that changes between the `-light.html` and `-dark.html` variants is `data-theme` on `<html>`.

```html
<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <style>
      :root {
        --db-navy: #0b2026;
        --db-navy-light: #1b3139;
        --db-lava: #ff3621;
        --db-lava-light: #ff5542;
        --db-oat-medium: #eeede9;
        --db-bg: #f9f7f4;
        --db-card: #ffffff;
      }
      html,
      body {
        margin: 0;
        padding: 0;
        width: 1920px;
        height: 1080px;
        overflow: hidden;
        font-family:
          "DM Sans",
          ui-sans-serif,
          system-ui,
          -apple-system,
          "Segoe UI",
          Roboto,
          sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      [data-theme="light"] body {
        background: var(--db-bg);
      }
      [data-theme="dark"] body {
        background: var(--db-navy);
      }
      .stage {
        width: 1920px;
        height: 1080px;
        padding: 96px 128px;
        box-sizing: border-box;
      }
      .app-frame {
        width: 100%;
        height: 100%;
        border-radius: 28px;
        overflow: hidden;
        position: relative;
        background: var(--db-card);
        box-shadow: 0 24px 64px rgba(11, 32, 38, 0.1);
      }
      [data-theme="dark"] .app-frame {
        background: var(--db-navy-light);
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
      }
      /* Default skeleton color references */
      :root {
        --skeleton: rgba(11, 32, 38, 0.62);
        --skeleton-muted: rgba(11, 32, 38, 0.18);
        --skeleton-strong: rgba(11, 32, 38, 0.92);
        --surface-soft: var(--db-oat-medium);
        --divider: rgba(11, 32, 38, 0.08);
      }
      [data-theme="dark"] {
        --skeleton: rgba(243, 238, 231, 0.68);
        --skeleton-muted: rgba(243, 238, 231, 0.22);
        --skeleton-strong: rgba(243, 238, 231, 0.95);
        --surface-soft: rgba(243, 238, 231, 0.06);
        --divider: rgba(243, 238, 231, 0.08);
      }
    </style>
  </head>
  <body>
    <div class="stage">
      <div class="app-frame">
        <!-- SKELETON -->
      </div>
    </div>
  </body>
</html>
```

The base is deliberately small. All variation happens inside `.app-frame`.

## Skeleton Library

Pick the skeleton that matches the dominant UI the resource produces. If several fit, pick the one that matches the **primary outcome** (what you'd demo first), not the one that mentions the most services.

### Chat app (AI chat, streaming assistants, conversational apps)

Two-column layout: narrow sidebar with thread items, main pane with alternating bubbles, bottom input row. One orange outgoing bubble. No glyphs.

```html
<div style="display:grid; grid-template-columns: 240px 1fr; height:100%;">
  <!-- Sidebar -->
  <div
    style="background:var(--surface-soft); padding:32px 20px; border-right:1px solid var(--divider);"
  >
    <div
      style="width:96px; height:12px; border-radius:3px; background:var(--skeleton); opacity:.85; margin-bottom:24px;"
    ></div>
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div
        style="height:44px; border-radius:10px; background:var(--skeleton-muted);"
      ></div>
      <div
        style="height:44px; border-radius:10px; background:var(--skeleton-strong); opacity:.12;"
      ></div>
      <div
        style="height:44px; border-radius:10px; background:var(--skeleton-muted);"
      ></div>
      <div
        style="height:44px; border-radius:10px; background:var(--skeleton-muted);"
      ></div>
      <div
        style="height:44px; border-radius:10px; background:var(--skeleton-muted);"
      ></div>
    </div>
  </div>
  <!-- Main pane -->
  <div
    style="padding:36px 80px; display:flex; flex-direction:column; justify-content:space-between;"
  >
    <div style="display:flex; flex-direction:column; gap:28px;">
      <!-- incoming -->
      <div
        style="align-self:flex-start; max-width:56%; background:var(--surface-soft); padding:22px 26px; border-radius:22px 22px 22px 6px;"
      >
        <div
          style="width:100%; height:10px; border-radius:3px; background:var(--skeleton); opacity:.55; margin-bottom:10px;"
        ></div>
        <div
          style="width:82%;  height:10px; border-radius:3px; background:var(--skeleton); opacity:.42;"
        ></div>
      </div>
      <!-- outgoing (lava) -->
      <div
        style="align-self:flex-end; max-width:62%; background:var(--db-lava); padding:22px 26px; border-radius:22px 22px 6px 22px;"
      >
        <div
          style="width:100%; height:10px; border-radius:3px; background:#fff; opacity:.92; margin-bottom:10px;"
        ></div>
        <div
          style="width:88%;  height:10px; border-radius:3px; background:#fff; opacity:.78; margin-bottom:10px;"
        ></div>
        <div
          style="width:40%;  height:10px; border-radius:3px; background:#fff; opacity:.7;"
        ></div>
      </div>
      <!-- incoming streaming (dots) -->
      <div
        style="align-self:flex-start; max-width:50%; background:var(--surface-soft); padding:22px 26px; border-radius:22px 22px 22px 6px; display:flex; gap:10px;"
      >
        <div
          style="width:10px; height:10px; border-radius:50%; background:var(--skeleton); opacity:.65;"
        ></div>
        <div
          style="width:10px; height:10px; border-radius:50%; background:var(--skeleton); opacity:.45;"
        ></div>
        <div
          style="width:10px; height:10px; border-radius:50%; background:var(--skeleton); opacity:.28;"
        ></div>
      </div>
    </div>
    <!-- input row -->
    <div
      style="display:flex; gap:16px; align-items:center; padding-top:28px; border-top:1px solid var(--divider);"
    >
      <div
        style="flex:1; height:56px; border-radius:28px; background:var(--surface-soft);"
      ></div>
      <div
        style="width:56px; height:56px; border-radius:50%; background:var(--db-lava);"
      ></div>
    </div>
  </div>
</div>
```

### Table (Lakebase, CRUD apps, admin tools, anything database-backed)

Topbar + rounded table: header row in cream, then 7 data rows with subtle dividers. One row (typically row 2) gets an orange leading badge pill to signal the active / new record. No text.

```html
<div style="display:flex; flex-direction:column; height:100%;">
  <!-- Topbar -->
  <div
    style="height:84px; display:flex; align-items:center; padding:0 40px; gap:28px; border-bottom:1px solid var(--divider);"
  >
    <div
      style="width:28px; height:28px; border-radius:8px; background:var(--db-lava);"
    ></div>
    <div style="display:flex; gap:20px; flex:1;">
      <div
        style="width:64px; height:10px; border-radius:3px; background:var(--skeleton); opacity:.55;"
      ></div>
      <div
        style="width:64px; height:10px; border-radius:3px; background:var(--skeleton); opacity:.28;"
      ></div>
      <div
        style="width:64px; height:10px; border-radius:3px; background:var(--skeleton); opacity:.28;"
      ></div>
    </div>
    <div
      style="width:36px; height:36px; border-radius:50%; background:var(--surface-soft);"
    ></div>
  </div>
  <!-- Table -->
  <div style="flex:1; padding:40px 60px;">
    <div
      style="border-radius:16px; overflow:hidden; border:1px solid var(--divider);"
    >
      <!-- header -->
      <div
        style="display:grid; grid-template-columns:28px 1.4fr 1fr 0.8fr 0.8fr 0.6fr; gap:24px; padding:22px 28px; background:var(--surface-soft); align-items:center;"
      >
        <div></div>
        <div
          style="height:10px; border-radius:3px; background:var(--skeleton); opacity:.52;"
        ></div>
        <div
          style="height:10px; border-radius:3px; background:var(--skeleton); opacity:.52;"
        ></div>
        <div
          style="height:10px; border-radius:3px; background:var(--skeleton); opacity:.52;"
        ></div>
        <div
          style="height:10px; border-radius:3px; background:var(--skeleton); opacity:.52;"
        ></div>
        <div
          style="height:10px; border-radius:3px; background:var(--skeleton); opacity:.52;"
        ></div>
      </div>
      <!-- rows (7) — second row is the orange accent -->
      <div class="row"></div>
    </div>
  </div>
</div>
<style>
  .row {
    /* replaced inline — see below */
  }
</style>
```

Replace `<div class="row"></div>` with seven data rows. Each data row is this pattern, with one (the 2nd or 3rd) using the orange badge instead of a muted one:

```html
<div
  style="display:grid; grid-template-columns:28px 1.4fr 1fr 0.8fr 0.8fr 0.6fr; gap:24px; padding:22px 28px; align-items:center; border-top:1px solid var(--divider);"
>
  <div
    style="width:14px; height:14px; border-radius:4px; background:var(--skeleton-muted);"
  ></div>
  <div
    style="height:10px; border-radius:3px; background:var(--skeleton); opacity:.48;"
  ></div>
  <div
    style="height:10px; border-radius:3px; background:var(--skeleton); opacity:.38;"
  ></div>
  <div
    style="height:10px; border-radius:3px; background:var(--skeleton); opacity:.42;"
  ></div>
  <div
    style="height:10px; border-radius:3px; background:var(--skeleton); opacity:.42;"
  ></div>
  <div
    style="height:20px; border-radius:10px; background:var(--skeleton-muted); justify-self:start; width:52px;"
  ></div>
</div>
```

For the accent row, replace the last cell's `background` with `var(--db-lava)` and the leading checkbox with `background:var(--db-lava); opacity:1;`.

### Dashboard (analytics, Genie, stats + chart)

Topbar + narrow sidebar + content: a row of 4 KPI cards (each a miniature mock), then a full-width chart card with a bar chart. One KPI card and one chart bar carry the lava accent.

```html
<div style="display:grid; grid-template-columns:200px 1fr; height:100%;">
  <!-- Sidebar -->
  <div
    style="background:var(--surface-soft); padding:32px 20px; border-right:1px solid var(--divider); display:flex; flex-direction:column; gap:12px;"
  >
    <div
      style="width:32px; height:32px; border-radius:8px; background:var(--db-lava); margin-bottom:16px;"
    ></div>
    <div
      style="height:38px; border-radius:10px; background:var(--skeleton-strong); opacity:.14;"
    ></div>
    <div
      style="height:38px; border-radius:10px; background:var(--skeleton-muted);"
    ></div>
    <div
      style="height:38px; border-radius:10px; background:var(--skeleton-muted);"
    ></div>
    <div
      style="height:38px; border-radius:10px; background:var(--skeleton-muted);"
    ></div>
    <div
      style="height:38px; border-radius:10px; background:var(--skeleton-muted);"
    ></div>
  </div>
  <!-- Content -->
  <div
    style="padding:40px 60px; display:flex; flex-direction:column; gap:40px;"
  >
    <!-- KPI row -->
    <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:24px;">
      <!-- normal KPI card -->
      <div
        style="background:var(--surface-soft); border-radius:16px; padding:22px 26px;"
      >
        <div
          style="width:60%; height:10px; border-radius:3px; background:var(--skeleton); opacity:.5; margin-bottom:16px;"
        ></div>
        <div
          style="width:50%; height:20px; border-radius:5px; background:var(--skeleton); opacity:.78;"
        ></div>
      </div>
      <!-- accent KPI card -->
      <div
        style="background:var(--db-lava); border-radius:16px; padding:22px 26px;"
      >
        <div
          style="width:60%; height:10px; border-radius:3px; background:#fff; opacity:.85; margin-bottom:16px;"
        ></div>
        <div
          style="width:50%; height:20px; border-radius:5px; background:#fff; opacity:.95;"
        ></div>
      </div>
      <div
        style="background:var(--surface-soft); border-radius:16px; padding:22px 26px;"
      >
        <div
          style="width:60%; height:10px; border-radius:3px; background:var(--skeleton); opacity:.5; margin-bottom:16px;"
        ></div>
        <div
          style="width:50%; height:20px; border-radius:5px; background:var(--skeleton); opacity:.78;"
        ></div>
      </div>
      <div
        style="background:var(--surface-soft); border-radius:16px; padding:22px 26px;"
      >
        <div
          style="width:60%; height:10px; border-radius:3px; background:var(--skeleton); opacity:.5; margin-bottom:16px;"
        ></div>
        <div
          style="width:50%; height:20px; border-radius:5px; background:var(--skeleton); opacity:.78;"
        ></div>
      </div>
    </div>
    <!-- Chart card -->
    <div
      style="flex:1; background:var(--surface-soft); border-radius:16px; padding:32px 40px;"
    >
      <div
        style="display:flex; gap:20px; align-items:end; height:100%; padding-bottom:12px; border-bottom:1px solid var(--divider);"
      >
        <div
          style="flex:1; height:42%; border-radius:8px 8px 0 0; background:var(--skeleton); opacity:.45;"
        ></div>
        <div
          style="flex:1; height:62%; border-radius:8px 8px 0 0; background:var(--skeleton); opacity:.55;"
        ></div>
        <div
          style="flex:1; height:78%; border-radius:8px 8px 0 0; background:var(--db-lava);"
        ></div>
        <div
          style="flex:1; height:56%; border-radius:8px 8px 0 0; background:var(--skeleton); opacity:.48;"
        ></div>
        <div
          style="flex:1; height:34%; border-radius:8px 8px 0 0; background:var(--skeleton); opacity:.38;"
        ></div>
        <div
          style="flex:1; height:48%; border-radius:8px 8px 0 0; background:var(--skeleton); opacity:.42;"
        ></div>
        <div
          style="flex:1; height:70%; border-radius:8px 8px 0 0; background:var(--skeleton); opacity:.55;"
        ></div>
      </div>
    </div>
  </div>
</div>
```

### Code / CLI (bootstrap, setup recipes, local dev)

Centered mac-style window with traffic-light dots, a short terminal prompt line (just a single bar), three lines of "code" (rects), and a running cursor.

```html
<div
  style="height:100%; display:flex; align-items:center; justify-content:center;"
>
  <div
    style="width:66%; aspect-ratio: 16/10; background:var(--db-navy); border-radius:20px; padding:28px 36px; box-shadow:0 16px 40px rgba(0,0,0,.15);"
  >
    <div style="display:flex; gap:10px; margin-bottom:28px;">
      <div
        style="width:14px; height:14px; border-radius:50%; background:#ff5e57;"
      ></div>
      <div
        style="width:14px; height:14px; border-radius:50%; background:#ffbd2e;"
      ></div>
      <div
        style="width:14px; height:14px; border-radius:50%; background:#28c840;"
      ></div>
    </div>
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div style="display:flex; gap:14px; align-items:center;">
        <div
          style="width:18px; height:10px; background:var(--db-lava); border-radius:2px;"
        ></div>
        <div
          style="width:42%; height:10px; border-radius:3px; background:#fff; opacity:.85;"
        ></div>
      </div>
      <div
        style="width:72%; height:10px; border-radius:3px; background:#fff; opacity:.55;"
      ></div>
      <div
        style="width:58%; height:10px; border-radius:3px; background:#fff; opacity:.45;"
      ></div>
      <div style="display:flex; gap:14px; align-items:center;">
        <div
          style="width:18px; height:10px; background:var(--db-lava); border-radius:2px;"
        ></div>
        <div
          style="width:16px; height:18px; background:#fff; opacity:.85;"
        ></div>
      </div>
    </div>
  </div>
</div>
```

### Pipeline (Lakeflow, CDC, medallion, ETL)

Horizontal flow of three stages connected by arrows. The final stage (gold / serving) is the lava accent. Each stage is a tall rounded card with skeleton bars inside so it looks like a table / pipeline stage summary.

```html
<div
  style="height:100%; display:flex; align-items:center; justify-content:center; gap:48px; padding:0 120px;"
>
  <!-- Stage 1 -->
  <div
    style="flex:1; aspect-ratio: 3/4; background:var(--surface-soft); border-radius:18px; padding:28px 24px; display:flex; flex-direction:column; gap:10px;"
  >
    <div
      style="width:40%; height:10px; border-radius:3px; background:var(--skeleton); opacity:.55; margin-bottom:8px;"
    ></div>
    <div
      style="height:8px; border-radius:2px; background:var(--skeleton); opacity:.32;"
    ></div>
    <div
      style="height:8px; border-radius:2px; background:var(--skeleton); opacity:.32;"
    ></div>
    <div
      style="height:8px; border-radius:2px; background:var(--skeleton); opacity:.32;"
    ></div>
    <div
      style="height:8px; border-radius:2px; background:var(--skeleton); opacity:.32;"
    ></div>
  </div>
  <!-- Arrow -->
  <div
    style="width:72px; height:4px; background:var(--skeleton); opacity:.4;"
  ></div>
  <!-- Stage 2 -->
  <div
    style="flex:1; aspect-ratio: 3/4; background:var(--surface-soft); border-radius:18px; padding:28px 24px; display:flex; flex-direction:column; gap:10px;"
  >
    <div
      style="width:40%; height:10px; border-radius:3px; background:var(--skeleton); opacity:.55; margin-bottom:8px;"
    ></div>
    <div
      style="height:8px; border-radius:2px; background:var(--skeleton); opacity:.32;"
    ></div>
    <div
      style="height:8px; border-radius:2px; background:var(--skeleton); opacity:.32;"
    ></div>
    <div
      style="height:8px; border-radius:2px; background:var(--skeleton); opacity:.32;"
    ></div>
  </div>
  <!-- Arrow -->
  <div
    style="width:72px; height:4px; background:var(--skeleton); opacity:.4;"
  ></div>
  <!-- Stage 3 (accent) -->
  <div
    style="flex:1; aspect-ratio: 3/4; background:var(--db-lava); border-radius:18px; padding:28px 24px; display:flex; flex-direction:column; gap:10px;"
  >
    <div
      style="width:40%; height:10px; border-radius:3px; background:#fff; opacity:.85; margin-bottom:8px;"
    ></div>
    <div
      style="height:8px; border-radius:2px; background:#fff; opacity:.55;"
    ></div>
    <div
      style="height:8px; border-radius:2px; background:#fff; opacity:.55;"
    ></div>
    <div
      style="height:8px; border-radius:2px; background:#fff; opacity:.55;"
    ></div>
  </div>
</div>
```

### Minimal (Hello World, starter templates, empty-state)

A nearly-empty app surface with a single small centered card, centered in the app frame. Convey "this is a blank canvas to start from".

```html
<div
  style="height:100%; display:flex; align-items:center; justify-content:center;"
>
  <div
    style="width:360px; height:200px; background:var(--surface-soft); border-radius:16px; padding:28px; display:flex; flex-direction:column; gap:14px; justify-content:center; align-items:flex-start;"
  >
    <div
      style="width:140px; height:10px; border-radius:3px; background:var(--skeleton); opacity:.6;"
    ></div>
    <div
      style="width:220px; height:8px; border-radius:2px; background:var(--skeleton); opacity:.35;"
    ></div>
    <div
      style="width:180px; height:8px; border-radius:2px; background:var(--skeleton); opacity:.35;"
    ></div>
    <div
      style="width:92px; height:34px; border-radius:10px; background:var(--db-lava); margin-top:12px;"
    ></div>
  </div>
</div>
```

## Picking A Skeleton

| Resource signal                                                   | Skeleton   |
| ----------------------------------------------------------------- | ---------- |
| Tags / services mention Chat, AI SDK, Agent, Streaming, Assistant | Chat       |
| Tags mention Lakebase, Postgres, Persistence, CRUD, admin tool    | Table      |
| Tags mention Genie, Analytics, AI/BI, Dashboard, KPIs, SaaS       | Dashboard  |
| Recipe is about CLI setup, bootstrap, scaffolding, local env      | Code / CLI |
| Tags mention Pipelines, CDC, Medallion, Sync, Lakeflow            | Pipeline   |
| Hello-world / starter / empty-state / "first app"                 | Minimal    |

When multiple fit, pick the one that matches the **primary outcome** (what the developer would see and demo first), not the one that mentions the most services.

## Failure Modes And Fixes

- **Verifier fails with "wrong aspect ratio":** the `<html>`/`<body>` isn't locked to 1920×1080. Ensure the CSS at the top of the base template is unmodified.
- **Image has text on it:** go back to step 2. Delete the `<text>` or any copy-ish element and replace with a bar.
- **Image is a blob at card size:** too many tiny rects too close together. Reduce row count, increase gaps, keep one dominant shape.
- **Light and dark look different:** you did a global `sed` on `data-theme`. Use the scoped `sed` command in step 3 so CSS selectors stay intact.
- **Dark mode looks like "dimmed light":** the skeleton color references (`--skeleton`, `--skeleton-muted`, ...) weren't left on the root — they must switch per theme via `[data-theme="dark"] { ... }`, which the base template already does.

## References

- DevHub image contract: `CONTRIBUTING.md`, section "Image Requirements"
- Verifier: `scripts/verify-example-images.mjs` (pre-commit)
- Renderer: `scripts/render-resource-image.mjs`
- Brand palette source: `src/css/custom.css`
