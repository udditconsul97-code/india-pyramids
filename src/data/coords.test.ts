import { describe, it, expect } from "vitest";
import { cityCoord, isApproxCoord } from "./coords";
import { CITY_COORDS } from "./cityCoords";
import { CITIES } from "./cities";

const city = (name: string) => CITIES.find((c) => c.name === name)!;

describe("cityCoord", () => {
  it("returns real coordinates for Tier-1 cities", () => {
    expect(cityCoord(city("Mumbai"))).toEqual([19.076, 72.8777]);
    expect(cityCoord(city("Delhi"))).toEqual([28.7041, 77.1025]);
  });

  it("returns real coordinates for Tier-2 cities", () => {
    expect(cityCoord(city("Visakhapatnam"))).toEqual([17.6868, 83.2185]);
  });

  it("geocodes Khurja (home marker) exactly", () => {
    expect(cityCoord(city("Khurja"))).toEqual([28.2536, 77.8546]);
  });

  it("every city has a real coordinate (no approximations left)", () => {
    for (const c of CITIES) {
      expect(CITY_COORDS[c.name], `missing coord for ${c.name}`).toBeDefined();
      expect(isApproxCoord(c)).toBe(false);
    }
  });

  it("places Tier-3/4 cities at their true location, not a state centroid", () => {
    // Korba, Chhattisgarh is in the NE of the state, well away from the CG centroid (~21.3, 82.0).
    const korba = cityCoord(city("Korba"));
    expect(korba[0]).toBeGreaterThan(22); // ~22.35N
    expect(korba[1]).toBeGreaterThan(82.5); // ~82.7E
  });

  it("clamps every city to India bounds (lat 6-37.5, lng 68-97.6)", () => {
    for (const c of CITIES) {
      const [lat, lng] = cityCoord(c);
      expect(lat).toBeGreaterThanOrEqual(6);
      expect(lat).toBeLessThanOrEqual(37.5);
      expect(lng).toBeGreaterThanOrEqual(68);
      expect(lng).toBeLessThanOrEqual(97.6);
      expect(Number.isFinite(lat) && Number.isFinite(lng)).toBe(true);
    }
  });
});
