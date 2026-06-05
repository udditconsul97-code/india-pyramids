// The cinematic auto-tour. A data-driven list of beats; the camera flies to each
// city while the caption (which carries the income-disparity metaphor for a viewer
// with zero dataviz context) shows. Pure state transitions live here so they're
// unit-testable without the R3F/WebGL wiring.
import { BY_NAME } from "./cityLayout";

// A beat's view: the whole map, a city framed, or a close-up. spotlight dims every
// other pyramid (via the existing selection-dim shader) so the focused city — and its
// glowing gold apex — carries the eye. This is the Approach-C narrative: overview ->
// the giant -> push into the apex while the rest recedes -> the home town.
// "tier" frames the cities of beat.tier (a wide, zoomed-out shot). overview/city/closeup
// are the zoomed-in shots. orbit slowly rotates the camera for an immersive 3D feel.
export type BeatView = "overview" | "city" | "closeup" | "tier";

export interface TourBeat {
  view: BeatView;
  city?: string; // required for "city"/"closeup"; must exist in BY_NAME
  tier?: number; // 0 = all; 1-4 sets the visible tier for this beat (drives "tier" view)
  spotlight?: boolean; // dim all other pyramids onto this city (also shows its data panel)
  orbit?: boolean; // slowly rotate the camera during the beat
  caption: string; // <= ~80 chars / 2 lines (premise #3: captions carry the meaning)
  duration: number; // ms to hold before advancing
}

// ~58s immersive tour: intro + band walkthrough on Mumbai (data panel shown on the
// right), then tier 1 -> 4 each framed and slowly rotating, then an outro.
export const TOUR: TourBeat[] = [
  { view: "overview", tier: 0, orbit: true, caption: "India's 305 biggest cities — each one a pyramid.", duration: 3800 },
  { view: "city", city: "Mumbai", tier: 0, spotlight: true, caption: "Taller means bigger. Mumbai is the giant.", duration: 3600 },
  // Walk the bands bottom -> top while holding the close-up; each caption names the lit band.
  { view: "closeup", city: "Mumbai", tier: 0, spotlight: true, caption: "The wide grey base is most people — below the middle class.", duration: 3800 },
  { view: "closeup", city: "Mumbai", tier: 0, spotlight: true, caption: "The two green bands are the lower-middle and middle classes.", duration: 3800 },
  { view: "closeup", city: "Mumbai", tier: 0, spotlight: true, caption: "The amber band above them is the affluent.", duration: 3400 },
  { view: "closeup", city: "Mumbai", tier: 0, spotlight: true, caption: "And the red tip is the elite — the ultra-rich few.", duration: 3800 },
  { view: "tier", tier: 1, orbit: true, caption: "Tier 1 — the 14 megacities. Towering giants.", duration: 7500 },
  { view: "tier", tier: 2, orbit: true, caption: "Tier 2 — 48 large cities, still tall.", duration: 7500 },
  { view: "tier", tier: 3, orbit: true, caption: "Tier 3 — 87 mid-size cities, shorter.", duration: 7500 },
  { view: "tier", tier: 4, orbit: true, caption: "Tier 4 — 156 towns, the smallest and most numerous.", duration: 7500 },
  { view: "overview", tier: 0, orbit: true, caption: "From megacity to small town, the income shape holds.", duration: 6000 },
];

export type TourStatus = "idle" | "playing" | "done";
export interface TourState {
  status: TourStatus;
  beat: number;
}

export const TOUR_IDLE: TourState = { status: "idle", beat: 0 };

/** Begin the tour at beat 0. */
export function startTour(): TourState {
  return TOUR.length > 0 ? { status: "playing", beat: 0 } : { status: "done", beat: 0 };
}

/** Advance to the next beat, or finish if we're on the last one. */
export function advanceTour(s: TourState, length = TOUR.length): TourState {
  if (s.status !== "playing") return s;
  return s.beat + 1 < length ? { status: "playing", beat: s.beat + 1 } : { status: "done", beat: s.beat };
}

/** End immediately (user interaction, deep-link, reduced-motion). */
export function endTour(s: TourState): TourState {
  return { status: "done", beat: s.beat };
}

// Dev-time guard: every beat that names a city must reference a real one.
export const tourCitiesResolve = () => TOUR.every((b) => !b.city || BY_NAME.has(b.city));
