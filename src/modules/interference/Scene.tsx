import { Billboard, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { PhasorDiagram } from "./PhasorDiagram";
import {
  useInterferenceStore,
  interferometerState,
  interferenceLabel,
} from "./store";

export function Scene() {
  const phi = useInterferenceStore((s) => s.phi);

  // Advance the phase during auto-sweep without depending on a stale closure.
  useFrame((_, dt) => {
    const { animating, phi: current, setPhi } = useInterferenceStore.getState();
    if (animating) setPhi(current + dt * 0.7);
  });

  const state = interferometerState(phi);
  const probs = state.probabilities();
  const label = interferenceLabel(phi);

  return (
    <group position={[0, 0.15, 0]}>
      <Billboard position={[-1.75, 0.1, 0]}>
        <group scale={1.05}>
          <PhasorDiagram phi={phi} output={0} probability={probs[0]} />
        </group>
      </Billboard>

      <Billboard position={[1.75, 0.1, 0]}>
        <group scale={1.05}>
          <PhasorDiagram phi={phi} output={1} probability={probs[1]} />
        </group>
      </Billboard>

      <Html
        position={[0, 1.75, 0]}
        center
        distanceFactor={9}
        className="pointer-events-none select-none"
      >
        <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface/85 px-3 py-1 shadow-sm backdrop-blur-sm">
          <span className="font-mono text-[12px] text-ink-muted">
            φ = {((phi * 180) / Math.PI).toFixed(0)}°
          </span>
          <span className="h-3 w-px bg-line" />
          <span className="text-[12px] font-medium text-ink">{label}</span>
        </div>
      </Html>
    </group>
  );
}
