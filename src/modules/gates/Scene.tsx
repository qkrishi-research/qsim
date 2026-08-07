import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";
import {
  arg,
  abs,
  reducedBlochVector,
  applyGate,
  applySingleQubitGate,
  type QuantumState,
} from "@/engine";
import { BlochSphere, blochToThree } from "@/render/primitives/BlochSphere";
import { Arrow } from "@/render/primitives/Arrow";
import { useGatesStore } from "./store";
import { getGateDef } from "./gateLibrary";

export function Scene() {
  const register = useGatesStore((s) => s.register);
  return register === "single" ? <SingleScene /> : <TwoScene />;
}

/* ── Single-qubit: Bloch evolution along the true rotation geodesic ─────── */

const RADIUS = 1.3;
const DURATION = 0.55;
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Great-circle arc between two points at a fixed radius (Three coords). */
function arcPoints(
  from: THREE.Vector3,
  to: THREE.Vector3,
  r: number,
  segments = 36
): [number, number, number][] {
  const f = from.clone().normalize();
  const t = to.clone().normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(f, t);
  const identity = new THREE.Quaternion();
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const qi = new THREE.Quaternion().slerpQuaternions(identity, q, i / segments);
    const v = f.clone().applyQuaternion(qi).multiplyScalar(r);
    pts.push([v.x, v.y, v.z]);
  }
  return pts;
}

function SingleScene() {
  const qubit = useGatesStore((s) => s.singleState);
  const rotationToken = useGatesStore((s) => s.rotationToken);
  const lastRotation = useGatesStore((s) => s.lastRotation);
  const selectedId = useGatesStore((s) => s.selectedId);
  const angle = useGatesStore((s) => s.angle);

  const b0 = qubit.blochVector();
  const displayPhys = useRef(new THREE.Vector3(b0.x, b0.y, b0.z));
  const displayThree = useRef<THREE.Vector3 | null>(blochToThree(b0, RADIUS));
  const anim = useRef({
    active: false,
    from: new THREE.Vector3(),
    axis: new THREE.Vector3(),
    angle: 0,
    elapsed: 0,
  });

  useEffect(() => {
    const b = qubit.blochVector();
    if (lastRotation && Math.abs(lastRotation.angle) > 1e-6) {
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
    const rotated = a.from.clone().applyAxisAngle(a.axis, a.angle * easeInOut(t));
    displayPhys.current.copy(rotated);
    displayThree.current = blochToThree(
      { x: rotated.x, y: rotated.y, z: rotated.z },
      RADIUS
    );
    if (t >= 1) {
      a.active = false;
      const b = qubit.blochVector();
      displayPhys.current.set(b.x, b.y, b.z);
      displayThree.current = blochToThree(b, RADIUS);
    }
  });

  // Live preview: where the selected gate (at the current angle) would send it.
  const def = getGateDef(selectedId);
  const previewBloch = applySingleQubitGate(qubit, def.make(angle), 0).blochVector();
  const currentThree = blochToThree(b0, RADIUS);
  const previewThree = blochToThree(previewBloch, RADIUS);

  return (
    <group position={[0, 0.05, 0]} scale={0.92}>
      <BlochSphere vector={b0} radius={RADIUS} follow={displayThree} trail />
      <PreviewVector from={currentThree} to={previewThree} radius={RADIUS} />
    </group>
  );
}

/** A ghost vector and rotation arc showing the pending gate result. */
function PreviewVector({
  from,
  to,
  radius,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  radius: number;
}) {
  const target = useRef(to.clone());
  target.current.copy(to);
  if (from.distanceTo(to) < 0.05) return null;

  return (
    <group>
      <Line
        points={arcPoints(from, to, radius)}
        color="#7c93b8"
        lineWidth={1.5}
        dashed
        dashSize={0.09}
        gapSize={0.06}
        transparent
        opacity={0.8}
      />
      <Arrow
        target={target.current}
        color="#93a7cc"
        shaftRadius={0.015}
        headLength={0.13}
        headRadius={0.05}
        opacity={0.55}
        lambda={18}
      />
      <mesh position={[to.x, to.y, to.z]}>
        <sphereGeometry args={[0.05, 20, 20]} />
        <meshBasicMaterial color="#93a7cc" transparent opacity={0.5} />
      </mesh>
      <Html
        position={[to.x * 1.18, to.y * 1.18, to.z * 1.18]}
        center
        distanceFactor={7}
        className="pointer-events-none select-none"
      >
        <span className="whitespace-nowrap rounded-full border border-line bg-surface/85 px-1.5 py-0.5 text-[10px] text-ink-subtle">
          result
        </span>
      </Html>
    </group>
  );
}

/* ── Two-qubit: joint-state evolution ───────────────────────────────────── */

const BASIS = ["00", "01", "10", "11"];

function phaseColor(phase: number): string {
  const hue = 220 + (phase / Math.PI) * 62;
  return `hsl(${hue} 68% 55%)`;
}

function TwoScene() {
  const state = useGatesStore((s) => s.twoState);
  const target = useGatesStore((s) => s.target);
  const selectedId = useGatesStore((s) => s.selectedId);
  const angle = useGatesStore((s) => s.angle);

  const def = getGateDef(selectedId);
  const isSingle = def.arity === 1;
  const preview = isSingle
    ? applySingleQubitGate(state, def.make(angle), target)
    : applyGate(state, def.make(angle), [0, 1]);

  return (
    <group position={[0, 0.15, 0]} scale={0.72}>
      <ReducedSphere state={state} qubit={0} position={[-2.6, 0.35, 0]} label="q₀" targeted={isSingle && target === 0} />
      <AmplitudeBars state={state} preview={preview} />
      <ReducedSphere state={state} qubit={1} position={[2.6, 0.35, 0]} label="q₁" targeted={isSingle && target === 1} />
    </group>
  );
}

function AmplitudeBars({
  state,
  preview,
}: {
  state: QuantumState;
  preview: QuantumState;
}) {
  return (
    <group position={[0, -0.75, 0]}>
      {state.amplitudes.map((amp, i) => (
        <Bar
          key={i}
          x={(i - 1.5) * 0.62}
          probability={abs(amp) ** 2}
          previewProbability={abs(preview.amplitudes[i]) ** 2}
          color={phaseColor(arg(amp))}
          label={BASIS[i]}
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
  previewProbability,
  color,
  label,
  significant,
}: {
  x: number;
  probability: number;
  previewProbability: number;
  color: string;
  label: string;
  significant: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const height = Math.max(probability * 2.0, 0.001);
  const previewHeight = previewProbability * 2.0;
  const showPreview = Math.abs(previewProbability - probability) > 0.01;

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    const k = 1 - Math.exp(-9 * Math.min(dt, 0.1));
    m.scale.y += (height - m.scale.y) * k;
    m.position.y = m.scale.y / 2;
  });

  const s = 0.29;
  const loop: [number, number, number][] = [
    [-s, previewHeight, -s],
    [s, previewHeight, -s],
    [s, previewHeight, s],
    [-s, previewHeight, s],
    [-s, previewHeight, -s],
  ];

  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, -0.006, 0]}>
        <boxGeometry args={[0.44, 0.012, 0.44]} />
        <meshStandardMaterial color="#d3d9e4" />
      </mesh>
      <mesh ref={mesh} castShadow>
        <boxGeometry args={[0.4, 1, 0.4]} />
        <meshPhysicalMaterial color={color} roughness={0.35} metalness={0.05} transparent opacity={significant ? 0.95 : 0.15} />
      </mesh>
      {showPreview && (
        <Line points={loop} color="#7c93b8" lineWidth={1.4} dashed dashSize={0.07} gapSize={0.05} transparent opacity={0.85} />
      )}
      <Html position={[0, -0.18, 0]} center distanceFactor={6.5} className="pointer-events-none select-none">
        <span className="whitespace-nowrap font-mono text-[12px] text-ink-muted">|{label}⟩</span>
      </Html>
    </group>
  );
}

function ReducedSphere({
  state,
  qubit,
  position,
  label,
  targeted,
}: {
  state: QuantumState;
  qubit: number;
  position: [number, number, number];
  label: string;
  targeted?: boolean;
}) {
  const reduced = reducedBlochVector(state, qubit);
  const radius = 0.62;
  return (
    <group position={position}>
      <BlochSphere vector={reduced} radius={radius} showLabels={false} />
      <Html position={[0, radius + 0.4, 0]} center distanceFactor={6} className="pointer-events-none select-none">
        <div className="flex flex-col items-center gap-0.5 whitespace-nowrap text-center">
          <span
            className={
              "rounded px-1.5 font-mono text-[12px] font-medium " +
              (targeted ? "bg-accent text-white" : "text-ink")
            }
          >
            {label}
          </span>
          <span className="text-[10px] text-ink-faint">
            {targeted ? "gate target" : "local view"}
          </span>
        </div>
      </Html>
    </group>
  );
}
