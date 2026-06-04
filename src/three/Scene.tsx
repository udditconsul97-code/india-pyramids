import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "../store";
import Land, { GroundShadows } from "./Land";
import Pyramids from "./Pyramids";
import CameraRig from "./CameraRig";
import Effects from "./Effects";
import { QUALITY, QualityMonitor } from "./useQuality";

const BG = {
  dark: "linear-gradient(180deg, #0C0C13 0%, #15151F 55%, #1C1C2A 100%)",
  light: "linear-gradient(180deg, #E2E6F0 0%, #EEF0F6 55%, #F6F7FA 100%)",
};
const FOG = { dark: "#161620", light: "#E9EBF2" };

export default function Scene() {
  const theme = useStore((s) => s.theme);
  const tier = useStore((s) => s.qualityTier);
  const q = QUALITY[tier];

  return (
    <div style={{ position: "absolute", inset: 0, background: BG[theme] }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ position: [180, 2750, 2350], near: 1, far: 20000, fov: 45 }}
      >
        <QualityMonitor />
        <fog attach="fog" args={[FOG[theme], 2200, 7000]} />
        <ambientLight intensity={theme === "dark" ? 0.45 : 0.7} />
        <hemisphereLight
          intensity={theme === "dark" ? 0.35 : 0.5}
          color={theme === "dark" ? "#9aa3c0" : "#ffffff"}
          groundColor={theme === "dark" ? "#0c0c13" : "#cfd2dc"}
        />
        {/* Shadow casting is gated by the quality tier (low tier = off, the silent phone cost). */}
        <directionalLight
          position={[1400, 2600, 1100]}
          intensity={theme === "dark" ? 1.5 : 2.0}
          castShadow={q.shadows === "high"}
          shadow-mapSize={[q.shadowMapSize, q.shadowMapSize]}
          shadow-bias={-0.0004}
          shadow-camera-near={100}
          shadow-camera-far={7000}
          shadow-camera-left={-1900}
          shadow-camera-right={1900}
          shadow-camera-top={1900}
          shadow-camera-bottom={-1900}
        />

        {/* Offline-safe environment (procedural Lightformers, no network fetch). */}
        <Environment resolution={256}>
          <Lightformer intensity={1.2} position={[0, 5, -8]} scale={[12, 12, 1]} color="#cdd6ff" />
          <Lightformer intensity={0.7} position={[-8, 4, 4]} scale={[8, 8, 1]} color="#ffe9c7" />
          <Lightformer intensity={0.5} position={[8, 3, 4]} scale={[8, 8, 1]} color="#ffffff" />
        </Environment>

        <Land />
        <Pyramids />
        <GroundShadows />
        <CameraRig />
        <Effects />
      </Canvas>
    </div>
  );
}
