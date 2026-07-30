import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Lighting } from "./Lighting";
import { Stage } from "./Stage";
import { CameraRig } from "./CameraRig";
import { Effects } from "./Effects";
import { SceneManager } from "@/render/SceneManager";

/**
 * The rendering surface. Establishes the colour-managed, physically lit
 * pipeline shared by every module. It owns lighting, grounding, camera
 * navigation and post-processing — never any quantum mathematics. The active
 * module's scene is resolved by {@link SceneManager}.
 */
export function RenderCanvas() {
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 2]}
      gl={{
        antialias: false,
        alpha: false,
        stencil: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      camera={{ position: [3.7, 2.5, 4.7], fov: 42, near: 0.1, far: 100 }}
    >
      <color attach="background" args={["#fbfcfe"]} />

      <Suspense fallback={null}>
        <Lighting />
        <Stage />
        <SceneManager />
      </Suspense>

      <CameraRig />
      <Effects />
    </Canvas>
  );
}
