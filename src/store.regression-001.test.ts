// Regression: review finding (narrative-tour) — an uninterrupted tour left the
// spotlight set, dimming the whole map except the last city, because advanceTour→done
// never cleared spotlightCity. Also: filters mid-tour didn't cancel the tour.
// Found by /review on 2026-06-05.
import { describe, it, expect } from "vitest";
import { useStore } from "./store";
import { TOUR } from "./three/tour";

describe("tour spotlight lifecycle (store)", () => {
  it("advanceTour to done clears the spotlight (no stuck dim after a full tour)", () => {
    useStore.setState({ tour: { status: "playing", beat: TOUR.length - 1 }, spotlightCity: "Khurja" });
    useStore.getState().advanceTour();
    expect(useStore.getState().tour.status).toBe("done");
    expect(useStore.getState().spotlightCity).toBeNull();
  });

  it("advanceTour mid-tour keeps the current spotlight", () => {
    useStore.setState({ tour: { status: "playing", beat: 2 }, spotlightCity: "Mumbai" });
    useStore.getState().advanceTour();
    expect(useStore.getState().tour.status).toBe("playing");
    expect(useStore.getState().spotlightCity).toBe("Mumbai");
  });

  it("changing a tier filter cancels the tour and clears the spotlight", () => {
    useStore.setState({ tour: { status: "playing", beat: 1 }, spotlightCity: "Mumbai", tierFilter: 0 });
    useStore.getState().setTierFilter(1);
    expect(useStore.getState().tierFilter).toBe(1);
    expect(useStore.getState().tour.status).toBe("done");
    expect(useStore.getState().spotlightCity).toBeNull();
  });

  it("changing the state filter cancels the tour", () => {
    useStore.setState({ tour: { status: "playing", beat: 1 }, stateFilter: "ALL" });
    useStore.getState().setStateFilter("KL");
    expect(useStore.getState().stateFilter).toBe("KL");
    expect(useStore.getState().tour.status).toBe("done");
  });
});
