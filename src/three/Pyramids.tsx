import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Billboard, Text, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { prefersReducedMotion } from "../ui/useReducedMotion";

const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
import { useStore } from "../store";
import { TIER_PCT, TIER_COLORS, fmt, type Tier } from "../data/income";
import {
  BY_TIER,
  BY_NAME,
  TIER_BASE_HEIGHT,
  BASE_HALF_FACTOR,
  TIERS,
  bandBoundaries,
  type Layout,
} from "./cityLayout";

const SQRT2 = Math.SQRT2;

// Bands bottom -> top. index 0 = grey "below-middle" mass; 1..4 = lm/um/af/ur.
const BAND_BASE_COLORS = ["", "#1D9E75", "#0F6E56", "#EF9F27", "#D85A30"];
const GREY = { dark: "#3A3A4A", light: "#C9C9D2" };
const EMISSIVE_INTENSITY = [0.04, 0.13, 0.13, 0.16, 0.24];

// instanceState values consumed by the highlight shader.
const S_NORMAL = 0, S_HOVER = 1, S_SELECTED = 2, S_DIM = 3;

function patchHighlight(mat: THREE.MeshStandardMaterial) {
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float instanceState;\nvarying float vState;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\n  vState = instanceState;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vState;")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
  if (vState > 2.5) {
    float g = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
    diffuseColor.rgb = mix(vec3(g), diffuseColor.rgb, 0.3) * 0.42;
    totalEmissiveRadiance *= 0.12;
  } else if (vState > 1.5) {
    totalEmissiveRadiance += diffuseColor.rgb * 0.55;
  } else if (vState > 0.5) {
    totalEmissiveRadiance += diffuseColor.rgb * 0.32;
  }`
      );
  };
  mat.customProgramCacheKey = () => "pyramid-highlight";
}

// One square frustum geometry for [f0,f1] of a tier reference height, base at y=0.
function frustum(H0: number, f0: number, f1: number): THREE.CylinderGeometry {
  const baseHalf = BASE_HALF_FACTOR * H0;
  const sBottom = baseHalf * (1 - f0);
  const sTop = baseHalf * (1 - f1);
  const h = (f1 - f0) * H0;
  const geo = new THREE.CylinderGeometry(sTop * SQRT2, sBottom * SQRT2, h, 4, 1, false, Math.PI / 4);
  geo.translate(0, ((f0 + f1) / 2) * H0, 0);
  return geo;
}

export default function Pyramids() {
  const theme = useStore((s) => s.theme);

  // Geometry + per-tier state attribute (stable across renders/theme).
  const tiers = useMemo(() => {
    return TIERS.map((tier) => {
      const cities = BY_TIER[tier];
      const count = cities.length;
      const H0 = TIER_BASE_HEIGHT[tier];
      const f = bandBoundaries(tier);
      const stateArr = new Float32Array(count);
      const stateAttr = new THREE.InstancedBufferAttribute(stateArr, 1);
      stateAttr.setUsage(THREE.DynamicDrawUsage);

      const bandGeos = [0, 1, 2, 3, 4].map((b) => {
        const g = frustum(H0, f[b], f[b + 1]);
        g.setAttribute("instanceState", stateAttr);
        return g;
      });

      // whole-pyramid cone for raycast hit-testing
      const hitGeo = new THREE.CylinderGeometry(0, BASE_HALF_FACTOR * H0 * SQRT2, H0, 4, 1, false, Math.PI / 4);
      hitGeo.translate(0, H0 / 2, 0);

      return { tier, cities, count, bandGeos, hitGeo, stateArr, stateAttr };
    });
  }, []);

  // Materials are built once (stable across theme toggles) and disposed on unmount.
  // The only theme-dependent value is the grey base band color, updated in place
  // by the effect below — recreating materials per toggle would leak GPU programs
  // and recompile the patched shaders.
  const materialsByTier = useMemo(() => {
    return tiers.map(() =>
      [0, 1, 2, 3, 4].map((b) => {
        const color = b === 0 ? GREY.dark : BAND_BASE_COLORS[b];
        const m = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: EMISSIVE_INTENSITY[b],
          roughness: b === 0 ? 0.92 : 0.5,
          metalness: 0,
        });
        patchHighlight(m);
        return m;
      })
    );
  }, [tiers]);

  useEffect(() => {
    const grey = theme === "dark" ? GREY.dark : GREY.light;
    for (const row of materialsByTier) {
      row[0].color.set(grey);
      row[0].emissive.set(grey);
    }
  }, [materialsByTier, theme]);

  useEffect(() => {
    return () => {
      for (const row of materialsByTier) for (const m of row) m.dispose();
    };
  }, [materialsByTier]);

  const hitMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    []
  );

  const visualRefs = useRef<Record<string, THREE.InstancedMesh | null>>({});
  const hitRefs = useRef<Record<number, THREE.InstancedMesh | null>>({});

  const tierFilter = useStore((s) => s.tierFilter);
  const stateFilter = useStore((s) => s.stateFilter);
  const hoveredCity = useStore((s) => s.hoveredCity);
  const selectedCity = useStore((s) => s.selectedCity);
  const spotlightCity = useStore((s) => s.spotlightCity);

  const visible = (c: Layout) =>
    (tierFilter === 0 || c.tier === tierFilter) && (stateFilter === "ALL" || c.state === stateFilter);

  // Write all instance matrices, scaling each city by scaleOf(city). Filtered-out -> 0.
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const writeMatrices = useCallback(
    (scaleOf: (c: Layout) => number) => {
      for (const t of tiers) {
        t.cities.forEach((c, i) => {
          const k = scaleOf(c);
          dummy.position.set(c.x, 0, c.z);
          dummy.scale.set(k, k, k);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          for (let b = 0; b < 5; b++) visualRefs.current[`${t.tier}-${b}`]?.setMatrixAt(i, dummy.matrix);
          hitRefs.current[t.tier]?.setMatrixAt(i, dummy.matrix);
        });
        for (let b = 0; b < 5; b++) {
          const m = visualRefs.current[`${t.tier}-${b}`];
          if (m) m.instanceMatrix.needsUpdate = true;
        }
        const h = hitRefs.current[t.tier];
        if (h) h.instanceMatrix.needsUpdate = true;
      }
    },
    [tiers, dummy]
  );

  // Ground-rise reveal: scale 0 -> k, swept west->east, easing out. Owns the matrices
  // until it finishes; reduced-motion skips it (revealDone starts true).
  const revealDone = useRef(prefersReducedMotion());
  const revealStart = useRef<number | null>(null);
  const REVEAL_RISE = 0.9, REVEAL_STAGGER = 0.7;
  useFrame((state) => {
    if (revealDone.current) return;
    if (revealStart.current === null) revealStart.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - revealStart.current;
    writeMatrices((c) => {
      if (!visible(c)) return 0;
      const delay = ((c.x + 1500) / 3000) * REVEAL_STAGGER;
      const p = Math.min(Math.max((t - delay) / REVEAL_RISE, 0), 1);
      return c.k * easeOutCubic(p);
    });
    if (t >= REVEAL_RISE + REVEAL_STAGGER) {
      revealDone.current = true;
      writeMatrices((c) => (visible(c) ? c.k : 0)); // settle to exact final scale
    }
  });

  // Filter changes after the reveal re-apply full matrices (reveal owns them before that).
  useEffect(() => {
    if (!revealDone.current) return;
    writeMatrices((c) => (visible(c) ? c.k : 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiers, tierFilter, stateFilter, writeMatrices]);

  // Per-instance highlight/dim state. A selected city or a tour spotlight both focus
  // one city and dim the rest (the spotlight is what the narrative tour drives).
  useEffect(() => {
    const focus = selectedCity ?? spotlightCity;
    const anyFocus = !!focus;
    for (const t of tiers) {
      t.cities.forEach((c, i) => {
        let s = S_NORMAL;
        if (!visible(c)) s = S_NORMAL;
        else if (c.name === focus) s = S_SELECTED;
        else if (anyFocus) s = S_DIM;
        else if (c.name === hoveredCity) s = S_HOVER;
        t.stateArr[i] = s;
      });
      t.stateAttr.needsUpdate = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiers, hoveredCity, selectedCity, spotlightCity, tierFilter, stateFilter]);

  const onMove = (tier: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const id = e.instanceId;
    if (id == null) return;
    const c = BY_TIER[tier as Tier][id];
    if (c && visible(c) && useStore.getState().hoveredCity !== c.name) useStore.getState().hover(c.name);
  };
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (useStore.getState().hoveredCity) useStore.getState().hover(null);
  };
  const onClick = (tier: number) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const id = e.instanceId;
    if (id == null) return;
    const c = BY_TIER[tier as Tier][id];
    if (c && visible(c)) useStore.getState().select(c.name);
  };

  // ---- Labels ----
  const labels = useMemo(() => {
    const set = new Map<string, Layout>();
    for (const c of BY_TIER[1]) set.set(c.name, c); // always-on Tier-1
    if (hoveredCity && BY_NAME.has(hoveredCity)) set.set(hoveredCity, BY_NAME.get(hoveredCity)!);
    if (selectedCity && BY_NAME.has(selectedCity)) set.set(selectedCity, BY_NAME.get(selectedCity)!);
    const khurja = BY_NAME.get("Khurja");
    if (khurja) set.set("Khurja", khurja);
    return [...set.values()].filter(visible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredCity, selectedCity, tierFilter, stateFilter]);

  const labelColor = theme === "dark" ? "#F2F2F7" : "#1A1A22";
  const labelOutline = theme === "dark" ? "#0B0B12" : "#FFFFFF";
  const hovered = hoveredCity ? BY_NAME.get(hoveredCity) : undefined;

  return (
    <group>
      {tiers.map((t) =>
        [0, 1, 2, 3, 4].map((b) => (
          <instancedMesh
            key={`${t.tier}-${b}`}
            ref={(m) => {
              visualRefs.current[`${t.tier}-${b}`] = m;
            }}
            args={[t.bandGeos[b], materialsByTier[t.tier - 1][b], t.count]}
            castShadow
            receiveShadow
            frustumCulled={false}
          />
        ))
      )}

      {tiers.map((t) => (
        <instancedMesh
          key={`hit-${t.tier}`}
          ref={(m) => {
            hitRefs.current[t.tier] = m;
          }}
          args={[t.hitGeo, hitMaterial, t.count]}
          frustumCulled={false}
          onPointerMove={onMove(t.tier)}
          onPointerOut={onOut}
          onClick={onClick(t.tier)}
        />
      ))}

      {labels.map((c) => {
        const isKhurja = c.name === "Khurja";
        const size = c.tier === 1 ? 30 : c.tier === 2 ? 22 : 18;
        return (
          <Billboard key={c.name} position={[c.x, c.height + size * 1.6, c.z]}>
            {isKhurja && (
              <Text fontSize={size * 1.3} position={[0, size * 1.5, 0]} color="#F5B301" anchorX="center" anchorY="middle" outlineWidth={size * 0.06} outlineColor={labelOutline}>
                ★
              </Text>
            )}
            <Text
              fontSize={size}
              color={isKhurja ? "#F5B301" : labelColor}
              anchorX="center"
              anchorY="middle"
              outlineWidth={size * 0.08}
              outlineColor={labelOutline}
            >
              {c.name}
            </Text>
          </Billboard>
        );
      })}

      {hovered && hovered.name !== selectedCity && (
        <Html position={[hovered.x, hovered.height + 18, hovered.z]} center distanceFactor={1400} style={{ pointerEvents: "none" }} zIndexRange={[20, 0]}>
          <div
            style={{
              whiteSpace: "nowrap",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 13,
              padding: "5px 9px",
              borderRadius: 7,
              background: theme === "dark" ? "rgba(20,20,28,0.92)" : "rgba(255,255,255,0.95)",
              color: theme === "dark" ? "#fff" : "#1a1a22",
              border: `1px solid ${TIER_COLORS[hovered.tier].border}`,
              boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
            }}
          >
            <strong>{hovered.name}</strong>
            <span style={{ opacity: 0.7 }}>
              {" "}· {TIER_COLORS[hovered.tier].label} · {fmt(hovered.pop)}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

// Re-export so the detail panel can compute counts without re-deriving.
export { TIER_PCT };
