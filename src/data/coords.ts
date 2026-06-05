// Geocoding. Every city now has a real [lat,lng] in cityCoords.ts (dataset-sourced
// + hand-set for renamed cities/agglomerations + verified exact for the foreground).
// The old state-centroid + jitter approximation is gone; STATE_CENTROID remains only
// as a defensive fallback for a name somehow missing from the table.
import type { City } from "./cities";
import { CITY_COORDS } from "./cityCoords";

export type LatLng = [number, number]; // [lat, lng]

// India bounds for clamping (defensive).
const LAT_MIN = 6, LAT_MAX = 37.5, LNG_MIN = 68, LNG_MAX = 97.6;

// Fallback only (unused in practice — all 305 cities are in CITY_COORDS).
const STATE_CENTROID: Record<string, LatLng> = {
  MH: [19.7, 75.7], UP: [27.0, 80.9], AP: [15.9, 79.7], WB: [23.0, 87.9], BR: [25.9, 85.5],
  TN: [11.1, 78.6], MP: [23.5, 78.6], GJ: [22.6, 71.8], KA: [15.3, 75.7], RJ: [27.0, 74.2],
  HR: [29.2, 76.3], PB: [31.1, 75.3], KL: [10.5, 76.3], OD: [20.5, 84.8], JH: [23.6, 85.3],
  CG: [21.3, 82.0], TS: [17.9, 79.1], UK: [30.1, 79.1], DL: [28.6, 77.1], CH: [30.7, 76.8],
  PY: [11.9, 79.8], JK: [33.8, 75.3], TR: [23.8, 91.5], MN: [24.7, 93.9], MZ: [23.2, 92.8],
  AS: [26.2, 92.9], HP: [31.9, 77.2],
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Real [lat, lng] for a city, clamped to India bounds. */
export function cityCoord(city: City): LatLng {
  const c = CITY_COORDS[city.name] ?? STATE_CENTROID[city.state] ?? [22, 79];
  return [clamp(c[0], LAT_MIN, LAT_MAX), clamp(c[1], LNG_MIN, LNG_MAX)];
}

/** True only if a city fell back to a centroid (no real coord). All 305 have real coords. */
export function isApproxCoord(city: City): boolean {
  return !CITY_COORDS[city.name];
}
