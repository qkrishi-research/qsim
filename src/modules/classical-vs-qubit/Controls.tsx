import { RotateCcw, Repeat, Dice5 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Hadamard, PauliX, PauliZ, SGate } from "@/engine";
import {
  ControlGroup,
  DockDivider,
  GateButton,
  ProbabilityMeter,
} from "@/modules/common/controls";
import { useClassicalQubitStore } from "./store";

const RAD2DEG = 180 / Math.PI;

export function Controls() {
  const classicalBit = useClassicalQubitStore((s) => s.classicalBit);
  const qubit = useClassicalQubitStore((s) => s.qubit);
  const flipClassical = useClassicalQubitStore((s) => s.flipClassical);
  const setBlochAngles = useClassicalQubitStore((s) => s.setBlochAngles);
  const applyGate = useClassicalQubitStore((s) => s.applyGate);
  const measure = useClassicalQubitStore((s) => s.measureQubit);
  const reset = useClassicalQubitStore((s) => s.reset);

  const bloch = qubit.blochVector();
  const theta = Math.acos(Math.max(-1, Math.min(1, bloch.z)));
  const phi = Math.atan2(bloch.y, bloch.x);
  const p1 = qubit.probabilityOfQubitOne(0);
  const p0 = 1 - p1;

  return (
    <div className="flex h-full items-stretch gap-4 overflow-x-auto px-4 py-3">
      <ControlGroup label="Classical bit" className="w-[132px] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md border border-line bg-panel font-mono text-xl font-semibold text-ink">
            {classicalBit}
          </div>
          <Button variant="secondary" size="sm" onClick={flipClassical}>
            <Repeat className="h-3.5 w-3.5" strokeWidth={2} />
            Flip
          </Button>
        </div>
        <p className="text-2xs leading-snug text-ink-faint">
          Deterministic — reading it never changes it.
        </p>
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="Qubit state" className="w-[220px] shrink-0">
        <Slider
          label="θ polar"
          display={`${(theta * RAD2DEG).toFixed(0)}°`}
          min={0}
          max={Math.PI}
          value={theta}
          onChange={(t) => setBlochAngles(t, phi)}
        />
        <Slider
          label="φ phase"
          display={`${(phi * RAD2DEG).toFixed(0)}°`}
          min={-Math.PI}
          max={Math.PI}
          value={phi}
          onChange={(p) => setBlochAngles(theta, p)}
        />
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="Gates" className="shrink-0">
        <div className="flex gap-1.5">
          <GateButton label="H" title="Hadamard" onClick={() => applyGate(Hadamard)} />
          <GateButton label="X" title="Pauli-X (NOT)" onClick={() => applyGate(PauliX)} />
          <GateButton label="Z" title="Pauli-Z" onClick={() => applyGate(PauliZ)} />
          <GateButton label="S" title="Phase" tone="phase" onClick={() => applyGate(SGate)} />
        </div>
        <p className="text-2xs leading-snug text-ink-faint">
          Rotations move the state continuously.
        </p>
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="Measurement" className="w-[210px] shrink-0">
        <ProbabilityMeter
          entries={[
            { label: "P(0)", value: p0 },
            { label: "P(1)", value: p1, color: "hsl(var(--signal-phase))" },
          ]}
        />
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={measure} className="flex-1">
            <Dice5 className="h-3.5 w-3.5" strokeWidth={2} />
            Measure
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={reset} title="Reset">
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      </ControlGroup>
    </div>
  );
}
