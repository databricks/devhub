# Contributing to DevHub

DevHub is [developers.databricks.com](https://developers.databricks.com) — the home for developers building data and AI applications on Databricks. Contributions that make the site clearer, more accurate, or more useful for coding agents are very welcome.

Keep changes small, clear, and easy to review.

## Before You Start

- Read [`AGENTS.md`](./AGENTS.md) (aliased as `CLAUDE.md`) for project conventions, coding guidelines, and the agent workflow.
- The repository is pnpm-only. Do not use npm, yarn, bun, or npx.
- Node.js 20 or later is required.

## Local Development

### Install And Run

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts the Next.js development server at [http://localhost:3000](http://localhost:3000). The site reloads on save.

AppKit reference docs are fetched automatically on first build or dev start via a shallow git clone of the [appkit](https://github.com/databricks/appkit) repository. Run `pnpm sync:appkit-docs` to force a re-sync.

You'll also need the [Vercel CLI](https://vercel.com/docs/cli) (for `vercel dev`) and the [Databricks CLI](https://developers.databricks.com/docs/tools/databricks-cli) if you plan to verify end-to-end flows against a real workspace.

### Feature Flags

Draft content is gated behind an env var so we can ship content progressively. To enable it locally, create `.env.local` in the repo root:

```ini
# .env.local — gitignored, local-only overrides
SHOW_DRAFTS=true
```

Next.js loads `.env.local` automatically. Restart the dev server after editing the file.

A flag is **enabled only when its value is exactly `"true"`** — any other value (empty, `"1"`, `"yes"`) is treated as disabled.

### Site Announcement Banner

The reusable site-wide announcement bar is driven by env vars, resolved by [`src/lib/site-banner-server.ts`](./src/lib/site-banner-server.ts), and rendered by [`SiteBanner`](./src/components/site-banner/site-banner.tsx) in the website layout (above the hackathon banner; not on Perspectives). It is **non-dismissible**.

| Env var                 | Purpose                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| `SITE_BANNER_ENABLED`   | Exact `"true"` shows the banner. Any other value (including unset) hides it.  |
| `SITE_BANNER_TEXT`      | Lead-in copy, injected as raw HTML (keep it trusted). **Required** to render. |
| `SITE_BANNER_LINK`      | CTA href (`/` path or `http(s):` URL). **Required**.                          |
| `SITE_BANNER_LINK_TEXT` | CTA label (e.g. `Learn more`). **Required**. No default.                      |

The banner is resolved at build time and ships in the initial HTML, so it never shifts layout after hydration. There is no date window: starting and ending a campaign is a redeploy, which is the tradeoff for avoiding that shift.

Example (Data + AI World Tour):

```bash
SITE_BANNER_ENABLED=true
SITE_BANNER_TEXT="Vibe code (safely) at work! Enable anyone to build and deploy AI apps that are fully-connected to enterprise data at"
SITE_BANNER_LINK="https://www.databricks.com/dataaisummit/worldtour"
SITE_BANNER_LINK_TEXT="Data + AI World Tour"
```

### Hackathon Banner & Events

Each hackathon event is its own page at `/hackathon/<slug>`, served by a Next App Router wrapper under `src/app/(website)/hackathon/<slug>/page.tsx`. Reusable legacy event bodies live under [`src/legacy-pages/hackathon/`](./src/legacy-pages/hackathon/) (for example [`apps-agents-for-good-2026.tsx`](./src/legacy-pages/hackathon/apps-agents-for-good-2026.tsx)). Events are fully independent — editing one never touches another. An event can reuse the shared [`HackathonEventPage`](./src/components/hackathon/hackathon-event-page.tsx) template by passing a typed `HackathonEvent` object, or render a completely bespoke layout instead. Event pages are `noindex` and kept out of `sitemap.xml`; entry is via the banner.

`/hackathon` ([`src/app/(website)/hackathon/page.tsx`](<./src/app/(website)/hackathon/page.tsx>)) redirects to the active event.

The hackathon announcement bar is driven by env vars at build time, resolved by [`src/lib/hackathon-banner-server.ts`](./src/lib/hackathon-banner-server.ts), and rendered by [`HackathonBanner`](./src/components/hackathon/hackathon-banner.tsx) in the website layout. It shows above the navbar across website routes and is intentionally **non-dismissible** so it stays the only on-site entry point to the event for the full window. When both the site banner and hackathon banner are active, they stack (site banner on top).

| Env var                    | Purpose                                                                                                                                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HACKATHON_BANNER_ENABLED` | Banner on **only when the value is exactly `"true"`** — any other value (including unset) is off. Same convention as `SHOW_DRAFTS`.                                                                                                                     |
| `HACKATHON_EVENT_SLUG`     | Slug of the active event. The banner links to `/hackathon/<slug>` and `/hackathon` redirects there. With no slug the banner links to `/hackathon` (which then shows the placeholder).                                                                   |
| `HACKATHON_BANNER_TEXT`    | Optional override for the **lead-in text only** (HTML allowed). The "See resources" link is always appended, so a misconfigured override can never strand visitors on a banner with no way in. Defaults to `"Databricks Developer Hackathon is live."`. |

Flipping the banner on Vercel is "edit env var → redeploy", the same model as `SHOW_DRAFTS`. The banner `id` is namespaced per slug automatically (`hackathon-<slug>`), so prior dismissals reset cleanly between events.

To stand up a new event: copy an existing file in `src/legacy-pages/hackathon/` to a new slug, add an App Router wrapper in `src/app/(website)/hackathon/<new-slug>/page.tsx`, edit its data (or write a custom layout), then set `HACKATHON_EVENT_SLUG=<new-slug>` and `HACKATHON_BANNER_ENABLED=true` on Vercel.

### Cookie consent & analytics (OneTrust + GTM + Rudderstack)

[`ConsentTags`](./src/components/consent-tags.tsx) renders the OneTrust consent banner, the Google Tag Manager container, and Rudderstack at the top of `<body>`, gated by [`resolveOneTrustEnv`](./src/lib/onetrust.ts): production deploys get the production OneTrust variant, previews get the test variant (works on any domain), and local dev gets none. Set `ONETRUST_ENV=test pnpm dev` to see the banner locally. Tag order is load-bearing — the OneTrust AutoBlocker must run before GTM so non-consented cookies are gated — so the tags render as plain blocking scripts, not `next/script` (React hoists only the banner stylesheet `<link>` into `<head>`; the scripts keep their `<body>` source order). The "Your Privacy Choices" footer link ([`YourPrivacyChoicesLink`](./src/components/your-privacy-choices-link.tsx)) opens the OneTrust preference center and must remain in both footers (main and perspectives).

Rudderstack is resolved separately by [`resolveRudderstackKey`](./src/lib/onetrust.ts) and is **production-only by default**, because every preview deployment would otherwise send events into the same Rudderstack source as production — polluting the campaign attribution the integration exists to measure, and running up a bill that is charged per API call even from staging. It also returns `null` whenever OneTrust is off, so Rudderstack can never load unconsented.

| Env var                 | Purpose                                                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RUDDERSTACK_WRITE_KEY` | The write key for the `developers.databricks.com` Rudderstack source. Set on Vercel at **Production scope only**; put it in gitignored `.env.local` for local runs.                   |
| `RUDDERSTACK_ENABLED`   | Opts a non-production deploy in — **only when the value is exactly `"true"`**, same convention as `HACKATHON_BANNER_ENABLED` and `SHOW_DRAFTS`. Use it on one preview, then unset it. |

`ConsentTags` is a Server Component, so neither variable needs a `NEXT_PUBLIC_` prefix — the key reaches the browser because the component writes it into the markup, not because the bundler inlines it. Pages here are statically prerendered though, so **both variables are read at build time and changing either one on Vercel needs a redeploy to take effect**, exactly like `ONETRUST_ENV`. Note that `.env.local` already sets `ONETRUST_ENV=test` and that override beats `VERCEL_ENV`, so pass `ONETRUST_ENV=production` explicitly if you want to reproduce the production tag stack locally.

Exactly one integration script ever renders, never both:

- **Rudderstack on** — `window.rudderstackKey` followed by the shared `db-rudderstack-events.js`. That script supplies its own `OptanonWrapper` (carrying the same opt-out cookie deletion), injects the Rudderstack SDK gated on `C0003`, and wires OneTrust into both Rudderstack and Google Consent Mode. The `ue.databricks.com` data plane is baked into it, so the write key is the only input.
- **Rudderstack off** — the shared `onetrust.js`, for the cookie deletion alone.

Keeping both would be a data-integrity bug, not just redundancy: `onetrust.js` hardcodes `rudderanalytics.load()` with **www.databricks.com's own write key** behind a `typeof rudderanalytics !== "undefined"` guard, so the moment the Rudderstack SDK is on the page it would send this site's traffic to the marketing source. It is inert today only because nothing defines `rudderanalytics`.

Because the site is a SPA there is no next page load to pick up a consent change, so `ConsentTags` also renders a consent-change handler that reloads the page when the user actually changes their consent (guarded by comparing `OnetrustActiveGroups` against a snapshot taken once the SDK publishes a non-empty group list). Rudderstack and Google Consent Mode react to consent on their own inside `db-rudderstack-events.js`, but GTM still drops third-party cookies that only unload on a real page load, so the reload stays. The handler deliberately **does not touch `OptanonWrapper`** — whichever integration script is active owns that global, and `db-rudderstack-events.js` injects its own declaration that would clobber anything assigned beforehand. It polls for `OneTrust.OnConsentChanged` instead, which makes it independent of load order and of which script won.

Note that `db-rudderstack-events.js` skips Rudderstack for known bot user agents, including `HeadlessChrome` and a `webmarketing_ignore` opt-out token. Headless Playwright runs therefore never load it, which keeps e2e traffic out of the data — verify Rudderstack in a real browser.

### Site URL Resolution

Anywhere we need an absolute URL — `llms.txt`, `sitemap.xml`, `robots.txt`, JSON-LD, `/api/markdown`, `/api/bootstrap-prompt`, `/api/mcp`, the `Copy prompt` / `Copy Markdown` buttons — we resolve the site origin in this order (see `src/lib/site-url.ts`):

1. `SITE_URL` (explicit override, e.g. `https://example.com` — useful for one-off builds and tests)
2. `VERCEL_PROJECT_PRODUCTION_URL` when `VERCEL_ENV=production` (auto-set by Vercel; becomes `developers.databricks.com` once the custom domain is attached, otherwise the project's `*.vercel.app` URL)
3. `VERCEL_URL` (per-deployment URL, used on preview / branch / `vercel dev` deployments)
4. `https://developers.databricks.com` as a final, safe production fallback

So locally it points to `http://localhost:3000`, on preview deployments to the deployment's `*.vercel.app` URL, and in production to whatever production URL Vercel has assigned. No env var setup is required on Vercel.

### Common Scripts

| Command                 | What it does                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`              | Next.js dev server on port 3000                                                                                |
| `pnpm fmt`              | Format the whole repo with Prettier                                                                            |
| `pnpm typecheck`        | Run `tsc` strictly                                                                                             |
| `pnpm verify:images`    | Check every image under `public/img/guides/` and `public/img/examples/` matches the 16:9 / >=1600x900 contract |
| `pnpm build`            | Production build via Next.js, plus generated static markdown, sitemap, and robots artifacts                    |
| `pnpm test`             | Build + Vitest + Playwright smoke tests (includes sitemap, robots, llms.txt)                                   |
| `pnpm sync:appkit-docs` | Force re-sync AppKit docs from main (auto-synced on first build)                                               |

### Pre-Commit Hook

Husky runs the following on every commit (fails fast, exits first failure):

1. `prettier -c .` — formatting check
2. `pnpm typecheck`
3. `pnpm verify:images`
4. `pnpm build`

If any step fails, the commit is aborted. Fix the issue and commit again.

## Authoring Content

> **New contributor?** The end-to-end walkthrough for adding recipes, cookbooks, and examples lives in the [`author-recipes-and-cookbooks`](./.agents/skills/author-recipes-and-cookbooks/SKILL.md) agent skill. It's the source of truth — the section below is a quick orientation for humans; the skill stays exhaustive so both humans and coding agents can follow it end to end.

DevHub has three internal content tiers that compose into each other:

- **Recipe** — atomic, copy-pasteable agent prompt for one outcome (e.g. "Create a Lakebase instance"). The smallest unit; everything else is built from these.
- **Cookbook** — composes multiple recipes into a longer end-to-end guide, plus its own meta content (intro, narrative, ordering). No app source.
- **Example** — a cookbook _plus_ a full deployable codebase that lives in the [app-templates](https://github.com/databricks/app-templates) repo at `app-templates/<slug>/`. Bundles recipes and cookbook narrative around runnable app code.

So: recipes are the atoms, cookbooks compose recipes with additional context, and examples are cookbooks with shipped code. **User-facing, all three are presented as one thing: a "template"** — the site, navigation, filters, copy-pasted prompts, and `llms.txt` only ever say "template(s)".

| Tier         | Purpose                                                            | Source                                                                                 |
| ------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| **Recipe**   | One atomic outcome (e.g. "Create a Lakebase instance")             | `src/content/recipes/<id>/goal.md` + metadata in `src/lib/recipes/recipes.ts`          |
| **Cookbook** | End-to-end walkthrough composed from multiple recipes              | `src/content/cookbooks/<id>/goal.md` + metadata in `src/lib/recipes/recipes.ts`        |
| **Example**  | Cookbook + full runnable app template with code, pipelines, deploy | `src/content/examples/<id>/goal.md` + `app-templates/<id>/` (separate repo) + metadata |

All three render at `/templates/<id>` and live in one unified Templates catalog filterable by service. Slugs must be globally unique across all three — the content-entries plugin validates this at build time.

### Quick Start

1. Decide whether your change is a recipe, a cookbook, or an example.
2. Follow the detailed walkthrough in the [`author-recipes-and-cookbooks`](./.agents/skills/author-recipes-and-cookbooks/SKILL.md) skill. It has the full contract — file layout, required fields, `createExample()` wiring, validation checklist, and a dry-run recipe for examples.
3. Run `pnpm fmt`, `pnpm typecheck`, `pnpm build`, and `pnpm test` before opening a PR.

### Writing Style

- Imperative voice ("Run", "Create", "Set"), short paragraphs, explicit headings.
- Optimize for copy-paste reliability first, readability second.
- One outcome per recipe. Split into multiple recipes rather than letting one grow.
- Explain _why_ only when it prevents a mistake.
- Keep example markdown focused on what's unique to the example (data flow, architecture, adaptation points); let the included cookbooks cover how-to detail.

## Image Requirements

Every example, cookbook, and recipe can optionally ship a preview image and (for examples) a multi-slide gallery. Images are **optional** — when omitted the UI falls back to a generic rotating card art that matches the guide cards, and the site stays visually clean.

When you do add an image, it must conform to the DevHub resource-image contract. The pre-commit hook runs `pnpm verify:images` and will reject any non-conforming file with a file-level explanation.

### The Contract (Enforced)

| Rule               | Value                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Aspect ratio       | **16:9** (tolerance ±2%)                                                                                                            |
| Minimum resolution | **1600×900 px** (recommended: 1920×1080)                                                                                            |
| Formats            | **PNG, JPEG, or WEBP**. SVG is not accepted for preview slots.                                                                      |
| Location           | `public/img/guides/<id>-<slot>-<theme>.<ext>` for recipes + cookbooks, `public/img/examples/<id>-<slot>-<theme>.<ext>` for examples |
| Naming             | Light and dark variants live side by side, e.g. `saas-tracker-dashboard-light.png` and `saas-tracker-dashboard-dark.png`            |

SVG is intentionally rejected for preview images — the site expects real screenshots. Abstract vector illustrations belong in inline components, not in this slot.

Run the verifier at any time:

```bash
pnpm verify:images
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

- **Recipes and cookbooks** (UI label "Guide") -> `public/img/guides/`
- **Examples** -> `public/img/examples/`

Example for an example:

1. Drop the files into `public/img/examples/`:

   ```
   public/img/examples/inventory-intelligence-dashboard-light.png   # 1920x1080 PNG
   public/img/examples/inventory-intelligence-dashboard-dark.png    # 1920x1080 PNG
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

3. Run `pnpm verify:images` locally. The pre-commit hook will catch any regression.

If something fails verification, the error message tells you the file, the actual vs expected ratio, and the exact fix (usually "re-export at 1600×900 or any exact 16:9 size").

### Generating Placeholder Images

If a real screenshot isn't available, use the [`resource-image-generator`](./.agents/skills/resource-image-generator/SKILL.md) skill to produce a clean lo-fi skeleton. Generate **one resource at a time** when you add a new guide or example — there's no bulk batch generator maintained in the repo.

## Pull Requests

- Keep docs accurate and concise; ship small, focused PRs.
- Include a short description of what changed and why.
- Ensure formatting, typecheck, image verification, build, and tests pass before opening a PR.
- If your change touches authoring contracts (schema, skills, required fields), call it out explicitly in the PR description.
