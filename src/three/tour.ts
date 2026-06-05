// The cinematic auto-tour. A data-driven list of beats; the camera flies to each
// city while the caption (which carries the income-disparity metaphor for a viewer
// with zero dataviz context) shows. Pure state transitions live here so they're
// unit-testable without the R3F/WebGL wiring.
import { BY_NAME } from "./cityLayout";

// A beat's view: the whole map, a city framed, or a close-up. spotlight dims every
// other pyramid (via the existing selection-dim shader) so the focused city — and its
// glowing gold apex — carries the eye. This is the Approach-C narrative: overview ->
// the giant -> push into the apex while the rest recedes -> the home town.
export type BeatView = "overview" | "city" | "closeup";

export interface TourBeat {
  view: BeatView;
  city?: string; // required for "city"/"closeup"; must exist in BY_NAME
  spotlight?: boolean; // dim all other pyramids onto this city
  caption: string; // <= ~80 chars / 2 lines (premise #3: captions carry the meaning)
  duration: number; // ms to hold before advancing
}

export const TOUR: TourBeat[] = [
  { view: "overview", caption: "India's 305 biggest cities — each one a pyramid.", duration: 3800 },
  { view: "city", city: "Mumbai", caption: "Taller means bigger. Mumbai is the giant.", duration: 3500 },
  // Walk the bands bottom -> top while holding the close-up, so each caption names
  // exactly the band that's lit.
  { view: "closeup", city: "Mumbai", spotlight: true, caption: "The wide grey base is most people — below the middle class.", duration: 4000 },
  { view: "closeup", city: "Mumbai", spotlight: true, caption: "The two green bands are the lower-middle and middle classes.", duration: 4000 },
  { view: "closeup", city: "Mumbai", spotlight: true, caption: "The amber band above them is the affluent.", duration: 3600 },
  { view: "closeup", city: "Mumbai", spotlight: true, caption: "And the red tip is the elite — the ultra-rich few.", duration: 4200 },
  { view: "closeup", city: "Khurja", spotlight: true, caption: "Even in a small town like Khurja, the shape holds.", duration: 4200 },
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
