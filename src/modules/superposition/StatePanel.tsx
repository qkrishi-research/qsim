import { formatComplex } from "@/engine";
import { Tex } from "@/components/common/Math";
import { ProbabilityMeter } from "@/modules/common/controls";
import { useSuperpositionStore } from "./store";

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
  const qubit = useSuperpositionStore((s) => s.qubit);
  const prediction = useSuperpositionStore((s) => s.prediction);
  const predictionCommitted = useSuperpositionStore((s) => s.predictionCommitted);
  const counts = useSuperpositionStore((s) => s.counts);
  const shotsFired = useSuperpositionStore((s) => s.shotsFired);

  const [alpha, beta] = qubit.amplitudes;
  const p1 = qubit.probabilityOfQubitOne(0);
  const total = counts[0] + counts[1];
  const measured1 = total > 0 ? counts[1] / total : 0;

  return (
    <div className="flex flex-col gap-6">
      <Section title="State vector">
        <div className="rounded-md border border-line bg-panel px-3 py-3 text-center text-ink">
          <Tex display>
            {"\\lvert\\psi\\rangle = \\alpha\\lvert 0\\rangle + \\beta\\lvert 1\\rangle"}
          </Tex>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <Amplitude ket="0" value={formatComplex(alpha, 3)} />
          <Amplitude ket="1" value={formatComplex(beta, 3)} />
        </div>
      </Section>

      <Section title="Prediction vs reality">
        <div className="flex flex-col gap-2">
          <CompareRow
            label="You predicted"
            value={predictionCommitted ? prediction : null}
            tone="predict"
          />
          <CompareRow label="Theory says" value={p1} tone="theory" />
          <CompareRow
            label="Measured"
            value={total > 0 ? measured1 : null}
            tone="measure"
            sub={total > 0 ? `${counts[1]} / ${total}` : "no shots yet"}
          />
        </div>
      </Section>

      <Section title="Measurement histogram">
        {total === 0 ? (
          <p className="text-xs text-ink-faint">
            Run the experiment to accumulate outcomes. The bars converge on the
            theoretical probabilities as the shot count grows.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            <ProbabilityMeter
              entries={[
                { label: "0", value: counts[0] / total },
                {
                  label: "1",
                  value: counts[1] / total,
                  color: "hsl(var(--signal-phase))",
                },
              ]}
            />
            <div className="flex items-center justify-between text-2xs text-ink-faint">
              <span>
                counts · {counts[0]} zeros, {counts[1]} ones
              </span>
              <span className="font-mono">{shotsFired} shots</span>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

function Amplitude({ ket, value }: { ket: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-panel px-3 py-2">
      <div className="text-ink-subtle">
        <Tex>{`\\lvert ${ket}\\rangle`}</Tex>
      </div>
      <div className="mt-0.5 font-mono text-[13px] tabular-nums text-ink">
        {value}
      </div>
    </div>
  );
}

function CompareRow({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: number | null;
  tone: "predict" | "theory" | "measure";
  sub?: string;
}) {
  const color =
    tone === "predict"
      ? "hsl(var(--signal-warn))"
      : tone === "theory"
        ? "hsl(var(--accent))"
        : "hsl(var(--signal-measure))";

  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-xs text-ink-muted">{label}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-line/70">
        {value !== null && (
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-precise"
            style={{ width: `${value * 100}%`, backgroundColor: color }}
          />
        )}
      </div>
      <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-ink">
        {value !== null ? `${(value * 100).toFixed(1)}%` : sub ?? "—"}
      </span>
    </div>
  );
}
