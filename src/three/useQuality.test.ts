import { describe, it, expect } from "vitest";
import { QUALITY } from "./useQuality";

describe("QUALITY tiers", () => {
  it("low tier drops the two real GPU costs (bloom + shadows)", () => {
    expect(QUALITY.low.bloom).toBe("off");
    expect(QUALITY.low.shadows).toBe("off");
  });

  it("high tier enables threshold bloom + shadows", () => {
    expect(QUALITY.high.bloom).toBe("threshold");
    expect(QUALITY.high.shadows).toBe("high");
  });

  it("low tier caps DPR and shadow map below high", () => {
    expect(QUALITY.low.maxDpr).toBeLessThanOrEqual(QUALITY.high.maxDpr);
    expect(QUALITY.low.shadowMapSize).toBeLessThanOrEqual(QUALITY.high.shadowMapSize);
  });
});
