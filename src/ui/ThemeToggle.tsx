import { useStore } from "../store";
import { palette, FONT } from "./theme";
import { useIsNarrow } from "./useIsNarrow";

export default function ThemeToggle() {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const p = palette(theme);
  const isNarrow = useIsNarrow();

  return (
    <button
      onClick={toggleTheme}
      title="Toggle dark / light"
      style={{
        position: "absolute",
        top: isNarrow ? 8 : 16,
        right: isNarrow ? 8 : 16,
        zIndex: 12,
        width: isNarrow ? 36 : 40,
        height: isNarrow ? 36 : 40,
        borderRadius: 10,
        border: `1px solid ${p.inputBorder}`,
        background: p.panelBg,
        color: p.text,
        cursor: "pointer",
        fontSize: 18,
        fontFamily: FONT,
        backdropFilter: "blur(10px)",
        boxShadow: p.shadow,
      }}
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
