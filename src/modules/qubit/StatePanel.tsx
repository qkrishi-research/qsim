import { formatComplex } from "@/engine";
import { Tex } from "@/components/common/Math";
import { useQubitStore } from "./store";

const RAD2DEG = 180 / Math.PI;

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
  const qubit = useQubitStore((s) => s.qubit);
  const theta = useQubitStore((s) => s.theta);
  const phi = useQubitStore((s) => s.phi);

  const [alpha, beta] = qubit.amplitudes;
  const b = qubit.blochVector();
  const p1 = qubit.probabilityOfQubitOne(0);

  return (
    <div className="flex flex-col gap-6">
      <Section title="State vector">
        <div className="rounded-md border border-line bg-panel px-3 py-3 text-center text-ink">
          <Tex display>
            {"\\lvert\\psi\\rangle = \\cos\\tfrac{\\theta}{2}\\lvert 0\\rangle + e^{i\\varphi}\\sin\\tfrac{\\theta}{2}\\lvert 1\\rangle"}
          </Tex>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <KV k={<Tex>{"\\alpha"}</Tex>} v={formatComplex(alpha, 3)} />
          <KV k={<Tex>{"\\beta"}</Tex>} v={formatComplex(beta, 3)} />
        </div>
      </Section>

      <Section title="Bloch coordinates">
        <div className="grid grid-cols-3 gap-2">
          <Coord axis="x" value={b.x} />
          <Coord axis="y" value={b.y} />
          <Coord axis="z" value={b.z} />
        </div>
      </Section>

      <Section title="Spherical angles">
        <div className="grid grid-cols-2 gap-2">
          <Angle sym="θ" deg={theta * RAD2DEG} rad={theta} />
          <Angle sym="φ" deg={phi * RAD2DEG} rad={phi} />
        </div>
      </Section>

      <Section title="Measurement (Z basis)">
        <div className="grid grid-cols-2 gap-2">
          <KV k="P(0)" v={`${((1 - p1) * 100).toFixed(2)}%`} />
          <KV k="P(1)" v={`${(p1 * 100).toFixed(2)}%`} />
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

function Angle({ sym, deg, rad }: { sym: string; deg: number; rad: number }) {
  return (
    <div className="rounded-md border border-line bg-panel px-3 py-2">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-sm text-ink">{sym}</span>
        <span className="font-mono text-[13px] tabular-nums text-ink">
          {deg.toFixed(1)}°
        </span>
      </div>
      <div className="mt-0.5 text-right font-mono text-2xs text-ink-faint">
        {rad.toFixed(3)} rad
      </div>
    </div>
  );
}
