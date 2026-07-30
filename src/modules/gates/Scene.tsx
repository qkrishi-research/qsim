import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BlochSphere, blochToThree } from "@/render/primitives/BlochSphere";
import { useGatesStore } from "./store";

const RADIUS = 1.3;
const DURATION = 0.55;

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function Scene() {
  const qubit = useGatesStore((s) => s.qubit);
  const rotationToken = useGatesStore((s) => s.rotationToken);
  const lastRotation = useGatesStore((s) => s.lastRotation);

  const b0 = qubit.blochVector();
  const displayPhys = useRef(new THREE.Vector3(b0.x, b0.y, b0.z));
  const displayThree = useRef<THREE.Vector3 | null>(
    blochToThree(b0, RADIUS)
  );

  const anim = useRef({
    active: false,
    from: new THREE.Vector3(),
    axis: new THREE.Vector3(),
    angle: 0,
    elapsed: 0,
  });

  // Each state change either starts a geodesic rotation or snaps (undo/reset).
  useEffect(() => {
    const b = qubit.blochVector();
    if (lastRotation) {
      anim.current = {
        active: true,
        from: displayPhys.current.clone(),
        axis: new THREE.Vector3(...lastRotation.axis).normalize(),
        angle: lastRotation.angle,
        elapsed: 0,
      };
    } else {
      anim.current.active = false;
      displayPhys.current.set(b.x, b.y, b.z);
      displayThree.current = blochToThree(b, RADIUS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotationToken]);

  useFrame((_, dt) => {
    const a = anim.current;
    if (!a.active) return;
    a.elapsed += Math.min(dt, 0.05);
    const t = Math.min(1, a.elapsed / DURATION);
    const rotated = a.from
      .clone()
      .applyAxisAngle(a.axis, a.angle * easeInOut(t));
    displayPhys.current.copy(rotated);
    displayThree.current = blochToThree(
      { x: rotated.x, y: rotated.y, z: rotated.z },
      RADIUS
    );
    if (t >= 1) {
      a.active = false;
      const b = qubit.blochVector(); // Correct any numerical drift.
      displayPhys.current.set(b.x, b.y, b.z);
      displayThree.current = blochToThree(b, RADIUS);
    }
  });

  return (
    <group position={[0, 0.05, 0]} scale={0.92}>
      <BlochSphere vector={b0} radius={RADIUS} follow={displayThree} />
    </group>
  );
}
