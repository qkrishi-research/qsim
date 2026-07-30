import { formatComplex } from "@/engine";
import { Tex } from "@/components/common/Math";
import { useClassicalQubitStore } from "./store";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="label-caps mb-2.5">{title}</h3>
      {children}
    </section>
  );
}

export function StatePanel() {
  const classicalBit = useClassicalQubitStore((s) => s.classicalBit);
  const qubit = useClassicalQubitStore((s) => s.qubit);
  const lastMeasurement = useClassicalQubitStore((s) => s.lastMeasurement);

  const [alpha, beta] = qubit.amplitudes;
  const bloch = qubit.blochVector();
  const p1 = qubit.probabilityOfQubitOne(0);

  return (
    <div className="flex flex-col gap-6">
      <Section title="Classical bit">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-panel font-mono text-lg font-semibold text-ink">
            {classicalBit}
          </div>
          <p className="text-xs leading-relaxed text-ink-muted">
            Exactly one of two values. It has no phase and no amplitude.
          </p>
        </div>
      </Section>

      <Section title="Qubit state vector">
        <div className="rounded-md border border-line bg-panel px-3 py-3 text-center text-ink">
          <Tex display>
            {"\\lvert\\psi\\rangle = \\alpha\\lvert 0\\rangle + \\beta\\lvert 1\\rangle"}
          </Tex>
        </div>
        <div className="mt-2.5 overflow-hidden rounded-md border border-line">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line bg-panel text-left text-ink-subtle">
                <th className="px-3 py-1.5 font-medium">Basis</th>
                <th className="px-3 py-1.5 font-medium">Amplitude</th>
                <th className="px-3 py-1.5 text-right font-medium">P</th>
              </tr>
            </thead>
            <tbody className="font-mono text-ink">
              <AmplitudeRow ket="0" amplitude={formatComplex(alpha, 3)} p={1 - p1} />
              <AmplitudeRow ket="1" amplitude={formatComplex(beta, 3)} p={p1} />
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Bloch vector">
        <div className="grid grid-cols-3 gap-2">
          <Coord axis="x" value={bloch.x} />
          <Coord axis="y" value={bloch.y} />
          <Coord axis="z" value={bloch.z} />
        </div>
      </Section>

      <Section title="Last measurement">
        {lastMeasurement === null ? (
          <p className="text-xs text-ink-faint">
            Not yet measured. The qubit holds a continuum of possibilities.
          </p>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-signal-measure/10 font-mono text-base font-semibold text-signal-measure">
              {lastMeasurement}
            </div>
            <p className="text-xs leading-relaxed text-ink-muted">
              The superposition collapsed to a definite outcome.
            </p>
          </div>
        )}
      </Section>
    </div>
  );
}

function AmplitudeRow({
  ket,
  amplitude,
  p,
}: {
  ket: string;
  amplitude: string;
  p: number;
}) {
  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-3 py-2">
        <Tex>{`\\lvert ${ket}\\rangle`}</Tex>
      </td>
      <td className="px-3 py-2 text-ink-muted">{amplitude}</td>
      <td className="px-3 py-2 text-right tabular-nums">{(p * 100).toFixed(1)}%</td>
    </tr>
  );
}

function Coord({ axis, value }: { axis: string; value: number }) {
  return (
    <div className="rounded-md border border-line bg-panel px-2 py-1.5 text-center">
      <div className="label-caps">{axis}</div>
      <div className="mt-0.5 font-mono text-[13px] tabular-nums text-ink">
        {value >= 0 ? "+" : "−"}
        {Math.abs(value).toFixed(2)}
      </div>
    </div>
  );
}
