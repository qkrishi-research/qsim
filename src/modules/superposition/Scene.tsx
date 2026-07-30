import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { BlochSphere } from "@/render/primitives/BlochSphere";
import { useSuperpositionStore } from "./store";

export function Scene() {
  const qubit = useSuperpositionStore((s) => s.qubit);
  const setBlochAngles = useSuperpositionStore((s) => s.setBlochAngles);
  const collapseToken = useSuperpositionStore((s) => s.collapseToken);
  const collapsedTo = useSuperpositionStore((s) => s.collapsedTo);

  const bloch = qubit.blochVector();

  return (
    <group position={[0, 0.05, 0]}>
      <BlochSphere vector={bloch} radius={1.15} interactive onChange={setBlochAngles} />
      <CollapseFlash token={collapseToken} pole={collapsedTo} radius={1.15} />

      <Html
        position={[0, -2.05, 0]}
        center
        distanceFactor={9}
        className="pointer-events-none select-none"
      >
        <span className="whitespace-nowrap text-[11px] text-ink-faint">
          Drag the sphere to prepare a state
        </span>
      </Html>
    </group>
  );
}

/**
 * A brief expanding halo at the measured pole, triggered whenever a real
 * collapse occurs. It communicates the abruptness of measurement without any
 * persistent scene change.
 */
function CollapseFlash({
  token,
  pole,
  radius,
}: {
  token: number;
  pole: 0 | 1 | null;
  radius: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(1); // 1 = finished (invisible)

  useEffect(() => {
    if (token > 0) t.current = 0;
  }, [token]);

  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    if (t.current >= 1) {
      mesh.visible = false;
      return;
    }
    t.current = Math.min(1, t.current + dt * 2.2);
    const e = t.current;
    mesh.visible = true;
    const scale = 0.2 + e * 1.3;
    mesh.scale.setScalar(scale);
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.opacity = (1 - e) * 0.7;
  });

  const y = pole === 1 ? -radius : radius;

  return (
    <mesh ref={ref} position={[0, y, 0]} visible={false}>
      <sphereGeometry args={[0.28, 24, 24]} />
      <meshBasicMaterial
        color={pole === 1 ? "#7c3aed" : "#1d4ed8"}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  );
}
