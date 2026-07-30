import { useState } from "react";
import { RotateCcw, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ControlGroup,
  DockDivider,
  GateButton,
} from "@/modules/common/controls";
import { useGatesStore, fixedGates, type RotationAxis } from "./store";

const RAD2DEG = 180 / Math.PI;

export function Controls() {
  const applyGate = useGatesStore((s) => s.applyGate);
  const applyRotation = useGatesStore((s) => s.applyRotation);
  const undo = useGatesStore((s) => s.undo);
  const reset = useGatesStore((s) => s.reset);
  const history = useGatesStore((s) => s.history);

  const [angle, setAngle] = useState(Math.PI / 2);

  const rotationButton = (axis: RotationAxis) => (
    <button
      onClick={() => applyRotation(axis, angle)}
      className="flex h-9 min-w-[52px] items-center justify-center rounded-md border border-line bg-surface px-2 font-mono text-[13px] text-signal-phase transition-all duration-150 ease-precise hover:border-signal-phase/40 hover:bg-signal-phase/5 active:scale-[0.96]"
    >
      R{axis}
    </button>
  );

  return (
    <div className="flex h-full items-stretch gap-4 overflow-x-auto px-4 py-3">
      <ControlGroup label="Pauli & Clifford" className="shrink-0">
        <div className="flex gap-1.5">
          {fixedGates.map((def) => (
            <GateButton
              key={def.symbol}
              label={def.symbol}
              title={def.name}
              tone={def.tone}
              onClick={() => applyGate(def)}
            />
          ))}
        </div>
        <p className="text-2xs leading-snug text-ink-faint">
          Each gate rotates the state about a fixed axis.
        </p>
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="Rotation gates" className="w-[236px] shrink-0">
        <Slider
          label="Angle"
          display={`${(angle * RAD2DEG).toFixed(0)}°`}
          min={0}
          max={2 * Math.PI}
          step={0.01}
          value={angle}
          onChange={setAngle}
        />
        <div className="flex gap-1.5">
          {rotationButton("x")}
          {rotationButton("y")}
          {rotationButton("z")}
        </div>
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="Circuit" className="w-[200px] shrink-0">
        <div className="flex min-h-[36px] flex-wrap content-start gap-1 overflow-hidden rounded-md border border-line bg-panel px-2 py-1.5">
          {history.length === 0 ? (
            <span className="text-2xs text-ink-faint">No gates applied yet.</span>
          ) : (
            history.slice(-10).map((g, i) => (
              <span
                key={i}
                className="rounded bg-surface px-1.5 py-0.5 font-mono text-2xs text-ink-muted"
              >
                {g}
              </span>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={undo} disabled={history.length === 0}>
            <Undo2 className="h-3.5 w-3.5" strokeWidth={2} />
            Undo
          </Button>
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
            Reset
          </Button>
        </div>
      </ControlGroup>
    </div>
  );
}
