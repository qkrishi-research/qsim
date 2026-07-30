import { formatComplex } from "@/engine";
import { Tex } from "@/components/common/Math";
import { useGatesStore } from "./store";

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
  const qubit = useGatesStore((s) => s.qubit);
  const history = useGatesStore((s) => s.history);

  const [alpha, beta] = qubit.amplitudes;
  const b = qubit.blochVector();
  const p1 = qubit.probabilityOfQubitOne(0);

  return (
    <div className="flex flex-col gap-6">
      <Section title="Amplitudes">
        <div className="grid grid-cols-2 gap-2">
          <KV k={<Tex>{"\\alpha"}</Tex>} v={formatComplex(alpha, 3)} />
          <KV k={<Tex>{"\\beta"}</Tex>} v={formatComplex(beta, 3)} />
          <KV k="P(0)" v={`${((1 - p1) * 100).toFixed(1)}%`} />
          <KV k="P(1)" v={`${(p1 * 100).toFixed(1)}%`} />
        </div>
      </Section>

      <Section title="Bloch coordinates">
        <div className="grid grid-cols-3 gap-2">
          <Coord axis="x" value={b.x} />
          <Coord axis="y" value={b.y} />
          <Coord axis="z" value={b.z} />
        </div>
      </Section>

      <Section title="Applied circuit">
        {history.length === 0 ? (
          <p className="text-xs text-ink-faint">
            Apply gates to build a sequence. Each animates along its true
            rotation axis on the sphere.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {history.map((g, i) => (
              <span
                key={i}
                className="rounded-md border border-line bg-panel px-2 py-1 font-mono text-xs text-ink"
              >
                {g}
              </span>
            ))}
          </div>
        )}
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

function Coord({ axis, value }: { axis: string; value: number }) {
  return (
    <div className="rounded-md border border-line bg-panel px-2 py-1.5 text-center">
      <div className="label-caps">{axis}</div>
      <div className="mt-0.5 font-mono text-[13px] tabular-nums text-ink">
        {value >= 0 ? "+" : "−"}
        {Math.abs(value).toFixed(3)}
      </div>
    </div>
  );
}
