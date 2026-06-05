import { CITIES } from "../data/cities";
import { BAND_COLORS, TIER_PCT, TIER_COLORS, STATES, fmt } from "../data/income";
import { isApproxCoord } from "../data/coords";
import { useStore } from "../store";
import { palette, FONT } from "./theme";
import { useIsNarrow } from "./useIsNarrow";

export default function DetailPanel() {
  const theme = useStore((s) => s.theme);
  const p = palette(theme);
  const selectedCity = useStore((s) => s.selectedCity);
  const spotlightCity = useStore((s) => s.spotlightCity);
  const resetView = useStore((s) => s.resetView);
  const isNarrow = useIsNarrow();

  // Show the panel for a user-selected city OR the tour's spotlight city (so the tour
  // surfaces the focused city's data on the right).
  const focusCity = selectedCity ?? spotlightCity;
  if (!focusCity) return null;
  const city = CITIES.find((c) => c.name === focusCity);
  if (!city) return null;

  const pct = TIER_PCT[city.tier];
  const tc = TIER_COLORS[city.tier];
  const addressable = Math.round((city.pop * pct.total) / 100);
  const grey = theme === "dark" ? "#3A3A4A" : "#C9C9D2";
  const belowPct = +(100 - pct.total).toFixed(1);
  const belowVal = Math.round((city.pop * belowPct) / 100);

  return (
    <div
      style={{
        position: "absolute",
        // Mobile: bottom sheet, full width. Desktop: right-side panel.
        ...(isNarrow
          ? { left: 8, right: 8, bottom: 8, maxHeight: "55vh" }
          : { top: 78, right: 16, width: 300, maxHeight: "calc(100vh - 200px)" }),
        zIndex: 12,
        overflowY: "auto",
        fontFamily: FONT,
        padding: 18,
        borderRadius: 14,
        background: p.panelBg,
        border: `1px solid ${p.panelBorder}`,
        backdropFilter: "blur(12px)",
        boxShadow: p.shadow,
        color: p.text,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.1 }}>
            {city.name}
            {city.name === "Khurja" && <span style={{ marginLeft: 8, color: "#F5B301", fontSize: 16 }}>★ home</span>}
          </div>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 5, background: tc.bg, color: tc.text }}>
              {tc.label}
            </span>
            <span style={{ fontSize: 13, color: p.textDim }}>{STATES[city.state]}</span>
          </div>
        </div>
        <button onClick={resetView} title="Close & reset view" style={{ background: "none", border: "none", color: p.textDim, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>
          ×
        </button>
      </div>

      <div style={{ marginTop: 14, fontSize: 13, color: p.textDim }}>
        MC Pop (2011): <strong style={{ color: p.text }}>{fmt(city.pop)}</strong>
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, color: p.textDim, marginBottom: 8 }}>
          Income bands (people)
        </div>
        {BAND_COLORS.map((b) => {
          const val = Math.round((city.pop * pct[b.key]) / 100);
          return (
            <div key={b.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: b.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13 }}>
                {b.label} <span style={{ color: p.textDim, fontSize: 11 }}>{b.sub}</span>
              </span>
              <span style={{ fontSize: 12, color: p.textDim, minWidth: 34, textAlign: "right" }}>{pct[b.key]}%</span>
              <span style={{ fontSize: 13, fontWeight: 600, minWidth: 56, textAlign: "right" }}>{fmt(val)}</span>
            </div>
          );
        })}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", opacity: 0.75 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: grey, flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13 }}>Below middle class</span>
          <span style={{ fontSize: 12, color: p.textDim, minWidth: 34, textAlign: "right" }}>{belowPct}%</span>
          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 56, textAlign: "right" }}>{fmt(belowVal)}</span>
        </div>
      </div>

      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${p.panelBorder}`, display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 14 }}>
        <span>Addressable (MC+)</span>
        <span style={{ color: tc.text }}>{fmt(addressable)}</span>
      </div>

      {isApproxCoord(city) && (
        <div style={{ marginTop: 12, fontSize: 10, color: p.textDim, lineHeight: 1.5 }}>
          Position is approximate (state-level). Tier-1/2 cities are placed at exact coordinates.
        </div>
      )}
    </div>
  );
}
