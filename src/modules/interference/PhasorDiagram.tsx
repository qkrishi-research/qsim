import { useMemo } from "react";
import { Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { Arrow } from "@/render/primitives/Arrow";

interface PhasorDiagramProps {
  /** Relative phase φ in radians. */
  phi: number;
  /** Which output amplitude to decompose: |0⟩ or |1⟩. */
  output: 0 | 1;
  probability: number;
}

/**
 * Head-to-tail phasor addition for one output amplitude of the H–phase–H
 * interferometer. Two half-unit contributions combine into a resultant whose
 * squared length is the outcome probability — long when in phase (constructive),
 * vanishing when out of phase (destructive).
 */
export function PhasorDiagram({ phi, output, probability }: PhasorDiagramProps) {
  const bAngle = output === 0 ? phi : phi + Math.PI;

  const { aTip, bTip, resultant } = useMemo(() => {
    const ax = 0.5;
    const bx = 0.5 * Math.cos(bAngle);
    const by = 0.5 * Math.sin(bAngle);
    return {
      aTip: new THREE.Vector3(ax, 0, 0),
      bTip: new THREE.Vector3(bx, by, 0),
      resultant: new THREE.Vector3(ax + bx, by, 0),
    };
  }, [bAngle]);

  const circlePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push([Math.cos(a), Math.sin(a), 0]);
    }
    return pts;
  }, []);

  return (
    <group>
      {/* Unit circle and complex-plane axes */}
      <Line points={circlePoints} color="#dbe1ea" lineWidth={1} />
      <Line points={[[-1.15, 0, 0], [1.15, 0, 0]]} color="#e2e7ee" lineWidth={1} />
      <Line points={[[0, -1.15, 0], [0, 1.15, 0]]} color="#e2e7ee" lineWidth={1} />

      {/* Contribution A (fixed reference) */}
      <Arrow
        target={aTip}
        color="#94a3b8"
        shaftRadius={0.014}
        headLength={0.11}
        headRadius={0.04}
      />

      {/* Contribution B, drawn head-to-tail from A's tip */}
      <group position={[0.5, 0, 0]}>
        <Arrow
          target={bTip}
          color="#3b82f6"
          shaftRadius={0.014}
          headLength={0.11}
          headRadius={0.04}
        />
      </group>

      {/* Resultant amplitude */}
      <Arrow
        target={resultant}
        color="#1d4ed8"
        shaftRadius={0.022}
        headLength={0.14}
        headRadius={0.06}
      />

      <Html
        position={[0, -1.4, 0]}
        center
        distanceFactor={9}
        className="pointer-events-none select-none"
      >
        <div className="flex flex-col items-center gap-0.5 whitespace-nowrap text-center">
          <span className="font-mono text-[13px] font-medium text-ink">
            → |{output}⟩
          </span>
          <span className="font-mono text-[11px] text-ink-muted">
            P = {(probability * 100).toFixed(1)}%
          </span>
        </div>
      </Html>
    </group>
  );
}
