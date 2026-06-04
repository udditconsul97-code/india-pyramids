// Geocoding. The dataset has no coordinates, so we derive them:
//  - Tier-1 & Tier-2 cities: hardcoded accurate real coordinates (the foreground;
//    these must be geographically correct).
//  - Tier-3 & Tier-4 cities: stateCentroid[state] + deterministicJitter(name),
//    clamped to India bounds. These positions are APPROXIMATE (state-level) — a
//    stable hash spreads them within their state but they are not real coordinates.
//  - Khurja (UP) is the home marker (§5) and is geocoded exactly.
import type { City } from "./cities";

export type LatLng = [number, number]; // [lat, lng]

// India bounds for clamping.
const LAT_MIN = 8, LAT_MAX = 37, LNG_MIN = 68, LNG_MAX = 97.5;

// State centroids (lat, lng) — from the master spec table. Used for Tier-3/4.
const STATE_CENTROID: Record<string, LatLng> = {
  MH: [19.7, 75.7], UP: [27.0, 80.9], AP: [15.9, 79.7], WB: [23.0, 87.9], BR: [25.9, 85.5],
  TN: [11.1, 78.6], MP: [23.5, 78.6], GJ: [22.6, 71.8], KA: [15.3, 75.7], RJ: [27.0, 74.2],
  HR: [29.2, 76.3], PB: [31.1, 75.3], KL: [10.5, 76.3], OD: [20.5, 84.8], JH: [23.6, 85.3],
  CG: [21.3, 82.0], TS: [17.9, 79.1], UK: [30.1, 79.1], DL: [28.6, 77.1], CH: [30.7, 76.8],
  PY: [11.9, 79.8], JK: [33.8, 75.3], TR: [23.8, 91.5], MN: [24.7, 93.9], MZ: [23.2, 92.8],
  AS: [26.2, 92.9], HP: [31.9, 77.2],
};

// Exact coordinates for every Tier-1 & Tier-2 city (plus the Khurja home marker).
const EXACT: Record<string, LatLng> = {
  // Tier 1
  Mumbai: [19.076, 72.8777], Delhi: [28.7041, 77.1025], Bengaluru: [12.9716, 77.5946],
  Hyderabad: [17.385, 78.4867], Ahmedabad: [23.0225, 72.5714], Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639], Surat: [21.1702, 72.8311], Pune: [18.5204, 73.8567],
  Jaipur: [26.9124, 75.7873], Lucknow: [26.8467, 80.9462], Kanpur: [26.4499, 80.3319],
  Nagpur: [21.1458, 79.0882], Indore: [22.7196, 75.8577],
  // Tier 2
  Thane: [19.2183, 72.9781], Bhopal: [23.2599, 77.4126], Visakhapatnam: [17.6868, 83.2185],
  "Pimpri-Chinchwad": [18.6298, 73.7997], Patna: [25.5941, 85.1376], Vadodara: [22.3072, 73.1812],
  Ghaziabad: [28.6692, 77.4538], Ludhiana: [30.901, 75.8573], Agra: [27.1767, 78.0081],
  Nashik: [19.9975, 73.7898], Faridabad: [28.4089, 77.3178], Meerut: [28.9845, 77.7064],
  Rajkot: [22.3039, 70.8022], "Kalyan-Dombivli": [19.2403, 73.1305], "Vasai-Virar": [19.3919, 72.8397],
  Varanasi: [25.3176, 82.9739], Srinagar: [34.0837, 74.7973], Aurangabad: [19.8762, 75.3433],
  Dhanbad: [23.7957, 86.4304], Amritsar: [31.634, 74.8723], "Navi Mumbai": [19.033, 73.0297],
  Prayagraj: [25.4358, 81.8463], Howrah: [22.5958, 88.2636], Ranchi: [23.3441, 85.3096],
  Jabalpur: [23.1815, 79.9864], Gwalior: [26.2183, 78.1828], Coimbatore: [11.0168, 76.9558],
  Vijayawada: [16.5062, 80.648], Jodhpur: [26.2389, 73.0243], Madurai: [9.9252, 78.1198],
  Raipur: [21.2514, 81.6296], Kota: [25.2138, 75.8648], Guwahati: [26.1445, 91.7362],
  Chandigarh: [30.7333, 76.7794], Solapur: [17.6599, 75.9064], "Hubli-Dharwad": [15.3647, 75.124],
  Tiruchirappalli: [10.7905, 78.7047], Tiruppur: [11.1085, 77.3411], Moradabad: [28.8386, 78.7733],
  Mysore: [12.2958, 76.6394], Bareilly: [28.367, 79.4304], Gurgaon: [28.4595, 77.0266],
  Aligarh: [27.8974, 78.088], Jalandhar: [31.326, 75.5762], Bhubaneswar: [20.2961, 85.8245],
  Salem: [11.6643, 78.146], "Mira-Bhayandar": [19.2952, 72.8544], Warangal: [17.9689, 79.5941],
  // Home marker
  Khurja: [28.2536, 77.8546],
};

// FNV-1a style 32-bit string hash with a seed — stable across reloads.
function hashStr(s: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// Two stable offsets in ±1.3° derived from the name — well-spread, deterministic.
function deterministicJitter(name: string): LatLng {
  const a = hashStr(name, 0x811c9dc5);
  const b = hashStr(name, 0x9e3779b9);
  const dLat = ((a % 100000) / 100000) * 2.6 - 1.3;
  const dLng = ((b % 100000) / 100000) * 2.6 - 1.3;
  return [dLat, dLng];
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Returns [lat, lng] for a city. Tier-1/2 are exact; Tier-3/4 are state-level approx. */
export function cityCoord(city: City): LatLng {
  const exact = EXACT[city.name];
  if (exact) return exact;
  const c = STATE_CENTROID[city.state] ?? [22, 79];
  const [dLat, dLng] = deterministicJitter(city.name + "|" + city.state);
  return [
    clamp(c[0] + dLat, LAT_MIN, LAT_MAX),
    clamp(c[1] + dLng, LNG_MIN, LNG_MAX),
  ];
}

/** True when the position is the approximate (state-level) kind. */
export function isApproxCoord(city: City): boolean {
  return !EXACT[city.name];
}
