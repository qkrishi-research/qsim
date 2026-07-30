import {
  formatComplex,
  concurrence,
  reducedPurityRadius,
} from "@/engine";
import { Tex } from "@/components/common/Math";
import {
  useBellStore,
  bellPresets,
  jointProbabilities,
  correlation,
} from "./store";

const BASIS = ["00", "01", "10", "11"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="label-caps mb-2.5">{title}</h3>
      {children}
    </section>
  );
}

export function StatePanel() {
  const state = useBellStore((s) => s.state);
  const presetId = useBellStore((s) => s.presetId);
  const thetaA = useBellStore((s) => s.thetaA);
  const thetaB = useBellStore((s) => s.thetaB);
  const counts = useBellStore((s) => s.counts);
  const shots = useBellStore((s) => s.shots);

  const preset = bellPresets.find((p) => p.id === presetId);
  const c = concurrence(state);
  const rA = reducedPurityRadius(state, 0);
  const rB = reducedPurityRadius(state, 1);

  const theoryE = correlation(jointProbabilities(state, thetaA, thetaB));
  const total = shots;
  const measuredE = total > 0 ? (counts[0] - counts[1] - counts[2] + counts[3]) / total : null;
  const agreement = total > 0 ? (counts[0] + counts[3]) / total : null;

  return (
    <div className="flex flex-col gap-6">
      <Section title="Joint state">
        <div className="rounded-md border border-line bg-panel px-3 py-3 text-center text-ink">
          <Tex display>{`\\lvert\\psi\\rangle = ${preset?.tex ?? ""}`}</Tex>
        </div>
        <div className="mt-2.5 overflow-hidden rounded-md border border-line">
          <table className="w-full text-xs">
            <tbody className="font-mono text-ink">
              {state.amplitudes.map((amp, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="px-3 py-1.5">
                    <Tex>{`\\lvert ${BASIS[i]}\\rangle`}</Tex>
                  </td>
                  <td className="px-3 py-1.5 text-ink-muted">{formatComplex(amp, 3)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {(Math.hypot(amp.re, amp.im) ** 2 * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Entanglement">
        <div className="mb-2 flex items-center justify-between rounded-md border border-line bg-panel px-3 py-2">
          <span className="text-xs text-ink-subtle">Concurrence</span>
          <span className="font-mono text-[13px] tabular-nums text-ink">{c.toFixed(3)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <LocalCard label="Qubit A" radius={rA} />
          <LocalCard label="Qubit B" radius={rB} />
        </div>
        <p className="mt-2 text-2xs leading-relaxed text-ink-faint">
          {c > 0.99
            ? "Maximally entangled — each qubit alone is completely mixed (Bloch length 0). The information lives in the correlations."
            : c < 1e-3
              ? "Product state — each qubit has a definite local state."
              : "Partially entangled."}
        </p>
      </Section>

      <Section title="Correlation">
        <div className="flex flex-col gap-2">
          <Row label="Theory ⟨A·B⟩" value={theoryE} />
          <Row label="Measured ⟨A·B⟩" value={measuredE} />
        </div>
        {total > 0 && (
          <div className="mt-2.5 flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-md border border-line bg-panel px-3 py-2">
              <span className="text-xs text-ink-subtle">Agreement</span>
              <span className="font-mono text-[13px] tabular-nums text-ink">
                {((agreement ?? 0) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <CountCard label="++" value={counts[0]} />
              <CountCard label="+−" value={counts[1]} />
              <CountCard label="−+" value={counts[2]} />
              <CountCard label="−−" value={counts[3]} />
            </div>
            <span className="text-2xs text-ink-faint">{total} joint measurements</span>
          </div>
        )}
      </Section>
    </div>
  );
}

function LocalCard({ label, radius }: { label: string; radius: number }) {
  return (
    <div className="rounded-md border border-line bg-panel px-3 py-2">
      <div className="label-caps">{label}</div>
      <div className="mt-0.5 font-mono text-[13px] tabular-nums text-ink">
        |r| = {radius.toFixed(2)}
      </div>
      <div className="text-2xs text-ink-faint">
        {radius < 0.02 ? "mixed" : radius > 0.98 ? "pure" : "partial"}
      </div>
    </div>
  );
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-line bg-panel px-1 py-1.5 text-center">
      <div className="font-mono text-2xs text-ink-subtle">{label}</div>
      <div className="font-mono text-[13px] tabular-nums text-ink">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number | null }) {
  const pct = value === null ? 0 : (value + 1) / 2; // map [-1,1] → [0,1]
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-xs text-ink-muted">{label}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-line/70">
        {/* centre marker */}
        <div className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
        {value !== null && (
          <div
            className="absolute inset-y-0 rounded-full transition-all duration-500 ease-precise"
            style={{
              left: value >= 0 ? "50%" : `${pct * 100}%`,
              width: `${Math.abs(value) * 50}%`,
              backgroundColor: value >= 0 ? "hsl(var(--signal-measure))" : "hsl(var(--signal-phase))",
            }}
          />
        )}
      </div>
      <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-ink">
        {value !== null ? value.toFixed(2) : "—"}
      </span>
    </div>
  );
}
