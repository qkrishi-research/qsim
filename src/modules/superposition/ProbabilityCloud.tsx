import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 540;

const COLOR_ZERO = new THREE.Color("#2f6bf3");
const COLOR_ONE = new THREE.Color("#8b5cf6");

/** Approximately normal in [-1.5, 1.5], for soft blob scatter. */
function gaussian() {
  return Math.random() + Math.random() + Math.random() - 1.5;
}

/** A soft round sprite so points read as a cloud rather than squares. */
function makeSpriteTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.85)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

interface ProbabilityCloudProps {
  /** Probability of |1⟩ (the lower pole). Points redistribute toward it. */
  p1: number;
  poleY: number;
  spread?: number;
}

/**
 * A cloud of possibility. Each point belongs to |0⟩ (top) or |1⟩ (bottom)
 * according to a fixed per-point threshold compared against the live
 * probability, and eases toward that pole every frame with a gentle wave.
 *
 * Because a measurement drives the probability to exactly 0 or 1, every point
 * naturally streams to a single pole — the collapse animation falls out of the
 * same mechanism, no special-casing required.
 */
export function ProbabilityCloud({ p1, poleY, spread = 0.42 }: ProbabilityCloudProps) {
  const ref = useRef<THREE.Points>(null);
  const texture = useMemo(makeSpriteTexture, []);

  const positions = useMemo(() => new Float32Array(COUNT * 3), []);
  const colors = useMemo(() => new Float32Array(COUNT * 3), []);

  const data = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        threshold: Math.random(),
        ox: gaussian() * spread,
        oy: gaussian() * spread * 0.7,
        oz: gaussian() * spread,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.9,
        waveAmp: 0.06 + Math.random() * 0.1,
      })),
    [spread]
  );

  useFrame((state, dt) => {
    const pts = ref.current;
    if (!pts) return;
    const pos = pts.geometry.attributes.position.array as Float32Array;
    const col = pts.geometry.attributes.color.array as Float32Array;
    const t = state.clock.elapsedTime;
    const k = 1 - Math.exp(-5 * Math.min(dt, 0.05));

    for (let i = 0; i < COUNT; i++) {
      const d = data[i];
      const toBottom = d.threshold < p1;
      const baseY = toBottom ? -poleY : poleY;
      const wave = Math.sin(t * d.speed + d.phase) * d.waveAmp;

      const tx = d.ox + wave;
      const ty = baseY + d.oy + Math.cos(t * d.speed * 0.7 + d.phase) * d.waveAmp;
      const tz = d.oz;

      const j = i * 3;
      pos[j] += (tx - pos[j]) * k;
      pos[j + 1] += (ty - pos[j + 1]) * k;
      pos[j + 2] += (tz - pos[j + 2]) * k;

      const c = toBottom ? COLOR_ONE : COLOR_ZERO;
      col[j] = c.r;
      col[j + 1] = c.g;
      col[j + 2] = c.b;
    }

    pts.geometry.attributes.position.needsUpdate = true;
    pts.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.11}
        map={texture}
        vertexColors
        transparent
        opacity={0.92}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.NormalBlending}
      />
    </points>
  );
}
