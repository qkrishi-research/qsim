import { ProbabilityMeter } from "@/modules/common/controls";
import {
  useMeasurementStore,
  bases,
  outcomeZeroProbability,
} from "./store";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="label-caps mb-2.5">{title}</h3>
      {children}
    </section>
  );
}

export function StatePanel() {
  const qubit = useMeasurementStore((s) => s.qubit);
  const basis = useMeasurementStore((s) => s.basis);
  const prediction = useMeasurementStore((s) => s.prediction);
  const predictionCommitted = useMeasurementStore((s) => s.predictionCommitted);
  const counts = useMeasurementStore((s) => s.counts);
  const shots = useMeasurementStore((s) => s.shots);
  const history = useMeasurementStore((s) => s.history);

  const info = bases[basis];
  const p0 = outcomeZeroProbability(qubit, info);
  const total = counts[0] + counts[1];
  const measured0 = total > 0 ? counts[0] / total : 0;

  return (
    <div className="flex flex-col gap-6">
      <Section title={`Prediction vs reality — ${info.label} basis`}>
        <div className="flex flex-col gap-2">
          <Row label="You predicted" value={predictionCommitted ? prediction : null} color="hsl(var(--signal-warn))" />
          <Row label="Theory says" value={p0} color={info.color} />
          <Row
            label="Measured"
            value={total > 0 ? measured0 : null}
            color="hsl(var(--signal-measure))"
            sub={total > 0 ? `${counts[0]} / ${total}` : "no data"}
          />
        </div>
        <p className="mt-2 text-2xs text-ink-faint">
          Fractions shown for outcome |{info.eigen[0].label}⟩.
        </p>
      </Section>

      <Section title="Histogram">
        {total === 0 ? (
          <p className="text-xs text-ink-faint">
            Measure repeatedly to build the distribution.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            <ProbabilityMeter
              entries={[
                { label: info.eigen[0].label, value: counts[0] / total, color: info.color },
                { label: info.eigen[1].label, value: counts[1] / total, color: "hsl(var(--ink-faint))" },
              ]}
            />
            <span className="text-2xs text-ink-faint">{shots} measurements</span>
          </div>
        )}
      </Section>

      <Section title="Measurement history">
        {history.length === 0 ? (
          <p className="text-xs text-ink-faint">
            Each single measurement collapses the state and appears here.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {history.map((h, i) => (
              <span
                key={i}
                className="rounded-md border px-2 py-0.5 font-mono text-xs"
                style={{
                  borderColor: `${bases[h.basis].color}55`,
                  color: bases[h.basis].color,
                }}
              >
                {h.label}
              </span>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Row({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: number | null;
  color: string;
  sub?: string;
}) {
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
