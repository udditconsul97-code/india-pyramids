import { useStore } from "../store";
import { TOUR } from "../three/tour";
import { palette, FONT } from "./theme";
import { useIsNarrow } from "./useIsNarrow";

// The tour's teaching layer: a big caption card while the camera flies, plus a single
// control that is "Skip tour" mid-tour and "Play/Replay tour" when idle/done. For
// reduced-motion users the tour never auto-plays, so the Play button is their way in.
export default function Captions() {
  const theme = useStore((s) => s.theme);
  const p = palette(theme);
  const tour = useStore((s) => s.tour);
  const everPlayed = useStore((s) => s.tourEverPlayed);
  const start = useStore((s) => s.startTour);
  const end = useStore((s) => s.endTour);
  const isNarrow = useIsNarrow();

  const playing = tour.status === "playing";
  const beat = TOUR[tour.beat];

  return (
    <>
      {playing && beat && (
        <div
          aria-live="polite"
          style={{
            position: "absolute",
            top: isNarrow ? "40%" : "15%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            width: "min(560px, 92vw)",
            textAlign: "center",
            pointerEvents: "none",
            fontFamily: FONT,
            padding: "14px 20px",
            borderRadius: 14,
            background: p.panelBg,
            border: `1px solid ${p.panelBorder}`,
            backdropFilter: "blur(10px)",
            boxShadow: p.shadow,
            color: p.text,
            fontSize: "clamp(17px, 3.4vw, 28px)",
            fontWeight: 500,
            lineHeight: 1.3,
          }}
        >
          {beat.caption}
        </div>
      )}

      <button
        onClick={() => (playing ? end() : start())}
        aria-label={playing ? "Skip the tour" : everPlayed ? "Replay the tour" : "Play the tour"}
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          ...(isNarrow ? { bottom: 72 } : { top: 64 }),
          zIndex: 11,
          padding: "7px 16px",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: FONT,
          borderRadius: 999,
          border: `1px solid ${p.inputBorder}`,
          background: p.panelBg,
          color: p.text,
          cursor: "pointer",
          backdropFilter: "blur(10px)",
          boxShadow: p.shadow,
          whiteSpace: "nowrap",
        }}
      >
        {playing ? "Skip tour ✕" : everPlayed ? "▶ Replay tour" : "▶ Play tour"}
      </button>
    </>
  );
}
