import { describe, it, expect } from "vitest";
import { cityCoord, isApproxCoord } from "./coords";
import { CITIES } from "./cities";

const city = (name: string) => CITIES.find((c) => c.name === name)!;

describe("cityCoord", () => {
  it("returns exact hardcoded coordinates for Tier-1 cities", () => {
    expect(cityCoord(city("Mumbai"))).toEqual([19.076, 72.8777]);
    expect(cityCoord(city("Delhi"))).toEqual([28.7041, 77.1025]);
  });

  it("returns exact coordinates for Tier-2 cities", () => {
    expect(cityCoord(city("Visakhapatnam"))).toEqual([17.6868, 83.2185]);
  });

  it("geocodes Khurja (home marker) exactly", () => {
    expect(cityCoord(city("Khurja"))).toEqual([28.2536, 77.8546]);
    expect(isApproxCoord(city("Khurja"))).toBe(false);
  });

  it("marks Tier-3/4 cities as approximate", () => {
    expect(isApproxCoord(city("Korba"))).toBe(true); // T3
    expect(isApproxCoord(city("Satara"))).toBe(true); // T4
  });

  it("is deterministic across calls for jittered cities", () => {
    const a = cityCoord(city("Korba"));
    const b = cityCoord(city("Korba"));
    expect(a).toEqual(b);
  });

  it("places jittered cities within ±1.3° of their state centroid", () => {
    // Korba is in Chhattisgarh, centroid [21.3, 82.0]
    const [lat, lng] = cityCoord(city("Korba"));
    expect(Math.abs(lat - 21.3)).toBeLessThanOrEqual(1.3);
    expect(Math.abs(lng - 82.0)).toBeLessThanOrEqual(1.3);
  });

  it("clamps every city to India bounds (lat 8-37, lng 68-97.5)", () => {
    for (const c of CITIES) {
      const [lat, lng] = cityCoord(c);
      expect(lat).toBeGreaterThanOrEqual(8);
      expect(lat).toBeLessThanOrEqual(37);
      expect(lng).toBeGreaterThanOrEqual(68);
      expect(lng).toBeLessThanOrEqual(97.5);
      expect(Number.isFinite(lat) && Number.isFinite(lng)).toBe(true);
    }
  });

  it("gives every Tier-1/Tier-2 city an exact (non-approx) position", () => {
    for (const c of CITIES) {
      if (c.tier === 1 || c.tier === 2) expect(isApproxCoord(c)).toBe(false);
    }
  });
});
