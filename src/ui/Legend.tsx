import { useState } from "react";
import { BAND_COLORS } from "../data/income";
import { useStore } from "../store";
import { palette, FONT } from "./theme";
import { useIsNarrow } from "./useIsNarrow";

// Collapsed by default to an "i" button; the full color key + disclaimer only
// appears when pressed.
export default function Legend() {
  const theme = useStore((s) => s.theme);
  const p = palette(theme);
  const grey = theme === "dark" ? "#3A3A4A" : "#C9C9D2";
  const isNarrow = useIsNarrow();
  const selectedCity = useStore((s) => s.selectedCity);
  const [open, setOpen] = useState(false);

  // On mobile the detail bottom-sheet owns the bottom; don't stack the legend under it.
  if (isNarrow && selectedCity) return null;

  return (
    <>
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: 56, // sits above the i / close button
            left: isNarrow ? 8 : "50%",
            right: isNarrow ? 8 : undefined,
            transform: isNarrow ? undefined : "translateX(-50%)",
            zIndex: 10,
            fontFamily: FONT,
            maxWidth: isNarrow ? undefined : "94vw",
            padding: isNarrow ? "8px 12px" : "10px 16px",
            borderRadius: 12,
            background: p.panelBg,
            border: `1px solid ${p.panelBorder}`,
            backdropFilter: "blur(10px)",
            boxShadow: p.shadow,
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: isNarrow ? "6px 10px" : 14 }}>
            {/* Bottom -> top of the pyramid: grey mass to ultra-rich apex */}
            <Item color={grey} label="Below middle class" sub="the base mass" p={p} />
            {[...BAND_COLORS].reverse().map((b) => (
              <Item key={b.key} color={b.color} label={b.label} sub={b.sub} p={p} />
            ))}
          </div>
          {!isNarrow && (
            <div style={{ fontSize: 10, color: p.textDim, marginTop: 7, lineHeight: 1.5 }}>
              Height = city tier · band heights = real population share, so the wide grey base tapering to a tiny ultra-rich
              apex <strong>is the income disparity, made physical</strong>. Income class % adjusted by tier (national avg
              2/4/12/20%); the income model is illustrative. MC pop per 2011 Census.
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        title={open ? "Hide the color key" : "What do the colors mean?"}
        aria-label={open ? "Hide the legend" : "Show the legend"}
        aria-expanded={open}
        style={{
          position: "absolute",
          bottom: 14,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 11,
          width: 34,
          height: 34,
          borderRadius: 999,
          border: `1px solid ${p.inputBorder}`,
          background: p.panelBg,
          color: p.text,
          cursor: "pointer",
          fontFamily: FONT,
          fontSize: open ? 18 : 15,
          fontStyle: open ? "normal" : "italic",
          fontWeight: 600,
          lineHeight: 1,
          backdropFilter: "blur(10px)",
          boxShadow: p.shadow,
        }}
      >
        {open ? "×" : "i"}
      </button>
    </>
  );
}

function Item({ color, label, sub, p }: { color: string; label: string; sub: string; p: ReturnType<typeof palette> }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: p.textDim }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
      <span style={{ color: p.text }}>{label}</span>
      <span>({sub})</span>
    </div>
  );
}
