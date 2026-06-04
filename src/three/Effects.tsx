import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useQuality } from "./useQuality";

/**
 * Bloom spike (T2). Luminance-threshold bloom: only pixels brighter than the
 * threshold bloom, and the ultra-rich apex band (emissive) is the only
 * intentionally-bright thing in the scene — so the gold tip glows and the grey
 * base / middle bands don't. Threshold avoids the InstancedMesh-subset problem
 * that stock SelectiveBloom can't express. Mounted only on the high tier.
 */
export default function Effects() {
  const q = useQuality();
  if (q.bloom !== "threshold") return null;
  return (
    <EffectComposer>
      <Bloom
        mipmapBlur
        luminanceThreshold={0.6}
        luminanceSmoothing={0.25}
        intensity={0.9}
        radius={0.7}
      />
    </EffectComposer>
  );
}
