import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ControlGroup,
  DockDivider,
  ProbabilityMeter,
} from "@/modules/common/controls";
import {
  useInterferenceStore,
  interferometerState,
} from "./store";

const RAD2DEG = 180 / Math.PI;

const presets = [
  { label: "Constructive", phi: 0 },
  { label: "Partial", phi: Math.PI / 2 },
  { label: "Destructive", phi: Math.PI },
];

export function Controls() {
  const phi = useInterferenceStore((s) => s.phi);
  const animating = useInterferenceStore((s) => s.animating);
  const setPhi = useInterferenceStore((s) => s.setPhi);
  const toggleAnimate = useInterferenceStore((s) => s.toggleAnimate);
  const reset = useInterferenceStore((s) => s.reset);

  const probs = interferometerState(phi).probabilities();

  return (
    <div className="flex h-full items-stretch gap-4 overflow-x-auto px-4 py-3">
      <ControlGroup label="Relative phase" className="w-[240px] shrink-0">
        <Slider
          label="φ on |1⟩"
          display={`${(phi * RAD2DEG).toFixed(0)}°`}
          min={0}
          max={2 * Math.PI}
          step={0.01}
          value={phi}
          onChange={setPhi}
        />
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={toggleAnimate} className="flex-1">
            {animating ? (
              <>
                <Pause className="h-3.5 w-3.5" strokeWidth={2} />
                Pause sweep
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" strokeWidth={2} />
                Sweep φ
              </>
            )}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={reset} title="Reset">
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="Presets" className="shrink-0">
        <div className="flex flex-col gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setPhi(p.phi)}
              className="flex h-8 items-center justify-between gap-3 rounded-md border border-line bg-surface px-2.5 text-[13px] text-ink transition-colors hover:border-accent/40 hover:bg-accent-soft"
            >
              <span>{p.label}</span>
              <span className="font-mono text-2xs text-ink-faint">
                {(p.phi * RAD2DEG).toFixed(0)}°
              </span>
            </button>
          ))}
        </div>
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="Output probability" className="w-[210px] shrink-0">
        <ProbabilityMeter
          entries={[
            { label: "|0⟩", value: probs[0] },
            { label: "|1⟩", value: probs[1], color: "hsl(var(--signal-phase))" },
          ]}
        />
        <p className="text-2xs leading-snug text-ink-faint">
          Interference reshapes the outcome — same gates, different phase.
        </p>
      </ControlGroup>
    </div>
  );
}
