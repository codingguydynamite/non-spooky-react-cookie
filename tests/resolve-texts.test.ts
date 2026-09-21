import { describe, expect, it } from "vitest";
import { de } from "../src/languages/de";
import { en } from "../src/languages/en";
import { pl } from "../src/languages/pl";
import { resolveTexts } from "../src/resolve-texts";

describe("resolveTexts", () => {
  it("returns the built-in texts for a known language", () => {
    expect(resolveTexts("de")).toEqual(de);
    expect(resolveTexts("pl")).toEqual(pl);
    expect(resolveTexts()).toEqual(en);
  });

  it("falls back to English for an unknown language", () => {
    expect(resolveTexts("fr")).toEqual(en);
  });

  it("deep-merges overrides without touching the built-ins", () => {
    const merged = resolveTexts("en", {
      banner: { title: "Custom title" },
      categories: {
        marketing: { items: { "meta-pixel": { title: "Meta Pixel" } } },
      },
    });

    expect(merged.banner.title).toBe("Custom title");
    expect(merged.banner.acceptAll).toBe(en.banner.acceptAll);
    expect(merged.categories.marketing?.title).toBe(en.categories.marketing?.title);
    expect(merged.categories.marketing?.items?.["meta-pixel"]?.title).toBe("Meta Pixel");
    expect(en.banner.title).not.toBe("Custom title");
  });

  it("ignores undefined override values", () => {
    const merged = resolveTexts("en", { banner: { title: undefined } });
    expect(merged.banner.title).toBe(en.banner.title);
  });
});
