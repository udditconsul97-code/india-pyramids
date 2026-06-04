import { useEffect, useRef } from "react";
import { CameraControls } from "@react-three/drei";
import { useStore } from "../store";
import { BY_NAME, filteredBounds } from "./cityLayout";
import { frameCity, frameCityClose, frameBounds, frameOverview } from "./cameraMoves";
import { TOUR } from "./tour";
import { INITIAL_CITY } from "./deepLink";
import { prefersReducedMotion } from "../ui/useReducedMotion";

/*
 * Camera control flow (single resolver, no competing effects):
 *
 *   mount ── reduced-motion? ─yes→ endTour ─┐
 *         ── ?city valid?    ─yes→ select  ─┤
 *         └─ else            ──────startTour┘
 *                                           │
 *   resolver(state) ───────────────────────▼
 *     tour playing → frame current beat city
 *     else selected city → frame it
 *     else state filter → frame filtered bounds
 *     else → overview
 *
 *   ticker: while playing, advance beat every beat.duration ms
 *   cancel: CameraControls 'control' event (user drag/zoom) → endTour
 *           selecting any city (store.select) → endTour
 */
export default function CameraRig() {
  const controls = useRef<React.ComponentRef<typeof CameraControls>>(null);
  const didInit = useRef(false);

  const tour = useStore((s) => s.tour);
  const selectedCity = useStore((s) => s.selectedCity);
  const overviewNonce = useStore((s) => s.overviewNonce);
  const tierFilter = useStore((s) => s.tierFilter);
  const stateFilter = useStore((s) => s.stateFilter);

  // Mount precedence: decide tour vs deep-link vs reduced-motion (once).
  useEffect(() => {
    const cc = controls.current;
    if (!cc || didInit.current) return;
    didInit.current = true;
    cc.smoothTime = 0.7;

    const deepCity = INITIAL_CITY;
    if (deepCity) {
      useStore.getState().select(deepCity); // also ends the tour; resolver frames it
    } else if (prefersReducedMotion()) {
      useStore.getState().endTour(); // resolver settles to overview; captions show "Play tour"
    } else {
      useStore.getState().startTour();
    }
    useStore.getState().setIntroDone(true);

    // Cancel the tour the moment the user grabs the camera.
    const onControl = () => {
      if (useStore.getState().tour.status === "playing") useStore.getState().endTour();
    };
    cc.addEventListener("control", onControl);
    return () => cc.removeEventListener("control", onControl);
  }, []);

  // Resolver: derive the desired view from all state.
  useEffect(() => {
    const cc = controls.current;
    if (!cc || !didInit.current) return;

    if (tour.status === "playing") {
      const beat = TOUR[tour.beat];
      const c = beat.city ? BY_NAME.get(beat.city) : undefined;
      if (beat.view === "overview" || !c) frameOverview(cc, true);
      else if (beat.view === "closeup") frameCityClose(cc, c, true);
      else frameCity(cc, c, true);
      useStore.getState().setSpotlight(beat.spotlight && beat.city ? beat.city : null);
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

  // Ticker: advance tour beats on their timers.
  useEffect(() => {
    if (tour.status !== "playing") return;
    const id = setTimeout(() => useStore.getState().advanceTour(), TOUR[tour.beat].duration);
    return () => clearTimeout(id);
  }, [tour]);

  return <CameraControls ref={controls} makeDefault minDistance={60} maxDistance={9000} dollyToCursor />;
}
