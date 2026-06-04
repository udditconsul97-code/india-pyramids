// Deep-link: ?city=<name>. No router — just URLSearchParams + history.replaceState.
// parseCityParam is pure (testable); an unknown/typo city returns null so the caller
// falls through to the normal auto-tour rather than blanking.
import { CITIES } from "../data/cities";

// lowercased name -> canonical name
const CANON: Map<string, string> = new Map(CITIES.map((c) => [c.name.toLowerCase(), c.name]));

/** Returns the canonical city name for a raw ?city value, or null if absent/unknown. */
export function parseCityParam(raw: string | null, canon: Map<string, string> = CANON): string | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  return canon.get(key) ?? null;
}

/** Read ?city from the current URL, normalized to a known canonical city or null. */
export function readCityFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  return parseCityParam(new URLSearchParams(window.location.search).get("city"));
}

// Captured ONCE at module load, before any React effect can mutate the URL. CameraRig
// reads this (not readCityFromUrl at mount) so the StrictMode double-effect / R3F-deferred
// mount can't clear ?city before we get to it.
export const INITIAL_CITY: string | null = readCityFromUrl();

/** Reflect the selected city into the URL (?city=Name), or clear it. Replaces history. */
export function writeCityToUrl(name: string | null): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (name) url.searchParams.set("city", name);
  else url.searchParams.delete("city");
  window.history.replaceState(null, "", url);
}
