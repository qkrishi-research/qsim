import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

/**
 * Orbit navigation with damped, restrained motion. Consumes the store's
 * camera-reset token to smoothly recentre the view on demand.
 */
export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);
  const resetToken = useWorkspaceStore((s) => s.cameraResetToken);

  useEffect(() => {
    controls.current?.reset();
  }, [resetToken]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.65}
      zoomSpeed={0.7}
      minDistance={2.5}
      maxDistance={9}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI - 0.35}
      target={[0, 0, 0]}
    />
  );
}
