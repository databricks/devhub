# Contributing to DevHub

DevHub is [dev.databricks.com](https://dev.databricks.com) — the home for developers building data and AI applications on Databricks. Contributions that make the site clearer, more accurate, or more useful for coding agents are very welcome.

Keep changes small, clear, and easy to review.

## Before You Start

- Read [`AGENTS.md`](./AGENTS.md) (aliased as `CLAUDE.md`) for project conventions, coding guidelines, and the agent workflow.
- The repository is npm-only. Do not use bun, yarn, or pnpm.
- Node.js 20 or later is required.

## Local Development

### Install And Run

```bash
npm install
npm run dev
```

`npm run dev` starts Docusaurus and the Vercel Functions together at [http://localhost:3000](http://localhost:3000). The site reloads on save.

AppKit reference docs are fetched automatically on first build or dev start via a shallow git clone of the [appkit](https://github.com/databricks/appkit) repository. Run `npm run sync:appkit-docs` to force a re-sync.

You'll also need the [Vercel CLI](https://vercel.com/docs/cli) (for `vercel dev`) and the [Databricks CLI](https://dev.databricks.com/docs/tools/databricks-cli) if you plan to verify end-to-end flows against a real workspace.

### Feature Flags

Some features (examples, draft content) are gated behind env vars so we can ship content progressively. To enable them locally, create `.env.local` in the repo root:

```ini
# .env.local — gitignored, local-only overrides
EXAMPLES_FEATURE=true
SHOW_DRAFTS=true
```

`scripts/dev.sh` sources `.env.local` before launching `vercel dev`, so both Docusaurus and the Functions runtime see the values. Restart the dev server after editing the file.

A flag is **enabled only when its value is exactly `"true"`** — any other value (empty, `"1"`, `"yes"`) is treated as disabled.

### Site URL Resolution

Anywhere we need an absolute URL — `llms.txt`, `sitemap.xml`, `robots.txt`, JSON-LD, `/api/markdown`, `/api/bootstrap-prompt`, `/api/mcp`, the `Copy prompt` / `Copy Markdown` buttons — we resolve the site origin in this order (see `src/lib/site-url.ts`):

1. `SITE_URL` (explicit override, e.g. `https://example.com` — useful for one-off builds and tests)
2. `VERCEL_PROJECT_PRODUCTION_URL` when `VERCEL_ENV=production` (auto-set by Vercel; becomes `dev.databricks.com` once the custom domain is attached, otherwise the project's `*.vercel.app` URL)
3. `VERCEL_URL` (per-deployment URL, used on preview / branch / `vercel dev` deployments)
4. `https://dev.databricks.com` as a final, safe production fallback

So locally it points to `http://localhost:3000`, on preview deployments to the deployment's `*.vercel.app` URL, and in production to whatever production URL Vercel has assigned. No env var setup is required on Vercel.

### Common Scripts

| Command                    | What it does                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `npm run dev`              | Docusaurus + Vercel Functions dev server on port 3000                                                         |
| `npm run fmt`              | Format the whole repo with Prettier                                                                           |
| `npm run typecheck`        | Regenerate generated files and run `tsc` strictly                                                             |
| `npm run verify:images`    | Check every image under `static/img/guides/` and `static/img/examples/` matches the 16:9 / ≥1600×900 contract |
| `npm run build`            | Production build via Docusaurus                                                                               |
| `npm run test`             | Build + Vitest + Playwright smoke tests (includes sitemap, robots, llms.txt)                                  |
| `npm run sync:appkit-docs` | Force re-sync AppKit docs from main (auto-synced on first build)                                              |

### Pre-Commit Hook

Husky runs the following on every commit (fails fast, exits first failure):

1. `prettier -c .` — formatting check
2. `npm run typecheck`
3. `npm run verify:images`
4. `npm run build`

If any step fails, the commit is aborted. Fix the issue and commit again.

## Authoring Content

DevHub has three tiers of content, all rendered at `/templates/<id>`:

| Tier         | Purpose                                                           | Source                                                                            |
| ------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Recipe**   | One atomic outcome (e.g. "Create a Lakebase instance")            | `content/recipes/<id>.md` + metadata in `src/lib/recipes/recipes.ts`              |
| **Cookbook** | End-to-end use case composed from multiple recipes (aka Template) | Metadata in `src/lib/recipes/recipes.ts` + page in `src/pages/templates/<id>.tsx` |
| **Example**  | Full runnable app with code, pipelines, deploy                    | `content/examples/<id>.md` + `examples/<id>/template/` + metadata                 |

In the UI, cookbooks and recipes are both labelled "Guides"; examples are labelled "Examples". Slugs must be globally unique across the three — the content-entries plugin validates this at build time.

### Quick Start

1. Decide whether your change is a recipe, a cookbook, or an example.
2. Follow the detailed walkthrough in the agent skill: [`.agents/skills/author-recipes-and-cookbooks/SKILL.md`](./.agents/skills/author-recipes-and-cookbooks/SKILL.md). It has the full contract — file layout, required fields, `createExample()` wiring, validation checklist, and a dry-run recipe for examples.
3. Run `npm run fmt && npm run typecheck && npm run build && npm run test` before opening a PR.

The agent skill is the source of truth. This section gives humans enough context to orient; the skill stays exhaustive so both humans and coding agents can follow it end to end.

### Writing Style

- Imperative voice ("Run", "Create", "Set"), short paragraphs, explicit headings.
- Optimize for copy-paste reliability first, readability second.
- One outcome per recipe. Split into multiple recipes rather than letting one grow.
- Explain _why_ only when it prevents a mistake.
- Keep example markdown focused on what's unique to the example (data flow, architecture, adaptation points); let the included cookbooks cover how-to detail.

## Image Requirements

Every example, cookbook, and recipe can optionally ship a preview image and (for examples) a multi-slide gallery. Images are **optional** — when omitted the UI falls back to a generic rotating card art that matches the guide cards, and the site stays visually clean.

When you do add an image, it must conform to the DevHub resource-image contract. The pre-commit hook runs `npm run verify:images` and will reject any non-conforming file with a file-level explanation.

### The Contract (Enforced)

| Rule               | Value                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Aspect ratio       | **16:9** (tolerance ±2%)                                                                                                            |
| Minimum resolution | **1600×900 px** (recommended: 1920×1080)                                                                                            |
| Formats            | **PNG, JPEG, or WEBP**. SVG is not accepted for preview slots.                                                                      |
| Location           | `static/img/guides/<id>-<slot>-<theme>.<ext>` for recipes + cookbooks, `static/img/examples/<id>-<slot>-<theme>.<ext>` for examples |
| Naming             | Light and dark variants live side by side, e.g. `saas-tracker-dashboard-light.png` and `saas-tracker-dashboard-dark.png`            |

SVG is intentionally rejected for preview images — the site expects real screenshots. Abstract vector illustrations belong in inline components, not in this slot.

Run the verifier at any time:

```bash
npm run verify:images
```

### Add Screenshots For Both Light And Dark

Every example app should ship **both a light-mode and a dark-mode screenshot** for every slot. The site picks the matching variant automatically based on the visitor's color mode, and visitors who land in dark mode should see a dark UI — not a bright light-mode screenshot flashed onto a dark card.

Practical rules:

- Always provide both `*-light.png` and `*-dark.png`. If only one variant is set the site reuses it for both modes, which looks jarring.
- When you capture a new screenshot, capture the same screen twice — once with your app in light mode and once in dark mode — at the same viewport and zoom so the two frames align perfectly in the carousel.
- Dark mode should use a dark neutral background (typically `--db-navy` or `--db-navy-light`), not a pure-black CSS default. This keeps the screenshots on-brand and visually consistent with the rest of DevHub.

### Use The Databricks Brand Palette In Screenshots

We want example apps to feel like Databricks apps, not generic demos. Style the app you're screenshotting with the Databricks palette before capturing frames. The site's own theme tokens live in [`src/css/custom.css`](./src/css/custom.css); reuse these hex values in the example app's own stylesheet / Tailwind config:

| Token             | Hex       | Role in screenshots                                                 |
| ----------------- | --------- | ------------------------------------------------------------------- |
| `--db-navy`       | `#0b2026` | Primary dark surface (dark-mode page background, sidebars, headers) |
| `--db-navy-light` | `#1b3139` | Secondary dark surface (dark-mode cards, raised panels)             |
| `--db-lava`       | `#ff3621` | Primary brand orange (buttons, highlights, focus states, badges)    |
| `--db-lava-dark`  | `#eb1600` | Hover / pressed state for the primary orange                        |
| `--db-lava-light` | `#ff5542` | Primary orange in dark mode (keeps contrast against navy)           |
| `--db-oat-medium` | `#eeede9` | Cream accent (secondary buttons, muted rows, light chips)           |
| `--db-bg`         | `#f9f7f4` | Light-mode page background (soft off-white)                         |
| `--db-card`       | `#ffffff` | Light-mode cards / raised surfaces                                  |

Guidance:

- **Light screenshots** lean on `--db-bg` + `--db-card` (cream + white) surfaces with navy text and orange accents.
- **Dark screenshots** lean on `--db-navy` + `--db-navy-light` surfaces with `--db-lava-light` accents and near-white text.
- Use orange (`--db-lava` / `--db-lava-light`) sparingly — primary CTAs, active / selected state, single accents. Avoid saturating whole regions.
- The AppKit defaults already wire these tokens into Tailwind; look at an existing example's client tailwind config as the starting point so screenshots are on-brand by default.

### Where Images Show Up

| Slot                                          | Property(-ies)                                 | Notes                                              |
| --------------------------------------------- | ---------------------------------------------- | -------------------------------------------------- |
| Landing carousel card, `/templates` list card | `previewImageLightUrl` / `previewImageDarkUrl` | Same contract for recipes, cookbooks, examples.    |
| Example detail hero (single image)            | `previewImageLightUrl` / `previewImageDarkUrl` | Used when `galleryImages` is not set.              |
| Example detail carousel (multiple images)     | `galleryImages: Array<{ lightUrl, darkUrl }>`  | Each slide must include both a light and dark URL. |

All four fields are optional. If either URL in a preview pair is set, include the matching variant for the other theme too; the site renders the matching variant based on the visitor's color mode with no manual toggle.

### Adding An Image

Pick the folder based on the resource tier:

- **Recipes and cookbooks** (UI label "Guide") → `static/img/guides/`
- **Examples** → `static/img/examples/`

Example for an example:

1. Drop the files into `static/img/examples/`:

   ```
   static/img/examples/inventory-intelligence-dashboard-light.png   # 1920x1080 PNG
   static/img/examples/inventory-intelligence-dashboard-dark.png    # 1920x1080 PNG
   ```

2. Reference them in the `createExample()` entry inside `src/lib/recipes/recipes.ts`:

   ```ts
   createExample({
     id: "inventory-intelligence",
     // ...
     previewImageLightUrl:
       "/img/examples/inventory-intelligence-dashboard-light.png",
     previewImageDarkUrl:
       "/img/examples/inventory-intelligence-dashboard-dark.png",
     // optional carousel:
     galleryImages: [
       {
         lightUrl: "/img/examples/inventory-intelligence-dashboard-light.png",
         darkUrl: "/img/examples/inventory-intelligence-dashboard-dark.png",
       },
       {
         lightUrl:
           "/img/examples/inventory-intelligence-replenishment-light.png",
         darkUrl: "/img/examples/inventory-intelligence-replenishment-dark.png",
       },
     ],
   });
   ```

For a recipe or cookbook, files go under `/img/guides/` and the fields live on the corresponding `recipes[n]` or `createTemplate({ ... })` entry.

3. Run `npm run verify:images` locally. The pre-commit hook will catch any regression.

If something fails verification, the error message tells you the file, the actual vs expected ratio, and the exact fix (usually "re-export at 1600×900 or any exact 16:9 size").

### Generating Placeholder Images

If a real screenshot isn't available, use the [`resource-image-generator`](./.agents/skills/resource-image-generator/SKILL.md) skill to produce a clean lo-fi skeleton. Generate **one resource at a time** when you add a new guide or example — there's no bulk batch generator maintained in the repo.

## Pull Requests

- Keep docs accurate and concise; ship small, focused PRs.
- Include a short description of what changed and why.
- Ensure formatting, typecheck, image verification, build, and tests pass before opening a PR.
- If your change touches authoring contracts (schema, skills, required fields), call it out explicitly in the PR description.
