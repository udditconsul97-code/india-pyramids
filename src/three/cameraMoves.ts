// Shared camera framing. Pure view math (cityView/boundsView) is unit-testable;
// the frame* appliers push a view onto any CameraControls-like object. Used by
// CameraRig (fly-to-city, overview), the tour, the state-filter reframe, and the
// deep-link — one place to tune the "flattering angle."

export type Vec3 = [number, number, number];
export interface View {
  pos: Vec3;
  target: Vec3;
}

// High-angle isometric overview framing all of India.
export const OVERVIEW: View = { pos: [180, 2750, 2350], target: [0, 90, 0] };

/** Frame a single city at a flattering downward angle, distance scaled to its height. */
export function cityView(c: { x: number; z: number; height: number }): View {
  const d = c.height * 1.9 + 140;
  return {
    pos: [c.x + d * 0.7, c.height * 1.05 + d * 0.55, c.z + d * 0.7],
    target: [c.x, c.height * 0.5, c.z],
  };
}

/** Tighter framing for the narrative close-up beats — pushes in toward the apex. */
export function cityCloseView(c: { x: number; z: number; height: number }): View {
  const d = c.height * 1.05 + 90;
  return {
    pos: [c.x + d * 0.55, c.height * 0.9 + d * 0.5, c.z + d * 0.55],
    target: [c.x, c.height * 0.6, c.z],
  };
}

/** Frame a cluster (filtered set) by its world bounds. */
export function boundsView(b: { cx: number; cz: number; span: number }): View {
  const d = Math.max(b.span * 0.9, 500) + 350;
  return {
    pos: [b.cx + d * 0.45, d * 0.95, b.cz + d * 0.7],
    target: [b.cx, 60, b.cz],
  };
}

// Minimal shape we need from drei's CameraControls — keeps appliers testable.
export interface Framer {
  setLookAt(
    px: number,
    py: number,
    pz: number,
    tx: number,
    ty: number,
    tz: number,
    enableTransition?: boolean,
  ): unknown;
}

// On wide screens, truck the camera left so India renders ~12% right of center,
// leaving the left margin clear for the tour captions / filters. 0 on narrow screens.
function panX(): number {
  if (typeof window === "undefined" || window.innerWidth < 760) return 0;
  return -380;
}

export function applyView(cc: Framer, v: View, transition: boolean): void {
  const dx = panX();
  cc.setLookAt(v.pos[0] + dx, v.pos[1], v.pos[2], v.target[0] + dx, v.target[1], v.target[2], transition);
}

export const frameCity = (cc: Framer, c: { x: number; z: number; height: number }, transition: boolean) =>
  applyView(cc, cityView(c), transition);

export const frameCityClose = (cc: Framer, c: { x: number; z: number; height: number }, transition: boolean) =>
  applyView(cc, cityCloseView(c), transition);

export const frameBounds = (cc: Framer, b: { cx: number; cz: number; span: number }, transition: boolean) =>
  applyView(cc, boundsView(b), transition);

export const frameOverview = (cc: Framer, transition: boolean) => applyView(cc, OVERVIEW, transition);
