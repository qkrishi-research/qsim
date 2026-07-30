import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { damp3 } from "../animation";

const UP = new THREE.Vector3(0, 1, 0);

interface ArrowProps {
  /** Target tip position relative to the arrow's origin. Animated smoothly. */
  target: THREE.Vector3;
  /**
   * Optional live target read every frame. When present it overrides `target`,
   * letting a parent drive the tip along an exact animated path (e.g. a gate
   * rotation) rather than a straight-line damp.
   */
  follow?: React.MutableRefObject<THREE.Vector3 | null>;
  color?: string;
  shaftRadius?: number;
  headLength?: number;
  headRadius?: number;
  /** Smoothing rate for the tip animation. Set high for near-instant tracking. */
  lambda?: number;
  opacity?: number;
}

/**
 * A vector arrow authored along +Y and re-oriented each frame toward `target`.
 * It damps to its target so state changes read as a physical sweep rather than
 * a snap. Purely presentational — it holds no quantum state.
 */
export function Arrow({
  target,
  follow,
  color = "#1d4ed8",
  shaftRadius = 0.018,
  headLength = 0.16,
  headRadius = 0.055,
  lambda = 12,
  opacity = 1,
}: ArrowProps) {
  const group = useRef<THREE.Group>(null);
  const shaft = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Mesh>(null);
  const current = useRef(new THREE.Vector3().copy(target));

  useFrame((_, dt) => {
    const g = group.current;
    const s = shaft.current;
    const h = head.current;
    if (!g || !s || !h) return;

    const tgt = follow?.current ?? target;
    damp3(current.current, tgt, lambda, Math.min(dt, 0.1));
    const length = current.current.length();
    if (length < 1e-4) {
      g.visible = false;
      return;
    }
    g.visible = true;

    const dir = current.current.clone().divideScalar(length);
    g.quaternion.setFromUnitVectors(UP, dir);

    const shaftLength = Math.max(length - headLength, 0.001);
    s.scale.set(1, shaftLength, 1);
    s.position.y = shaftLength / 2;
    h.position.y = shaftLength + headLength / 2;
  });

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.05,
        transparent: opacity < 1,
        opacity,
      }),
    [color, opacity]
  );

  return (
    <group ref={group}>
      <mesh ref={shaft} material={material} castShadow>
        <cylinderGeometry args={[shaftRadius, shaftRadius, 1, 24]} />
      </mesh>
      <mesh ref={head} material={material} castShadow>
        <coneGeometry args={[headRadius, headLength, 28]} />
      </mesh>
    </group>
  );
}
