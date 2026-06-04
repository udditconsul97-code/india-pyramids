import { describe, it, expect } from "vitest";
import { fmt, TIER_PCT, BAND_COLORS, STATES } from "./income";

describe("fmt", () => {
  it("formats crores (>= 1e7)", () => {
    expect(fmt(12442373)).toBe("1.24 Cr");
    expect(fmt(10000000)).toBe("1.00 Cr");
  });
  it("formats lakhs (>= 1e5)", () => {
    expect(fmt(121207)).toBe("1.2 L");
    expect(fmt(100000)).toBe("1.0 L");
  });
  it("formats thousands (>= 1e3)", () => {
    expect(fmt(5400)).toBe("5.4K");
  });
  it("formats small numbers as integers", () => {
    expect(fmt(999)).toBe("999");
    expect(fmt(0)).toBe("0");
  });
});

describe("TIER_PCT", () => {
  it("band shares sum to the addressable total for every tier", () => {
    for (const tier of [1, 2, 3, 4] as const) {
      const p = TIER_PCT[tier];
      const sum = p.ur + p.af + p.um + p.lm;
      expect(sum).toBeCloseTo(p.total, 5);
    }
  });
  it("addressable total decreases with tier number", () => {
    expect(TIER_PCT[1].total).toBeGreaterThan(TIER_PCT[2].total);
    expect(TIER_PCT[2].total).toBeGreaterThan(TIER_PCT[3].total);
    expect(TIER_PCT[3].total).toBeGreaterThan(TIER_PCT[4].total);
  });
});

describe("BAND_COLORS", () => {
  it("lists the four income bands apex-first", () => {
    expect(BAND_COLORS.map((b) => b.key)).toEqual(["ur", "af", "um", "lm"]);
  });
});

describe("STATES", () => {
  it("maps the home-marker state code", () => {
    expect(STATES.UP).toBe("Uttar Pradesh");
  });
});
