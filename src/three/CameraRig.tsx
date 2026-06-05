import { useEffect, useRef } from "react";
import { CameraControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useStore } from "../store";
import { BY_NAME, filteredBounds } from "./cityLayout";
import { frameCity, frameCityClose, frameBounds, frameOverview, frameEye } from "./cameraMoves";
import { TOUR } from "./tour";
import { INITIAL_CITY } from "./deepLink";
import { prefersReducedMotion } from "../ui/useReducedMotion";

const ORBIT_SPEED = 0.12; // rad/s — gentle, immersive rotation during flagged beats

/*
 * Camera control:
 *   mount: reduced-motion / ?city -> no tour; else start tour. didInit guards it.
 *   beat-effects (per beat): apply the beat's tier filter (raw, no tour-cancel) + spotlight.
 *   resolver: frame the current beat (tier -> filtered bounds; city/closeup/overview) or,
 *             when not touring, the selected city / state filter / overview.
 *   ticker: advance beats on their timers.
 *   orbit: useFrame slowly rotates the camera on beats flagged orbit.
 *   cancel: real user input on the canvas (pointerdown / wheel) ends the tour. DOM events
 *           are used so the tour's OWN programmatic moves (framing, orbit) never self-cancel.
 */
export default function CameraRig() {
  const controls = useRef<React.ComponentRef<typeof CameraControls>>(null);
  const didInit = useRef(false);
  const gl = useThree((s) => s.gl);

  const tour = useStore((s) => s.tour);
  const selectedCity = useStore((s) => s.selectedCity);
  const overviewNonce = useStore((s) => s.overviewNonce);
  const tierFilter = useStore((s) => s.tierFilter);
  const stateFilter = useStore((s) => s.stateFilter);

  useEffect(() => {
    const cc = controls.current;
    if (!cc || didInit.current) return;
    didInit.current = true;
    cc.smoothTime = 0.7;

    const deepCity = INITIAL_CITY;
    if (deepCity) useStore.getState().select(deepCity);
    else if (prefersReducedMotion()) useStore.getState().endTour();
    else useStore.getState().startTour();
    useStore.getState().setIntroDone(true);

    const el = gl.domElement;
    const cancel = () => {
      if (useStore.getState().tour.status === "playing") useStore.getState().endTour();
    };
    el.addEventListener("pointerdown", cancel);
    el.addEventListener("wheel", cancel, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", cancel);
      el.removeEventListener("wheel", cancel);
    };
  }, [gl]);

  // Per-beat side effects (tier filter + spotlight), once per beat.
  useEffect(() => {
    if (tour.status !== "playing") return;
    const beat = TOUR[tour.beat];
    useStore.getState().setTierFilterRaw(beat.tier ?? 0);
    useStore.getState().setSpotlight(beat.spotlight && beat.city ? beat.city : null);
  }, [tour]);

  // Resolver: framing.
  useEffect(() => {
    const cc = controls.current;
    if (!cc || !didInit.current) return;

    if (tour.status === "playing") {
      const beat = TOUR[tour.beat];
      if (beat.view === "revolve") {
        frameEye(cc, true);
      } else if (beat.view === "tier") {
        const b = filteredBounds(beat.tier ?? 0, "ALL");
        if (b) frameBounds(cc, b, true);
        else frameOverview(cc, true);
      } else {
        const c = beat.city ? BY_NAME.get(beat.city) : undefined;
        if (beat.view === "overview" || !c) frameOverview(cc, true);
        else if (beat.view === "closeup") frameCityClose(cc, c, true);
        else frameCity(cc, c, true);
      }
      return;
    }
    if (selectedCity && BY_NAME.has(selectedCity)) {
      frameCity(cc, BY_NAME.get(selectedCity)!, true);
      return;
    }
    if (stateFilter !== "ALL") {
      const b = filteredBounds(tierFilter, stateFilter);
      if (b) {
        frameBounds(cc, b, true);
        return;
      }
    }
    frameOverview(cc, true);
  }, [tour, selectedCity, overviewNonce, tierFilter, stateFilter]);

  // Ticker.
  useEffect(() => {
    if (tour.status !== "playing") return;
    const id = setTimeout(() => useStore.getState().advanceTour(), TOUR[tour.beat].duration);
    return () => clearTimeout(id);
  }, [tour]);

  // Orbit: gentle rotation on "orbit" beats; the finale "revolve" beat spins exactly one
  // full 360° over its duration (speed = 2π / duration).
  useFrame((_, delta) => {
    const cc = controls.current;
    if (!cc) return;
    const st = useStore.getState();
    if (st.tour.status !== "playing") return;
    const beat = TOUR[st.tour.beat];
    if (!beat?.orbit && !beat?.revolve) return;
    const speed = beat.revolve ? (2 * Math.PI) / (beat.duration / 1000) : ORBIT_SPEED;
    cc.rotate(speed * delta, 0, false);
  });

  return <CameraControls ref={controls} makeDefault minDistance={60} maxDistance={9000} dollyToCursor />;
}
