// The cinematic auto-tour. A data-driven list of beats; the camera flies to each
// city while the caption (which carries the income-disparity metaphor for a viewer
// with zero dataviz context) shows. Pure state transitions live here so they're
// unit-testable without the R3F/WebGL wiring.
import { BY_NAME } from "./cityLayout";

export interface TourBeat {
  city: string; // must exist in BY_NAME
  caption: string; // <= ~80 chars / 2 lines (premise #3: captions carry the meaning)
  duration: number; // ms to hold this beat before advancing
}

export const TOUR: TourBeat[] = [
  { city: "Mumbai", caption: "Every Indian city, as a pyramid. Taller means a bigger city.", duration: 4000 },
  { city: "Delhi", caption: "That wide grey base? Most people — below the middle class.", duration: 4000 },
  { city: "Bengaluru", caption: "The green and amber bands are the middle and affluent classes.", duration: 4000 },
  { city: "Hyderabad", caption: "And the tiny gold tip is the ultra-rich — a sliver, in every city.", duration: 4200 },
  { city: "Khurja", caption: "Even in small towns like Khurja, the shape holds.", duration: 4200 },
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

// Dev-time guard: every beat must reference a real city (validated in unit tests).
export const tourCitiesResolve = () => TOUR.every((b) => BY_NAME.has(b.city));
