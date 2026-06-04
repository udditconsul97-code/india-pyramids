import { useMemo } from "react";
import { CITIES } from "../data/cities";
import { STATES, TIER_COLORS } from "../data/income";
import { useStore } from "../store";
import { palette, FONT } from "./theme";

export default function Filters() {
  const theme = useStore((s) => s.theme);
  const p = palette(theme);
  const tierFilter = useStore((s) => s.tierFilter);
  const stateFilter = useStore((s) => s.stateFilter);
  const setTierFilter = useStore((s) => s.setTierFilter);
  const setStateFilter = useStore((s) => s.setStateFilter);

  const stateList = useMemo(() => [...new Set(CITIES.map((c) => c.state))].sort(), []);

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 10,
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        alignItems: "center",
        fontFamily: FONT,
        padding: 8,
        borderRadius: 12,
        background: p.panelBg,
        border: `1px solid ${p.panelBorder}`,
        backdropFilter: "blur(10px)",
        boxShadow: p.shadow,
        maxWidth: "42vw",
      }}
    >
      {[0, 1, 2, 3, 4].map((t) => {
        const on = tierFilter === t;
        const tc = t === 0 ? null : TIER_COLORS[t as 1 | 2 | 3 | 4];
        return (
          <button
            key={t}
            onClick={() => setTierFilter(t)}
            style={{
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: 7,
              border: `1px solid ${on ? (tc ? tc.border : p.accent) : p.inputBorder}`,
              background: on ? (tc ? tc.bg : p.accent) : "transparent",
              color: on ? (tc ? tc.text : "#fff") : p.textDim,
              fontFamily: FONT,
            }}
          >
            {t === 0 ? "All" : `T${t}`}
          </button>
        );
      })}
      <select
        value={stateFilter}
        onChange={(e) => setStateFilter(e.target.value)}
        style={{
          fontSize: 12,
          padding: "5px 8px",
          borderRadius: 7,
          border: `1px solid ${p.inputBorder}`,
          background: p.inputBg,
          color: p.text,
          cursor: "pointer",
          fontFamily: FONT,
        }}
      >
        <option value="ALL">All states</option>
        {stateList.map((s) => (
          <option key={s} value={s}>
            {STATES[s] || s}
          </option>
        ))}
      </select>
    </div>
  );
}
