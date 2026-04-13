import { describe, expect, test } from "vitest";
import {
  ABOUT_DEVHUB_CANONICAL_LLMS_TXT_URL,
  substituteAboutDevhubLlmsUrl,
} from "../src/lib/copy-preamble";

describe("substituteAboutDevhubLlmsUrl", () => {
  test("replaces canonical llms.txt URL with the requested URL", () => {
    const body = `See <${ABOUT_DEVHUB_CANONICAL_LLMS_TXT_URL}> for the index.`;
    const out = substituteAboutDevhubLlmsUrl(
      body,
      "http://localhost:3000/llms.txt",
    );
    expect(out).toContain("http://localhost:3000/llms.txt");
    expect(out).not.toContain(ABOUT_DEVHUB_CANONICAL_LLMS_TXT_URL);
  });

  test("supports localhost llms.txt for local copies", () => {
    const body = ABOUT_DEVHUB_CANONICAL_LLMS_TXT_URL;
    const out = substituteAboutDevhubLlmsUrl(
      body,
      "http://localhost:4173/llms.txt",
    );
    expect(out).toBe("http://localhost:4173/llms.txt");
  });

  test("replaces every occurrence", () => {
    const body = `${ABOUT_DEVHUB_CANONICAL_LLMS_TXT_URL} and again ${ABOUT_DEVHUB_CANONICAL_LLMS_TXT_URL}`;
    const out = substituteAboutDevhubLlmsUrl(
      body,
      "http://example.com/llms.txt",
    );
    expect(out).toBe(
      "http://example.com/llms.txt and again http://example.com/llms.txt",
    );
  });
});
