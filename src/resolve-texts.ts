import type { DeepPartial, Texts } from "./types";
import { de } from "./languages/de";
import { en } from "./languages/en";
import { pl } from "./languages/pl";

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
 * Resolves the final texts: built-in texts for the chosen language,
 * merged with any user-provided overrides. Unknown languages fall back to English.
 */
export function resolveTexts(
  language: string = "en",
  texts?: DeepPartial<Texts>,
): Texts {
  const base = builtInTexts[language] ?? builtInTexts.en;

  return mergeDeep(base, texts);
}
