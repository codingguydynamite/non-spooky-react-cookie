import { de } from "./languages/de";
import { en } from "./languages/en";
import { pl } from "./languages/pl";
import type { DeepPartial, Texts } from "./types";

const builtInTexts: Record<string, Texts> = {
  de,
  en,
  pl,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeDeep<T extends Record<string, unknown>>(
  target: T,
  source?: DeepPartial<T>,
): T {
  if (!source) return target;

  const result: Record<string, unknown> = { ...target };

  Object.entries(source).forEach(([key, value]) => {
    if (value === undefined) return;

    const current = result[key];
    if (isRecord(current) && isRecord(value)) {
      result[key] = mergeDeep(current, value as DeepPartial<typeof current>);
      return;
    }

    result[key] = value;
  });

  return result as T;
}

/**
 * Finds the built-in texts for a language code. Matching ignores case, and a
 * region or script suffix falls back to the base language ("pl-PL" and
 * "de_AT" resolve to "pl" and "de"). Unknown languages get English.
 */
function builtInTextsFor(language: string): Texts {
  const code = language.toLowerCase();
  const base = code.split(/[-_]/)[0] ?? code;

  return builtInTexts[code] ?? builtInTexts[base] ?? en;
}

/**
 * Resolves the final texts: built-in texts for the chosen language,
 * merged with any user-provided overrides.
 */
export function resolveTexts(language: string = "en", texts?: DeepPartial<Texts>): Texts {
  const base = builtInTextsFor(language);

  return mergeDeep(base, texts);
}

/** Turns `texts.dialog.itemsLabel` into the word shown next to `count`. */
export function resolveItemsLabel(
  label: Texts["dialog"]["itemsLabel"],
  count: number,
): string {
  return typeof label === "function" ? label(count) : label;
}
