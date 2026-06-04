import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useStore, type QualityTier } from "../store";

// Per-tier render settings. The phone (low) tier drops the two real GPU costs:
// bloom (a full-screen pass) and shadows (a depth prepass), and caps DPR.
export interface QualitySettings {
  bloom: "off" | "threshold";
  shadows: "off" | "high";
  shadowMapSize: number;
  maxDpr: number;
}

export const QUALITY: Record<QualityTier, QualitySettings> = {
  low: { bloom: "off", shadows: "off", shadowMapSize: 1024, maxDpr: 1.5 },
  high: { bloom: "threshold", shadows: "high", shadowMapSize: 2048, maxDpr: 2 },
};

/** Read the current tier's settings. */
export function useQuality(): QualitySettings {
  return QUALITY[useStore((s) => s.qualityTier)];
}

/**
 * Live FPS guard. Sits inside the Canvas. If sustained frame rate drops, it first
 * lets drei scale the renderer DPR down; a persistent decline downgrades the whole
 * tier to "low" (turning off bloom + shadows). One-way: we never auto-upgrade back,
 * to avoid oscillation. Must be rendered inside <Canvas>.
 */
export function QualityMonitor() {
  const setTier = useStore((s) => s.setQualityTier);
  const tier = useStore((s) => s.qualityTier);
  const setDpr = useThree((s) => s.setDpr);

  // Clamp DPR to the active tier's ceiling whenever the tier changes.
  useEffect(() => {
    setDpr(Math.min(window.devicePixelRatio || 1, QUALITY[tier].maxDpr));
  }, [tier, setDpr]);

  return (
    <PerformanceMonitor
      // bounds keyed to ~60fps targets; flipped factor on sustained decline
      onDecline={() => {
        if (useStore.getState().qualityTier !== "low") setTier("low");
      }}
    />
  );
}
