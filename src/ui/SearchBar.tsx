import { useMemo, useState, useRef, useEffect } from "react";
import { CITIES } from "../data/cities";
import { STATES, TIER_COLORS, fmt } from "../data/income";
import { useStore } from "../store";
import { palette, FONT } from "./theme";
import { useIsNarrow } from "./useIsNarrow";

// Lightweight fuzzy score: prefix > word-start > substring > subsequence.
function score(name: string, q: string): number {
  const n = name.toLowerCase();
  const t = q.toLowerCase();
  if (!t) return 0;
  if (n === t) return 1000;
  if (n.startsWith(t)) return 800 - n.length;
  const wi = n.split(/[\s-]+/).findIndex((w) => w.startsWith(t));
  if (wi >= 0) return 600 - wi * 5 - n.length;
  const idx = n.indexOf(t);
  if (idx >= 0) return 400 - idx - n.length;
  // subsequence
  let i = 0;
  for (const ch of n) if (i < t.length && ch === t[i]) i++;
  if (i === t.length) return 200 - n.length;
  return -1;
}

export default function SearchBar() {
  const theme = useStore((s) => s.theme);
  const p = palette(theme);
  const select = useStore((s) => s.select);
  const resetView = useStore((s) => s.resetView);
  const goToKhurja = useStore((s) => s.goToKhurja);
  const selectedCity = useStore((s) => s.selectedCity);
  const isNarrow = useIsNarrow();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    if (!q.trim()) return [];
    return CITIES.map((c) => ({ c, s: score(c.name, q) }))
      .filter((m) => m.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map((m) => m.c);
  }, [q]);

  useEffect(() => setActive(0), [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const choose = (name: string) => {
    select(name);
    setQ(name);
    setOpen(false);
  };

  return (
    <div
      ref={boxRef}
      style={
        isNarrow
          ? {
              position: "absolute",
              top: 8,
              left: 8,
              right: 52, // leave room for the theme toggle
              zIndex: 11,
              fontFamily: FONT,
            }
          : {
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              fontFamily: FONT,
              width: "min(440px, 90vw)",
            }
      }
    >
      <div style={{ display: "flex", gap: 8, flexWrap: isNarrow ? "wrap" : "nowrap" }}>
        <div style={{ position: "relative", flex: 1, flexBasis: isNarrow ? "100%" : "auto" }}>
          <input
            value={q}
            placeholder="Search a city…"
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, matches.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && matches[active]) {
                choose(matches[active].name);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 14px",
              fontSize: 14,
              fontFamily: FONT,
              borderRadius: 10,
              border: `1px solid ${p.inputBorder}`,
              background: p.panelBg,
              color: p.text,
              outline: "none",
              backdropFilter: "blur(10px)",
              boxShadow: p.shadow,
            }}
          />
          {open && matches.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                background: p.panelBg,
                border: `1px solid ${p.panelBorder}`,
                borderRadius: 10,
                overflow: "hidden",
                backdropFilter: "blur(10px)",
                boxShadow: p.shadow,
              }}
            >
              {matches.map((c, i) => {
                const tc = TIER_COLORS[c.tier];
                return (
                  <div
                    key={c.name + c.state}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      choose(c.name);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      cursor: "pointer",
                      background: i === active ? p.hoverBg : "transparent",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: tc.bg,
                        color: tc.text,
                      }}
                    >
                      T{c.tier}
                    </span>
                    <span style={{ flex: 1, fontSize: 13, color: p.text }}>
                      {c.name}
                      {c.name === "Khurja" && <span style={{ marginLeft: 6, color: "#F5B301" }}>★</span>}
                    </span>
                    <span style={{ fontSize: 11, color: p.textDim }}>{STATES[c.state]}</span>
                    <span style={{ fontSize: 11, color: p.textDim }}>{fmt(c.pop)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button onClick={() => { resetView(); setQ(""); }} title="Reset to overview" style={btn(p)}>
          Reset view
        </button>
        <button onClick={() => { goToKhurja(); setQ("Khurja"); }} title="Fly to Khurja (home)" style={{ ...btn(p), color: "#F5B301" }}>
          ★ Khurja
        </button>
      </div>
      {selectedCity && (
        <div style={{ marginTop: 6, textAlign: "center", fontSize: 11, color: p.textDim }}>
          Viewing <strong style={{ color: p.text }}>{selectedCity}</strong> — press Reset view to zoom out
        </div>
      )}
    </div>
  );
}

function btn(p: ReturnType<typeof palette>): React.CSSProperties {
  return {
    padding: "0 14px",
    fontSize: 13,
    fontFamily: FONT,
    fontWeight: 500,
    whiteSpace: "nowrap",
    borderRadius: 10,
    border: `1px solid ${p.inputBorder}`,
    background: p.panelBg,
    color: p.text,
    cursor: "pointer",
    backdropFilter: "blur(10px)",
    boxShadow: p.shadow,
  };
}
