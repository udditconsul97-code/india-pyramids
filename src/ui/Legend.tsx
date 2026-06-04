import { BAND_COLORS } from "../data/income";
import { useStore } from "../store";
import { palette, FONT } from "./theme";

export default function Legend() {
  const theme = useStore((s) => s.theme);
  const p = palette(theme);
  const grey = theme === "dark" ? "#3A3A4A" : "#C9C9D2";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 14,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        fontFamily: FONT,
        maxWidth: "94vw",
        padding: "10px 16px",
        borderRadius: 12,
        background: p.panelBg,
        border: `1px solid ${p.panelBorder}`,
        backdropFilter: "blur(10px)",
        boxShadow: p.shadow,
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
        {/* Bottom -> top of the pyramid: grey mass to ultra-rich apex */}
        <Item color={grey} label="Below middle class" sub="the base mass" p={p} />
        {[...BAND_COLORS].reverse().map((b) => (
          <Item key={b.key} color={b.color} label={b.label} sub={b.sub} p={p} />
        ))}
      </div>
      <div style={{ fontSize: 10, color: p.textDim, marginTop: 7, lineHeight: 1.5 }}>
        Height = city tier · band heights = real population share, so the wide grey base tapering to a tiny ultra-rich apex
        <strong> is the income disparity, made physical</strong>. Income class % adjusted by tier (national avg 2/4/12/20%);
        the income model is illustrative. MC pop per 2011 Census.
      </div>
    </div>
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
