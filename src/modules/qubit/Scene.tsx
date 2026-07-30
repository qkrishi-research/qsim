import { BlochSphere } from "@/render/primitives/BlochSphere";
import { useQubitStore } from "./store";

export function Scene() {
  const qubit = useQubitStore((s) => s.qubit);
  const setBlochAngles = useQubitStore((s) => s.setBlochAngles);

  return (
    <group position={[0, 0.05, 0]} scale={0.92}>
      <BlochSphere
        vector={qubit.blochVector()}
        radius={1.3}
        interactive
        showProjections
        showAngles
        onChange={setBlochAngles}
      />
    </group>
  );
}
