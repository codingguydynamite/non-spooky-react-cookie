import { describe, expect, it } from "vitest";
import { de } from "../src/languages/de";
import { en } from "../src/languages/en";
import { pl } from "../src/languages/pl";
import { resolveItemsLabel, resolveTexts } from "../src/resolve-texts";

describe("resolveTexts", () => {
  it("returns the built-in texts for a known language", () => {
    expect(resolveTexts("de")).toEqual(de);
    expect(resolveTexts("pl")).toEqual(pl);
    expect(resolveTexts()).toEqual(en);
  });

  it("falls back to English for an unknown language", () => {
    expect(resolveTexts("fr")).toEqual(en);
    expect(resolveTexts("fr-PL")).toEqual(en);
    expect(resolveTexts("")).toEqual(en);
  });

  it("resolves region codes and any casing to the base language", () => {
    expect(resolveTexts("pl-PL")).toEqual(pl);
    expect(resolveTexts("de_AT")).toEqual(de);
    expect(resolveTexts("EN-us")).toEqual(en);
    expect(resolveTexts("PL")).toEqual(pl);
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

describe("resolveItemsLabel", () => {
  it("returns a plain string label as is", () => {
    expect(resolveItemsLabel("Services", 1)).toBe("Services");
  });

  it("picks the English and German plural forms", () => {
    expect(resolveItemsLabel(en.dialog.itemsLabel, 1)).toBe("Service");
    expect(resolveItemsLabel(en.dialog.itemsLabel, 2)).toBe("Services");
    expect(resolveItemsLabel(de.dialog.itemsLabel, 1)).toBe("Dienst");
    expect(resolveItemsLabel(de.dialog.itemsLabel, 3)).toBe("Dienste");
  });

  it("picks the Polish plural forms", () => {
    const label = (count: number) => resolveItemsLabel(pl.dialog.itemsLabel, count);

    expect(label(1)).toBe("Usługa");
    expect([2, 3, 4, 22, 24, 102].map(label)).toEqual(Array(6).fill("Usługi"));
    expect([0, 5, 11, 12, 13, 14, 21, 25, 112].map(label)).toEqual(
      Array(9).fill("Usług"),
    );
  });

  it("accepts a function override through texts", () => {
    const texts = resolveTexts("en", {
      dialog: { itemsLabel: (count) => (count === 1 ? "tracker" : "trackers") },
    });

    expect(resolveItemsLabel(texts.dialog.itemsLabel, 4)).toBe("trackers");
  });
});
