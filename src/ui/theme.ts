import type { Theme } from "../store";

export interface Palette {
  panelBg: string;
  panelBorder: string;
  text: string;
  textDim: string;
  inputBg: string;
  inputBorder: string;
  hoverBg: string;
  accent: string;
  shadow: string;
}

export function palette(theme: Theme): Palette {
  return theme === "dark"
    ? {
        panelBg: "rgba(20,20,28,0.86)",
        panelBorder: "rgba(255,255,255,0.10)",
        text: "#F2F2F7",
        textDim: "#9a9aab",
        inputBg: "rgba(255,255,255,0.06)",
        inputBorder: "rgba(255,255,255,0.14)",
        hoverBg: "rgba(255,255,255,0.08)",
        accent: "#7C74E0",
        shadow: "0 8px 30px rgba(0,0,0,0.45)",
      }
    : {
        panelBg: "rgba(255,255,255,0.92)",
        panelBorder: "rgba(0,0,0,0.08)",
        text: "#1A1A22",
        textDim: "#76768a",
        inputBg: "rgba(0,0,0,0.03)",
        inputBorder: "rgba(0,0,0,0.12)",
        hoverBg: "rgba(0,0,0,0.05)",
        accent: "#534AB7",
        shadow: "0 8px 30px rgba(0,0,0,0.18)",
      };
}

export const FONT = "'DM Sans', 'Instrument Sans', system-ui, -apple-system, sans-serif";
