import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { QuantumState } from "@/engine";
import { BlochSphere, blochToThree } from "@/render/primitives/BlochSphere";
import { useMeasurementStore, bases } from "./store";

const RADIUS = 1.3;

export function Scene() {
  const qubit = useMeasurementStore((s) => s.qubit);
  const basis = useMeasurementStore((s) => s.basis);
  const setBlochAngles = useMeasurementStore((s) => s.setBlochAngles);
  const collapseToken = useMeasurementStore((s) => s.collapseToken);
  const lastOutcome = useMeasurementStore((s) => s.lastOutcome);

  const info = bases[basis];
  const axis = blochToThree(
    { x: info.axis[0], y: info.axis[1], z: info.axis[2] },
    RADIUS * 1.28
  );

  const flashPos =
    lastOutcome !== null
      ? blochToThree(
          QuantumState.fromBlochAngles(...info.eigen[lastOutcome].angles).blochVector(),
          RADIUS
        )
      : new THREE.Vector3();

  return (
    <group position={[0, 0.05, 0]} scale={0.92}>
      <BlochSphere
        vector={qubit.blochVector()}
        radius={RADIUS}
        interactive
        onChange={setBlochAngles}
      />

      {/* Highlighted measurement axis */}
      <Line
        points={[
          [-axis.x, -axis.y, -axis.z],
          [axis.x, axis.y, axis.z],
        ]}
        color={info.color}
        lineWidth={2.5}
        transparent
        opacity={0.55}
      />
      <mesh position={[axis.x, axis.y, axis.z]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={info.color} />
      </mesh>
      <mesh position={[-axis.x, -axis.y, -axis.z]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={info.color} />
      </mesh>

      <CollapseFlash token={collapseToken} position={flashPos} color={info.color} />
    </group>
  );
}

function CollapseFlash({
  token,
  position,
  color,
}: {
  token: number;
  position: THREE.Vector3;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(1);

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
    t.current = Math.min(1, t.current + dt * 2.4);
    const e = t.current;
    mesh.visible = true;
    mesh.scale.setScalar(0.2 + e * 1.4);
    (mesh.material as THREE.MeshBasicMaterial).opacity = (1 - e) * 0.65;
  });

  return (
    <mesh ref={ref} position={position} visible={false}>
      <sphereGeometry args={[0.3, 24, 24]} />
      <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
