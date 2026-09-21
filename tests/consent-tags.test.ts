import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ConsentTags } from "../src/components/consent-tags";

const WRITE_KEY = "test-write-key";

const ONETRUST_JS = "plugins/databricks/js/onetrust.js";
const RUDDERSTACK_JS = "rudderstack/v1/db-rudderstack-events.js";

function render(): string {
  return renderToStaticMarkup(createElement(ConsentTags));
}

/** Asserts every marker is present and appears in the given order. */
function expectOrder(html: string, markers: string[]): void {
  const positions = markers.map((marker) => html.indexOf(marker));
  expect(positions.every((index) => index !== -1)).toBe(true);
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
}

beforeEach(() => {
  vi.stubEnv("ONETRUST_ENV", "");
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("RUDDERSTACK_WRITE_KEY", "");
  vi.stubEnv("RUDDERSTACK_ENABLED", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("ConsentTags", () => {
  test("renders nothing without a consent variant", () => {
    expect(render()).toBe("");
  });

  test("without Rudderstack, keeps the legal tag order: AutoBlocker, SDK stub, onetrust.js, consent-change, GTM", () => {
    vi.stubEnv("ONETRUST_ENV", "test");

    expectOrder(render(), [
      "OtAutoBlock.js",
      "otSDKStub.js",
      ONETRUST_JS,
      "db-onetrust-consent-change",
      "'dataLayer','GTM-TWTKQQ'",
    ]);
  });

  test("with Rudderstack, the write key and db-rudderstack-events.js take onetrust.js's slot in the order", () => {
    vi.stubEnv("ONETRUST_ENV", "test");
    vi.stubEnv("RUDDERSTACK_WRITE_KEY", WRITE_KEY);
    vi.stubEnv("RUDDERSTACK_ENABLED", "true");

    expectOrder(render(), [
      "OtAutoBlock.js",
      "otSDKStub.js",
      "window.rudderstackKey=",
      RUDDERSTACK_JS,
      "db-onetrust-consent-change",
      "'dataLayer','GTM-TWTKQQ'",
    ]);
  });

  // onetrust.js hardcodes rudderanalytics.load() with www.databricks.com's own
  // write key, so shipping it alongside the Rudderstack SDK would send this
  // site's traffic to the marketing source.
  test("onetrust.js and db-rudderstack-events.js are mutually exclusive", () => {
    vi.stubEnv("ONETRUST_ENV", "test");

    const withoutRudderstack = render();
    expect(withoutRudderstack).toContain(ONETRUST_JS);
    expect(withoutRudderstack).not.toContain(RUDDERSTACK_JS);

    vi.stubEnv("RUDDERSTACK_WRITE_KEY", WRITE_KEY);
    vi.stubEnv("RUDDERSTACK_ENABLED", "true");

    const withRudderstack = render();
    expect(withRudderstack).toContain(RUDDERSTACK_JS);
    expect(withRudderstack).not.toContain(ONETRUST_JS);
  });

  test("the write key never reaches the markup while Rudderstack is off", () => {
    vi.stubEnv("ONETRUST_ENV", "test");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("RUDDERSTACK_WRITE_KEY", WRITE_KEY);

    const html = render();
    expect(html).not.toContain(WRITE_KEY);
    expect(html).not.toContain("window.rudderstackKey=");
  });

  test("the write key is inlined as escaped JSON", () => {
    vi.stubEnv("ONETRUST_ENV", "test");
    vi.stubEnv("RUDDERSTACK_WRITE_KEY", "ab</script>c");
    vi.stubEnv("RUDDERSTACK_ENABLED", "true");

    const html = render();
    expect(html).toContain('window.rudderstackKey="ab\\u003c/script>c";');
  });

  test("consent-change handler polls for the SDK and reloads on a real consent change", () => {
    vi.stubEnv("ONETRUST_ENV", "test");
    const html = render();

    expect(html).toContain("OnConsentChanged");
    expect(html).toContain("window.location.reload()");
    // Snapshot guard: only reload when the active groups actually differ, so
    // SDK-internal re-fires cannot cause a reload loop.
    expect(html).toContain("var initialGroups=window.OnetrustActiveGroups");
    expect(html).toContain("!==initialGroups");
    // Bounded retry rather than a one-shot read, since the SDK publishes its
    // group list asynchronously.
    expect(html).toContain("setTimeout(register,300)");
    expect(html).toContain("attempts>100");
  });

  // Whichever integration script is active owns OptanonWrapper, and
  // db-rudderstack-events.js injects its own declaration that would clobber
  // anything assigned beforehand, so the handler must not touch it.
  test("consent-change handler does not touch OptanonWrapper in either mode", () => {
    vi.stubEnv("ONETRUST_ENV", "test");
    expect(render()).not.toContain("OptanonWrapper");

    vi.stubEnv("RUDDERSTACK_WRITE_KEY", WRITE_KEY);
    vi.stubEnv("RUDDERSTACK_ENABLED", "true");
    expect(render()).not.toContain("OptanonWrapper");
  });
});
