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
  /** Leave a fading trajectory trail behind the state tip. */
  trail?: boolean;
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

// ── Palette tuned for a white studio: recessive sphere, legible axes ───────
const SPHERE_FILL = "#eef2f8";
const GRID_COLOR = "#ccd6e6";
const EQUATOR_COLOR = "#9aa6bd";
const AXIS_COLOR = "#586172";
const AXIS_TICK = "#8a94a6";

export function BlochSphere({
  vector,
  radius = 1,
  color = "#1d4ed8",
  interactive = false,
  showLabels = true,
  showProjections = false,
  showAngles = false,
  trail = false,
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

  // Trajectory trail — a light polyline fading to the white background.
  const trailLine = useMemo(() => {
    if (!trail) return null;
    const LEN = 96;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(LEN * 3);
    const colors = new Float32Array(LEN * 3);
    const accent = new THREE.Color(color);
    const bg = new THREE.Color("#fbfcfe");
    for (let i = 0; i < LEN; i++) {
      const t = i / (LEN - 1);
      const c = bg.clone().lerp(accent, t * t);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    return new THREE.Line(geo, mat);
  }, [trail, color]);
  const trailInit = useRef(false);

  useFrame((_, dt) => {
    const tgt = follow?.current ?? target;
    if (tip.current) damp3(tip.current.position, tgt, 14, Math.min(dt, 0.1));

    if (trailLine && tip.current) {
      const pos = trailLine.geometry.attributes.position.array as Float32Array;
      const p = tip.current.position;
      if (!trailInit.current) {
        for (let i = 0; i < pos.length; i += 3) {
          pos[i] = p.x;
          pos[i + 1] = p.y;
          pos[i + 2] = p.z;
        }
        trailInit.current = true;
      } else {
        pos.copyWithin(0, 3);
        const last = pos.length - 3;
        pos[last] = p.x;
        pos[last + 1] = p.y;
        pos[last + 2] = p.z;
      }
      trailLine.geometry.attributes.position.needsUpdate = true;
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

  const l = radius * 1.28; // axis half-length

  return (
    <group>
      {/* Soft volume fill — light enough to stay recessive, solid enough to read */}
      <mesh renderOrder={-2}>
        <sphereGeometry args={[radius * 0.998, 64, 48]} />
        <meshStandardMaterial
          color={SPHERE_FILL}
          transparent
          opacity={0.4}
          roughness={0.85}
          metalness={0}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={1}
        />
      </mesh>

      <SphereGrid radius={radius} />

      {/* Coordinate axes with arrowheads — high contrast against the shell */}
      <Axis3D dir="y" length={l} color={AXIS_COLOR} />
      <Axis3D dir="x" length={l} color={AXIS_COLOR} />
      <Axis3D dir="z" length={l} color={AXIS_COLOR} />

      {trailLine && <primitive object={trailLine} />}

      {showProjections && <Projection target={target} color={color} />}
      {showAngles && <AngleArcs target={target} radius={radius} />}

      {/* State vector — the hero: bold, saturated, with a bright tip */}
      <Arrow
        target={target}
        follow={follow}
        color={color}
        shaftRadius={0.026}
        headLength={0.19}
        headRadius={0.075}
      />
      <group ref={tip}>
        <mesh castShadow>
          <sphereGeometry args={[0.062, 28, 28]} />
          <meshStandardMaterial
            color={color}
            roughness={0.28}
            metalness={0.15}
            emissive={color}
            emissiveIntensity={0.18}
          />
        </mesh>
      </group>

      {showLabels && (
        <>
          <PoleLabel position={[0, radius * 1.44, 0]}>|0⟩</PoleLabel>
          <PoleLabel position={[0, -radius * 1.44, 0]}>|1⟩</PoleLabel>
          <Label position={[radius * 1.42, 0, 0]}>|+⟩</Label>
          <Label position={[-radius * 1.44, 0, 0]}>|−⟩</Label>
          <Label position={[0, 0, radius * 1.42]}>|i⟩</Label>
          <Label position={[0, 0, -radius * 1.48]}>|−i⟩</Label>
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

/** Emphasized pole label with a subtle chip for readability against the grid. */
function PoleLabel({
  position,
  children,
}: {
  position: [number, number, number];
  children: React.ReactNode;
}) {
  return (
    <Label position={position} tone="state" className="text-[14px]">
      {children}
    </Label>
  );
}

/** A globe of latitude/longitude lines with an emphasized equator. */
function SphereGrid({ radius }: { radius: number }) {
  const { parallels, meridians, equator } = useMemo(() => {
    const circle = (
      kind: "parallel" | "meridian",
      param: number
    ): [number, number, number][] => {
      const pts: [number, number, number][] = [];
      const segs = 96;
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        if (kind === "parallel") {
          pts.push([
            radius * Math.cos(param) * Math.cos(a),
            radius * Math.sin(param),
            radius * Math.cos(param) * Math.sin(a),
          ]);
        } else {
          pts.push([
            radius * Math.sin(a) * Math.cos(param),
            radius * Math.cos(a),
            radius * Math.sin(a) * Math.sin(param),
          ]);
        }
      }
      return pts;
    };
    const d2r = Math.PI / 180;
    return {
      equator: circle("parallel", 0),
      parallels: [-60, -30, 30, 60].map((lat) => circle("parallel", lat * d2r)),
      meridians: [0, 30, 60, 90, 120, 150].map((az) =>
        circle("meridian", az * d2r)
      ),
    };
  }, [radius]);

  return (
    <group renderOrder={-1}>
      {parallels.map((pts, i) => (
        <Line key={`p${i}`} points={pts} color={GRID_COLOR} lineWidth={0.8} transparent opacity={0.5} />
      ))}
      {meridians.map((pts, i) => (
        <Line key={`m${i}`} points={pts} color={GRID_COLOR} lineWidth={0.8} transparent opacity={0.5} />
      ))}
      <Line points={equator} color={EQUATOR_COLOR} lineWidth={1.4} />
    </group>
  );
}

/** A single coordinate axis: a shaft through the origin capped by arrowheads. */
function Axis3D({
  dir,
  length,
  color,
}: {
  dir: "x" | "y" | "z";
  length: number;
  color: string;
}) {
  const rotation: [number, number, number] =
    dir === "y"
      ? [0, 0, 0]
      : dir === "x"
        ? [0, 0, -Math.PI / 2]
        : [Math.PI / 2, 0, 0];

  return (
    <group rotation={rotation}>
      <mesh>
        <cylinderGeometry args={[0.006, 0.006, length * 2, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, length, 0]}>
        <coneGeometry args={[0.032, 0.1, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, -length, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.032, 0.1, 16]} />
        <meshBasicMaterial color={AXIS_TICK} />
      </mesh>
    </group>
  );
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
            lineWidth={1.25}
            dashed
            dashSize={0.07}
            gapSize={0.05}
            transparent
            opacity={0.6}
          />
          <Line
            points={[
              [p.x, 0, p.z],
              [target.x, target.y, target.z],
            ]}
            color={color}
            lineWidth={1.25}
            dashed
            dashSize={0.07}
            gapSize={0.05}
            transparent
            opacity={0.6}
          />
          <mesh position={[p.x, 0, p.z]}>
            <sphereGeometry args={[0.026, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.75} />
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
          lineWidth={1.75}
          transparent
          opacity={0.8}
        />
      )}
      {hasAzimuth && (
        <Line
          points={arcPoints(X_AXIS, equator, phiR)}
          color="#7c3aed"
          lineWidth={1.75}
          transparent
          opacity={0.75}
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
