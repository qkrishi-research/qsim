import { RotateCcw, Zap, Check, Dice5 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ControlGroup,
  DockDivider,
  ProbabilityMeter,
} from "@/modules/common/controls";
import { useSuperpositionStore } from "./store";

const RAD2DEG = 180 / Math.PI;

export function Controls() {
  const qubit = useSuperpositionStore((s) => s.qubit);
  const prediction = useSuperpositionStore((s) => s.prediction);
  const predictionCommitted = useSuperpositionStore((s) => s.predictionCommitted);
  const setPrediction = useSuperpositionStore((s) => s.setPrediction);
  const commitPrediction = useSuperpositionStore((s) => s.commitPrediction);
  const setBlochAngles = useSuperpositionStore((s) => s.setBlochAngles);
  const makeEqual = useSuperpositionStore((s) => s.makeEqualSuperposition);
  const runShots = useSuperpositionStore((s) => s.runShots);
  const collapseOnce = useSuperpositionStore((s) => s.collapseOnce);
  const reset = useSuperpositionStore((s) => s.reset);

  const bloch = qubit.blochVector();
  const theta = Math.acos(Math.max(-1, Math.min(1, bloch.z)));
  const phi = Math.atan2(bloch.y, bloch.x);
  const p1 = qubit.probabilityOfQubitOne(0);

  return (
    <div className="flex h-full items-stretch gap-4 overflow-x-auto px-4 py-3">
      <ControlGroup label="1 · Predict" className="w-[190px] shrink-0">
        <Slider
          label="Your guess: P(1)"
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
          {predictionCommitted ? "Locked in" : "Commit prediction"}
        </Button>
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="2 · Experiment" className="w-[220px] shrink-0">
        <Slider
          label="θ balance"
          display={`${(theta * RAD2DEG).toFixed(0)}°`}
          min={0}
          max={Math.PI}
          value={theta}
          onChange={(t) => setBlochAngles(t, phi)}
        />
        <div className="flex items-center gap-2">
          <Slider
            label="φ phase"
            display={`${(phi * RAD2DEG).toFixed(0)}°`}
            min={-Math.PI}
            max={Math.PI}
            value={phi}
            onChange={(p) => setBlochAngles(theta, p)}
            className="flex-1"
          />
        </div>
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="Probability" className="w-[180px] shrink-0">
        <ProbabilityMeter
          entries={[
            { label: "P(0)", value: 1 - p1 },
            { label: "P(1)", value: p1, color: "hsl(var(--signal-phase))" },
          ]}
        />
        <Button variant="secondary" size="sm" onClick={makeEqual}>
          <Zap className="h-3.5 w-3.5" strokeWidth={2} />
          Equal (H)
        </Button>
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="3 · Measure" className="w-[210px] shrink-0">
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => runShots(100)} className="flex-1">
            <Dice5 className="h-3.5 w-3.5" strokeWidth={2} />
            Run ×100
          </Button>
          <Button variant="secondary" size="sm" onClick={collapseOnce}>
            Collapse ×1
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
          Reset experiment
        </Button>
      </ControlGroup>
    </div>
  );
}
