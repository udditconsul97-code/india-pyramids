import { useStore } from "../store";
import { TOUR } from "../three/tour";
import { palette, FONT } from "./theme";
import { useIsNarrow } from "./useIsNarrow";

// Tour teaching layer. On desktop the captions sit on the LEFT, below the filters,
// clear of the (right-shifted) map. On mobile they're centered. The single control is
// "Skip tour" mid-tour and "Play/Replay tour" otherwise.
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

  const controlBtn = (
    <button
      onClick={() => (playing ? end() : start())}
      aria-label={playing ? "Skip the tour" : everPlayed ? "Replay the tour" : "Play the tour"}
      style={{
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
        alignSelf: "flex-start",
      }}
    >
      {playing ? "Skip tour ✕" : everPlayed ? "▶ Replay tour" : "▶ Play tour"}
    </button>
  );

  const captionCard = playing && beat && (
    <div
      aria-live="polite"
      style={{
        fontFamily: FONT,
        padding: "14px 18px",
        borderRadius: 14,
        background: p.panelBg,
        border: `1px solid ${p.panelBorder}`,
        backdropFilter: "blur(10px)",
        boxShadow: p.shadow,
        color: p.text,
        fontSize: isNarrow ? "clamp(16px, 4vw, 22px)" : 21,
        fontWeight: 500,
        lineHeight: 1.35,
      }}
    >
      {beat.caption}
    </div>
  );

  // Mobile: caption floats center, control pinned bottom-center (map is full-screen).
  if (isNarrow) {
    return (
      <>
        {playing && beat && (
          <div style={{ position: "absolute", top: "40%", left: 8, right: 8, zIndex: 10, textAlign: "center", pointerEvents: "none" }}>
            {captionCard}
          </div>
        )}
        <div style={{ position: "absolute", bottom: 72, left: "50%", transform: "translateX(-50%)", zIndex: 11 }}>{controlBtn}</div>
      </>
    );
  }

  // Desktop: left column under the filters; the map is shifted right to clear it.
  return (
    <div
      style={{
        position: "absolute",
        top: 86,
        left: 16,
        zIndex: 11,
        width: "min(360px, 32vw)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      {captionCard}
      {controlBtn}
    </div>
  );
}
