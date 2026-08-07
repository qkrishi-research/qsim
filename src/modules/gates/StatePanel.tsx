import {
  applyGate,
  applySingleQubitGate,
  formatComplex,
  type QuantumState,
} from "@/engine";
import { Tex } from "@/components/common/Math";
import { CircuitSymbol } from "./CircuitSymbol";
import { useGatesStore } from "./store";
import { getGateDef } from "./gateLibrary";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="label-caps mb-2">{title}</h3>
      {children}
    </section>
  );
}

export function StatePanel() {
  const selectedId = useGatesStore((s) => s.selectedId);
  const angle = useGatesStore((s) => s.angle);
  const register = useGatesStore((s) => s.register);
  const target = useGatesStore((s) => s.target);
  const singleState = useGatesStore((s) => s.singleState);
  const twoState = useGatesStore((s) => s.twoState);

  const def = getGateDef(selectedId);
  const gate = def.make(angle);

  const before = register === "single" ? singleState : twoState;
  const after =
    def.arity === 2
      ? applyGate(twoState, gate, [0, 1])
      : register === "single"
        ? applySingleQubitGate(singleState, gate, 0)
        : applySingleQubitGate(twoState, gate, target);

  const kets =
    register === "single" ? ["0", "1"] : ["00", "01", "10", "11"];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-panel font-mono text-lg font-semibold text-ink">
            {def.symbol}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-ink">{def.name}</span>
              {def.featured && (
                <span className="rounded-full bg-signal-warn/12 px-2 py-0.5 text-2xs font-medium text-signal-warn">
                  Key gate
                </span>
              )}
            </div>
            <span className="text-xs text-ink-faint">
              {def.arity === 1 ? "Single-qubit" : "Two-qubit"} ·{" "}
              {def.parametric ? "parametric" : "fixed"}
            </span>
          </div>
        </div>
      </div>

      <Section title="Circuit symbol">
        <div className="flex justify-center rounded-md border border-line bg-panel px-3 py-3">
          <CircuitSymbol spec={def.circuit} />
        </div>
      </Section>

      <Section title="Matrix">
        <div className="overflow-x-auto rounded-md border border-line bg-panel px-3 py-3 text-center text-ink">
          <Tex display>{def.matrixTex}</Tex>
        </div>
      </Section>

      <Section title="Transformation">
        <div className="overflow-x-auto rounded-md border border-line bg-panel px-3 py-2.5 text-center text-ink">
          <Tex display>{def.transformTex}</Tex>
        </div>
      </Section>

      <Section title="State before → after">
        <div className="grid grid-cols-2 gap-2">
          <StateColumn label="Before" state={before} kets={kets} />
          <StateColumn label="After" state={after} kets={kets} highlight />
        </div>
      </Section>

      <Section title="Physical intuition">
        <p
          className={
            "text-[13px] leading-relaxed " +
            (def.featured ? "rounded-md border border-signal-warn/25 bg-signal-warn/5 px-3 py-2.5 text-ink" : "text-ink-muted")
          }
        >
          {def.intuition}
        </p>
      </Section>
    </div>
  );
}

function StateColumn({
  label,
  state,
  kets,
  highlight,
}: {
  label: string;
  state: QuantumState;
  kets: string[];
  highlight?: boolean;
}) {
  return (
    <div className={"overflow-hidden rounded-md border " + (highlight ? "border-accent/40" : "border-line")}>
      <div className={"px-2.5 py-1 text-2xs font-medium " + (highlight ? "bg-accent-soft text-accent" : "bg-panel text-ink-subtle")}>
        {label}
      </div>
      <table className="w-full text-2xs">
        <tbody className="font-mono text-ink">
          {state.amplitudes.map((amp, i) => {
            const p = amp.re * amp.re + amp.im * amp.im;
            const faint = p < 1e-6;
            return (
              <tr key={i} className="border-t border-line first:border-0">
                <td className="py-1 pl-2.5 pr-1 text-ink-subtle">
                  <Tex>{`\\lvert ${kets[i]}\\rangle`}</Tex>
                </td>
                <td className={"py-1 pr-2.5 text-right " + (faint ? "text-ink-faint" : "text-ink-muted")}>
                  {formatComplex(amp, 2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
