import { Sparkles, Play, Undo2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ControlGroup, DockDivider } from "@/modules/common/controls";
import { cn } from "@/lib/utils";
import { useGatesStore } from "./store";
import { gateDefs, gateCategories, getGateDef, type GateDef } from "./gateLibrary";

const RAD2DEG = 180 / Math.PI;

export function Controls() {
  const selectedId = useGatesStore((s) => s.selectedId);
  const angle = useGatesStore((s) => s.angle);
  const register = useGatesStore((s) => s.register);
  const target = useGatesStore((s) => s.target);
  const select = useGatesStore((s) => s.select);
  const setAngle = useGatesStore((s) => s.setAngle);
  const setRegister = useGatesStore((s) => s.setRegister);
  const setTarget = useGatesStore((s) => s.setTarget);
  const apply = useGatesStore((s) => s.apply);
  const undo = useGatesStore((s) => s.undo);
  const reset = useGatesStore((s) => s.reset);
  const history = useGatesStore((s) => s.history);

  const selected = getGateDef(selectedId);

  return (
    <div className="flex h-full items-stretch gap-3.5 overflow-x-auto px-4 py-3">
      {gateCategories.map((cat) => {
        const gates = gateDefs.filter((g) => g.category === cat.id);
        return (
          <ControlGroup key={cat.id} label={cat.label} className="shrink-0">
            <div className="flex gap-1.5">
              {gates.map((g) => (
                <GateChip
                  key={g.id}
                  def={g}
                  active={selectedId === g.id}
                  onClick={() => select(g.id)}
                />
              ))}
            </div>
          </ControlGroup>
        );
      })}

      <DockDivider />

      <ControlGroup label="Register" className="shrink-0">
        <div className="flex gap-1.5">
          <RegisterButton active={register === "single"} onClick={() => setRegister("single")}>
            1 qubit
          </RegisterButton>
          <RegisterButton
            active={register === "two"}
            onClick={() => setRegister("two")}
          >
            2 qubits
          </RegisterButton>
        </div>
        {register === "two" && selected.arity === 1 ? (
          <div className="flex items-center gap-1.5">
            <span className="text-2xs text-ink-faint">on</span>
            <RegisterButton active={target === 0} onClick={() => setTarget(0)}>
              q₀
            </RegisterButton>
            <RegisterButton active={target === 1} onClick={() => setTarget(1)}>
              q₁
            </RegisterButton>
          </div>
        ) : (
          <p className="text-2xs leading-snug text-ink-faint">
            {register === "two"
              ? "Control q₀ · target q₁"
              : "Single-qubit Bloch view"}
          </p>
        )}
      </ControlGroup>

      <DockDivider />

      <ControlGroup label="Apply" className="w-[224px] shrink-0">
        {selected.parametric ? (
          <Slider
            label={`${selected.symbol} angle`}
            display={`${(angle * RAD2DEG).toFixed(0)}°`}
            min={0}
            max={2 * Math.PI}
            step={0.01}
            value={angle}
            onChange={setAngle}
          />
        ) : (
          <div className="flex h-[34px] items-center gap-2 rounded-md border border-line bg-panel px-2.5">
            <span className="font-mono text-sm font-semibold text-ink">{selected.symbol}</span>
            <span className="truncate text-xs text-ink-muted">{selected.name}</span>
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={apply} className="flex-1">
            <Play className="h-3.5 w-3.5" strokeWidth={2} />
            Apply {selected.symbol}
          </Button>
          <Button variant="secondary" size="icon-sm" onClick={undo} disabled={history.length === 0} title="Undo">
            <Undo2 className="h-4 w-4" strokeWidth={2} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={reset} title="Reset">
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      </ControlGroup>
    </div>
  );
}

function RegisterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-8 items-center justify-center rounded-md border px-2.5 text-xs font-medium transition-colors",
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-line bg-surface text-ink-muted hover:bg-panel"
      )}
    >
      {children}
    </button>
  );
}

function GateChip({
  def,
  active,
  onClick,
}: {
  def: GateDef;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={def.name}
      className={cn(
        "relative flex h-9 min-w-[40px] items-center justify-center rounded-md border px-2 font-mono text-[13px] font-medium transition-all duration-150 ease-precise active:scale-[0.95]",
        active
          ? "border-accent bg-accent text-accent-contrast shadow-sm"
          : "border-line bg-surface text-ink hover:border-accent/40 hover:bg-accent-soft"
      )}
    >
      {def.symbol}
      {def.featured && (
        <Sparkles
          className={cn(
            "absolute -right-1 -top-1 h-3 w-3",
            active ? "text-accent-contrast" : "text-signal-warn"
          )}
          strokeWidth={2.5}
          fill="currentColor"
        />
      )}
    </button>
  );
}
