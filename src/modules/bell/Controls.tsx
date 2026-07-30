import { Dice5, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ControlGroup, DockDivider } from "@/modules/common/controls";
import { useBellStore, bellPresets } from "./store";

const RAD2DEG = 180 / Math.PI;

export function Controls() {
  const presetId = useBellStore((s) => s.presetId);
  const thetaA = useBellStore((s) => s.thetaA);
  const thetaB = useBellStore((s) => s.thetaB);
  const applyPreset = useBellStore((s) => s.applyPreset);
  const setThetaA = useBellStore((s) => s.setThetaA);
  const setThetaB = useBellStore((s) => s.setThetaB);
  const runCorrelation = useBellStore((s) => s.runCorrelation);
  const reset = useBellStore((s) => s.reset);

  return (
    <div className="flex h-full items-stretch gap-4 overflow-x-auto px-4 py-3">
      <ControlGroup label="Prepare state" className="shrink-0">
        <div className="flex gap-1.5">
          {bellPresets.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              title={p.entangled ? "Entangled" : "Product state"}
              className={cn(
                "flex h-9 min-w-[48px] items-center justify-center rounded-md border px-2 font-mono text-[13px] transition-all duration-150 ease-precise active:scale-[0.96]",
                presetId === p.id
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line bg-surface text-ink hover:border-accent/40 hover:bg-accent-soft"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-2xs leading-snug text-ink-faint">
          Φ / Ψ are entangled; |00⟩ is a product state.
        </p>
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="Measurement basis" className="w-[248px] shrink-0">
        <Slider
          label="Qubit A angle"
          display={`${(thetaA * RAD2DEG).toFixed(0)}°`}
          min={0}
          max={Math.PI}
          step={0.01}
          value={thetaA}
          onChange={setThetaA}
        />
        <Slider
          label="Qubit B angle"
          display={`${(thetaB * RAD2DEG).toFixed(0)}°`}
          min={0}
          max={Math.PI}
          step={0.01}
          value={thetaB}
          onChange={setThetaB}
        />
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="Correlation experiment" className="w-[180px] shrink-0">
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => runCorrelation(200)} className="flex-1">
            <Dice5 className="h-3.5 w-3.5" strokeWidth={2} />
            Run ×200
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={reset} title="Reset">
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
        <p className="text-2xs leading-snug text-ink-faint">
          Measure both qubits many times and compare outcomes.
        </p>
      </ControlGroup>
    </div>
  );
}
