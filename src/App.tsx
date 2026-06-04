import { useMemo } from "react";
import Scene from "./three/Scene";
import SearchBar from "./ui/SearchBar";
import Filters from "./ui/Filters";
import DetailPanel from "./ui/DetailPanel";
import Legend from "./ui/Legend";
import ThemeToggle from "./ui/ThemeToggle";
import { CITIES } from "./data/cities";
import { TIER_PCT, fmt } from "./data/income";
import { useStore } from "./store";
import { palette, FONT } from "./ui/theme";
import { useIsNarrow } from "./ui/useIsNarrow";

export default function App() {
  const theme = useStore((s) => s.theme);
  const p = palette(theme);
  const isNarrow = useIsNarrow();

  const totals = useMemo(() => {
    let pop = 0;
    let addr = 0;
    for (const c of CITIES) {
      pop += c.pop;
      addr += Math.round((c.pop * TIER_PCT[c.tier].total) / 100);
    }
    return { cities: CITIES.length, pop, addr };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", fontFamily: FONT }}>
      <Scene />

      <SearchBar />
      <Filters />
      <ThemeToggle />
      <DetailPanel />
      <Legend />

      {/* Title + corpus stats — hidden on mobile, where the legend owns the bottom */}
      {!isNarrow && (
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: 16,
          zIndex: 9,
          fontFamily: FONT,
          color: p.text,
          padding: "8px 12px",
          borderRadius: 10,
          background: p.panelBg,
          border: `1px solid ${p.panelBorder}`,
          backdropFilter: "blur(10px)",
          boxShadow: p.shadow,
          maxWidth: "30vw",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600 }}>India Income Pyramids</div>
        <div style={{ fontSize: 11, color: p.textDim, marginTop: 2 }}>
          {totals.cities} cities · {fmt(totals.pop)} MC pop · {fmt(totals.addr)} addressable
        </div>
      </div>
      )}
    </div>
  );
}
