import { describe, it, expect, vi } from "vitest";
import { cityView, boundsView, applyView, frameOverview, OVERVIEW } from "./cameraMoves";

describe("cityView", () => {
  it("targets the city's footprint at mid-height and pulls back by height", () => {
    const v = cityView({ x: 100, z: 200, height: 200 });
    expect(v.target).toEqual([100, 100, 200]); // x, height*0.5, z
    // camera is offset out and up from the city
    expect(v.pos[0]).toBeGreaterThan(100);
    expect(v.pos[1]).toBeGreaterThan(200);
    expect(v.pos[2]).toBeGreaterThan(200);
  });
  it("is deterministic", () => {
    const c = { x: 5, z: -5, height: 80 };
    expect(cityView(c)).toEqual(cityView(c));
  });
});

describe("boundsView", () => {
  it("scales camera distance with the cluster span", () => {
    const near = boundsView({ cx: 0, cz: 0, span: 200 });
    const far = boundsView({ cx: 0, cz: 0, span: 2000 });
    expect(far.pos[1]).toBeGreaterThan(near.pos[1]); // bigger span -> further back/up
    expect(near.target).toEqual([0, 60, 0]);
  });
});

describe("applyView", () => {
  it("calls setLookAt with the view's pos + target and transition flag", () => {
    const cc = { setLookAt: vi.fn() };
    applyView(cc, { pos: [1, 2, 3], target: [4, 5, 6] }, true);
    expect(cc.setLookAt).toHaveBeenCalledWith(1, 2, 3, 4, 5, 6, true);
  });
  it("frameOverview applies the OVERVIEW constant", () => {
    const cc = { setLookAt: vi.fn() };
    frameOverview(cc, false);
    expect(cc.setLookAt).toHaveBeenCalledWith(...OVERVIEW.pos, ...OVERVIEW.target, false);
  });
});
