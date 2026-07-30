import { formatComplex } from "@/engine";
import { Tex } from "@/components/common/Math";
import {
  useInterferenceStore,
  interferometerState,
  interferenceLabel,
} from "./store";

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
  const phi = useInterferenceStore((s) => s.phi);
  const state = interferometerState(phi);
  const [a0, a1] = state.amplitudes;
  const probs = state.probabilities();
  const label = interferenceLabel(phi);

  return (
    <div className="flex flex-col gap-6">
      <Section title="Interferometer">
        <div className="rounded-md border border-line bg-panel px-3 py-3 text-center text-ink">
          <Tex display>{"H \\cdot P(\\varphi) \\cdot H \\,\\lvert 0\\rangle"}</Tex>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          A relative phase between the two paths controls how the amplitudes
          recombine at the final Hadamard.
        </p>
      </Section>

      <Section title="Output amplitudes">
        <div className="grid grid-cols-2 gap-2">
          <KV k={<Tex>{"\\langle 0 \\lvert \\psi\\rangle"}</Tex>} v={formatComplex(a0, 3)} />
          <KV k={<Tex>{"\\langle 1 \\lvert \\psi\\rangle"}</Tex>} v={formatComplex(a1, 3)} />
        </div>
      </Section>

      <Section title="Outcome">
        <div className="mb-2 flex items-center justify-between rounded-md border border-line bg-panel px-3 py-2">
          <span className="text-xs text-ink-subtle">Interference</span>
          <span className="text-[13px] font-medium text-ink">{label}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <KV k="P(0)" v={`${(probs[0] * 100).toFixed(2)}%`} />
          <KV k="P(1)" v={`${(probs[1] * 100).toFixed(2)}%`} />
        </div>
        <div className="mt-2 rounded-md border border-line bg-panel px-3 py-2 text-center text-ink">
          <Tex>{"P(0) = \\cos^2\\tfrac{\\varphi}{2}"}</Tex>
        </div>
      </Section>
    </div>
  );
}

function KV({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-line bg-panel px-3 py-2">
      <span className="text-xs text-ink-subtle">{k}</span>
      <span className="font-mono text-[13px] tabular-nums text-ink">{v}</span>
    </div>
  );
}
