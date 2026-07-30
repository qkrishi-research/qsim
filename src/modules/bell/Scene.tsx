import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { arg, abs, reducedBlochVector, type QuantumState } from "@/engine";
import { BlochSphere, blochToThree } from "@/render/primitives/BlochSphere";
import { useBellStore, jointProbabilities, correlation } from "./store";

const BASIS_LABELS = ["00", "01", "10", "11"];

export function Scene() {
  const state = useBellStore((s) => s.state);
  const thetaA = useBellStore((s) => s.thetaA);
  const thetaB = useBellStore((s) => s.thetaB);

  const e = correlation(jointProbabilities(state, thetaA, thetaB));

  return (
    <group position={[0, 0.15, 0]} scale={0.7}>
      <ReducedSphere state={state} qubit={0} theta={thetaA} position={[-2.5, 0.35, 0]} label="A" />
      <AmplitudeBars state={state} />
      <ReducedSphere state={state} qubit={1} theta={thetaB} position={[2.5, 0.35, 0]} label="B" />

      <Html position={[0, 2.15, 0]} center distanceFactor={7} className="pointer-events-none select-none">
        <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface/85 px-3 py-1 shadow-sm backdrop-blur-sm">
          <span className="text-[12px] text-ink-muted">Correlation</span>
          <span className="font-mono text-[13px] font-semibold" style={{ color: e >= 0 ? "hsl(var(--signal-measure))" : "hsl(var(--signal-phase))" }}>
            {e >= 0 ? "+" : "−"}
            {Math.abs(e).toFixed(2)}
          </span>
        </div>
      </Html>
    </group>
  );
}

/** Hue-maps a complex phase so a sign flip (phase π) is visibly distinct. */
function phaseColor(phase: number): string {
  const hue = 220 + (phase / Math.PI) * 62;
  return `hsl(${hue} 68% 55%)`;
}

function AmplitudeBars({ state }: { state: QuantumState }) {
  return (
    <group position={[0, -0.75, 0]}>
      {state.amplitudes.map((amp, i) => (
        <Bar
          key={i}
          x={(i - 1.5) * 0.62}
          probability={abs(amp) ** 2}
          color={phaseColor(arg(amp))}
          label={BASIS_LABELS[i]}
          significant={abs(amp) > 1e-4}
        />
      ))}
      <Html position={[0, -0.62, 0]} center distanceFactor={7} className="pointer-events-none select-none">
        <span className="whitespace-nowrap text-[11px] text-ink-faint">joint state — |basis⟩ probabilities</span>
      </Html>
    </group>
  );
}

function Bar({
  x,
  probability,
  color,
  label,
  significant,
}: {
  x: number;
  probability: number;
  color: string;
  label: string;
  significant: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const height = Math.max(probability * 2.0, 0.001);

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    const k = 1 - Math.exp(-10 * Math.min(dt, 0.1));
    m.scale.y += (height - m.scale.y) * k;
    m.position.y = m.scale.y / 2;
  });

  return (
    <group position={[x, 0, 0]}>
      {/* base tick */}
      <mesh position={[0, -0.006, 0]}>
        <boxGeometry args={[0.44, 0.012, 0.44]} />
        <meshStandardMaterial color="#d3d9e4" />
      </mesh>
      <mesh ref={mesh} castShadow>
        <boxGeometry args={[0.4, 1, 0.4]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.35}
          metalness={0.05}
          transparent
          opacity={significant ? 0.95 : 0.15}
        />
      </mesh>
      <Html position={[0, -0.18, 0]} center distanceFactor={6.5} className="pointer-events-none select-none">
        <span className="whitespace-nowrap font-mono text-[12px] text-ink-muted">|{label}⟩</span>
      </Html>
    </group>
  );
}

function ReducedSphere({
  state,
  qubit,
  theta,
  position,
  label,
}: {
  state: QuantumState;
  qubit: number;
  theta: number;
  position: [number, number, number];
  label: string;
}) {
  const reduced = reducedBlochVector(state, qubit);
  const radius = 0.62;

  // Measurement direction n(θ) in the X–Z plane → Three coords.
  const n = blochToThree({ x: Math.sin(theta), y: 0, z: Math.cos(theta) }, radius * 1.25);

  return (
    <group position={position}>
      <BlochSphere vector={reduced} radius={radius} showLabels={false} color="#1d4ed8" />

      {/* Measurement axis */}
      <Line
        points={[
          [-n.x, -n.y, -n.z],
          [n.x, n.y, n.z],
        ]}
        color="#0d9488"
        lineWidth={2}
        transparent
        opacity={0.7}
      />
      <mesh position={[n.x, n.y, n.z]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#0d9488" />
      </mesh>

      <Html position={[0, radius + 0.4, 0]} center distanceFactor={6} className="pointer-events-none select-none">
        <div className="flex flex-col items-center gap-0.5 whitespace-nowrap text-center">
          <span className="text-[12px] font-medium text-ink">Qubit {label}</span>
          <span className="text-[10px] text-ink-faint">local view</span>
        </div>
      </Html>
    </group>
  );
}
