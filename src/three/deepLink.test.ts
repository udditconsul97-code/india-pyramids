import { describe, it, expect } from "vitest";
import { parseCityParam } from "./deepLink";

const canon = new Map([
  ["mumbai", "Mumbai"],
  ["new delhi", "New Delhi"],
]);

describe("parseCityParam", () => {
  it("matches a known city exactly", () => {
    expect(parseCityParam("Mumbai", canon)).toBe("Mumbai");
  });
  it("is case-insensitive and trims whitespace", () => {
    expect(parseCityParam("  mumbai ", canon)).toBe("Mumbai");
    expect(parseCityParam("NEW DELHI", canon)).toBe("New Delhi");
  });
  it("returns null for an unknown/typo city (caller falls through to the tour)", () => {
    expect(parseCityParam("Gotham", canon)).toBeNull();
  });
  it("returns null for absent/empty param", () => {
    expect(parseCityParam(null, canon)).toBeNull();
    expect(parseCityParam("", canon)).toBeNull();
  });
  it("uses the real city dataset by default", () => {
    expect(parseCityParam("khurja")).toBe("Khurja");
    expect(parseCityParam("definitely-not-a-city")).toBeNull();
  });
});
