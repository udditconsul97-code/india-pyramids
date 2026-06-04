import { useEffect, useMemo } from "react";
import Scene from "./three/Scene";
import SearchBar from "./ui/SearchBar";
import Filters from "./ui/Filters";
import DetailPanel from "./ui/DetailPanel";
import Legend from "./ui/Legend";
import ThemeToggle from "./ui/ThemeToggle";
import Captions from "./ui/Captions";
import { CITIES } from "./data/cities";
import { TIER_PCT, fmt } from "./data/income";
import { useStore } from "./store";
import { palette, FONT } from "./ui/theme";
import { useIsNarrow } from "./ui/useIsNarrow";
import { writeCityToUrl } from "./three/deepLink";

// Cheap WebGL probe so a failed context shows a hero fallback, never a blank page.
function webGLAvailable(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

export default function App() {
  const theme = useStore((s) => s.theme);
  const p = palette(theme);
  const isNarrow = useIsNarrow();
  const selectedCity = useStore((s) => s.selectedCity);
  const webgl = useMemo(webGLAvailable, []);

  const totals = useMemo(() => {
    let pop = 0;
    let addr = 0;
    for (const c of CITIES) {
      pop += c.pop;
      addr += Math.round((c.pop * TIER_PCT[c.tier].total) / 100);
    }
    return { cities: CITIES.length, pop, addr };
  }, []);

  // Reflect the selected city into the URL so a friend can share /?city=Name. The
  // initial ?city is captured at module load (deepLink.INITIAL_CITY), so an early
  // null-write here can't lose it — CameraRig still selects it, which writes it back.
  useEffect(() => {
    writeCityToUrl(selectedCity);
  }, [selectedCity]);

  if (!webgl) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 24,
          fontFamily: FONT,
          background: "#0C0C13",
          color: "#F2F2F7",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 600 }}>India Income Pyramids</div>
        <p style={{ maxWidth: 460, color: "#9a9aab", lineHeight: 1.5, marginTop: 10 }}>
          A 3D map of India where every city is a pyramid — height shows its tier, and the bands
          show income: a wide base of most people tapering to a tiny ultra-rich tip. This needs
          WebGL, which your browser couldn't start. Try a recent Chrome, Safari, or Firefox.
        </p>
        <div style={{ fontSize: 12, color: "#76768a", marginTop: 12 }}>
          {totals.cities} cities · {fmt(totals.pop)} MC pop · {fmt(totals.addr)} addressable
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", fontFamily: FONT }}>
      <Scene />
      <Captions />

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
