import { useMemo } from "react";
import * as THREE from "three";
import { ContactShadows } from "@react-three/drei";
import { INDIA, shapePoint } from "./useProjection";
import { useStore } from "../store";

// Colored landmass so India reads as a distinct map under the (green/amber/red)
// pyramids, on both dark and light backgrounds. Cool blue contrasts the warm pyramids;
// bright state borders make the outline easy to see.
const LAND = { dark: "#2B486E", light: "#BFD4EF" };
const BORDER = { dark: "#82B1E6", light: "#4D79B0" };

export default function Land() {
  const theme = useStore((s) => s.theme);

  const { fillGeo, borderGeo } = useMemo(() => {
    const shapes: THREE.Shape[] = [];
    const segPts: number[] = [];

    const addRingToShape = (ring: number[][], shape: THREE.Shape, isHole: boolean) => {
      const path = isHole ? new THREE.Path() : shape;
      ring.forEach((c, i) => {
        const [x, y] = shapePoint(c[1], c[0]);
        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      });
      if (isHole) shape.holes.push(path as THREE.Path);
    };

    const addRingToBorders = (ring: number[][]) => {
      for (let i = 0; i < ring.length - 1; i++) {
        const a = shapePoint(ring[i][1], ring[i][0]);
        const b = shapePoint(ring[i + 1][1], ring[i + 1][0]);
        segPts.push(a[0], a[1], 1.2, b[0], b[1], 1.2);
      }
    };

    for (const f of INDIA.features) {
      const polys =
        f.geometry.type === "Polygon"
          ? [f.geometry.coordinates]
          : f.geometry.coordinates;
      for (const poly of polys as number[][][][]) {
        const shape = new THREE.Shape();
        (poly as number[][][]).forEach((ring, ri) => {
          addRingToShape(ring, shape, ri > 0);
          addRingToBorders(ring);
        });
        shapes.push(shape);
      }
    }

    const fillGeo = new THREE.ShapeGeometry(shapes);
    const borderGeo = new THREE.BufferGeometry();
    borderGeo.setAttribute("position", new THREE.Float32BufferAttribute(segPts, 3));
    return { fillGeo, borderGeo };
  }, []);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={fillGeo} receiveShadow>
        <meshStandardMaterial
          color={theme === "dark" ? LAND.dark : LAND.light}
          roughness={1}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments geometry={borderGeo}>
        <lineBasicMaterial
          color={theme === "dark" ? BORDER.dark : BORDER.light}
          transparent
          opacity={0.8}
        />
      </lineSegments>
    </group>
  );
}

export function GroundShadows() {
  // Rendered in world space (not the rotated land group). Sits just above y=0.
  return (
    <ContactShadows
      position={[0, 0.4, 0]}
      scale={3400}
      far={400}
      blur={2.2}
      opacity={0.45}
      resolution={1024}
    />
  );
}
