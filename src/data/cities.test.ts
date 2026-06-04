import { describe, it, expect } from "vitest";
import { CITIES } from "./cities";

describe("CITIES dataset", () => {
  it("parses the full corpus", () => {
    expect(CITIES.length).toBe(305);
  });

  it("has no duplicate names (selection keys on name)", () => {
    const names = CITIES.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("every city has a valid tier (1-4) and positive population", () => {
    for (const c of CITIES) {
      expect([1, 2, 3, 4]).toContain(c.tier);
      expect(c.pop).toBeGreaterThan(0);
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.state.length).toBeGreaterThan(0);
    }
  });

  it("includes the Khurja home marker", () => {
    const k = CITIES.find((c) => c.name === "Khurja");
    expect(k).toBeDefined();
    expect(k?.state).toBe("UP");
  });

  it("parses pipe-delimited fields correctly (Mumbai)", () => {
    const m = CITIES.find((c) => c.name === "Mumbai");
    expect(m).toEqual({ name: "Mumbai", state: "MH", tier: 1, pop: 12442373 });
  });
});
