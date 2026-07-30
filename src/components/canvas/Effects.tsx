import { EffectComposer, SMAA } from "@react-three/postprocessing";

/**
 * Deliberately restrained post-processing. High-quality edge anti-aliasing
 * only — soft shadows and contact occlusion are handled in the scene so the
 * white studio stays clean and scientifically legible.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <SMAA />
    </EffectComposer>
  );
}
