import { SoftShadows } from "@react-three/drei";

/**
 * Physically plausible three-point lighting tuned for a white studio.
 * Kept restrained: a soft key with contact shadows, a cool fill, and a
 * gentle rim to separate objects from the near-white background.
 */
export function Lighting() {
  return (
    <>
      <SoftShadows size={26} samples={16} focus={0.9} />

      <hemisphereLight
        intensity={0.55}
        color="#ffffff"
        groundColor="#d7dde8"
      />
      <ambientLight intensity={0.25} />

      <directionalLight
        castShadow
        position={[4.5, 7, 5]}
        intensity={2.1}
        color="#fffaf2"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-6, 6, 6, -6, 0.1, 30]}
        />
      </directionalLight>

      <directionalLight position={[-6, 3, -4]} intensity={0.5} color="#eaf0ff" />
      <directionalLight position={[0, 2, -7]} intensity={0.35} color="#ffffff" />
    </>
  );
}
