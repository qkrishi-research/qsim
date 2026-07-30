import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ControlGroup, DockDivider } from "@/modules/common/controls";
import { useQubitStore, blochPresets } from "./store";

const RAD2DEG = 180 / Math.PI;

export function Controls() {
  const theta = useQubitStore((s) => s.theta);
  const phi = useQubitStore((s) => s.phi);
  const setBlochAngles = useQubitStore((s) => s.setBlochAngles);
  const applyPreset = useQubitStore((s) => s.applyPreset);
  const reset = useQubitStore((s) => s.reset);

  return (
    <div className="flex h-full items-stretch gap-4 overflow-x-auto px-4 py-3">
      <ControlGroup label="Spherical angles" className="w-[240px] shrink-0">
        <Slider
          label="θ polar"
          display={`${(theta * RAD2DEG).toFixed(1)}°`}
          min={0}
          max={Math.PI}
          step={0.005}
          value={theta}
          onChange={(t) => setBlochAngles(t, phi)}
        />
        <Slider
          label="φ azimuth"
          display={`${(phi * RAD2DEG).toFixed(1)}°`}
          min={-Math.PI}
          max={Math.PI}
          step={0.005}
          value={phi}
          onChange={(p) => setBlochAngles(theta, p)}
        />
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="Cardinal states" className="shrink-0">
        <div className="grid grid-cols-3 gap-1.5">
          {blochPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="flex h-9 min-w-[52px] items-center justify-center rounded-md border border-line bg-surface px-2 font-mono text-[13px] text-ink transition-all duration-150 ease-precise hover:border-accent/40 hover:bg-accent-soft active:scale-[0.96]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="View" className="shrink-0">
        <Button variant="secondary" size="sm" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
          Reset to |0⟩
        </Button>
        <p className="text-2xs leading-snug text-ink-faint">
          Drag the sphere or use the sliders. Dashed lines show the projection;
          arcs mark θ and φ.
        </p>
      </ControlGroup>
    </div>
  );
}
