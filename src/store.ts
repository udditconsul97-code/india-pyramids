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

  select: (name: string | null) => void;
  hover: (name: string | null) => void;
  setTierFilter: (t: number) => void;
  setStateFilter: (s: string) => void;
  toggleTheme: () => void;
  resetView: () => void;
  goToKhurja: () => void;
  setIntroDone: (v: boolean) => void;
  setQualityTier: (t: QualityTier) => void;
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

  // Selecting any city is a user action -> it also cancels the auto-tour.
  select: (name) => set((s) => ({ selectedCity: name, tour: name ? endTour(s.tour) : s.tour })),
  hover: (name) => set({ hoveredCity: name }),
  setTierFilter: (t) => set({ tierFilter: t }),
  setStateFilter: (s) => set({ stateFilter: s }),
  toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
  resetView: () => set((s) => ({ selectedCity: null, overviewNonce: s.overviewNonce + 1 })),
  goToKhurja: () => set((s) => ({ selectedCity: "Khurja", tour: endTour(s.tour) })),
  setIntroDone: (v) => set({ introDone: v }),
  setQualityTier: (t) => set({ qualityTier: t }),
  startTour: () => set({ tour: startTour(), tourEverPlayed: true }),
  advanceTour: () => set((s) => ({ tour: advanceTour(s.tour) })),
  endTour: () => set((s) => ({ tour: endTour(s.tour) })),
}));
