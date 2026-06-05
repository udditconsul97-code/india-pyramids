import { create } from "zustand";
import { TOUR_IDLE, startTour, advanceTour, endTour, type TourState } from "./three/tour";

export type Theme = "dark" | "light";
export type QualityTier = "low" | "high";

// Cheap initial guess: touch-primary devices start low; the live FPS monitor
// (QualityMonitor) downgrades a too-optimistic "high" to "low" if frames dip.
function guessInitialTier(): QualityTier {
  if (typeof window === "undefined" || !window.matchMedia) return "high";
  return window.matchMedia("(pointer: coarse)").matches ? "low" : "high";
}

interface AppState {
  selectedCity: string | null;
  hoveredCity: string | null;
  tierFilter: number; // 0 = all tiers, else 1..4
  stateFilter: string; // "ALL" or a state code
  theme: Theme;
  overviewNonce: number; // bumped to re-trigger an overview camera move
  introDone: boolean;
  qualityTier: QualityTier; // adaptive render quality (bloom/shadows/dpr)
  tour: TourState; // cinematic auto-tour state machine
  tourEverPlayed: boolean; // false until the tour has run once (Play vs Replay label)
  spotlightCity: string | null; // tour-driven focus: dims others without opening the panel

  select: (name: string | null) => void;
  hover: (name: string | null) => void;
  setTierFilter: (t: number) => void;
  setStateFilter: (s: string) => void;
  setTierFilterRaw: (t: number) => void;
  toggleTheme: () => void;
  resetView: () => void;
  goToKhurja: () => void;
  setIntroDone: (v: boolean) => void;
  setQualityTier: (t: QualityTier) => void;
  setSpotlight: (name: string | null) => void;
  startTour: () => void;
  advanceTour: () => void;
  endTour: () => void;
}

export const useStore = create<AppState>((set) => ({
  selectedCity: null,
  hoveredCity: null,
  tierFilter: 0,
  stateFilter: "ALL",
  theme: "dark",
  overviewNonce: 0,
  introDone: false,
  qualityTier: guessInitialTier(),
  tour: TOUR_IDLE,
  tourEverPlayed: false,
  spotlightCity: null,

  // Selecting a city is a user action -> cancel the tour. If a tour was playing it also
  // resets the tour's tier filtering so the picked city shows among all cities.
  select: (name) =>
    set((s) => {
      const wasPlaying = name != null && s.tour.status === "playing";
      return {
        selectedCity: name,
        ...(name != null ? { tour: endTour(s.tour), spotlightCity: null } : {}),
        ...(wasPlaying ? { tierFilter: 0 } : {}),
      };
    }),
  hover: (name) => set({ hoveredCity: name }),
  // User filter change -> cancel the tour + clear spotlight (sets tierFilter to t, so we
  // do NOT reset it to 0 the way a tour-stop does).
  setTierFilter: (t) => set((s) => ({ tierFilter: t, tour: endTour(s.tour), spotlightCity: null })),
  setStateFilter: (st) => set((s) => ({ stateFilter: st, tour: endTour(s.tour), spotlightCity: null })),
  // Tour-driven tier change: does NOT cancel the tour (the tour itself walks the tiers).
  setTierFilterRaw: (t) => set({ tierFilter: t }),
  toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
  resetView: () => set((s) => ({ selectedCity: null, overviewNonce: s.overviewNonce + 1 })),
  goToKhurja: () =>
    set((s) => ({
      selectedCity: "Khurja",
      tour: endTour(s.tour),
      spotlightCity: null,
      ...(s.tour.status === "playing" ? { tierFilter: 0 } : {}),
    })),
  setIntroDone: (v) => set({ introDone: v }),
  setQualityTier: (t) => set({ qualityTier: t }),
  setSpotlight: (name) => set({ spotlightCity: name }),
  startTour: () => set({ tour: startTour(), tourEverPlayed: true }),
  // On natural completion (last beat -> done) reset the tour's transient view state:
  // clear the spotlight (no stuck dim) and the tier filter (back to all cities).
  advanceTour: () =>
    set((s) => {
      const next = advanceTour(s.tour);
      return next.status === "done"
        ? { tour: next, spotlightCity: null, tierFilter: 0 }
        : { tour: next };
    }),
  // Manual exit (skip / interaction): same cleanup as natural completion.
  endTour: () => set((s) => ({ tour: endTour(s.tour), spotlightCity: null, tierFilter: 0 })),
}));
