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
// "revolve" = eye-level 360° finale. "birdseye" = top-down view that pulses zoom in/out.
export type BeatView = "overview" | "city" | "closeup" | "tier" | "revolve" | "birdseye";

export interface TourBeat {
  view: BeatView;
  city?: string; // required for "city"/"closeup"; must exist in BY_NAME
  tier?: number; // 0 = all; 1-4 sets the visible tier for this beat (drives "tier" view)
  spotlight?: boolean; // dim all other pyramids onto this city (also shows its data panel)
  orbit?: boolean; // slowly rotate the camera during the beat
  revolve?: boolean; // spin exactly one full 360° turn over the beat's duration
  zoompulse?: boolean; // bird's-eye: pulse the zoom in/out (fast in, fast out, in, out)
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
  // Each tier: a wide, rotating, labelled shot of the whole tier, then (T2-T4) a zoom-in
  // to one representative city's stack, then zoom back out into the next tier.
  { view: "tier", tier: 1, orbit: true, caption: "Tier 1 — the 14 megacities. Towering giants.", duration: 6000 },
  { view: "tier", tier: 2, orbit: true, caption: "Tier 2 — 48 large cities, still tall.", duration: 5000 },
  { view: "closeup", city: "Bhopal", tier: 2, spotlight: true, caption: "Bhopal — a Tier-2 city in Madhya Pradesh.", duration: 4500 },
  // Tier 3 & 4 get extra dwell time to showcase the mid-size cities and small towns.
  { view: "tier", tier: 3, orbit: true, caption: "Tier 3 — 87 mid-size cities.", duration: 7000 },
  { view: "closeup", city: "Saharanpur", tier: 3, spotlight: true, caption: "Saharanpur — a Tier-3 city in Uttar Pradesh.", duration: 6000 },
  { view: "tier", tier: 4, orbit: true, caption: "Tier 4 — 156 towns, the smallest and most numerous.", duration: 7000 },
  { view: "closeup", city: "Farrukhabad", tier: 4, spotlight: true, caption: "Farrukhabad — a Tier-4 town in Uttar Pradesh.", duration: 6000 },
  { view: "overview", tier: 0, orbit: true, caption: "From megacity to small town, the income shape holds.", duration: 6000 },
  // Finale part 1: drop to eye level and revolve a full 360° around India.
  { view: "revolve", tier: 0, revolve: true, caption: "A full 360° turn — the income pyramid repeats across India.", duration: 20300 },
  // Finale part 2 (last 10s): a bird's-eye view that pulses the zoom — fast in, fast out,
  // in, out. Total demo lands at exactly 100.0s.
  { view: "birdseye", tier: 0, zoompulse: true, caption: "A bird's-eye view across all of India.", duration: 10000 },
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
