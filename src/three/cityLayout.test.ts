import { describe, it, expect } from "vitest";
import {
  bandBoundaries,
  LAYOUT,
  BY_NAME,
  BY_TIER,
  TIER_BASE_HEIGHT,
} from "./cityLayout";
import { project, FIT } from "./useProjection";
import { TIER_PCT } from "../data/income";

describe("bandBoundaries", () => {
  it("returns 6 cumulative boundaries from 0 to 1 for every tier", () => {
    for (const tier of [1, 2, 3, 4] as const) {
      const f = bandBoundaries(tier);
      expect(f.length).toBe(6);
      expect(f[0]).toBe(0);
      expect(f[5]).toBeCloseTo(1, 6);
    }
  });

  it("is strictly increasing (each band has positive height)", () => {
    for (const tier of [1, 2, 3, 4] as const) {
      const f = bandBoundaries(tier);
      for (let i = 1; i < f.length; i++) expect(f[i]).toBeGreaterThan(f[i - 1]);
    }
  });

  it("band gaps equal real population shares (the disparity made physical)", () => {
    const p = TIER_PCT[1];
    const f = bandBoundaries(1);
    expect(f[1] - f[0]).toBeCloseTo((100 - p.total) / 100, 6); // grey base mass
    expect(f[2] - f[1]).toBeCloseTo(p.lm / 100, 6);
    expect(f[3] - f[2]).toBeCloseTo(p.um / 100, 6);
    expect(f[4] - f[3]).toBeCloseTo(p.af / 100, 6);
    expect(f[5] - f[4]).toBeCloseTo(p.ur / 100, 6); // ultra-rich apex sliver
  });
});

describe("LAYOUT heights", () => {
  it("keeps tiers cleanly separated (every T1 taller than every T2, etc.)", () => {
    const maxOf = (t: 1 | 2 | 3 | 4) => Math.max(...BY_TIER[t].map((l) => l.height));
    const minOf = (t: 1 | 2 | 3 | 4) => Math.min(...BY_TIER[t].map((l) => l.height));
    expect(minOf(1)).toBeGreaterThan(maxOf(2));
    expect(minOf(2)).toBeGreaterThan(maxOf(3));
    expect(minOf(3)).toBeGreaterThan(maxOf(4));
  });

  it("scales height within ±15% of the tier base (k in [0.85, 1.15])", () => {
    for (const l of LAYOUT) {
      const ratio = l.height / TIER_BASE_HEIGHT[l.tier];
      expect(ratio).toBeGreaterThanOrEqual(0.85 - 1e-9);
      expect(ratio).toBeLessThanOrEqual(1.15 + 1e-9);
    }
  });
});

describe("layout indexes", () => {
  it("BY_NAME and BY_TIER together cover the full corpus", () => {
    expect(BY_NAME.size).toBe(LAYOUT.length);
    const tierSum = BY_TIER[1].length + BY_TIER[2].length + BY_TIER[3].length + BY_TIER[4].length;
    expect(tierSum).toBe(LAYOUT.length);
  });
});

describe("projection", () => {
  it("projects to finite world coordinates", () => {
    const [x, z] = project(19.076, 72.8777);
    expect(Number.isFinite(x) && Number.isFinite(z)).toBe(true);
  });

  it("centers India near the origin within the fit box", () => {
    // every city's projected position stays inside the FIT box (centered on 0)
    for (const l of LAYOUT) {
      expect(Math.abs(l.x)).toBeLessThanOrEqual(FIT / 2 + 1);
      expect(Math.abs(l.z)).toBeLessThanOrEqual(FIT / 2 + 1);
    }
  });

  it("preserves cardinal directions (north = -z, east = +x)", () => {
    const mumbai = project(19.076, 72.8777);
    const delhi = project(28.7041, 77.1025); // north of Mumbai
    const chennai = project(13.0827, 80.2707); // south of Mumbai
    const kolkata = project(22.5726, 88.3639); // east of Mumbai
    expect(delhi[1]).toBeLessThan(mumbai[1]); // north -> smaller z
    expect(chennai[1]).toBeGreaterThan(mumbai[1]); // south -> larger z
    expect(kolkata[0]).toBeGreaterThan(mumbai[0]); // east -> larger x
  });
});
