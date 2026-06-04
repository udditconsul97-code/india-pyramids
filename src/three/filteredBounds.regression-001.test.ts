// Regression: ISSUE-001 — state filter left the camera at the full-India overview,
// so filtering to a sparse/distant state (e.g. Kerala) showed an empty-looking scene.
// Found by /qa on 2026-06-04
// Report: .gstack/qa-reports/qa-report-localhost-2026-06-04.md
import { describe, it, expect } from "vitest";
import { filteredBounds, LAYOUT, BY_NAME } from "./cityLayout";

describe("filteredBounds (camera reframe on filter)", () => {
  it("returns bounds covering the whole map for no filter", () => {
    const all = filteredBounds(0, "ALL");
    expect(all).not.toBeNull();
    expect(all!.span).toBeGreaterThan(1000); // India spans the fit box
  });

  it("returns a tight bound centered on a single state's cities (Kerala)", () => {
    const b = filteredBounds(0, "KL")!;
    expect(b).not.toBeNull();
    // Kerala's cluster is far smaller than all of India — the bug was framing the
    // whole map, so this span must be well under the full-map span.
    const all = filteredBounds(0, "ALL")!;
    expect(b.span).toBeLessThan(all.span * 0.5);
    // Center should match the mean of Kerala cities' world positions.
    const kl = LAYOUT.filter((l) => l.state === "KL");
    const cx = kl.reduce((s, l) => s + l.x, 0) / kl.length;
    expect(Math.abs(b.cx - cx)).toBeLessThan(b.span); // center is inside the cluster
  });

  it("returns null when the tier+state combination matches no cities", () => {
    // Kerala has no Tier-1 cities, so T1 + Kerala is empty -> overview fallback.
    expect(filteredBounds(1, "KL")).toBeNull();
  });

  it("frames a single selected-style state that exists (Delhi is one city)", () => {
    const b = filteredBounds(0, "DL");
    expect(b).not.toBeNull();
    expect(b!.span).toBeGreaterThanOrEqual(0);
    expect(BY_NAME.get("Delhi")).toBeDefined();
  });
});
