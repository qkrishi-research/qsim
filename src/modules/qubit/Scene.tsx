import { Html } from "@react-three/drei";
import { BlochSphere } from "@/render/primitives/BlochSphere";
import { Tex } from "@/components/common/Math";
import { useQubitStore } from "./store";

const RAD2DEG = 180 / Math.PI;

export function Scene() {
  const qubit = useQubitStore((s) => s.qubit);
  const theta = useQubitStore((s) => s.theta);
  const phi = useQubitStore((s) => s.phi);
  const setBlochAngles = useQubitStore((s) => s.setBlochAngles);

  const b = qubit.blochVector();

  return (
    <group position={[0, 0.05, 0]} scale={0.92}>
      <BlochSphere
        vector={b}
        radius={1.3}
        interactive
        showProjections
        showAngles
        trail
        onChange={setBlochAngles}
      />

      {/* Mathematical overlay — synchronized with the sphere */}
      <Html
        position={[-2.75, 1.95, 0]}
        distanceFactor={8}
        className="pointer-events-none select-none"
      >
        <div className="flex flex-col gap-1 whitespace-nowrap rounded-lg border border-line bg-surface/85 px-2.5 py-1.5 shadow-sm backdrop-blur-sm">
          <div className="text-[13px] text-ink">
            <Tex>{"\\lvert\\psi\\rangle = \\cos\\tfrac{\\theta}{2}\\lvert0\\rangle + e^{i\\varphi}\\sin\\tfrac{\\theta}{2}\\lvert1\\rangle"}</Tex>
          </div>
          <div className="flex gap-2.5 font-mono text-[10px] text-ink-muted">
            <span>θ {(theta * RAD2DEG).toFixed(0)}°</span>
            <span>φ {(phi * RAD2DEG).toFixed(0)}°</span>
            <span>
              r ({b.x >= 0 ? "+" : "−"}
              {Math.abs(b.x).toFixed(2)}, {b.y >= 0 ? "+" : "−"}
              {Math.abs(b.y).toFixed(2)}, {b.z >= 0 ? "+" : "−"}
              {Math.abs(b.z).toFixed(2)})
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
}
