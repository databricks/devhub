import { describe, expect, test } from "vitest";
import { cn } from "../src/lib/utils";

describe("cn", () => {
  test("merges conflicting Tailwind utilities so later classes win", () => {
    expect(cn("text-primary-foreground", "text-db-lava")).toBe("text-db-lava");
  });

  test("combines non-conflicting classes", () => {
    expect(cn("flex", "gap-2", "p-4")).toBe("flex gap-2 p-4");
  });
});
