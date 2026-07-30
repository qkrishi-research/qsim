import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { BlochVector } from "@/engine";
import { Arrow } from "./Arrow";
import { Label } from "./Label";
import { useDrag } from "../useDrag";
import { damp3 } from "../animation";

interface BlochSphereProps {
  /** Bloch coordinates in physics convention (|0⟩ at +z). */
  vector: BlochVector;
  radius?: number;
  color?: string;
  interactive?: boolean;
  showLabels?: boolean;
  /** Draw the dashed component decomposition of the state vector. */
  showProjections?: boolean;
  /** Draw the polar (θ) and azimuth (φ) angle arcs. */
  showAngles?: boolean;
  /**
   * Optional live tip position (Three coords) read every frame, overriding the
   * damped `vector`. Used to animate a gate rotation along its true geodesic.
   */
  follow?: React.MutableRefObject<THREE.Vector3 | null>;
  /** Called with new polar/azimuth angles while the user drags the state. */
  onChange?: (theta: number, phi: number) => void;
}

/** Physics Bloch coords → Three.js coords (|0⟩ up along +Y). */
export function blochToThree(v: BlochVector, r = 1): THREE.Vector3 {
  return new THREE.Vector3(v.x * r, v.z * r, v.y * r);
}

const toThree = blochToThree;

export function BlochSphere({
  vector,
  radius = 1,
  color = "#1d4ed8",
  interactive = false,
  showLabels = true,
  showProjections = false,
  showAngles = false,
  follow,
  onChange,
}: BlochSphereProps) {
  const controls = useThree((s) => s.controls) as unknown as
    | { enabled: boolean }
    | null;

  // Keep the live angles in refs so drag math reads current values without
  // re-subscribing handlers every render.
  const angles = useRef({ theta: 0, phi: 0 });
  angles.current.theta = Math.acos(THREE.MathUtils.clamp(vector.z, -1, 1));
  angles.current.phi = Math.atan2(vector.y, vector.x);

  const target = useMemo(() => toThree(vector, radius), [vector, radius]);
  const tip = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (tip.current) {
      const tgt = follow?.current ?? target;
      damp3(tip.current.position, tgt, 14, Math.min(dt, 0.1));
    }
  });

  const { dragging, handlers } = useDrag(
    (dx, dy) => {
      const next = {
        theta: THREE.MathUtils.clamp(
          angles.current.theta + dy * 0.01,
          0,
          Math.PI
        ),
        phi: angles.current.phi - dx * 0.01,
      };
      angles.current = next;
      onChange?.(next.theta, next.phi);
    },
    {
      onStart: () => controls && (controls.enabled = false),
      onEnd: () => controls && (controls.enabled = true),
    }
  );

  const axisColor = "#c3cbd9";
  const ringColor = "#d3d9e4";

  return (
    <group>
      {/* Translucent shell */}
      <mesh>
        <sphereGeometry args={[radius, 64, 48]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.06}
          roughness={0.15}
          metalness={0}
          transmission={0.6}
          thickness={0.5}
          depthWrite={false}
        />
      </mesh>

      {/* Great circles: equator and two meridians */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.004, 8, 128]} />
        <meshBasicMaterial color={ringColor} />
      </mesh>
      <mesh>
        <torusGeometry args={[radius, 0.004, 8, 128]} />
        <meshBasicMaterial color={ringColor} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[radius, 0.004, 8, 128]} />
        <meshBasicMaterial color={ringColor} />
      </mesh>

      {/* Axes (Three coords): Y = |0⟩/|1⟩, X = |+⟩/|−⟩, Z = |i⟩/|−i⟩ */}
      <Axis a={[0, -radius * 1.25, 0]} b={[0, radius * 1.25, 0]} color={axisColor} />
      <Axis a={[-radius * 1.25, 0, 0]} b={[radius * 1.25, 0, 0]} color={axisColor} />
      <Axis a={[0, 0, -radius * 1.25]} b={[0, 0, radius * 1.25]} color={axisColor} />

      {showProjections && <Projection target={target} color={color} />}
      {showAngles && <AngleArcs target={target} radius={radius} />}

      {/* State vector and tip marker */}
      <Arrow target={target} follow={follow} color={color} />
      <group ref={tip}>
        <mesh castShadow>
          <sphereGeometry args={[0.05, 24, 24]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </mesh>
      </group>

      {showLabels && (
        <>
          <Label position={[0, radius * 1.42, 0]} tone="state">
            |0⟩
          </Label>
          <Label position={[0, -radius * 1.42, 0]} tone="state">
            |1⟩
          </Label>
          <Label position={[radius * 1.4, 0, 0]}>|+⟩</Label>
          <Label position={[-radius * 1.42, 0, 0]}>|−⟩</Label>
          <Label position={[0, 0, radius * 1.4]}>|i⟩</Label>
          <Label position={[0, 0, -radius * 1.46]}>|−i⟩</Label>
        </>
      )}

      {/* Invisible grab shell for dragging the state */}
      {interactive && (
        <mesh {...handlers} scale={dragging ? 1.001 : 1}>
          <sphereGeometry args={[radius * 1.02, 32, 32]} />
          <meshBasicMaterial
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

function Axis({
  a,
  b,
  color,
}: {
  a: [number, number, number];
  b: [number, number, number];
  color: string;
}) {
  return <Line points={[a, b]} color={color} lineWidth={1.25} />;
}

/** Dashed decomposition of the state vector into its equatorial projection. */
function Projection({
  target,
  color,
}: {
  target: THREE.Vector3;
  color: string;
}) {
  const p = new THREE.Vector3(target.x, 0, target.z);
  const inPlane = p.length() > 1e-3;

  return (
    <group>
      {inPlane && (
        <>
          <Line
            points={[
              [0, 0, 0],
              [p.x, 0, p.z],
            ]}
            color={color}
            lineWidth={1}
            dashed
            dashSize={0.06}
            gapSize={0.05}
            transparent
            opacity={0.55}
          />
          <Line
            points={[
              [p.x, 0, p.z],
              [target.x, target.y, target.z],
            ]}
            color={color}
            lineWidth={1}
            dashed
            dashSize={0.06}
            gapSize={0.05}
            transparent
            opacity={0.55}
          />
          <mesh position={[p.x, 0, p.z]}>
            <sphereGeometry args={[0.022, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.7} />
          </mesh>
        </>
      )}
    </group>
  );
}

const UP_AXIS = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);

/** Great-circle arc from `from` to `to` at a given radius. */
function arcPoints(
  from: THREE.Vector3,
  to: THREE.Vector3,
  r: number,
  segments = 40
): [number, number, number][] {
  const f = from.clone().normalize();
  const t = to.clone().normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(f, t);
  const identity = new THREE.Quaternion();
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const qi = new THREE.Quaternion().slerpQuaternions(
      identity,
      q,
      i / segments
    );
    const v = f.clone().applyQuaternion(qi).multiplyScalar(r);
    pts.push([v.x, v.y, v.z]);
  }
  return pts;
}

/** The polar (θ) and azimuth (φ) angle arcs with labels. */
function AngleArcs({
  target,
  radius,
}: {
  target: THREE.Vector3;
  radius: number;
}) {
  const dir = target.clone();
  const equator = new THREE.Vector3(target.x, 0, target.z);
  const hasPolar = dir.length() > 1e-3;
  const hasAzimuth = equator.length() > 1e-3;

  const thetaR = radius * 0.42;
  const phiR = radius * 0.55;

  const thetaMid = hasPolar
    ? UP_AXIS.clone()
        .lerp(dir.clone().normalize(), 0.5)
        .normalize()
        .multiplyScalar(thetaR * 1.28)
    : null;
  const phiMid = hasAzimuth
    ? X_AXIS.clone()
        .lerp(equator.clone().normalize(), 0.5)
        .normalize()
        .multiplyScalar(phiR * 1.3)
    : null;

  return (
    <group>
      {hasPolar && (
        <Line
          points={arcPoints(UP_AXIS, dir, thetaR)}
          color="#1d4ed8"
          lineWidth={1.5}
          transparent
          opacity={0.75}
        />
      )}
      {hasAzimuth && (
        <Line
          points={arcPoints(X_AXIS, equator, phiR)}
          color="#7c3aed"
          lineWidth={1.5}
          transparent
          opacity={0.7}
        />
      )}
      {thetaMid && (
        <Label position={[thetaMid.x, thetaMid.y, thetaMid.z]} tone="muted">
          θ
        </Label>
      )}
      {phiMid && (
        <Label position={[phiMid.x, phiMid.y, phiMid.z]} tone="muted">
          φ
        </Label>
      )}
    </group>
  );
}
