import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { decompressFromEncodedURIComponent } from "lz-string";

// Playwright is run from the repo root (per package.json scripts and CI).
const REPO_ROOT = process.cwd();

type VaEvent = [string, { name: string; data: Record<string, unknown> }];
type WindowWithSpy = Window & { __vaEvents?: VaEvent[] };

/**
 * Spies on `window.va` (the global function `@vercel/analytics` uses under
 * the hood) so `track(...)` calls land in `window.__vaEvents`. Uses a
 * configurable property so the analytics SDK can still assign its own
 * implementation later without overwriting our spy.
 */
function setupAnalyticsSpy(page: Page) {
  return page.addInitScript(() => {
    const events: VaEvent[] = [];
    (window as WindowWithSpy).__vaEvents = events;
    let realVa: ((...args: unknown[]) => void) | undefined;
    Object.defineProperty(window, "va", {
      configurable: true,
      get() {
        return (...args: unknown[]) => {
          events.push(args as VaEvent);
          if (realVa) realVa(...args);
        };
      },
      set(fn: (...args: unknown[]) => void) {
        realVa = fn;
      },
    });
  });
}

function getAnalyticsEvents(page: Page): Promise<VaEvent[]> {
  return page.evaluate(() => (window as WindowWithSpy).__vaEvents ?? []);
}

test.describe("Open prompt in dropdown", () => {
  test("renders on a Replit-enabled template; the Replit menu item links to a stack=Build URL that decodes back to the source file", async ({
    page,
  }) => {
    await page.goto("/templates/saas-tracker");

    const trigger = page.getByRole("button", { name: "Open prompt in" });
    await expect(trigger).toBeVisible();
    await trigger.click();

    const item = page.getByRole("menuitem", { name: "Replit" });
    await expect(item).toBeVisible();

    const href = await item.getAttribute("href");
    expect(href, "Replit menu item should be a real anchor").toBeTruthy();

    const url = new URL(href!);
    expect(url.origin + url.pathname).toBe("https://replit.com/");
    // Replit's Open in Replit protocol requires stack=Build for Agent mode.
    // Without it Replit may silently fail to fill the prompt.
    expect(url.searchParams.get("stack")).toBe("Build");
    expect(url.searchParams.get("referrer")).toBe("devhub");
    expect(url.searchParams.get("utm_source")).toBe("devhub");

    const encoded = url.searchParams.get("prompt");
    expect(encoded).toBeTruthy();

    // End-to-end roundtrip: the prompt Replit Agent will see after decoding
    // must equal the on-disk replit-prompt.md byte-for-byte. Catches any
    // future regression in lz-string encoding, the plugin pipeline, the
    // useReplitPrompt aggregator, or the buildReplitUrl helper.
    const decoded = decompressFromEncodedURIComponent(encoded!);
    const onDisk = readFileSync(
      resolve(REPO_ROOT, "content/examples/saas-tracker/replit-prompt.md"),
      "utf-8",
    );
    expect(decoded).toBe(onDisk);
  });

  test("does not render on a template without a replit-prompt.md", async ({
    page,
  }) => {
    await page.goto("/templates/set-up-your-local-dev-environment");
    await expect(
      page.getByRole("button", { name: "Copy prompt" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Open prompt in" }),
    ).toHaveCount(0);
  });

  test("clicking the Replit menu item fires an open_prompt_in analytics event with the expected payload", async ({
    page,
  }) => {
    await setupAnalyticsSpy(page);
    await page.goto("/templates/saas-tracker");

    await page.getByRole("button", { name: "Open prompt in" }).click();
    const item = page.getByRole("menuitem", { name: "Replit" });
    await expect(item).toBeVisible();

    // Block the actual navigation so the test stays on the page after click.
    // The track() call runs before the listener resolves, so blocking nav
    // doesn't suppress the event.
    await page.evaluate(() => {
      document
        .querySelectorAll<HTMLAnchorElement>(
          "[data-slot=dropdown-menu-content] a",
        )
        .forEach((a) => {
          a.addEventListener("click", (e) => e.preventDefault(), {
            once: true,
          });
        });
    });

    await item.click();

    const events = await getAnalyticsEvents(page);
    const openEvent = events.find(
      ([action, payload]) =>
        action === "event" && payload?.name === "open_prompt_in",
    );
    expect(
      openEvent,
      "open_prompt_in event should have been recorded",
    ).toBeTruthy();
    expect(openEvent![1].data).toEqual({
      target: "replit",
      slug: "saas-tracker",
      title: "SaaS Subscription Tracker",
      permalink: "/templates/saas-tracker",
    });
  });
});
