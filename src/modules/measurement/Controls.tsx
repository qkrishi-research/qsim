import { Dice5, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  ControlGroup,
  DockDivider,
  ProbabilityMeter,
} from "@/modules/common/controls";
import { blochPresets } from "@/modules/qubit/store";
import {
  useMeasurementStore,
  bases,
  outcomeZeroProbability,
  type Basis,
} from "./store";

export function Controls() {
  const qubit = useMeasurementStore((s) => s.qubit);
  const basis = useMeasurementStore((s) => s.basis);
  const prediction = useMeasurementStore((s) => s.prediction);
  const predictionCommitted = useMeasurementStore((s) => s.predictionCommitted);
  const applyAngles = useMeasurementStore((s) => s.applyAngles);
  const setBasis = useMeasurementStore((s) => s.setBasis);
  const setPrediction = useMeasurementStore((s) => s.setPrediction);
  const commitPrediction = useMeasurementStore((s) => s.commitPrediction);
  const measureOnce = useMeasurementStore((s) => s.measureOnce);
  const runShots = useMeasurementStore((s) => s.runShots);
  const reset = useMeasurementStore((s) => s.reset);

  const info = bases[basis];
  const p0 = outcomeZeroProbability(qubit, info);

  return (
    <div className="flex h-full items-stretch gap-4 overflow-x-auto px-4 py-3">
      <ControlGroup label="Prepare" className="shrink-0">
        <div className="grid grid-cols-3 gap-1.5">
          {blochPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyAngles(preset.theta, preset.phi)}
              className="flex h-8 min-w-[48px] items-center justify-center rounded-md border border-line bg-surface px-2 font-mono text-xs text-ink transition-all duration-150 ease-precise hover:border-accent/40 hover:bg-accent-soft active:scale-[0.96]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="Basis" className="shrink-0">
        <div className="flex gap-1.5">
          {(Object.keys(bases) as Basis[]).map((b) => (
            <button
              key={b}
              onClick={() => setBasis(b)}
              className={cn(
                "flex h-9 w-11 items-center justify-center rounded-md border font-mono text-sm font-medium transition-all duration-150 ease-precise active:scale-[0.96]",
                basis === b
                  ? "border-transparent text-white"
                  : "border-line bg-surface text-ink hover:bg-panel"
              )}
              style={
                basis === b ? { backgroundColor: bases[b].color } : undefined
              }
            >
              {bases[b].label}
            </button>
          ))}
        </div>
        <p className="text-2xs leading-snug text-ink-faint">
          Outcomes: |{info.eigen[0].label}⟩ / |{info.eigen[1].label}⟩
        </p>
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="Predict outcome" className="w-[190px] shrink-0">
        <Slider
          label={`P(${info.eigen[0].label})`}
          display={`${(prediction * 100).toFixed(0)}%`}
          min={0}
          max={1}
          step={0.01}
          value={prediction}
          disabled={predictionCommitted}
          onChange={setPrediction}
        />
        <Button
          variant={predictionCommitted ? "subtle" : "primary"}
          size="sm"
          onClick={commitPrediction}
          disabled={predictionCommitted}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2} />
          {predictionCommitted ? "Locked in" : "Commit"}
        </Button>
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="Measure" className="w-[210px] shrink-0">
        <ProbabilityMeter
          entries={[
            { label: info.eigen[0].label, value: p0, color: info.color },
            { label: info.eigen[1].label, value: 1 - p0, color: "hsl(var(--ink-faint))" },
          ]}
        />
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={measureOnce} className="flex-1">
            <Dice5 className="h-3.5 w-3.5" strokeWidth={2} />
            Measure
          </Button>
          <Button variant="secondary" size="sm" onClick={() => runShots(100)}>
            ×100
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={reset} title="Reset">
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      </ControlGroup>
    </div>
  );
}
