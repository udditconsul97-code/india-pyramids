// Income model — ported VERBATIM from the prototype india_city_income_pyramids.jsx.
// Percentages and colors must not change. The income model is illustrative
// (founder assumption, national avg 2/4/12/20%); the UI keeps the disclaimer.

export type Tier = 1 | 2 | 3 | 4;
export type BandKey = "ur" | "af" | "um" | "lm";

export const STATES: Record<string, string> = {
  MH: "Maharashtra", UP: "Uttar Pradesh", AP: "Andhra Pradesh", WB: "West Bengal", BR: "Bihar",
  TN: "Tamil Nadu", MP: "Madhya Pradesh", GJ: "Gujarat", KA: "Karnataka", RJ: "Rajasthan",
  HR: "Haryana", PB: "Punjab", KL: "Kerala", OD: "Odisha", JH: "Jharkhand", CG: "Chhattisgarh",
  TS: "Telangana", UK: "Uttarakhand", DL: "Delhi", CH: "Chandigarh", PY: "Puducherry",
  JK: "J&K", TR: "Tripura", MN: "Manipur", MZ: "Mizoram", AS: "Assam", HP: "Himachal Pradesh",
};

// Per-tier population share (%) in each income band, plus addressable total.
export const TIER_PCT: Record<Tier, { ur: number; af: number; um: number; lm: number; total: number }> = {
  1: { ur: 3.5, af: 7, um: 16, lm: 22, total: 48.5 },
  2: { ur: 2, af: 4.5, um: 12, lm: 21, total: 39.5 },
  3: { ur: 1, af: 3, um: 10, lm: 20, total: 34 },
  4: { ur: 0.5, af: 2, um: 7, lm: 18, total: 27.5 },
};

export const TIER_COLORS: Record<Tier, { bg: string; text: string; border: string; label: string }> = {
  1: { bg: "#EEEDFE", text: "#534AB7", border: "#AFA9EC", label: "Tier 1" },
  2: { bg: "#E1F5EE", text: "#0F6E56", border: "#5DCAA5", label: "Tier 2" },
  3: { bg: "#FAEEDA", text: "#854F0B", border: "#FAC775", label: "Tier 3" },
  4: { bg: "#FAECE7", text: "#993C1D", border: "#F0997B", label: "Tier 4" },
};

// Ordered top -> bottom of the pyramid (apex first), as in the prototype.
export const BAND_COLORS: { key: BandKey; color: string; label: string; sub: string }[] = [
  { key: "ur", color: "#D85A30", label: "Ultra-rich", sub: "₹100L+/yr" },
  { key: "af", color: "#EF9F27", label: "Affluent", sub: "₹30-100L/yr" },
  { key: "um", color: "#0F6E56", label: "Upper middle", sub: "₹7.5-30L/yr" },
  { key: "lm", color: "#1D9E75", label: "Lower middle", sub: "₹2.5-7.5L/yr" },
];

// Cr / L / K formatter — ported verbatim.
export function fmt(n: number): string {
  if (n >= 10000000) return (n / 10000000).toFixed(2) + " Cr";
  if (n >= 100000) return (n / 100000).toFixed(1) + " L";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return Math.round(n).toString();
}
