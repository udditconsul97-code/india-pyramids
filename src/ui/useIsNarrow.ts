import { useSyncExternalStore } from "react";

// True on narrow (phone-width) viewports. Drives the mobile HUD layout.
const QUERY = "(max-width: 640px)";

function subscribe(cb: () => void) {
  const m = window.matchMedia(QUERY);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

export function useIsNarrow(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false, // server snapshot (no SSR here, but keeps the API total)
  );
}
