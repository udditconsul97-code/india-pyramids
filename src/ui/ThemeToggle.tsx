import { useStore } from "../store";
import { palette, FONT } from "./theme";

export default function ThemeToggle() {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const p = palette(theme);

  return (
    <button
      onClick={toggleTheme}
      title="Toggle dark / light"
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 10,
        width: 40,
        height: 40,
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
