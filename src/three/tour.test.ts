import { describe, it, expect } from "vitest";
import { TOUR, startTour, advanceTour, endTour, tourCitiesResolve, TOUR_IDLE } from "./tour";

describe("TOUR data", () => {
  it("every beat references a real city", () => {
    expect(tourCitiesResolve()).toBe(true);
  });
  it("beats have positive durations and captions within the length cap", () => {
    for (const b of TOUR) {
      expect(b.duration).toBeGreaterThan(0);
      expect(b.caption.length).toBeLessThanOrEqual(80);
    }
  });
});

describe("tour state machine", () => {
  it("startTour begins playing at beat 0", () => {
    expect(startTour()).toEqual({ status: "playing", beat: 0 });
  });
  it("advanceTour steps through beats then finishes", () => {
    let s = startTour();
    for (let i = 1; i < TOUR.length; i++) {
      s = advanceTour(s);
      expect(s).toEqual({ status: "playing", beat: i });
    }
    s = advanceTour(s); // past the last beat
    expect(s.status).toBe("done");
    expect(s.beat).toBe(TOUR.length - 1);
  });
  it("advanceTour is a no-op when not playing", () => {
    expect(advanceTour(TOUR_IDLE)).toEqual(TOUR_IDLE);
    const done = { status: "done" as const, beat: 2 };
    expect(advanceTour(done)).toEqual(done);
  });
  it("endTour finishes from any beat", () => {
    expect(endTour({ status: "playing", beat: 3 })).toEqual({ status: "done", beat: 3 });
  });
});
