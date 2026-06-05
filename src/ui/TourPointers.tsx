import { type CSSProperties } from "react";
import { useStore } from "../store";
import { palette, FONT } from "./theme";
import { useIsNarrow } from "./useIsNarrow";

// Animated finger pointers that guide a first-time viewer during the tour: one nudging
// them to read the caption (left), one pointing at the city data panel (right). Desktop
// only; hidden on mobile where space is tight.
let injected = false;
function ensureKeyframes() {
  if (injected || typeof document === "undefined") return;
  injected = true;
  const s = document.createElement("style");
  s.textContent =
    "@keyframes gpPointL{0%,100%{transform:translateX(3px)}50%{transform:translateX(-9px)}}" +
    "@keyframes gpPointR{0%,100%{transform:translateX(-3px)}50%{transform:translateX(9px)}}";
  document.head.appendChild(s);
}

export default function TourPointers() {
  ensureKeyframes();
  const theme = useStore((s) => s.theme);
  const p = palette(theme);
  const tour = useStore((s) => s.tour);
  const spotlightCity = useStore((s) => s.spotlightCity);
  const selectedCity = useStore((s) => s.selectedCity);
  const isNarrow = useIsNarrow();

  if (isNarrow || tour.status !== "playing") return null;
  const panelUp = !!(spotlightCity && !selectedCity); // the tour-driven data panel is showing

  const pill: CSSProperties = {
    fontFamily: FONT,
    fontSize: 11,
    fontWeight: 600,
    color: p.text,
    background: p.panelBg,
    border: `1px solid ${p.panelBorder}`,
    borderRadius: 999,
    padding: "3px 9px",
    boxShadow: p.shadow,
    whiteSpace: "nowrap",
  };
  const hand: CSSProperties = { fontSize: 30, lineHeight: 1, display: "inline-block" };

  return (
    <>
      {/* Nudge: read the caption (sits just right of the caption column, pointing left). */}
      <div
        style={{
          position: "absolute",
          top: 98,
          left: "calc(16px + min(360px, 32vw) + 8px)",
          zIndex: 13,
          display: "flex",
          alignItems: "center",
          gap: 6,
          pointerEvents: "none",
        }}
      >
        <span style={{ ...hand, animation: "gpPointL 0.85s ease-in-out infinite" }}>👈</span>
        <span style={pill}>read this</span>
      </div>

      {/* Point at the city data panel (sits just left of the panel, pointing right). */}
      {panelUp && (
        <div
          style={{
            position: "absolute",
            top: 104,
            right: "calc(16px + 300px + 8px)",
            zIndex: 13,
            display: "flex",
            alignItems: "center",
            gap: 6,
            pointerEvents: "none",
          }}
        >
          <span style={pill}>the data</span>
          <span style={{ ...hand, animation: "gpPointR 0.85s ease-in-out infinite" }}>👉</span>
        </div>
      )}
    </>
  );
}
