import { useEffect, useRef } from "react";
import { CameraControls } from "@react-three/drei";
import { useStore } from "../store";
import { BY_NAME } from "./cityLayout";

// High-angle isometric overview framing all of India.
const OVERVIEW = { pos: [180, 2750, 2350] as const, target: [0, 90, 0] as const };
// Far/high start for the intro reveal.
const INTRO_START = { pos: [1100, 4600, 3900] as const, target: [0, 120, 0] as const };

export default function CameraRig() {
  const controls = useRef<React.ComponentRef<typeof CameraControls>>(null);
  const didIntro = useRef(false);
  const selectedCity = useStore((s) => s.selectedCity);
  const overviewNonce = useStore((s) => s.overviewNonce);

  useEffect(() => {
    const cc = controls.current;
    if (!cc) return;
    cc.smoothTime = 0.7;

    if (!didIntro.current) {
      didIntro.current = true;
      cc.setLookAt(...INTRO_START.pos, ...INTRO_START.target, false);
      cc.setLookAt(...OVERVIEW.pos, ...OVERVIEW.target, true);
      const id = setTimeout(() => useStore.getState().setIntroDone(true), 2600);
      return () => clearTimeout(id);
    }

    if (selectedCity && BY_NAME.has(selectedCity)) {
      const c = BY_NAME.get(selectedCity)!;
      const d = c.height * 1.9 + 140;
      cc.setLookAt(
        c.x + d * 0.7,
        c.height * 1.05 + d * 0.55,
        c.z + d * 0.7,
        c.x,
        c.height * 0.5,
        c.z,
        true
      );
    } else {
      cc.setLookAt(...OVERVIEW.pos, ...OVERVIEW.target, true);
    }
  }, [selectedCity, overviewNonce]);

  return <CameraControls ref={controls} makeDefault minDistance={60} maxDistance={9000} dollyToCursor />;
}
