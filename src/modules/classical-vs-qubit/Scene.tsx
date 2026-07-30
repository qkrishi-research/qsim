import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox, Html } from "@react-three/drei";
import * as THREE from "three";
import { BlochSphere } from "@/render/primitives/BlochSphere";
import { damp } from "@/render/animation";
import { useSelectionStore } from "@/render/selection";
import { useClassicalQubitStore } from "./store";

export function Scene() {
  const classicalBit = useClassicalQubitStore((s) => s.classicalBit);
  const qubit = useClassicalQubitStore((s) => s.qubit);
  const flipClassical = useClassicalQubitStore((s) => s.flipClassical);
  const setBlochAngles = useClassicalQubitStore((s) => s.setBlochAngles);

  const bloch = qubit.blochVector();
  const select = useSelectionStore((s) => s.select);

  return (
    <group position={[0, 0.3, 0]} scale={0.82}>
      <group position={[-2.1, 0, 0]} onPointerDown={() => select("classical")}>
        <ClassicalStation bit={classicalBit} onFlip={flipClassical} />
        <Caption position={[0, -1.85, 0]} title="Classical bit" />
      </group>

      <group position={[1.45, 0, 0]} onPointerDown={() => select("qubit")}>
        <BlochSphere vector={bloch} interactive onChange={setBlochAngles} />
        <Caption position={[0, -2.15, 0]} title="Qubit" />
      </group>
    </group>
  );
}

function ClassicalStation({
  bit,
  onFlip,
}: {
  bit: 0 | 1;
  onFlip: () => void;
}) {
  const knob = useRef<THREE.Group>(null);
  const targetY = bit === 1 ? 0.62 : -0.62;

  useFrame((_, dt) => {
    if (knob.current) {
      knob.current.position.y = damp(
        knob.current.position.y,
        targetY,
        11,
        Math.min(dt, 0.1)
      );
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onFlip();
  };

  return (
    <group onClick={handleClick} onPointerOver={() => setCursor("pointer")} onPointerOut={() => setCursor("auto")}>
      {/* Track */}
      <RoundedBox args={[0.34, 1.9, 0.34]} radius={0.16} smoothness={6}>
        <meshStandardMaterial color="#eef1f6" roughness={0.6} metalness={0.05} />
      </RoundedBox>

      {/* End ticks */}
      <PoleTick y={0.86} active={bit === 1} label="1" />
      <PoleTick y={-0.86} active={bit === 0} label="0" />

      {/* Sliding knob */}
      <group ref={knob}>
        <RoundedBox args={[0.72, 0.56, 0.72]} radius={0.14} smoothness={6} castShadow>
          <meshStandardMaterial
            color={bit === 1 ? "#1d4ed8" : "#334155"}
            roughness={0.32}
            metalness={0.12}
          />
        </RoundedBox>
        <Html center distanceFactor={7} className="pointer-events-none select-none">
          <span className="font-mono text-[15px] font-semibold text-white">
            {bit}
          </span>
        </Html>
      </group>
    </group>
  );
}

function PoleTick({
  y,
  active,
  label,
}: {
  y: number;
  active: boolean;
  label: string;
}) {
  return (
    <Html
      position={[0.42, y, 0]}
      center
      distanceFactor={7}
      className="pointer-events-none select-none"
    >
      <span
        className={
          "font-mono text-[13px] leading-none tracking-tight " +
          (active ? "font-semibold text-ink" : "text-ink-faint")
        }
      >
        {label}
      </span>
    </Html>
  );
}

function Caption({
  position,
  title,
}: {
  position: [number, number, number];
  title: string;
}) {
  return (
    <Html
      position={position}
      center
      distanceFactor={8}
      className="pointer-events-none select-none"
    >
      <span className="whitespace-nowrap rounded-full border border-line bg-surface/80 px-2.5 py-1 text-[12px] font-medium text-ink-muted shadow-sm backdrop-blur-sm">
        {title}
      </span>
    </Html>
  );
}

function setCursor(value: string) {
  document.body.style.cursor = value;
}
