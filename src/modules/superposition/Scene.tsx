import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox, Html } from "@react-three/drei";
import * as THREE from "three";
import { BlochSphere } from "@/render/primitives/BlochSphere";
import { damp } from "@/render/animation";
import { ProbabilityCloud } from "./ProbabilityCloud";
import { useSuperpositionStore } from "./store";

const POLE_Y = 1.45;

export function Scene() {
  const qubit = useSuperpositionStore((s) => s.qubit);
  const classicalBit = useSuperpositionStore((s) => s.classicalBit);
  const flipClassical = useSuperpositionStore((s) => s.flipClassical);
  const collapseOnce = useSuperpositionStore((s) => s.collapseOnce);
  const collapsedTo = useSuperpositionStore((s) => s.collapsedTo);

  const p1 = qubit.probabilityOfQubitOne(0);
  const p0 = 1 - p1;

  return (
    <group position={[0, 0.2, 0]} scale={0.68}>
      <ClassicalStation bit={classicalBit} onFlip={flipClassical} position={[-3.3, 0, 0]} />

      <QubitHero
        p0={p0}
        p1={p1}
        collapsedTo={collapsedTo}
        onMeasure={collapseOnce}
        position={[-0.1, 0, 0]}
      />

      <group position={[3.1, 0.35, 0]} scale={0.6}>
        <BlochSphere vector={qubit.blochVector()} radius={1} showLabels />
        <Html position={[0, -1.75, 0]} center distanceFactor={7} className="pointer-events-none select-none">
          <span className="whitespace-nowrap text-[11px] text-ink-faint">
            Bloch view — one representation
          </span>
        </Html>
      </group>
    </group>
  );
}

/* ── Classical bit: a definite switch, always exactly one value ─────────── */

function ClassicalStation({
  bit,
  onFlip,
  position,
}: {
  bit: 0 | 1;
  onFlip: () => void;
  position: [number, number, number];
}) {
  const knob = useRef<THREE.Group>(null);
  const targetY = bit === 1 ? 0.72 : -0.72;

  useFrame((_, dt) => {
    if (knob.current) {
      knob.current.position.y = damp(knob.current.position.y, targetY, 11, Math.min(dt, 0.1));
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onFlip();
  };

  return (
    <group position={position}>
      <group
        onClick={handleClick}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <RoundedBox args={[0.36, 2.1, 0.36]} radius={0.17} smoothness={6}>
          <meshStandardMaterial color="#eef1f6" roughness={0.6} metalness={0.05} />
        </RoundedBox>
        <group ref={knob}>
          <RoundedBox args={[0.78, 0.6, 0.78]} radius={0.15} smoothness={6} castShadow>
            <meshStandardMaterial color={bit === 1 ? "#334155" : "#334155"} roughness={0.32} metalness={0.12} />
          </RoundedBox>
          <Html center distanceFactor={7} className="pointer-events-none select-none">
            <span className="font-mono text-[15px] font-semibold text-white">{bit}</span>
          </Html>
        </group>
      </group>

      <PoleTag y={1.15} text="1" muted={bit !== 1} />
      <PoleTag y={-1.15} text="0" muted={bit !== 0} />

      <Html position={[0, -1.85, 0]} center distanceFactor={7} className="pointer-events-none select-none">
        <div className="flex flex-col items-center gap-0.5 whitespace-nowrap text-center">
          <span className="text-[12px] font-medium text-ink">Classical bit</span>
          <span className="text-[10px] text-ink-faint">always exactly one value</span>
        </div>
      </Html>
    </group>
  );
}

function PoleTag({ y, text, muted }: { y: number; text: string; muted: boolean }) {
  return (
    <Html position={[0.5, y, 0]} center distanceFactor={7} className="pointer-events-none select-none">
      <span className={"font-mono text-[12px] " + (muted ? "text-ink-faint" : "font-semibold text-ink")}>
        {text}
      </span>
    </Html>
  );
}

/* ── Qubit: the probability cloud (primary explanation) ─────────────────── */

function QubitHero({
  p0,
  p1,
  collapsedTo,
  onMeasure,
  position,
}: {
  p0: number;
  p1: number;
  collapsedTo: 0 | 1 | null;
  onMeasure: () => void;
  position: [number, number, number];
}) {
  const r0 = 0.24 + 0.55 * Math.sqrt(p0);
  const r1 = 0.24 + 0.55 * Math.sqrt(p1);

  const handleMeasure = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onMeasure();
  };

  return (
    <group position={position}>
      {/* Axis between the two outcomes */}
      <mesh>
        <cylinderGeometry args={[0.006, 0.006, POLE_Y * 2.1, 8]} />
        <meshBasicMaterial color="#d3d9e4" />
      </mesh>

      {/* Probability orbs — radius encodes probability */}
      <ProbabilityOrb y={POLE_Y} radius={r0} color="#2f6bf3" probability={p0} />
      <ProbabilityOrb y={-POLE_Y} radius={r1} color="#8b5cf6" probability={p1} />

      {/* The cloud of possibility */}
      <ProbabilityCloud p1={p1} poleY={POLE_Y} />

      {/* Clickable region — click the cloud to measure it */}
      <mesh onClick={handleMeasure} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "auto")}>
        <cylinderGeometry args={[1.05, 1.05, POLE_Y * 2.3, 24, 1, true]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Outcome labels with live probability */}
      <Html position={[0, POLE_Y + 0.55, 0]} center distanceFactor={7} className="pointer-events-none select-none">
        <OutcomeTag ket="0" pct={p0 * 100} active={collapsedTo === 0} color="#2f6bf3" />
      </Html>
      <Html position={[0, -POLE_Y - 0.55, 0]} center distanceFactor={7} className="pointer-events-none select-none">
        <OutcomeTag ket="1" pct={p1 * 100} active={collapsedTo === 1} color="#8b5cf6" />
      </Html>

      <Html position={[0, -POLE_Y - 1.15, 0]} center distanceFactor={7.5} className="pointer-events-none select-none">
        <div className="flex flex-col items-center gap-0.5 whitespace-nowrap text-center">
          <span className="text-[12px] font-medium text-ink">Qubit — both outcomes at once</span>
          <span className="text-[10px] text-ink-faint">
            {collapsedTo === null ? "click the cloud to measure" : "collapsed to a definite value"}
          </span>
        </div>
      </Html>
    </group>
  );
}

function ProbabilityOrb({
  y,
  radius,
  color,
  probability,
}: {
  y: number;
  radius: number;
  color: string;
  probability: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      const s = damp(ref.current.scale.x, radius, 9, Math.min(dt, 0.1));
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <mesh ref={ref} position={[0, y, 0]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.1 + 0.22 * probability}
        roughness={0.2}
        transmission={0.5}
        thickness={0.4}
        depthWrite={false}
      />
    </mesh>
  );
}

function OutcomeTag({
  ket,
  pct,
  active,
  color,
}: {
  ket: string;
  pct: number;
  active: boolean;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      <span className="font-mono text-[14px] font-semibold" style={{ color: active ? color : "hsl(var(--ink))" }}>
        |{ket}⟩
      </span>
      <span className="font-mono text-[12px] tabular-nums" style={{ color }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}
