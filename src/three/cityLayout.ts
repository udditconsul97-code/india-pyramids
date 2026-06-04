// Computed once: each city's world position (x,z), tier-driven height, uniform
// scale k, and band boundaries. Shared by Pyramids (rendering) and CameraRig (framing).
import { CITIES } from "../data/cities";
import { cityCoord, isApproxCoord } from "../data/coords";
import { project } from "./useProjection";
import { TIER_PCT, type Tier } from "../data/income";

// Headline visual: height encodes tier. Tier-1 giant -> Tier-4 small.
export const TIER_BASE_HEIGHT: Record<Tier, number> = { 1: 200, 2: 130, 3: 80, 4: 48 };

// Steep, Egyptian silhouette: base half-width = 0.35 * height.
export const BASE_HALF_FACTOR = 0.35;

export const TIERS: Tier[] = [1, 2, 3, 4];

export interface Layout {
  name: string;
  state: string;
  tier: Tier;
  pop: number;
  x: number;
  z: number;
  height: number;
  k: number; // uniform scale vs the tier reference height
  approx: boolean;
}

// log-normalized population within each tier -> subtle within-tier height variation.
const logPopNorm = (() => {
  const byTier: Record<Tier, { min: number; max: number }> = {
    1: { min: Infinity, max: -Infinity },
    2: { min: Infinity, max: -Infinity },
    3: { min: Infinity, max: -Infinity },
    4: { min: Infinity, max: -Infinity },
  };
  for (const c of CITIES) {
    const l = Math.log(c.pop);
    const b = byTier[c.tier];
    if (l < b.min) b.min = l;
    if (l > b.max) b.max = l;
  }
  return (tier: Tier, pop: number) => {
    const b = byTier[tier];
    if (b.max === b.min) return 0.5;
    return (Math.log(pop) - b.min) / (b.max - b.min);
  };
})();

export const LAYOUT: Layout[] = CITIES.map((c) => {
  const [lat, lng] = cityCoord(c);
  const [x, z] = project(lat, lng);
  const k = 0.85 + 0.3 * logPopNorm(c.tier, c.pop);
  const height = TIER_BASE_HEIGHT[c.tier] * k;
  return { name: c.name, state: c.state, tier: c.tier, pop: c.pop, x, z, height, k, approx: isApproxCoord(c) };
});

export const BY_NAME = new Map<string, Layout>(LAYOUT.map((l) => [l.name, l]));

export const BY_TIER: Record<Tier, Layout[]> = { 1: [], 2: [], 3: [], 4: [] };
for (const l of LAYOUT) BY_TIER[l.tier].push(l);

/**
 * World bounds (center + span) of the cities matching the current filters, or null
 * if none match. Used to reframe the camera when a state filter is applied so the
 * filtered set fills the view instead of being a speck in the full-India overview.
 */
export function filteredBounds(
  tierFilter: number,
  stateFilter: string
): { cx: number; cz: number; span: number } | null {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity, n = 0;
  for (const l of LAYOUT) {
    if (tierFilter !== 0 && l.tier !== tierFilter) continue;
    if (stateFilter !== "ALL" && l.state !== stateFilter) continue;
    n++;
    if (l.x < minX) minX = l.x;
    if (l.x > maxX) maxX = l.x;
    if (l.z < minZ) minZ = l.z;
    if (l.z > maxZ) maxZ = l.z;
  }
  if (n === 0) return null;
  return { cx: (minX + maxX) / 2, cz: (minZ + maxZ) / 2, span: Math.max(maxX - minX, maxZ - minZ) };
}

/**
 * Cumulative vertical fractions (0..1) of band boundaries for a tier, bottom -> top:
 * [below-middle, lower-middle, upper-middle, affluent, ultra-rich]. The slab heights
 * equal real population shares — the income disparity made physical.
 */
export function bandBoundaries(tier: Tier): number[] {
  const p = TIER_PCT[tier];
  const below = 100 - p.total;
  const f = [0];
  f.push(below / 100);
  f.push(f[1] + p.lm / 100);
  f.push(f[2] + p.um / 100);
  f.push(f[3] + p.af / 100);
  f.push(1); // + p.ur/100
  return f;
}
